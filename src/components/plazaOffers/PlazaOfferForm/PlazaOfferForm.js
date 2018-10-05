import first from 'lodash/first';
import range from 'lodash/range';
import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import Promise from 'bluebird';
import reduce from 'lodash/reduce';
import uniq from 'lodash/uniq';
import moment from 'moment';

import { fetchLocations } from '../../../actions/LocationActions';
import { fetchTags } from '../../../actions/TagActions';

import { fetchMetroCities } from '../../../actions/DataActions';

import {
  LinkTo,
  LocationsTimeArray,
  LocationsDateArray,
  renderField,
  renderCheckboxField,
  renderTextareaField,
  renderDatePicker,
  renderDropdownList,
  renderDropdownListCustom,
  renderMultiselect
} from '../../../helpers';

import { weekDays, capitalize } from '../../../utils';

class PlazaOfferForm extends Component {
	
	state = {
		citiesFetched: false,
		showPlanFields: true
	}
	
	
  componentDidMount() {
    const { fetchTags, fetchLocations, fetchMetroCities } = this.props;
	fetchMetroCities().then(() => {this.setState({citiesFetched: true})});
    Promise.all([
      fetchTags({}),
      fetchLocations({limit:500})
    ]).then(() => this.handleInitialize());
  }

  handleInitialize() {
    const { item, item: {
      banner_url, title, description, posting_type, metro_city2, plan_locations, start_day, end_day, count_attended_range, type_event, is21_age , first_message, posting_live_date, estimated_cost
    }, initialize } = this.props;

    if (!isEmpty(item)) {
      initialize({
         banner_url, title, description, posting_type, metro_city2, plan_locations, start_day, end_day, count_attended_range, type_event, is21_age , first_message, posting_live_date, estimated_cost
      });
	  
	  if(posting_type.value == 'series'){
		  this.setState({ showPlanFields: false });
	  }
    }
  }

	selectLocationSelection(locations) {
		console.log(locations);
		this.setLocationTags(locations);
		this.locationDateArrayMountedCallbacks.selectLocation(locations);
	}

	locationDateArrayMounted (callbacks) {
		console.log("locationDateArrayMounted");
		this.locationDateArrayMountedCallbacks = callbacks
	}

	setLocationTags(locations) {
		const newTags = locations.map(function(item, index) {
			return item.tags || [];
		});
		const merged = reduce(newTags, function(result, arr) {
			return result.concat(arr);
		}, []);
		this.props.change('tags', uniq(merged));
	}
	
	onChange = (value) => {
		this.props.change('posting_type', value);
		if(value.value == 'series'){
			this.setState({ showPlanFields: false});
		}
		else{
			this.setState({ showPlanFields: true});
		}
	}
	
