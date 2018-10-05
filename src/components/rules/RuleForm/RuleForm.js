import set from 'lodash';
import first from 'lodash/first';
import isEmpty from 'lodash/isEmpty';
import React, { PropTypes, Component } from 'react';
import { Field, reduxForm } from 'redux-form';

import {
  LinkTo,
  renderTextareaField,
  renderCheckboxField,
  renderDatePicker,
  renderField,
  renderDropdownList,
} from '../../../helpers';

import { weekDays, capitalize } from '../../../utils';

class RuleForm extends Component {
  componentDidMount() {
    this.handleInitialize()
  }

  getAvailableMetroCities() {
    const { metroCityItems, rules, item } = this.props;
    let metroCities = metroCityItems;
    let availableMetroCities = [];

    if (metroCities.length > 0) { 
      if (rules) {
        rules.map((rule) => {
          let v = metroCities.filter(city => city.name !== rule.metro_city.name )
          metroCities = v;
        });

        if (metroCities.length > 0) {
          metroCities.map((metroCity) => {
            availableMetroCities.push(metroCity);
          });
        }
      } else {
        availableMetroCities.push(item.metro_city);
      }      
    }

    // console.log('Available Metro cities', availableMetroCities);
    return availableMetroCities;
  }

  handleInitialize() {
    const {
      item,
      locationTypeItems,
      item: {
        metro_city, 
        mile, 
        morning_percent,
        noon_percent, 
        afternoon_percent, 
        evening_percent, 
        late_percent,
        ...locationTypes
      },
      initialize
    } = this.props;

    // if (locationTypes.length > 0){
    //   locationTypes.map((locationType, index) => {
    //     let rlt = {};
    //     _.set(rlt, locationType, '1');
    //     console.log(rlt);
    //     initialize(rlt);
    //   });
    // }

    if (!isEmpty(item)) {
      delete locationTypes.createdAt;
      delete locationTypes.updatedAt;
      delete locationTypes.objectId;
      initialize({
        metro_city, mile, morning_percent, noon_percent, afternoon_percent, evening_percent, late_percent, ...locationTypes
      });
    } else {
      initialize({
        morning_percent: '20',
        noon_percent: '20',
        afternoon_percent: '20',
        evening_percent: '20',
        late_percent: '20'
      });
    }
  }

  render () {
    const { item, rules, locationTypes, locationTypeItems, metroCityItems, errorMessage, handleSubmit, onSave } = this.props;
    let availableMetroCities = this.getAvailableMetroCities();

    return (
      <form onSubmit={handleSubmit(rule => onSave(rule))}>
        <div className="row">
          <div className="col-md-6">
            <Field
              name="metro_city"
              valueField="value"
              textField="name"
              component={renderDropdownList}
              data={availableMetroCities}
              label="Select Metro city"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <h3>Hours allotted for location types(hour)</h3>
            { 
              (locationTypes.length > 0) ?
                locationTypes.map((locationType, index) => (
                  <Field 
                    key={index} 
                    name={locationType} 
                    component={renderField} 
                    label={locationTypeItems[index].name}
                    placeholder=" "/>
                ))
              : null
            }
          </div>
          <div className="col-md-8">
            <h3>Distance between locations(mile)</h3>
            <Field 
              name="mile" 
              component={renderField} 
              label="mile"
              placeholder=" "/>
          </div>
          <div className="col-md-8">
            <h3>Percentage breakdown of time of day(percent)</h3>
            <Field 
              name="morning_percent" 
              component={renderField} 
              label="morning_percent"
              placeholder=" "/>
            <Field 
              name="noon_percent" 
              component={renderField} 
              label="noon_percent"
              placeholder=" "/>
            <Field 
              name="afternoon_percent" 
              component={renderField} 
              label="afternoon_percent"
              placeholder=" "/>
            <Field 
              name="evening_percent" 
              component={renderField} 
              label="evening_percent"
              placeholder=" "/>
            <Field 
              name="late_percent" 
              component={renderField} 
              label="late_percent"
              placeholder=" "/>
          </div>
        </div>
        {errorMessage ? (
            <div className="alert alert-danger">
              <strong>Oops!</strong> {errorMessage}
            </div>
          ) : null}
        <div className="btn-group">
          <LinkTo className="btn btn-default" url="rules">Cancel</LinkTo>
          <button action="submit" className="btn btn-primary">
            {isEmpty(item) ? 'Create Rule' : 'Update Rule'}
          </button>
        </div>
      </form>
    );
  }
}

RuleForm.defaultProps = {
  item: {}
};

RuleForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    objectId: PropTypes.string
  })
};

function validate(values) {
  const { metro_city, mile, morning_percent, noon_percent, afternoon_percent, evening_percent, late_percent } = values;

  const errors = {};

  if (!metro_city)
    errors.metro_city = 'You should select a Metro city(if you have no choice for Metro city, then it seems you already created all rule sets for your entire Metro city)';

  if (!mile) {
    errors.mile = 'Mile should be required';
  } else {
    if (isNaN(parseFloat(mile)))
      errors.mile = 'Mile should be float number';
  }

  if (isNaN(parseInt(morning_percent)))
    errors.morning_percent = 'Morning percent should be integer number';
  if (isNaN(parseInt(noon_percent)))
    errors.noon_percent = 'Noon percent should be integer number';
  if (isNaN(parseInt(afternoon_percent)))
    errors.afternoon_percent = 'Afternoon percent should be integer number';
  if (isNaN(parseInt(evening_percent)))
    errors.evening_percent = 'Evening percent should be integer number';
  if (isNaN(parseInt(late_percent)))
    errors.late_percent = 'Late percent should be integer number';

  if (!isNaN(parseInt(morning_percent)) &&
      !isNaN(parseInt(noon_percent)) &&
      !isNaN(parseInt(afternoon_percent)) &&
      !isNaN(parseInt(evening_percent)) &&
      !isNaN(parseInt(late_percent))) {
        var sum = parseInt(morning_percent) + parseInt(noon_percent) + parseInt(afternoon_percent) + parseInt(evening_percent) + parseInt(late_percent);
        if (sum != 100)
          errors.late_percent = 'Sum of percentages should be 100';
      }

  return errors;
}

export default reduxForm({ form: 'rule', validate })(RuleForm);