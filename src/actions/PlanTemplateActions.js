import { browserHistory } from 'react-router';

import { ADD_PLANTEMPLATES, ADD_PLANTEMPLATE, PLANTEMPLATE_ERROR, REMOVE_PLANTEMPLATE, SHOW_PLANTEMPLATE } from '../constants/PlanTemplate';

import { apiRequest } from '../utils';

export function addPlanTemplates(items = [], count = 0) {
  return {
    type: ADD_PLANTEMPLATES,
    items,
    count
  };
}

export function addPlanTemplate(item = {}) {
  return {
    type: ADD_PLANTEMPLATE,
    item
  };
}

export function showPlanTemplate(item = {}) {
  return {
    type: SHOW_PLANTEMPLATE,
    item
  };
}

export function planTemplateError(errorMessage) {
  return {
    type: PLANTEMPLATE_ERROR,
    errorMessage
  };
}

export function removePlanTemplate(itemId) {
  return {
    type: REMOVE_PLANTEMPLATE,
    itemId
  };
}

export function fetchPlanTemplates({ search, include, order }) {
  const url = [
    'PlanTemplate?count=1',
    order ? `&order=${order}` : null,
    include ? `&include=${include}` : null,
    search ? `&where=${JSON.stringify({
        $or: [
          { name: { $regex: search, $options: 'i' } }
        ]
      })}` : null
  ].join('');

  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addPlanTemplates(results, count)));
}

export function fetchPlanTemplate(itemId) {
  return dispatch => apiRequest.get('PlanTemplate', itemId)
    .then(({ data }) => dispatch(showPlanTemplate(data)))
    .catch(() => browserHistory.push('/not-found'));
}

export function createPlanTemplate(planTemplate) {
  return dispatch => apiRequest.post('PlanTemplate', planTemplate)
    .then(() => browserHistory.push('/planTemplates'))
    .catch(({ response: { data: { error } } }) => dispatch(planTemplateError(error)));
}

export function updatePlanTemplate(itemID, planTemplate) {
  return dispatch => apiRequest.put('PlanTemplate', itemID, planTemplate)
    .then(() => browserHistory.push('/planTemplates'))
    .catch(({ response: { data: { error } } }) => dispatch(planTemplateError(error)));
}

export function deletePlanTemplate(itemID) {
  return dispatch => apiRequest.delete('PlanTemplate', itemID)
    .then(() => dispatch(removePlanTemplate(itemID)))
    .then(() => browserHistory.push('/planTemplates'));
}
