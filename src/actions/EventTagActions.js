import { browserHistory } from 'react-router';

import { ADD_EVENT_TAGS, ADD_EVENT_TAG, EVENT_TAG_ERROR, SHOW_EVENT_TAG, REMOVE_EVENT_TAG } from '../constants/EventTag';

import { apiRequest } from '../utils';

export function addEventTags(items = [], count = 0) {
  return {
    type: ADD_EVENT_TAGS,
    items,
    count
  };
}

export function addEventTag(item = {}) {
  return {
    type: ADD_EVENT_TAG,
    item
  };
}

export function EventTagError(errorMessage) {
  return {
    type: EVENT_TAG_ERROR,
    errorMessage
  };
}

export function showEventTag(item = {}) {
  return {
    type: SHOW_EVENT_TAG,
    item
  };
}

export function removeEventTag(itemId) {
  return {
    type: REMOVE_EVENT_TAG,
    itemId
  };
}

export function fetchEventTags({ search, include, order }) {
  const url = [
    'EventTags?count=1',
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
    .then(({ data: { results, count } }) => dispatch(addEventTags(results, count)));
}

export function fetchEventTag(itemId) {
  return dispatch => apiRequest.get('EventTags', itemId)
    .then(({ data }) => dispatch(showEventTag(data)))
    .catch(() => browserHistory.push('/not-found'));
}

export function createEventTag(EventTag) {
  return dispatch => apiRequest.post('EventTags', EventTag)
    .then(() => browserHistory.push('/eventTags'))
    .catch(({ response: { data: { error } } }) => dispatch(EventTagError(error)));
}

export function updateEventTag(itemID, EventTag) {
  return dispatch => apiRequest.put('EventTags', itemID, EventTag)
    .then(() => browserHistory.push('/eventTags'))
    .catch(({ response: { data: { error } } }) => dispatch(EventTagError(error)));
}

export function deleteEventTag(itemID) {
  return dispatch => apiRequest.delete('EventTags', itemID)
    .then(() => dispatch(removeEventTag(itemID)))
    .then(() => browserHistory.push('/eventTags'));
}
