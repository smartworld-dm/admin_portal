import filter from 'lodash/filter';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { browserHistory } from 'react-router';
import moment from 'moment';

import { ADD_PLAZA_OFFERS, ADD_PLAZA_OFFER, PLAZA_OFFER_ERROR, SHOW_PLAZA_OFFER, REMOVE_PLAZA_OFFER } from '../constants/PlazaOffer';

import { apiRequest } from '../utils';

export function addPlazaOffers(items = [], count = 0) {
  return {
    type: ADD_PLAZA_OFFERS,
    items,
    count
  };
}

export function addPlazaOffer(item = {}) {
  return {
    type: ADD_PLAZA_OFFER,
    item
  };
}

export function plazaOfferError(errorMessage) {
  return {
    type: PLAZA_OFFER_ERROR,
    errorMessage
  };
}

export function showPlazaOffer(item = {}) {
  return {
    type: SHOW_PLAZA_OFFER,
    item
  };
}

export function removePlazaOffer(itemId) {
  return {
    type: REMOVE_PLAZA_OFFER,
    itemId
  };
}

export function fetchPlazaOffers({ search, include, order, limit, page }) {
  const url = [
    'PlazaOffer?count=1',
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
    .then(({ data: { results, count } }) => dispatch(addPlazaOffers(results, count)));
}

export function fetchPlazaOffer(itemId, { include = 'locations.location' }) {
  return dispatch => apiRequest.get('PlazaOffer', itemId, `?include="${include}"`)
    .then(({ data }) => dispatch(showPlazaOffer(data)))
    .catch(() => browserHistory.push('/not-found'));
}

export function createPlazaOffer({
  banner_url, title, description, posting_type, metro_city2, plan_locations, start_day, end_day, count_attended_range, type_event, is21_age , first_message, posting_live_date, estimated_cost}) {
	  
	  var status = 'Pending';
	  if(moment('YYYY-MM-DD') == moment(posting_live_date).format('YYYY-MM-DD')){
		   var status = 'Live';
	  }
	  else if(moment('YYYY-MM-DD') < moment(posting_live_date).format('YYYY-MM-DD')){
		   var status = 'Expired';
	  }
	  
  return dispatch => apiRequest.post('PlazaOffer', {
    banner_url, title, description, posting_type, metro_city2, plan_locations, start_day, end_day, count_attended_range, type_event, is21_age , first_message, posting_live_date, estimated_cost, status
  }).then(() => browserHistory.push('/plazaOffers'))
    .catch(({ response: { data: { error } } }) => dispatch(plazaOfferErrorError(error)));
}

export function updatePlazaOffer(itemID, {
  banner_url, title, description, posting_type, metro_city2, plan_locations, start_day, end_day, count_attended_range, type_event, is21_age , first_message, posting_live_date, estimated_cost}, item) {
	  
	  var status = 'Pending';
	  var current_date_var = moment();
	  var posting_live_date_var = moment(posting_live_date);
	  if(current_date_var.diff(posting_live_date_var,'days') == 0){
		   var status = 'Live';
	  }
	  else if(current_date_var.diff(posting_live_date_var,'days')>0){
		   var status = 'Expired';
	  }
	
  return dispatch => apiRequest.put('PlazaOffer', itemID, {
		banner_url, title, description, posting_type, metro_city2, plan_locations, start_day, end_day, count_attended_range, type_event, is21_age , first_message, posting_live_date, estimated_cost, status
  }).then(() => browserHistory.push('/plazaOffers'))
    .catch(({ response: { data: { error } } }) => dispatch(plazaOfferError(error)));
}

export function deletePlazaOffer(itemID) {
  return dispatch => apiRequest.delete('PlazaOffer', itemID)
    .then(() => dispatch(removePlazaOffer(itemID)))
    .then(() => browserHistory.push('/plazaOffers'));
}
