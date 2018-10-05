import size from 'lodash/size';
import isArray from 'lodash/isArray';
import without from 'lodash/without';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import momentLocalizer from 'react-widgets-moment';
import cl from 'classnames';

import { NameAddressItem, NameAddressValue } from './helpers';
import { Button } from '../../helpers';

momentLocalizer(moment);

export default class ArrayPlus extends Component {

  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string,
    type: PropTypes.string
  };

  state = {
    value: '',
    values: [],
  };

  componentWillReceiveProps(nextProps) {
    if (isArray(nextProps.input.value) && size(nextProps.input.value) > 0) {
      this.setState({ values: nextProps.input.value })
    }
  }

  render() {
    const { input, label, meta: { touched, error, warning } } = this.props;
    const { value, values } = this.state;

    return (
      <fieldset className={cl('form-group', {'has-error': (touched && error)})}>
        {label ? <label>{label}</label> : null}
        <table className="table table-hover table-striped table-bordered">
          <tbody>
          <tr>
            <td className="wide-td-md">
              <input type="text" value={value}
                onChange={(e) => this.setState({ value: e.target.value })}
              />
            </td>
            <td>
              <Button
                color="primary"
                disabled={value.length < 1}
                onClick={() => this.setState({ value: '', values: [...values, value] }, () => input.onChange(this.state.values))}
              >
                Add
              </Button>
            </td>
          </tr>
          {
            values &&
            values.map((val, index) => (
              <tr key={index}>
                <td>
                  {val ? val : null}
                </td>
                <td>
                  <Button
                    color="danger"
                    onClick={() =>
                      this.setState({ values: without(values, val) }, () => input.onChange(this.state.values))}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))
          }
          </tbody>
        </table>
        {touched && ((error && <div className="error help-block">{error}</div>) || (warning && <div className="error">{warning}</div>))}
      </fieldset>
    );
  }
}
