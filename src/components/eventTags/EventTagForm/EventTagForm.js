import isEmpty from 'lodash/isEmpty';
import React, { PropTypes, Component } from 'react';
import { Field, reduxForm } from 'redux-form';

import {
  LinkTo,
  renderField,
  renderCheckboxField
} from '../../../helpers';

class EventTagForm extends Component {
  componentDidMount() {
    this.handleInitialize()
  }

  handleInitialize() {
    const {
      item,
      item: {
        tag,
		is_feature_tag
      },
      initialize
    } = this.props;

    if (!isEmpty(item)) {
      initialize({
        tag,
		is_feature_tag
      });
    }
  }

  render () {
    const { item, errorMessage, handleSubmit, onSave } = this.props;
    return (
      <form onSubmit={handleSubmit(EventTag => onSave(EventTag))}>
        <div className="row">
          <div className="col-md-6">
            <Field name="tag" component={renderField} label="Tag Name" />
          </div>
          <div className="col-md-6">

          </div>
        </div>
		
		<div className="row">
          <div className="col-md-6">
			<Field name="is_feature_tag" component={renderCheckboxField} label="Feature Tag" />
		 </div>
          <div className="col-md-6">

          </div>
        </div>
		
        {errorMessage ? (
            <div className="alert alert-danger">
              <strong>Oops!</strong> {errorMessage}
            </div>
          ) : null}
        <div className="btn-group">
          <LinkTo className="btn btn-default" url="eventTags">Cancel</LinkTo>
          <button action="submit" className="btn btn-primary">
            {isEmpty(item) ? 'Create Tag' : 'Update Tag'}
          </button>
        </div>
      </form>
    );
  }
}

EventTagForm.defaultProps = {
  item: {}
};

EventTagForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    objectId: PropTypes.string
  })
};

export default reduxForm({ form: 'EventTag' })(EventTagForm);