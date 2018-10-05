import filter from 'lodash/filter';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import { browserHistory } from 'react-router';

import { ADD_RULES, ADD_RULE, RULE_ERROR, SHOW_RULE, REMOVE_RULE } from '../constants/Rule';

import { apiRequest } from '../utils';

export function addRules(items = [], count = 0) {
  return {
    type: ADD_RULES,
    items,
    count
  };
}

export function addRule(item = {}) {
  return {
    type: ADD_RULE,
    item
  };
}

export function ruleError(errorMessage) {
  return {
    type: RULE_ERROR,
    errorMessage
  };
}

export function showRule(item = {}) {
  return {
    type: SHOW_RULE,
    item
  };
}

export function removeRule(itemId) {
  return {
    type: REMOVE_RULE,
    itemId
  };
}

export function fetchRules({ search, order, limit, page }) {
  const url = [
    'Rule?count=1',
    limit ? `&limit=${limit}` : null,
    page && (page > 1) ? `&skip=${page * limit}` : null,
    order ? `&order=${order}` : null,
    search ? `&where=${JSON.stringify({
      $or: [
        { title_event: { $regex: search, $options: 'i' } },
        { description_event: { $regex:  search, $options: 'i' } }
      ]
    })}` : null
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addRules(results, count)));
}

export function createRule(rule) {
  return dispatch => apiRequest.post('Rule', rule)
    .then(() => browserHistory.push('/rules'))
    .catch(({ response: { data: { error } } }) => dispatch(ruleError(error)));
}

export function fetchRule(itemId) {
  return dispatch => apiRequest.get('Rule', itemId)
    .then(({ data }) => dispatch(showRule(data)))
    .catch(() => browserHistory.push('/not-found'));
}

export function updateRule(itemID, rule) {
  return dispatch => apiRequest.put('Rule', itemID, rule)
    .then(() => browserHistory.push('/rules'))
    .catch(({ response: { data: { error } } }) => dispatch(ruleError(error)));
}

export function deleteRule(itemID) {
  return dispatch => apiRequest.delete('Rule', itemID)
    .then(() => dispatch(removeRule(itemID)))
    .then(() => browserHistory.push('/rules'));
}