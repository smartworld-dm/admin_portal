import { ADD_RULES, ADD_RULE, RULE_ERROR, SHOW_RULE, REMOVE_RULE } from '../constants/Rule';

const defaultState = {
  items: [],
  item: {},
  errorMessage: null
};

export default function RULEReducer(state = defaultState, { type, items, count, item, itemId, errorMessage }) {
  switch (type) {
    case ADD_RULES:
      return {
        ...state,
        items,
        count
      };

    case ADD_RULE:
      return {
        ...state,
        items: [
          ...state.items,
          item
        ]
      };

    case RULE_ERROR:
      return {
        ...state,
        errorMessage
      };

    case SHOW_RULE:
      return {
        ...state,
        item
      };

    case REMOVE_RULE:
      return {
        ...state,
        items: state.items.filter(i => i.id !== itemId)
      };

    default:
      return state;
  }
}
