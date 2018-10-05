import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import without from 'lodash/without';
import size from 'lodash/size';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList'
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import momentLocalizer from 'react-widgets-moment';
import { Checkbox } from 'react-bootstrap';
import cl from 'classnames';

import { Button } from '../helpers';
import { weekDays, numberOfWeekDay, capitalize } from '../utils';

momentLocalizer(moment);

export default class WeekdayStartEndList extends Component {

  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string,
    type: PropTypes.string
  };

  state = {
    value: {
      allDay: false
    },
    values: [],
    isEditTime: false,
    new_time: '',
    curValIndex: 0,
    isEditStart: false,
    canCopy: false
  };

  componentWillReceiveProps(nextProps) {
    if (isArray(nextProps.input.value) && size(nextProps.input.value) > 0) {
      this.setState({ values: nextProps.input.value })
    }
  }

  onTimeChange(e) {
    this.setState({ new_time: e.target.value });
  }

  onClickFinish() {
    const { input } = this.props;
    const { values, isEditTime, new_time, curValIndex, isEditStart } = this.state;

    if (isEditTime) {
      let newValues = [];

      values.map((value, index) =>{
        newValues.push(value);

        if (index === curValIndex) {
          if (isEditStart)
            newValues[index].start = new_time;
          else
            newValues[index].end = new_time;
        }
      });

      this.setState({ values: newValues, isEditTime: false }, () => input.onChange(this.state.values));
    }
  }

  onClickCopy(index) {
    const { input } = this.props;
    const { values, value, canCopy } = this.state;

    if (canCopy) {
      let newValue = {
        'day': value.day, 
        'start': values[index].start,
        'end': values[index].end
      };

      this.setState({ values: [...values, newValue], canCopy: false }, () => input.onChange(this.state.values));
    }
  }

  onClickTime(val, index, isEditStart) {
    let new_time = '';

    if (isEditStart) new_time = val.start;
    else new_time = val.end;

    if (!this.state.isEditTime)
      this.setState({ 
        isEditTime: true,
        canCopy: false,
        new_time,
        curValIndex: index,
        isEditStart
      });
  }

  render() {
    const { input, label, time, meta: { touched, error, warning } } = this.props;
    const { value, values, curValIndex, new_time, isEditStart, isEditTime, canCopy } = this.state;

    return (
      <fieldset className={cl('form-group', {'has-error': (touched && error)})}>
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
                value={isNumber(value.day) ? capitalize(weekDays[value.day]) : null}
                onChange={day => this.setState({ value: { ...value, day: numberOfWeekDay(day.value) }, canCopy: true, isEditTime: false })}
              />
            </td>
            <td>
              {time ? (
                  <DateTimePicker
                    date={false}
                    disabled={value.allDay}
                    value={value.start ? moment(value.start, 'HHmm').toDate() : null}
                    onChange={(_, start) =>
                      this.setState({ value: { ...value, start: moment(start, 'hh:mm A').format('HHmm') } })
                    }
                  />
                ) : (
                  <DateTimePicker
                    format={'MM/DD/YYYY hh:mm:ss'}
                    value={value.start ? moment(value.start, 'MM/DD/YYYY hh:mm:ss').toDate() : null}
                    onChange={(_, start) => this.setState({ value: { ...value, start } })}
                  />
                )}
            </td>
            <td>
              {time ? (
                  <DateTimePicker
                    date={false}
                    disabled={value.allDay}
                    value={value.end ? moment(value.end, 'HHmm').toDate() : null}
                    onChange={(_, end) =>
                      this.setState({ value: { ...value, end: moment(end, 'hh:mm A').format('HHmm') } })
                    }
                  />
                ) : (
                  <DateTimePicker
                    format={'MM/DD/YYYY hh:mm:ss'}
                    value={value.end ? moment(value.end, 'MM/DD/YYYY hh:mm:ss').toDate() : null}
                    onChange={(_, end) => this.setState({ value: { ...value, end } })}
                  />
                )}
            </td>
            <td>
              <Checkbox
                checked={value.allDay}
                onChange={({ target: { checked } }) =>
                  this.setState({ value: { ...value, allDay: checked, start: '0000', end: '2359' } })
                }>
                All day
              </Checkbox>
            </td>
            <td>
              <Button
                color="primary"
                disabled={!isNumber(value.day) || !value.start || !value.end}
                onClick={() => this.setState({ value: {}, allDay: false, values: [...values, value] }, () => input.onChange(this.state.values))}
              >
                Add
              </Button>
            </td>
          </tr>
          {values.map((val, index) => (
            <tr key={index}>
              <td>{capitalize(weekDays[val.day])}</td>
              <td onClick={() => this.onClickTime(val, index, true)}>
                {
                  curValIndex === index && isEditTime && isEditStart ?
                    <input type="text" name="new_time" value={new_time} onChange={(e) => this.onTimeChange(e)}/>
                  : moment(val.start, 'HHmm').format('hh:mm A')
                }
              </td>
              <td onClick={() => this.onClickTime(val, index, false)}>
                {
                  curValIndex === index && isEditTime && !isEditStart ?
                    <input type="text" name="new_time" value={new_time} onChange={(e) => this.onTimeChange(e)}/>
                  : moment(val.end, 'HHmm').format('hh:mm A')
                }
              </td>
              <td>
        			  {/*} <Button
                          color="danger"
                          onClick={() =>
                            this.setState({
                              values: values.filter(({ day, start, end }) => (val.day !== day && val.start !== start && val.end !== end))
                            }, () => input.onChange(this.state.values))
                          }
                        >
                          Remove
        		    </Button> */}
  				
  				      <Button
                  color="danger"
                  onClick={() => this.setState({
                    values: without(values, val)
                  }, () => input.onChange(this.state.values))}
                >
                  Remove
                </Button>
              </td>
              <td>
                {
                  curValIndex === index && isEditTime ?
                    <Button color="primary" onClick={() => this.onClickFinish()}>
                      Finish
                    </Button>
                  : null
                }
                {
                  canCopy ?
                    <Button color="primary" onClick={() => this.onClickCopy(index)}>
                      Copy
                    </Button>
                  : null
                }
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
