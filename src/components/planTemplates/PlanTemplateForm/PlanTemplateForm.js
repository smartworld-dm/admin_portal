import isEmpty from 'lodash/isEmpty';
import React, { PropTypes, Component } from 'react';
import { Field, reduxForm } from 'redux-form';

import {
  LinkTo,
  renderField,
  renderDropdownList,
} from '../../../helpers';

class PlanTemplateForm extends Component {
  componentDidMount() {
    this.handleInitialize()
  }

  handleInitialize() {
    const {
      item,
      item: {
        location_types
      },
      initialize
    } = this.props;

    if (!isEmpty(item)) {
      if (item.location_types.length > 0)
        this.props.change('location_type_0', {"name": item.location_types[0]});
      if (item.location_types.length > 1)
        this.props.change('location_type_1', {"name": item.location_types[1]});
      if (item.location_types.length > 2)
        this.props.change('location_type_2', {"name": item.location_types[2]});
    }
  }

  render () {
    const { item, errorMessage, handleSubmit, onSave, locationTypes } = this.props;
    return (
      <form onSubmit={handleSubmit(planTemplate => onSave(planTemplate))}>
        <div className="row">
          <div className="col-md-6">
            <Field
              name="location_type_0"
              valueField="value"
              textField="name"
              component={renderDropdownList}
              data={locationTypes}
              label="LocationType #1"
            />
            <Field
              name="location_type_1"
              valueField="value"
              textField="name"
              component={renderDropdownList}
              data={locationTypes}
              label="LocationType #2"
            />
            <Field
              name="location_type_2"
              valueField="value"
              textField="name"
              component={renderDropdownList}
              data={locationTypes}
              label="LocationType #2"
            />
          </div>
        </div>
        {errorMessage ? (
            <div className="alert alert-danger">
              <strong>Oops!</strong> {errorMessage}
            </div>
          ) : null}
        <div className="btn-group">
          <LinkTo className="btn btn-default" url="planTemplates">Cancel</LinkTo>
          <button action="submit" className="btn btn-primary">
            {isEmpty(item) ? 'Create PlanTemplate' : 'Update PlanTemplate'}
          </button>
        </div>
      </form>
    );
  }
}

PlanTemplateForm.defaultProps = {
  item: {}
};

PlanTemplateForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    objectId: PropTypes.string
  })
};

export default reduxForm({ form: 'planTemplate' })(PlanTemplateForm);