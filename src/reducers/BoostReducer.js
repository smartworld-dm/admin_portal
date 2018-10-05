import { ADD_BOOSTS, ADD_BOOSTS_UNVERIFIED, ADD_BOOST, BOOST_ERROR, SHOW_BOOST, REMOVE_BOOST } from '../constants/Boost';

const defaultState = {
  items: [],
  items_unverified: [],
  item: {},
  errorMessage: null
};

export default function BoostReducer(state = defaultState, { type, items, count, items_unverified, count_unverified, item, itemId, errorMessage }) {
  switch (type) {
    case ADD_BOOSTS:
      return {
        ...state,
        items,
        count
      };
	  
	  case ADD_BOOSTS_UNVERIFIED:
      return {
        ...state,
        items_unverified,
        count_unverified
      };

    case ADD_BOOST:
      return {
        ...state,
        items: [
          ...state.items,
          item
        ]
      };

    case BOOST_ERROR:
      return {
        ...state,
        errorMessage
      };

    case SHOW_BOOST:
      return {
        ...state,
        item
      };

    case REMOVE_BOOST:
      return {
        ...state,
        items: state.items.filter(i => i.id !== itemId)
      };

    default:
      return state;
  }
}
