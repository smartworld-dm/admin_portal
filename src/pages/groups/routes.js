import React from 'react';
import { Route, IndexRoute } from 'react-router';

import GroupsIndexPage from './GroupsIndexPage';
import GroupAddPage from './GroupAddPage';
import GroupShowPage from './GroupShowPage';
import GroupEditPage from './GroupEditPage';
import GroupCopyPage from './GroupCopyPage';
import GroupDeletePage from './GroupDeletePage';

import { RequireAuth } from '../../utils';

export default (
  <Route path="groups">
    <IndexRoute component={RequireAuth(GroupsIndexPage)} />
    <Route path="new" component={RequireAuth(GroupAddPage)} />
    <Route path=":itemID/edit" component={RequireAuth(GroupEditPage)} />
    <Route path=":itemID/copy" component={RequireAuth(GroupCopyPage)} />
    <Route path=":itemID/delete" component={RequireAuth(GroupDeletePage)} />
    <Route path=":itemID" component={RequireAuth(GroupShowPage)} />
  </Route>
);
