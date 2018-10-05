import { ADD_SERIES, ADD_A_SERIES, SERIES_ERROR, SHOW_SERIES, REMOVE_SERIES } from '../constants/Series';

const defaultState = {
  items: [],
  item: {},
  errorMessage: null
};

export default function SeriesReducer(state = defaultState, { type, items, count, item, itemId, errorMessage }) {
  switch (type) {
    case ADD_SERIES:
      return {
        ...state,
        items,
        count
      };

    case ADD_A_SERIES:
      return {
        ...state,
        items: [
          ...state.items,
          item
        ]
      };

    case SERIES_ERROR:
      return {
        ...state,
        errorMessage
      };

    case SHOW_SERIES:
      return {
        ...state,
        item
      };

    case REMOVE_SERIES:
      return {
        ...state,
        items: state.items.filter(i => i.id !== itemId)
      };

    default:
      return state;
  }
}
