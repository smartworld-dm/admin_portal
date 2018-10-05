import React from 'react';
import { Route, IndexRoute } from 'react-router';

import SeriesIndexPage from './SeriesIndexPage';
import SeriesAddPage from './SeriesAddPage';
import SeriesShowPage from './SeriesShowPage';
import SeriesEditPage from './SeriesEditPage';
import SeriesDeletePage from './SeriesDeletePage';

import { RequireAuth } from '../../utils';

export default (
  <Route path="series">
    <IndexRoute component={RequireAuth(SeriesIndexPage)} />
    <Route path="new" component={RequireAuth(SeriesAddPage)} />
    <Route path=":itemID/edit" component={RequireAuth(SeriesEditPage)} />
    <Route path=":itemID/delete" component={RequireAuth(SeriesDeletePage)} />
    <Route path=":itemID" component={RequireAuth(SeriesShowPage)} />
  </Route>
);
