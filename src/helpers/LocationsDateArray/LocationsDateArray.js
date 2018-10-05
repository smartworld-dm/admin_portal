import size from 'lodash/size';
import isArray from 'lodash/isArray';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList'
import Multiselect from 'react-widgets/lib/Multiselect'
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import momentLocalizer from 'react-widgets-moment';
import cl from 'classnames';

import { NameAddressItem, NameAddressValue } from './helpers';
import { Button } from '../../helpers';

momentLocalizer(moment);

export default class LocationsDateArray extends Component {

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
		if(this.props.input.value){
			this.setState({ values: this.props.input.value })
		}
		if (this.props.onMounted) {
				this.props.onMounted({
			})
		}
	}

  componentWillReceiveProps(nextProps) {
    if (isArray(nextProps.input.value) && size(nextProps.input.value) > 0) {
      this.setState({ values: nextProps.input.value })
    }
  }
  
  render() {
    const { input, label, meta: { touched, error, warning }, data, tags, neighborhoods } = this.props;
    const { value, values } = this.state;
    return (
      <fieldset className={cl('form-group', {'has-error': (touched && error)})}>
        {label ? <label>{label}</label> : null}
        <table className="table table-hover table-striped table-bordered">
		  <thead>
			<tr>
				<th />
				<th>Neighborhoods</th>
				<th>Tags</th>
				<th>Price</th>
				<th/>
			</tr>
		  </thead>	
          <tbody>
          <tr>
			<td />
			<td>
				<Multiselect
				    data={neighborhoods}
					value={this.state.value.neighborhood}
					onChange={neighborhood => { this.setState({ value: { ...value, neighborhood } }) }}	
				/>
			</td>
			<td>
				<Multiselect
				    data={tags}
					value={this.state.value.tag}
					onChange={tag => {this.setState({ value: { ...value, tag } })}}	
				/>
			</td>
			<td className="wide-td-md">
			  <input
			  className="form-control"
			  placeholder="price"
			  type="text"
			  value={this.state.value.price || ''}
			  onChange={e => { var price =e.target.value; this.setState({ value: { ...value, price } })}}
			  />
            </td>
            <td>
              <Button
                color="primary"
                disabled={ !value.neighborhood || !value.tag  || !value.price}
                onClick={() => this.setState({ value: {}, values: [...values, value] }, () => input.onChange(this.state.values))}
              >
                Add
              </Button>
            </td>
          </tr>
          {values.map((val, index) => (
            <tr key={index}>
			   <td>Stop {index+1}</td>
			  <td>{val.neighborhood}</td>
			  <td>{val.tag}</td>
              <td>{val.price}</td>
              <td>
                <Button
                  color="danger"
                  onClick={() =>
                    this.setState({
                      values: values.filter(({  neighborhood, tag, price }) => (val.neighborhood !== neighborhood))
                    }, () => input.onChange(this.state.values))
                  }
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
