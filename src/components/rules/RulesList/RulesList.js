import compact from 'lodash/compact';
import React, { PropTypes } from 'react';
import { Field } from 'redux-form';

import { LinkTo } from '../../../helpers';
import { 
  renderDate,
  renderTextareaField,
  renderCheckboxField,
  BooleanField
} from '../../../utils';

import { weekDays, capitalize } from '../../../utils';

function RulesList({ items }) {
  return (
    <table className="table table-bordered table-hover table-striped table-responsive">
      <thead>
      <tr>
        <th>Metro city</th>
        <th>Mile</th>
        <th>Morning</th>
        <th>Noon</th>
        <th>Afternoon</th>
        <th>Evening</th>
        <th>Late</th>
        <th />
		    <th />
        <th />
      </tr>
      </thead>
      <tbody>
      {items.map(({ objectId, metro_city, mile, morning_percent, noon_percent, afternoon_percent, evening_percent, late_percent }) => (
        <tr key={objectId}>
          <td>{metro_city.name}</td>
          <td>{mile}</td>
          <td>{morning_percent}%</td>
          <td>{noon_percent}%</td>
          <td>{afternoon_percent}%</td>
          <td>{evening_percent}%</td>
          <td>{late_percent}%</td>
			    <td>
            <LinkTo className="btn btn-info" url={`rules/${objectId}`}>Show</LinkTo>
			    </td>
          <td>
            <LinkTo className="btn btn-primary" url={`rules/${objectId}/edit`}>Edit</LinkTo>
          </td>
          <td>
            <LinkTo className="btn btn-danger" url={`rules/${objectId}/delete`}>Delete</LinkTo>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}

RulesList.propTypes = {
  items: PropTypes.array.isRequired
};

export default RulesList;
