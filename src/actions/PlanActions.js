import filter from 'lodash/filter';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import { browserHistory } from 'react-router';

import { ADD_PLANS, ADD_PLAN, PLAN_ERROR, SHOW_PLAN, REMOVE_PLAN } from '../constants/Plan';

import { apiRequest } from '../utils';

export function addPlans(items = [], count = 0) {
  return {
    type: ADD_PLANS,
    items,
    count
  };
}

export function addPlan(item = {}) {
  return {
    type: ADD_PLAN,
    item
  };
}

export function planError(errorMessage) {
  return {
    type: PLAN_ERROR,
    errorMessage
  };
}

export function showPlan(item = {}) {
  return {
    type: SHOW_PLAN,
    item
  };
}

export function removePlan(itemId) {
  return {
    type: REMOVE_PLAN,
    itemId
  };
}

export function fetchPlans({ search, include, order, limit, page }) {
  const url = [
    'EventDetail?count=1',
    limit ? `&limit=${limit}` : `&limit=1000`,
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
    .then(({ data: { results, count } }) => dispatch(addPlans(results, count)));
}

export function fetchPlan(itemId, { include = 'locations.location' }) {
  return dispatch => apiRequest.get('EventDetail', itemId, `?include="${include}"`)
    .then(({ data }) => dispatch(showPlan(data)))
    .catch(() => browserHistory.push('/not-found'));
}

export function createPlan({
  title_event, description_event, image, type_event,
  tags, locations, location,
  partner, start_day, count_attended, count_attended_range, is21_age, estimated_cost, end_day,
  reoccur_monday, reoccur_tuesday, reoccur_wednesday, reoccur_thursday, reoccur_friday, reoccur_saturday, reoccur_sunday,
  featured, featured_image_url, featured_name, featured_link, first_message, is_series_plan
}) {
	const d1 = new Date(start_day);
	const d2 = new Date(end_day);

  const isSingleDayPlan = d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  
  return dispatch => apiRequest.post('EventDetail', {
		is_single_day_plan : isSingleDayPlan,
    start_day: start_day ? {
      __type: 'Date',
      iso: start_day
    } : null,
    end_day: end_day ? {
      __type: 'Date',
      iso: end_day
    } : null,
    locations: (locations || []).map(l => ({
      time: l.time,
      location: {
        __type: 'Pointer',
        className: 'Location',
        objectId: l.location.objectId
      }
    })),
    lookupLocations: (locations || []).map(l => ({
      __type: 'Pointer',
      className: 'Location',
      objectId: l.location.objectId
    })),
    title_event, description_event, image, type_event,
    tags, location,
    partner, 
	count_attended: parseInt(count_attended, 10),
    count_attended_range, 	
	is21_age, estimated_cost,
    reoccur_monday, reoccur_tuesday, reoccur_wednesday, reoccur_thursday, reoccur_friday, reoccur_saturday, reoccur_sunday,
    featured, featured_image_url, featured_name, featured_link, first_message, is_series_plan
  }).then(() => browserHistory.push('/plans'))
    .catch(({ response: { data: { error } } }) => dispatch(planError(error)));
}

export function updatePlan(itemID, {
  title_event, description_event, image, type_event,
  tags, locations, location,
  partner, start_day, count_attended, count_attended_range, is21_age, estimated_cost, end_day,
  reoccur_monday, reoccur_tuesday, reoccur_wednesday, reoccur_thursday, reoccur_friday, reoccur_saturday, reoccur_sunday,
  featured, featured_image_url, featured_name, featured_link, first_message,is_series_plan
}, item) {

	const d1 = new Date(start_day);
	const d2 = new Date(end_day);
	const isSingleDayPlan = d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  return dispatch => apiRequest.put('EventDetail', itemID, {
		is_single_day_plan : isSingleDayPlan,
    start_day: start_day ? {
        __type: 'Date',
        iso: start_day
      } : null,
    end_day: end_day ? {
        __type: 'Date',
        iso: end_day
      } : null,
    locations: (locations || []).map(l => ({
      time: l.time,
      location: {
        __type: 'Pointer',
        className: 'Location',
        objectId: l.location.objectId
      }
    })),
    lookupLocations: (locations || []).map(l => ({
      __type: 'Pointer',
      className: 'Location',
      objectId: l.location.objectId
    })),
    title_event, description_event, image, type_event,
    tags, location,
    partner, 
	count_attended: parseInt(count_attended, 10),
	count_attended_range,	
	is21_age, estimated_cost,
    reoccur_monday, reoccur_tuesday, reoccur_wednesday, reoccur_thursday, reoccur_friday, reoccur_saturday, reoccur_sunday,
    featured, featured_image_url, featured_name, featured_link, first_message,is_series_plan
  }).then(() => browserHistory.push('/plans'))
    .catch(({ response: { data: { error } } }) => dispatch(planError(error)));
}

export function deletePlan(itemID) {
  return dispatch => apiRequest.delete('EventDetail', itemID)
    .then(() => dispatch(removePlan(itemID)))
    .then(() => browserHistory.push('/plans'));
}
