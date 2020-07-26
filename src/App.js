import * as React from 'react';
import { Admin, Resource } from 'react-admin';

import './App.css';
import dataProvider from './components/admin/dataProvider/dataProvider';
import messages from './components/admin/resources/messages';
import subscriptions from './components/admin/resources/subscriptions';
import activities from './components/admin/resources/activities';

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="messages" {...messages} />
    <Resource name="subscriptions" {...subscriptions} />
    <Resource name="activities" {...activities} />
  </Admin>
);

export default App;
