import * as React from 'react';
import { Admin, Resource } from 'react-admin';

import './App.css';
import dataProvider from './components/admin/dataProvider/dataProvider';
import messages from './components/admin/resources/messages';
import subscriptions from './components/admin/resources/subscriptions';
import activities from './components/admin/resources/activities';
import tracks from './components/admin/resources/tracks';
import photos from './components/admin/resources/photos';
import files from './components/admin/resources/files';

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="messages" {...messages} />
    <Resource name="subscriptions" {...subscriptions} />
    <Resource name="activities" {...activities} />
    <Resource name="tracks" {...tracks} />
    <Resource name="photos" {...photos} />
    <Resource name="files" {...files} />
  </Admin>
);

export default App;
