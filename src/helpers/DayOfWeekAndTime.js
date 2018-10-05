import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import size from 'lodash/size';
import React, { Component, PropTypes } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import cl from 'classnames';
import Multiselect from 'react-widgets/lib/Multiselect';
import without from 'lodash/without';
import { Field } from 'redux-form';

import { Button, renderCheckboxField } from '../helpers';
import { weekDays, numberOfWeekDay, capitalize } from '../utils';

export default class DayOfWeekAndTime extends Component {

  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string,
    type: PropTypes.string
  };

  state = {
    value: {},
    values: []
  };

  componentDidMount() {
	  if(this.props.dates && this.props.dates.length>0){
		this.setState({values: this.props.dates});
	  }
  }
  componentWillReceiveProps(nextProps) {
    if (isArray(nextProps.input.value)) {
      this.setState({ values: nextProps.input.value })
    }
  }
  
  changeStateData = (value) =>{
	this.props.input.onChange(this.state.values)
  }
  
  render() {
    const { input, label, time, dates, dropUp, disabled, meta: { touched, error, warning } } = this.props;
    const { value, values } = this.state;
    return (
      <fieldset className={cl('form-group', {'has-error': (touched && error)})} disabled={disabled ? true : null}>
        {label ? <label>{label}</label> : null}
        <table className="table table-hover table-striped table-bordered">
          <tbody>
          <tr>
            <td className="wide-td">
              <DropdownList
                valueField="value"
                textField="name"
                data={weekDays.map(day => ({ name: capitalize(day), value: day }))}
                filter="contains"
                value={isNumber(value.day) ? capitalize(weekDays[value.day - 1]) : null}
                onChange={day => this.setState({ value: { ...value, day: numberOfWeekDay(day.value) } })}
                {...{dropUp}}
                disabled={ disabled ? true : values.map((val) => weekDays[val.day - 1])}
              />
            </td>
            <td>
              <Multiselect
                valueField="id"
                textField="name"
                value={value.times}
                data={[
                  { id: '0600_1000', name: 'Morning (6:00 AM to 10:00 AM)' },
                  { id: '1001_1400', name: 'Noon (10:01 AM to 2:00 PM)' },
                  { id: '1401_1800', name: 'Afternoon (2:01 PM to 6:00 PM)' },
                  { id: '1801_2200', name: 'Evening (6:01 PM to 10:00 PM)' },
                  { id: '2201_0200', name: 'Late (10:01 PM to 2:00 AM)' },
                ]}
                onChange={(times, ...rest) => this.setState({ value: { ...value, times } })}
                {...{dropUp}}
                disabled={disabled ? true : null}
              />
            </td>
            <td>
              <Button
                color="primary"
                disabled={!isNumber(value.day) || !value.times}
				onClick={() =>{this.setState({ value: {}, allDay: false, values: [...values, value] }, () => this.changeStateData(value))}}
              >
                Add
              </Button>
            </td>
          </tr>
          {values.map((val, index) => (
            <tr key={index}>
              <td>{capitalize(weekDays[val.day - 1])}</td>
              <td>{(val.times || []).map(time => time.name).join(', ')}</td>
              <td>
              <Button
                color="danger"
                onClick={() => this.setState({
                  values: without(values, val)
                }, () => input.onChange(this.state.values))}
              >
                Remove
              </Button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        {touched && ((error && <div className="error help-block">{error}</div>) || (warning && <div className="error">{warning}</div>))}
      </fieldset>
    );
  }
}
