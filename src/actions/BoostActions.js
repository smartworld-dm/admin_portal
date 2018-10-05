import pickBy from 'lodash/pickBy';
import isNull from 'lodash/isNull';
import { browserHistory } from 'react-router';

import { ADD_BOOSTS, ADD_BOOSTS_UNVERIFIED, ADD_BOOST, BOOST_ERROR, SHOW_BOOST, REMOVE_BOOST } from '../constants/Boost';

import { apiRequest } from '../utils';

export function addBoosts(items = [], count = 0) {
  return {
    type: ADD_BOOSTS,
    items,
    count
  };
}

export function addBoostsUnVerified(items_unverified = [], count_unverified = 0) {
  return {
    type: ADD_BOOSTS_UNVERIFIED,
    items_unverified,
    count_unverified
  };
}

export function addBoost(item = {}) {
  return {
    type: ADD_BOOST,
    item
  };
}

export function boostError(errorMessage) {
  return {
    type: BOOST_ERROR,
    errorMessage
  };
}

export function showBoost(item = {}) {
  return {
    type: SHOW_BOOST,
    item
  };
}

export function removeBoost(itemId) {
  return {
    type: REMOVE_BOOST,
    itemId
  };
}

export function fetchBoosts({ search, include, order }, { is_admin, objectId }) {
  const user = is_admin ? {} : {
    __type: 'Pointer',
    className: 'Partner',
    objectId
  };

  const query = pickBy({
    $or: search ? [
        { name: { $regex: search, $options: 'i' } }
      ] : null,
    user: is_admin ? null : user,
	$or:[{ $and: [{approved: {"$exists": true}}, {approved: true}]}, { location: {"$inQuery":{"where":{"verified":true},"className":"Location"}}}],
	//approved: true
  }, v => !isNull(v));

  const url = [
    'Boost?count=1',
    order ? `&order=${order}` : null,
    include ? `&include=${include}` : null,
    `&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addBoosts(results, count)));
}

export function fetchBoostsUnVerified({ search, include, order }, { is_admin, objectId }) {
  const user = is_admin ? {} : {
    __type: 'Pointer',
    className: 'Partner',
    objectId
  };

  const query = pickBy({
    $or: search ? [
        { name: { $regex: search, $options: 'i' } }
      ] : null,
    user: is_admin ? null : user,
	location: {"$inQuery":{"where":{"verified":false},"className":"Location"}},
	$or:[{approved: {"$exists": false}}, {approved: false}]
  }, v => !isNull(v));

  const url = [
    'Boost?count=1',
    order ? `&order=${order}` : null,
    include ? `&include=${include}` : null,
    `&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addBoostsUnVerified(results, count)));
}

export function fetchBoost(itemId) {
  return dispatch => apiRequest.get('Boost', itemId)
    .then(({ data }) => dispatch(showBoost(data)))
    .catch(() => browserHistory.push('/not-found'));
}

export function createBoost(boost, { objectId }) {
	boost.location= {__type: "Pointer", className: "Location", objectId: boost.location.objectId };
  return dispatch => apiRequest.post('Boost', {
    ...boost,
    user: {
      __type: 'Pointer',
      className: 'Partner',
      objectId
    },
  })
    .then(() => browserHistory.push('/boosts'))
    .catch(({ response: { data: { error } } }) => dispatch(boostError(error)));
}

export function updateBoost(itemID, boost) {
	boost.location= {__type: "Pointer", className: "Location", objectId: boost.location.objectId };
  return dispatch => apiRequest.put('Boost', itemID, boost)
    .then(() => browserHistory.push('/boosts'))
    .catch(({ response: { data: { error } } }) => dispatch(boostError(error)));
}

export function deleteBoost(itemID) {
  return dispatch => apiRequest.delete('Boost', itemID)
    .then(() => dispatch(removeBoost(itemID)))
    .then(() => browserHistory.push('/boosts'));
}

export function pauseBoost(itemID, boost_pause) {
	return dispatch => apiRequest.put('Boost', itemID,{boost_pause: boost_pause}).
	then(() => { return true;}).
	catch(err => console.log(err));
}
