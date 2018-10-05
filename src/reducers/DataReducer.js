import { ADD_DATA, CITY_DATA, DOWNLOADS, USERS, TAGS, MALE, SENT_INVITES_COUNT, ACCEPT_INVITES_COUNT, NO_OF_PLANS, NO_OF_ACTIVE_PLANS, TOP_NEIGHBORHOODS, TOP_LOCATIONS, POPULAR_PLANS, POP_DATE_TIME, ACCEPTED_PLANS_BY_STOPS, INITIATED_PLANS_COUNT, ACCEPTED_TAGS_STOP} from '../constants/Data';

const defaultState = {
  item: {},
  cities: {},
  sent_invite_Count: 0,
  accept_invite_count: 0,
  plans_count: 0,
  active_plans_count: 0,
  estimated_cost_list: {},
  plans_neighborhoods: {},
  locations_list: {},
  plans_list: {},
  category_list: {},
  popular_date_time: {},
  accepted_plans_by_stop: {},
  initiated_plans: 0,
  initiated_plans_users:0,
  accepted_tags_by_stop: {}
};

export default function DataReducer(state = defaultState, { type, item, cities, downloads_count, users_count, tags, male, sent_invite_Count, accept_invite_count, plans_count, active_plans_count, estimated_cost_list, plans_neighborhoods, neighborhoods, locations_list, plans_list, category_list, popular_date_time, accepted_plans_by_stop, initiated_plans, initiated_plans_users, accepted_tags_by_stop }) {
  switch (type) {
    case ADD_DATA:
      return {
        ...state,
        item
      };
    case CITY_DATA:
      return {
        ...state,
        cities
      };
	  case DOWNLOADS:
      return {
        ...state,
        downloads_count
      };
	  case USERS:
	  return {
        ...state,
        users_count
      };
	  case TAGS:
	  return {
        ...state,
        tags
      };
	  case MALE:
	  return {
        ...state,
        male
      };
	  case SENT_INVITES_COUNT:
	  return {
        ...state,
        sent_invite_Count
      };
	  case ACCEPT_INVITES_COUNT:
	  return {
        ...state,
        accept_invite_count
      };
	  case NO_OF_PLANS:
	  return {
        ...state,
        plans_count
      };
	  case NO_OF_ACTIVE_PLANS:
	  return {
        ...state,
        active_plans_count,
		estimated_cost_list,
		plans_neighborhoods
      };
	  case TOP_NEIGHBORHOODS:
	  return {
        ...state,
        neighborhoods
      };
	  case TOP_LOCATIONS:
	  return {
        ...state,
        locations_list
      };
	  case POPULAR_PLANS:
	  return {
        ...state,
        plans_list,
		category_list
      };
	  case POP_DATE_TIME:
	  return {
        ...state,
        popular_date_time
      };
	  case ACCEPTED_PLANS_BY_STOPS:
	  return {
        ...state,
        accepted_plans_by_stop
      };
	  case INITIATED_PLANS_COUNT:
	   return {
        ...state,
        initiated_plans,
		initiated_plans_users
      };
	  case ACCEPTED_TAGS_STOP:
	  return {
        ...state,
        accepted_tags_by_stop
      };
    default:
      return state;
  }
}
