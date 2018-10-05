import { ADD_GROUPS, ADD_GROUP, GROUP_ERROR, SHOW_GROUP, REMOVE_GROUP } from '../constants/Group';

const defaultState = {
  items: [],
  item: {},
  errorMessage: null
};

export default function GroupReducer(state = defaultState, { type, items, count, item, itemId, errorMessage }) {
  switch (type) {
    case ADD_GROUPS:
      return {
        ...state,
        items,
        count
      };

    case ADD_GROUP:
      return {
        ...state,
        items: [
          ...state.items,
          item
        ]
      };

    case GROUP_ERROR:
      return {
        ...state,
        errorMessage
      };

    case SHOW_GROUP:
      return {
        ...state,
        item
      };

    case REMOVE_GROUP:
      return {
        ...state,
        items: state.items.filter(i => i.id !== itemId)
      };

    default:
      return state;
  }
}