  render () {
    const { item, locations, tags, errorMessage, handleSubmit, onSave, change, cities } = this.props;
	const { citiesFetched, showPlanFields } = this.state;
		const addTagsOfLocation = otherField => (value, previousValue, allValues) => {
			const tags =  allValues['tags'] || [];
			const newTags = value.map(function(item, index) {
				return item.location.tags || [];
			});
			const merged = reduce(newTags, function(result, arr) {
				return result.concat(arr);
			}, tags);
			change('tags', uniq(merged)	);
			return value;
		}

    return (
      <form onSubmit={handleSubmit(plazaOffer => {onSave(plazaOffer)})}>
        <div className="row">
			{errorMessage ? (
				<div className="alert alert-danger">
				  <strong>Oops!</strong> {errorMessage}
				</div>
			  ) : null}
			<div className="btn-group">
			  <LinkTo className="btn btn-default" url="plazaOffers">Cancel</LinkTo>
			  <button action="submit" className="btn btn-primary">
				{ isEmpty(item) ? 'Create Offer' : 'Update Offer'}
			  </button>
			</div>
        </div>
        <div className="row">
			<Field name="banner_url" component={renderField} label="URL Of Banner"/>
            <Field name="title" component={renderField} label="Title"/>
            <Field name="description" component={renderTextareaField} max={250} label="Description" />
			<Field
			  valueField="value"
              textField="name"	
              name="posting_type"
              component={renderDropdownListCustom}
			  data={[{value: 'plan', name: 'Plan'}]}
              label="Posting Type"
			  onChange={value => { this.onChange(value);}}
            />
			<Field
			  name="metro_city2"
			  valueField="objectId"
			  textField="name"
			  component={renderDropdownList}
			  data={citiesFetched ? cities.map(({ name, value }) => ({ name, value })): []}
			  label="Metro City"
			/>
			<Field
              name="plan_locations"
              valueField="objectId"
              textField="name"
              component={LocationsDateArray}
              data={locations.map(({ objectId, name, address, tags }) => ({ objectId, name, address, tags }))}
              label="Stops"
			  tags={tags.map(({ tag }) => tag)}
			  neighborhoods={locations.map(({ neighborhood }) => (neighborhood ))}
            />
			<Field
              name="start_day"
              component={renderDatePicker}
              label="Start Day"
            />
            <Field
              name="end_day"
              component={renderDatePicker}
              label="End Day"
            />
			<Field
              name="count_attended_range"
			  valueField="value"
              textField="name"
              component={renderDropdownList}
			  data={[
                {name: '1-4', value: '1-4'},
                {name: '5-10', value: '5-10'},
                {name: '10+', value: '10+'}
              ]}
              label="Number of Attendees"
            />
            <Field
              name="type_event"
              component={renderDropdownList}
              data={[
                'Adventure',
                'Coffee',
                'Dance',
                'Drinks',
                'Food',
                'Ladies Only',
                'Museum',
                'Music',
                'Relax',
                'Sports',
                'Theatre',
                'Tours',
                'VIP',
                'Volunteer',
                'Workout',
                'Test'
              ]}
              label="Experience Type"
            />
            <Field name="is21_age" component={renderCheckboxField} label="Only 21+ Allowed" />
			<Field name="first_message" component={renderTextareaField} label="First Chat Message" />
			<Field name="posting_live_date" component={renderDatePicker} label="Posting Live Date" />
			<Field
              name="estimated_cost"
              component={renderDropdownList}
              data={['FREE', '$', '$$', '$$$', '$$$$', '$$$$$']}
              label="Estimate Cost"
            />
			{ !showPlanFields ? (<Field
              name="series_locations"
              valueField="objectId"
              textField="name"
              component={LocationsDateArray}
              data={locations.map(({ objectId, name }) => ({ objectId, name }))}
              label="Select Location"
            />
			): null}
			
        </div>
        <div className="row">
          <div className="col-md-12">
            {errorMessage ? (
                <div className="alert alert-danger">
                  <strong>Oops!</strong> {errorMessage}
                </div>
              ) : null}
            <div className="btn-group">
              <LinkTo className="btn btn-default" url="plazaOffers">Cancel</LinkTo>
              <button action="submit" className="btn btn-primary">
                { isEmpty(item) ? 'Create Offer' : 'Update Offer'}
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

PlazaOfferForm.defaultProps = {
  item: {}
};

PlazaOfferForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    objectId: PropTypes.string
  })
};

function validate(values) {
  const {  banner_url, title, description, posting_type, metro_city2, plan_locations, start_day, end_day, count_attended_range, type_event, is21_age , first_message, posting_live_date, estimated_cost } = values;

  const errors = {};

  if (description && description.length > 250) {
    errors.description = 'Description must be less 250';
  }
  
  if(!metro_city2){
	  errors.metro_city2 = 'Metro city is required';
  }
 
  if(!posting_type){
	  errors.posting_type = 'Posting type is required';
  }
  else{
	  if(posting_type.value == 'series'){
		  if(size(series_locations) == 0){
			  errors.series_locations = 'Locations are required';
		  }
	  }
	  else if(posting_type.value == 'plan'){
		  if(size(plan_locations) == 0){
			  errors.plan_locations = 'Locations are required';
		  }
	  }
  }
  
  if(!type_event){
	  errors.type_event = 'Experience Type is required';
  }
  
  if(!count_attended_range){
	  errors.count_attended_range = 'Number of attendees is required';
  }
  
  if(!estimated_cost){
	  errors.estimated_cost = 'Estimated cost is required';
  }

  [
    'title',
	'banner_url',
    'posting_live_date',
	'start_day',
	'end_day'
  ].map(field => {
    if (!values[field]) {
      errors[field] = `${capitalize(first(field.split('_')))} is required`;
    }
  });

  return errors;
}

export default connect(({
  locations: { items: locations },
  tags: { items: tags },
  data: {cities}
}) => ({ locations, tags, cities }), ({ fetchTags, fetchLocations, fetchMetroCities }))(reduxForm({ form: 'plazaOffer', validate })(PlazaOfferForm));
