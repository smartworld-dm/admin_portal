import { ADD_EVENT_TAGS, ADD_EVENT_TAG, EVENT_TAG_ERROR, SHOW_EVENT_TAG, REMOVE_EVENT_TAG } from '../constants/EventTag';

const defaultState = {
  items: [],
  item: {},
  errorMessage: null
};

export default function EventTagReducer(state = defaultState, { type, items, count, item, itemId, errorMessage }) {
  switch (type) {
    case ADD_EVENT_TAGS:
      return {
        ...state,
        items,
        count
      };

    case ADD_EVENT_TAG:
      return {
        ...state,
        items: [
          ...state.items,
          item
        ]
      };

    case EVENT_TAG_ERROR:
      return {
        ...state,
        errorMessage
      };

    case SHOW_EVENT_TAG:
      return {
        ...state,
        item
      };

    case REMOVE_EVENT_TAG:
      return {
        ...state,
        items: state.items.filter(i => i.id !== itemId)
      };

    default:
      return state;
  }
}
