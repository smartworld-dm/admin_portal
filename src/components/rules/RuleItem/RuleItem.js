import compact from 'lodash/compact';
import React, { PropTypes } from 'react';
import { Field } from 'redux-form';
import size from 'lodash/size';

import { BooleanField, LinkTo, renderField } from '../../../helpers';
import { renderDate } from '../../../utils';

import { weekDays, capitalize } from '../../../utils';

function RuleItem({
  item, 
  locationTypes, 
  locationTypeItems,
  item: {
    objectId, metro_city, mile, morning_percent, noon_percent, afternoon_percent, evening_percent, late_percent
  }
}){
  return (
    <div>
      <h1>Rule #{objectId}</h1>
      <table className="table table-bordered table-hover table-striped table-responsive">
        <tbody>
        <tr>
          <td>ObjectId</td>
          <td>{objectId}</td>
        </tr>
        <tr>
          <td><h4>Metro city</h4></td>
        </tr>
        <tr>
          <td>Metro city</td>
          <td>{metro_city.name}</td>
        </tr>
        <tr>
          <td><h4>Hours allotted for location types(hour)</h4></td>
        </tr>
        {locationTypeItems.map((locationTypeItem, index) => (
          <tr key={index}>
            <td>{locationTypeItem.name}</td>
            <td>
            {
                item[locationTypes[index]]
              }
            </td>
          </tr>
        ))}
        <tr>
          <td><h4>Distance between locations(mile)</h4></td>
        </tr>
        <tr>
          <td>mile</td>
          <td>{mile}</td>
        </tr>
        <tr>
          <td><h4>Percentage breakdown of time of day</h4></td>
        </tr>
        <tr>
          <td>Morning percent</td>
          <td>{morning_percent}</td>
        </tr>
        <tr>
          <td>Noon percent</td>
          <td>{noon_percent}</td>
        </tr>
        <tr>
          <td>Afternoon percent</td>
          <td>{afternoon_percent}</td>
        </tr>
        <tr>
          <td>Evening percent</td>
          <td>{evening_percent}</td>
        </tr>
        <tr>
          <td>Late percent</td>
          <td>{late_percent}</td>
        </tr>
        </tbody>
      </table>
    </div>
  );
}

RuleItem.propTypes = {
  item: PropTypes.shape({
    objectId: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired
};

export default RuleItem;