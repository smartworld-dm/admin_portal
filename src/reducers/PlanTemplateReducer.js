import { ADD_PLANTEMPLATES, ADD_PLANTEMPLATE, SHOW_PLANTEMPLATE, PLANTEMPLATE_ERROR, REMOVE_PLANTEMPLATE } from '../constants/PlanTemplate';

const defaultState = {
  items: [],
  item: {},
  errorMessage: null
};

export default function PlanTemplateReducer(state = defaultState, { type, items, count, item, itemId, errorMessage }) {
  switch (type) {
    case ADD_PLANTEMPLATES:
      return {
        ...state,
        items,
        count
      };

    case ADD_PLANTEMPLATE:
      return {
        ...state,
        items: [
          ...state.items,
          item
        ]
      };

    case PLANTEMPLATE_ERROR:
      return {
        ...state,
        errorMessage
      };

    case SHOW_PLANTEMPLATE:
      return {
        ...state,
        item
      };

    case REMOVE_PLANTEMPLATE:
      return {
        ...state,
        items: state.items.filter(i => i.id !== itemId)
      };

    default:
      return state;
  }
}
