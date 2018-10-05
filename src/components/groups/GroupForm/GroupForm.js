import isEmpty from 'lodash/isEmpty';
import first from 'lodash/first';
import size from 'lodash/size';
import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import { Field, reduxForm } from 'redux-form';

import {
  LinkTo,
  renderField,
  renderMultiselect,
  ArrayPlus,
  renderTextareaField,
  renderCheckboxField,
  renderDropdownList
} from '../../../helpers';

import { capitalize, days, times } from '../../../utils';

class GroupForm extends Component {
  state = {
    is_private: false
  }

  componentDidMount() {
    this.handleInitialize()
  }

  handleInitialize() {
    const {
      item,
      item: {
        name, tags, description, criteria, group_banner_url, group_profile_photo_url, age_small, age_big, metro_cities, gender, group_question, first_msg, 
        verify_question, verify_answer, is_private, reservations, is_one_location, access_code, active_days, active_times, email_verification, skip_group_suggestion, require_availability
      },
      initialize
    } = this.props;

    if (!isEmpty(item)) {
      initialize({
        name, tags, description, criteria, group_banner_url, group_profile_photo_url, age_small, age_big, metro_cities, gender, group_question, first_msg, 
        verify_question, verify_answer, is_private, reservations, is_one_location, access_code, active_days, active_times, email_verification, skip_group_suggestion, require_availability
      });
    }
  }

  render () {
    const { item, copy, tags, metroCities, errorMessage, handleSubmit, onSave } = this.props;
    const { is_private } = this.state;

    return (
      <form onSubmit={handleSubmit(group => onSave(group))}>
        <div className="row group">
          <div className="col-md-6">
            <Field name="name" component={renderField} label="Group Name" />
            <Field name="description" component={renderTextareaField} label="Group Description" max="250" min="0" />
            <Field name="group_banner_url" component={renderField} label="Group Banner URL" />
            <Field name="group_profile_photo_url" component={renderField} label="Group Profile Photo URL" />
            <div className="row">
              <div className="col-md-3 small-age">
                <Field name="age_small" component={renderField} label="Age Criteria" />
              </div> 
              <div className="col-md-1 to-age">to</div>
              <div className="col-md-3 big-age">
                <Field name="age_big" component={renderField}/>
              </div>
            </div>
            <Field
                name="gender"
                valueField="value"
                textField="name"
                component={renderDropdownList}
                data={[
                  {name: 'Male', value: 'male'},
                  {name: 'Female', value: 'female'},
                  {name: 'Both', value: 'both'}
                ]}
                label="Gender"
              />
            <Field name="first_msg" component={renderTextareaField} label="First Message"/>
            <Field name="is_private" component={renderCheckboxField} label="Private" 
              afterChange={({ target: { checked } }) => this.setState({ is_private: checked })}/>
            {
              is_private ? (
                <Field
                  name="access_code"
                  component={renderField}
                  placeholder="Access Code"
                />
              ) : null
            }
            <Field name="reservations" component={renderCheckboxField} label="Take Reservations" />
            <Field name="is_one_location" component={renderCheckboxField} label="One Location?" />
            <Field name="email_verification" component={renderCheckboxField} label="Email Verification" />
            <Field name="skip_group_suggestion" component={renderCheckboxField} label="Skip Group Suggestion" />
            <Field name="require_availability" component={renderCheckboxField} label="Require Availability" />
            <div className="btn-group">
              <LinkTo className="btn btn-default" url="Groups">Cancel</LinkTo>
              <button action="submit" className="btn btn-primary">
                {(isEmpty(item) || (copy!=undefined && copy=='copy')) ? 'Create Group' : 'Update Group'}
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <Field
              name="tags"
              component={renderMultiselect}
              data={tags.map(({ tag }) => tag)}
              label="Tags"
            />
            <Field
              name="criteria"
              component={ArrayPlus}
              label="Group Criteria"
            />
            <Field
              name="metro_cities"
              component={renderMultiselect}
              data={metroCities.map(({ name }) => name)}
              label="Metro Cities"
            />
            <Field
              name="group_question"
              component={ArrayPlus}
              label="Group Questions"
            />
            <Field name="verify_question" component={renderField} label="Group Verification Questions" />
            <Field
              name="verify_answer"
              component={ArrayPlus}
              label="Verification Answers"
            />
            <Field
              name="active_days"
              component={renderMultiselect}
              data={days.map(({ name }) => name)}
              label="Active Days"
            />
            <Field
              name="active_times"
              component={renderMultiselect}
              data={times.map(({ name }) => name)}
              label="Active Times"
            />
          </div>
        </div>
        {
          errorMessage ? 
          ( <div className="alert alert-danger">
              <strong>Oops!</strong> {errorMessage}
            </div> ) 
          : null
        }
      </form>
    );
  }
}

function validate(values) {
  const { name, description, age_small, age_big, group_banner_url, group_profile_photo_url, verify_answer, verify_question, criteria, metro_cities, gender, group_question, tags, is_private, access_code, active_days, active_times, email_verification } = values;
  const errors = {};

  if (name && name.length > 35)
    errors.name = 'Group name length should be up to 35 characters.';

  if (description && description.length > 250)
    errors.description = 'Group description length should be up to 250 characters.';

  if (age_big) {
    if (parseInt(age_big) > 100) errors.age_big = "Age shouldn't be over 100.";
    else if (parseInt(age_big) < 1) errors.age_big = "Age shouldn't be under 0.";
    else if (_.isNaN(parseInt(age_big))) errors.age_big = "Age should between 0 to 100.";
  }

  if (age_small) {
    if (parseInt(age_small) > 100) errors.age_small = "Age shouldn't be over 100.";
    else if (parseInt(age_small) < 1) errors.age_small = "Age shouldn't be under 0.";
    else if (_.isNaN(parseInt(age_small))) errors.age_small = "Age should between 0 to 100.";
  }

  if (size(criteria) === 0) 
    errors.criteria = 'Criterias are required';

  if (size(metro_cities) === 0) 
    errors.metro_cities = 'Metro cities are required';

  if (size(gender) === 0) 
    errors.gender = 'gender is required';

  if (size(group_question) === 0) 
    errors.group_question = 'Group question is required';

  if (size(active_days) === 0) 
    errors.active_days = 'Active days is required';

  if (size(active_times) === 0) 
    errors.active_times = 'Active times is required';

  if (is_private)
    if (!access_code)
      errors.access_code = 'Access code is required';

  [
    'name',
    'description',
    'group_banner_url',
    'group_profile_photo_url'
  ].map(field => {
    if (!values[field]) {
      errors[field] = `${capitalize(first(field.split('_')))} is required`;
    }
  });

  return errors;
}

GroupForm.defaultProps = {
  item: {}
};

GroupForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    objectId: PropTypes.string
  })
};

export default reduxForm({ form: 'group', validate })(GroupForm);