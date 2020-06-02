export const headers = (obj) => {
  return Object.keys(obj).reduce((object, key) => {
    object[key.split('.').join('_')] = obj[key];
    return object
  }, {});
}
