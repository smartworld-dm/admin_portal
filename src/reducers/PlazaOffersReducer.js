import { ADD_PLAZA_OFFERS, ADD_PLAZA_OFFER, PLAZA_OFFER_ERROR, SHOW_PLAZA_OFFER, REMOVE_PLAZA_OFFER } from '../constants/PlazaOffer';
const defaultState = {
  items: [],
  item: {},
  errorMessage: null
};

export default function PlazaOfferReducer(state = defaultState, { type, items, count, item, itemId, errorMessage }) {
  switch (type) {
    case ADD_PLAZA_OFFERS:
      return {
        ...state,
        items,
        count
      };

    case ADD_PLAZA_OFFER:
      return {
        ...state,
        items: [
          ...state.items,
          item
        ]
      };

    case PLAZA_OFFER_ERROR:
      return {
        ...state,
        errorMessage
      };

    case SHOW_PLAZA_OFFER:
      return {
        ...state,
        item
      };

    case REMOVE_PLAZA_OFFER:
      return {
        ...state,
        items: state.items.filter(i => i.id !== itemId)
      };

    default:
      return state;
  }
}
