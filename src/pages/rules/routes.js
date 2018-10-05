import React from 'react';
import { Route, IndexRoute } from 'react-router';

import RulesIndexPage from './RulesIndexPage';
import RuleAddPage from './RuleAddPage';
import RuleShowPage from './RuleShowPage';
import RuleEditPage from './RuleEditPage';
import RuleDeletePage from './RuleDeletePage';

import { RequireAuth } from '../../utils';

export default (
  <Route path="rules">
    <IndexRoute component={(RulesIndexPage)} />
    <Route path="new" component={(RuleAddPage)} />
    <Route path=":itemID/edit" component={(RuleEditPage)} />
    <Route path=":itemID/delete" component={(RuleDeletePage)} />
    <Route path=":itemID" component={(RuleShowPage)} />
  </Route>
);
