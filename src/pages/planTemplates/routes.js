import React from 'react';
import { Route, IndexRoute } from 'react-router';

import PlanTemplatesIndexPage from './PlanTemplatesIndexPage';
import PlanTemplateAddPage from './PlanTemplateAddPage';
import PlanTemplateEditPage from './PlanTemplateEditPage';
import PlanTemplateDeletePage from './PlanTemplateDeletePage';

import { RequireAuth } from '../../utils';

export default (
  <Route path="planTemplates">
    <IndexRoute component={RequireAuth(PlanTemplatesIndexPage)} />
    <Route path="new" component={RequireAuth(PlanTemplateAddPage)} />
    <Route path=":itemID/edit" component={RequireAuth(PlanTemplateEditPage)} />
    <Route path=":itemID/delete" component={RequireAuth(PlanTemplateDeletePage)} />
  </Route>
);
