const Sentry = require('@sentry/node');
const dotenv = require('dotenv').config();

const { SENTRY_DSN } = process.env;
const remainingTimeInMillis = 10000;
const defaultOptions = {
  flushTimeout: 2000,
  rethrowAfterCapture: true,
  callbackWaitsForEmptyEventLoop: false,
  captureTimeoutWarning: true,
  timeoutWarningLimit: 500,
};

const addTimeoutWarning = async (event, options) => {
  // In seconds. You cannot go any more granular than this in AWS Lambda.
  const configuredTimeout = Math.ceil(remainingTimeInMillis / 1000);
  const configuredTimeoutMinutes = Math.floor(configuredTimeout / 60);
  const configuredTimeoutSeconds = configuredTimeout % 60;
  const humanReadableTimeout = configuredTimeoutMinutes > 0
    ? `${configuredTimeoutMinutes}m${configuredTimeoutSeconds}s`
    : `${configuredTimeoutSeconds}s`;
  const timeoutWarningDelay = remainingTimeInMillis - options.timeoutWarningLimit;
  return setTimeout(() => {
    Sentry.withScope((scope) => {
      scope.setTag('timeout', humanReadableTimeout);
      scope.setContext('event', event);
      Sentry.captureMessage(`Timeout: ${event.path}`, Sentry.Severity.Warning);
    });
  }, timeoutWarningDelay);
}

module.exports = (handler, wrapOptions) => {
  let timeoutWarningTimer;
  let sentryInitialized = false;
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
    });
    sentryInitialized = true;
  }
  const options = {
    ...defaultOptions,
    ...wrapOptions,
  };
  return async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = options.callbackWaitsForEmptyEventLoop;
    // When callbackWaitsForEmptyEventLoop is set to false,
    // which it should when using `captureTimeoutWarning`,
    // we don't have a guarantee that this message will be delivered.
    // Because of that, we don't flush it.
    if (options.captureTimeoutWarning && sentryInitialized) {
      timeoutWarningTimer = await addTimeoutWarning(event, options);
    }
    let rv;
    try {
      rv = await handler(event, context);
      if (!sentryInitialized) {
        return rv;
      }
    } catch (e) {
      if (!sentryInitialized) {
        throw e;
      }
      Sentry.withScope((scope) => {
        scope.setContext('event', event);
        Sentry.captureException(e);
      });
      if (options.rethrowAfterCapture) {
        throw e;
      }
      return {
        statusCode: 500,
        body: 'Error',
      };
    }
    finally {
      clearTimeout(timeoutWarningTimer);
      await Sentry.flush(options.flushTimeout);
    }
    return rv;
  };
};
