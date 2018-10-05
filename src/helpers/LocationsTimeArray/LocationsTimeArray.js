import size from 'lodash/size';
import isArray from 'lodash/isArray';
import without from 'lodash/without';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList'
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import momentLocalizer from 'react-widgets-moment';
import cl from 'classnames';
import axios from 'axios';
import { Modal } from 'react-bootstrap';

import { NameAddressItem, NameAddressValue } from './helpers';
import { Button } from '../../helpers';
import { YELP_HOST_URI } from '../../config';

momentLocalizer(moment);

export default class LocationsTimeArray extends Component {

  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string,
    type: PropTypes.string
  };

  state = {
    value: {},
    values: [],
    isEditTime: false,
    time: '',
    anote: '',
    curValIndex: 0,
    selectedVal: null,
    showModal: false
  };

	componentDidMount () {
		if (this.props.onMounted) {
				this.props.onMounted({
				selectLocation: location => this.selectLocation(location)
			})
		}
	}

  componentWillReceiveProps(nextProps) {
    const { isAutomate, initials } = nextProps;

    if (isAutomate)
      this.setState({ values: initials });

    if (isArray(nextProps.input.value) && size(nextProps.input.value) > 0) {
      this.setState({ values: nextProps.input.value })
    }
  }

	selectLocation(location) {
		const { value } = this.state;
		const newValues = location.map(( value, index ) => {
			const time = value.time || 0;
			const timeString = moment(new Date(time * 1000)).utcOffset(0).format('LT');
			return {
				location:{
					objectId : value.objectId,
					address : value.address,
					name : value.name,
					tags : value.tags || []
				},
				time : timeString
			};
		})
		this.setState({ values: newValues });
	}

  onClickTime(val, index) {
    if (!this.state.isEditTime) {
      this.setState({ 
        isEditTime: true, 
        time: val.time,
        curValIndex: index
      });
    }
  }

  onTimeChange(e) {
    this.setState({ time: e.target.value });
  }

  onClickFinish() {
    const { input } = this.props;
    const { values, isEditTime, time, curValIndex } = this.state;

    if (isEditTime) {
      let newValues = [];

      values.map((value, index) =>{
        newValues.push(value);

        if (index === curValIndex)
          newValues[index].time = time;
      });

      this.setState({ values: newValues, isEditTime: false }, () => input.onChange(this.state.values));
    }
  }

  afterSetState() {
    const { input, onChangeLocationTime } = this.props;
    const { values } = this.state;

    input.onChange(values);
    onChangeLocationTime(values);
  }

  addData(value) {
    const { input } = this.props;
    const { values } = this.state;

    value["neighborhood"] = this.getFirstNeighborhood(value.location);
    this.addYelpReview(value);
    this.setState({ value: {}, values: [...values, value] }, () => this.afterSetState());
  }

  removeData(value) {
    const { input } = this.props;
    const { values } = this.state;
    
    this.setState({ values: without(values, value) }, () => this.afterSetState());
  }

  addYelpReview(value) {
    axios.post(`${YELP_HOST_URI}/reviews`, { id: value.location.yelp_id })
    .then(({ data }) => {
      let reviews = [];
      data.reviews.reviews.map((review) => {
        reviews.push(review.text);
      });
      value["reviews"] = reviews;
      this.setState({ values });
    })
    .catch(({ errorMessage }) => this.setState({ errorMessage }));
  }

  getFirstNeighborhood(location) {
    if (location.neighborhood) {
      if (location.neighborhood.indexOf(',') > -1) {
        return location.neighborhood.substring(0, location.neighborhood.indexOf(','));
      } else {
        return location.neighborhood;
      }
    } else {
      return '';
    }
  }

  showModal4AdditionalNote(val) {
    this.setState({ selectedVal: val, showModal: true, anote: val.location.additional_notes });
  }

  addAdditionalNote() {
    const { anote, selectedVal, values } = this.state;
    const { onUpdateLocation } = this.props;
    selectedVal.location.additional_notes = anote;
    this.setState({ 
      showModal: false,   
    }, () => onUpdateLocation(selectedVal.location.objectId, selectedVal.location, this.state.values));
  }

  onANoteChange(e) {
    this.setState({anote: e.target.value});
  }
	
  render() {
    const { input, label, meta: { touched, error, warning }, data } = this.props;
    const { value, values, isEditTime, time, curValIndex, selectedVal, showModal, anote } = this.state;

    return (
      <fieldset className={cl('form-group', {'has-error': (touched && error)})}>
        {label ? <label>{label}</label> : null}
        <table className="table table-hover table-striped table-bordered location-time-array">
          <tbody>
          <tr>
            <td className="wide-td-md">
              <DropdownList
                valueField="value"
                textField="name"
                data={data}
                filter="contains"
                value={value.location ? value.location.name : null}
                itemComponent={NameAddressItem}
                valueComponent={NameAddressValue}
                onChange={location => this.setState({ value: { ...value, location } })}
              />
            </td>
            <td>
              <DateTimePicker
                date={false}
                value={value.time ? moment(value.time, 'hh:mm A').toDate() : null}
                onChange={(_, time) => this.setState({ value: { ...value, time } })}
              />
            </td>
            <td>
              <Button
                color="primary"
                disabled={!value.location || !value.time}
                onClick={() => this.addData(value)}
              >
                Add
              </Button>
            </td>
          </tr>
          {values.map((val, index) => (
            <tr key={index}>
              <td>
                {val.location ? val.location.name : null} {val.neighborhood ? <label style={{fontStyle: 'italic'}}> ({val.neighborhood}) </label> : ''}
                <p className="notes">{val.location ? val.location.notes : null}</p>
                {
                  size(val.reviews || []) > 0 ? (
                    <table className="table table-bordered table-hover table-striped table-responsive reviews-table">
                      <thead>
                        <tr>
                          <td>Reviews</td>
                        </tr>
                      </thead>
                      <tbody>
                      {
                        val.reviews.map((review, index) => (
                          <tr key={index}>
                            <td>{review}</td>
                          </tr>
                        ))
                      }
                      </tbody>
                    </table>
                  ) : null
                }
              </td>
              <td onClick={() => this.onClickTime(val, index)}>
              { 
                curValIndex === index && isEditTime ? 
                  <input type="text" name="time" value={time} onChange={(e) => this.onTimeChange(e)}/>
                : <div><p className={val.hasConflict ? 'red' : ''}>{val.time}</p><p style={{fontStyle: 'italic'}}>{val.activity ? val.activity : null}</p></div>
              }
              </td>
              <td>
              {
                curValIndex === index && isEditTime ? 
                  <Button
                    color="primary"
                    onClick={() => this.onClickFinish()}
                  >
                    Finish
                  </Button>
                : <div>
                    <Button color="danger"
                      onClick={() => this.removeData(val)}
                    >
                      Remove
                    </Button><br/>
                    <a onClick={() => this.showModal4AdditionalNote(val)}>Additional Note</a>
                  </div>
              }
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        {touched && ((error && <div className="error help-block">{error}</div>) || (warning && <div className="error">{warning}</div>))}
        {
          <Modal aria-labelledby='modal-label' show={showModal}>
            <div className="row">
              <div className="col-md-12">
                <h4><center>Additional Note</center></h4>
              </div>
            </div>
            <div className="row additional-note-modal">
              <div className="col-md-12">
                <center><textarea rows="4" cols="50" value={anote} onChange={(e) => this.onANoteChange(e)}></textarea></center>
                <center>
                  <button className="btn btn-primary" onClick={() => this.addAdditionalNote()}>OK</button>
                  <button className="btn btn-primary" onClick={() => this.setState({ showModal: false })}>Cancel</button>
                </center>
              </div>
            </div>
          </Modal>
        } 
      </fieldset>
    );
  }
}
