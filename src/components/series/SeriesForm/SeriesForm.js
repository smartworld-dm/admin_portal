import first from 'lodash/first';
import range from 'lodash/range';
import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import React, { PropTypes, Component } from 'react';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import Promise from 'bluebird';
import reduce from 'lodash/reduce';
import uniq from 'lodash/uniq';

import {
  LinkTo,
  LocationsTimeArray,
  renderField,
  renderCheckboxField,
  renderTextareaField,
  renderDatePicker,
  renderDropdownList,
  renderMultiselect,
	SeriesPlanFinder,
	SeriesPlanArray,
} from '../../../helpers';

import { weekDays, capitalize } from '../../../utils';

class SeriesForm extends Component {
  componentDidMount() {
		this.handleInitialize();
  }

  handleInitialize() {
    const { item, item: {
      title, image,
      start_date, end_date, location, 
			plans
    }, initialize } = this.props;

    if (!isEmpty(item)) {
      initialize({
				title, image,
        start_date: (start_date ? start_date.iso : null),
        end_date: (end_date ? end_date.iso : null),
        plans,location, latitude: location.latitude, longitude: location.longitude
      });
    }
  }

	selectPlanSelection(plans) {
    this.props.change('plans', plans );
    
		if (plans.length > 0) { 
			var start_date = plans[0].start_day.iso;
			var end_date = plans[plans.length - 1].start_day.iso;
			this.props.change('start_date', start_date );
      this.props.change('end_date', end_date );
      this.props.change('latitude', plans[0].locations[0].location.location.latitude );
      this.props.change('longitude', plans[0].locations[0].location.location.longitude );
		}
	}

  render () {
    const { item, errorMessage, handleSubmit, onSave, change } = this.props;
    
    return (
      <form onSubmit={handleSubmit(series => {onSave(series)})}>
        <div className="row">
          <div className="col-md-6">
            {errorMessage ? (
                <div className="alert alert-danger">
                  <strong>Oops!</strong> {errorMessage}
                </div>
              ) : null}
            <div className="btn-group">
              <LinkTo className="btn btn-default" url="series">Cancel</LinkTo>
              <button action="submit" className="btn btn-primary">
                {isEmpty(item) ? 'Create Series' : 'Update Series'}
              </button>
            </div>
          </div>
					<div className="col-md-6">
					<Field
						name="planFinder"
						component={SeriesPlanFinder}
						label="Find Plans"
						placeholder="Find Plans"
						onSelectPlans={(plans) => { this.selectPlanSelection( plans ) } }
					 />
					</div>
        </div>
        <div className="row">
					<div className="col-md-6">
            <Field name="image" component={renderField} label="URL of banner"/>
            <Field name="title" component={renderField} label="Title"/>
            <Field
              name="start_date"
              component={renderDatePicker}
              label="Start Date"
            />
					<p className="help-block">Start date should be date of first plan</p>
            <Field
              name="end_date"
              component={renderDatePicker}
              label="End Date"
            />
					<p className="help-block">End date should be date of last plan</p>
          </div>
          <div className="col-md-6">
            <Field name="latitude" component={renderField} label="Latitude"/>
            <Field name="longitude" component={renderField} label="Longitude"/>
          </div>
          <div className="col-md-12">
						<Field
							name="plans"
							component={SeriesPlanArray}
							label="Plans"
						/>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {errorMessage ? (
                <div className="alert alert-danger">
                  <strong>Oops!</strong> {errorMessage}
                </div>
              ) : null}
            <div className="btn-group">
              <LinkTo className="btn btn-default" url="Series">Cancel</LinkTo>
              <button action="submit" className="btn btn-primary">
                {isEmpty(item) ? 'Create Series' : 'Update Series'}
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

SeriesForm.defaultProps = {
  item: {}
};

SeriesForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    objectId: PropTypes.string
  })
};

function validate(values) {
	const errors = {};
	[
		'title',
		'image',
		'start_date',
    'end_date',
    'latitude',
    'longitude'
	].map(field => {
		if (!values[field]) {
			errors[field] = `${capitalize(first(field.split('_')))} is required`;
		}
	});
	return errors;
}

export default reduxForm({ form: 'series', validate })(SeriesForm);
