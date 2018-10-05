import filter from 'lodash/filter';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import { browserHistory } from 'react-router';

import { ADD_SERIES, ADD_A_SERIES, SERIES_ERROR, SHOW_SERIES, REMOVE_SERIES } from '../constants/Series';

import { apiRequest } from '../utils';

export function addSeries(items = [], count = 0) {
  return {
    type: ADD_SERIES,
    items,
    count
  };
}

export function addASeries(item = {}) {
  return {
    type: ADD_A_SERIES,
    item
  };
}

export function seriesError(errorMessage) {
  return {
    type: SERIES_ERROR,
    errorMessage
  };
}

export function showSeries(item = {}) {
  return {
    type: SHOW_SERIES,
    item
  };
}

export function removeSeries(itemId) {
  return {
    type: REMOVE_SERIES,
    itemId
  };
}

export function fetchSeries({ search, include, order, limit, page }) {
  const url = [
    'Series?count=1',
    limit ? `&limit=${limit}` : null,
    page && (page > 1) ? `&skip=${page * limit}` : null,
    order ? `&order=${order}` : null,
    include ? `&include=${include}` : null,
    search ? `&where=${JSON.stringify({
      $or: [
        { title_event: { $regex: search, $options: 'i' } },
        { description_event: { $regex:  search, $options: 'i' } }
      ]
    })}` : null
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addSeries(results, count)));
}

export function fetchASeries(itemId, { include = 'plans, plans.locations.location' }) {
  return dispatch => apiRequest.get('Series', itemId, `?include="${include}"`)
    .then(({ data }) => dispatch(showSeries(data)))
    .catch(() => browserHistory.push('/not-found'));
}

export function createSeries({
  title, image,
  start_date, end_date,
  plans, latitude, longitude
}) {
	return dispatch => apiRequest.post('Series', {
			start_date: start_date ? {
				__type: 'Date',
				iso: start_date
			} : null,
			end_date: end_date ? {
				__type: 'Date',
				iso: end_date
			} : null,
			plans: (plans || []).map(p => ({
				__type: 'Pointer',
				className: 'EventDetail',
				objectId: p.objectId}
			)),
			title,
      image,
      location: {
        __type: 'GeoPoint',
        latitude: latitude,
        longitude: longitude
      }
		}).then(() => browserHistory.push('/series'))
		.catch( ({ response: { data: { error } } }) => dispatch(seriesError(error)) );
}

export function updateSeries(itemID, {
  title, image,
  start_date, end_date,
	plans, latitude, longitude
}, item) {
  return dispatch => apiRequest.put('Series', itemID, {
    start_date: start_date ? {
        __type: 'Date',
        iso: start_date
      } : null,
    end_date: end_date ? {
        __type: 'Date',
        iso: end_date
      } : null,
    plans: (plans || []).map(l => ({
        __type: 'Pointer',
        className: 'EventDetail',
        objectId: l.objectId
      })),
    title, image,
    location: latitude && longitude ? {
      __type: 'GeoPoint',
      latitude: latitude,
      longitude: longitude
    } : null,
  }).then(() => browserHistory.push('/series'))
    .catch(({ response: { data: { error } } }) => dispatch(seriesError(error)));
}

export function deleteSeries(itemID) {
  return dispatch => apiRequest.delete('Series', itemID)
    .then(() => dispatch(removeSeries(itemID)))
    .then(() => browserHistory.push('/series'));
}
