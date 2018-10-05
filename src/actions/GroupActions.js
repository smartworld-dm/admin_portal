import { browserHistory } from 'react-router';

import { ADD_GROUPS, ADD_GROUP, GROUP_ERROR, SHOW_GROUP, REMOVE_GROUP } from '../constants/Group';

import { apiRequest } from '../utils';

export function addGroups(items = [], count = 0) {
  return {
    type: ADD_GROUPS,
    items,
    count
  };
}

export function addGroup(item = {}) {
  return {
    type: ADD_GROUP,
    item
  };
}

export function groupError(errorMessage) {
  return {
    type: GROUP_ERROR,
    errorMessage
  };
}

export function showGroup(item = {}) {
  return {
    type: SHOW_GROUP,
    item
  };
}

export function removeGroup(itemId) {
  return {
    type: REMOVE_GROUP,
    itemId
  };
}

export function fetchGroups({ search, include, order }) {
  const url = [
    'Groups?count=1',
	  '&limit=count',
    order ? `&order=${order}` : null,
    include ? `&include=${include}` : null,
    search ? `&where=${JSON.stringify({
        $or: [
          { tag: { $regex: search, $options: 'i' } }
        ]
      })}` : null
  ].join('');

  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addGroups(results, count)));
}

export function fetchGroup(itemId) {
  return dispatch => apiRequest.get('Groups', itemId)
    .then(({ data }) => dispatch(showGroup(data)))
    .catch(() => browserHistory.push('/not-found'));
}

export function createGroup(Group) {
  return dispatch => apiRequest.post('Groups', Group)
    .then(() => browserHistory.push('/groups'))
    .catch(({ response: { data: { error } } }) => dispatch(groupError(error)));
}

export function updateGroup(itemID, Group) {
  return dispatch => apiRequest.put('Groups', itemID, Group)
    .then(() => browserHistory.push('/groups'))
    .catch(({ response: { data: { error } } }) => dispatch(groupError(error)));
}

export function deleteGroup(itemID) {
  return dispatch => apiRequest.delete('Groups', itemID)
    .then(() => dispatch(removeGroup(itemID)))
    .then(() => browserHistory.push('/groups'));
}
