import React from 'react';
import { Route, IndexRoute } from 'react-router';

import LocationsIndexPage from './LocationsIndexPage';
import LocationAddPage from './LocationAddPage';
import LocationShowPage from './LocationShowPage';
import LocationEditPage from './LocationEditPage';
import LocationDeletePage from './LocationDeletePage';

import { RequireAuth } from '../../utils';

export default (
  <Route path="locations">
    <IndexRoute component={(LocationsIndexPage)} />
    <Route path="new" component={(LocationAddPage)} />
    <Route path=":itemID/edit" component={(LocationEditPage)} />
    <Route path=":itemID/delete" component={(LocationDeletePage)} />
    <Route path=":itemID" component={(LocationShowPage)} />
  </Route>
);
