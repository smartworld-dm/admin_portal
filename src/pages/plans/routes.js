import React from 'react';
import { Route, IndexRoute } from 'react-router';

import PlansIndexPage from './PlansIndexPage';
import PlanAddPage from './PlanAddPage';
import PlanShowPage from './PlanShowPage';
import PlanEditPage from './PlanEditPage';
import PlanCopyPage from './PlanCopyPage';
import PlanDeletePage from './PlanDeletePage';

import { RequireAuth } from '../../utils';

export default (
  <Route path="plans">
    <IndexRoute component={(PlansIndexPage)} />
    <Route path="new" component={(PlanAddPage)} />
    <Route path=":itemID/edit" component={(PlanEditPage)} />
	<Route path=":itemID/copy" component={(PlanCopyPage)} />
    <Route path=":itemID/delete" component={(PlanDeletePage)} />
    <Route path=":itemID" component={(PlanShowPage)} />
  </Route>
);
