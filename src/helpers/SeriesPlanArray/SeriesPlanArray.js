import size from 'lodash/size';
import isArray from 'lodash/isArray';
import compact from 'lodash/compact';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList'
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import momentLocalizer from 'react-widgets-moment';
import cl from 'classnames';

import { Button } from '../../helpers';
import { renderDate } from '../../utils';

momentLocalizer(moment);

export default class SeriesPlanArray extends Component {

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

	componentDidMount () {
		if (this.props.onMounted) {
				this.props.onMounted({
				selectLocation: location => this.selectLocation(location)
			})
		}
	}

	componentWillReceiveProps(nextProps) {
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
		this.setState({ values: newValues })
	}

  render() {
    const { input, label, meta: { touched, error, warning }, data } = this.props;
		const { value, values } = this.state;
		
  	return (
			<fieldset className={cl('form-group', {'has-error': (touched && error)})}>
				{label ? <label>{label}</label> : null}
				<table className="table table-hover table-striped table-bordered">
					<tbody>
						{values.map((val, index) => (
							<tr key={index}>
								<td>
									{val.image ? (<img className="list-image img-responsive" src={val.image} alt="" />) : null}
								</td>
								<td>{val.title_event}</td>
								<td>{(val.tags || []).join(', ')}</td>
								<td>{compact((val.locations || []).map(l => l.location ? l.location.neighborhood : null)).join(', ')}</td>
              	<td>
									{val.start_day ? renderDate(val.start_day.iso) : null}
              	</td>
            </tr>
          ))}
          </tbody>
        </table>
				{size(values) == 0 ? (
					<div>No Plans found</div>
				) : null}
        {touched && ((error && <div className="error help-block">{error}</div>) || (warning && <div className="error">{warning}</div>))}
      </fieldset>
    );
  }
}
