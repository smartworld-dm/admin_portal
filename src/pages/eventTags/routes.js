import React from 'react';
import { Route, IndexRoute } from 'react-router';

import EventTagsIndexPage from './EventTagsIndexPage';
import EventTagAddPage from './EventTagAddPage';
import EventTagShowPage from './EventTagShowPage';
import EventTagEditPage from './EventTagEditPage';
import EventTagDeletePage from './EventTagDeletePage';

import { RequireAuth } from '../../utils';

export default (
  <Route path="eventtags">
    <IndexRoute component={(EventTagsIndexPage)} />
    <Route path="new" component={(EventTagAddPage)} />
    <Route path=":itemID/edit" component={(EventTagEditPage)} />
    <Route path=":itemID/delete" component={(EventTagDeletePage)} />
    <Route path=":itemID" component={(EventTagShowPage)} />
  </Route>
);
