import size from 'lodash/size';
import React, { PropTypes } from 'react';

import { LinkTo, BooleanField, SeriesListPlanList } from '../../../helpers';
import { renderDateTime, weekDays, capitalize } from '../../../utils';

function SeriesItem({
  item, item: {
    objectId,
    title, image,
    start_date, end_date,
		plans,location,
    createdAt, updatedAt
  }
}) {
  return (
    <div>
      <h1>Series #{objectId}</h1>
      <table className="table table-bordered table-hover table-striped table-responsive">
        <tbody>
        <tr>
          <td>ObjectId</td>
          <td>{objectId}</td>
        </tr>
        <tr>
          <td>Title Event</td>
          <td>{title}</td>
        </tr>
        <tr>
          <td>Start Date</td>
          <td>{start_date ? renderDateTime(start_date.iso) : null}</td>
        </tr>
        <tr>
          <td>End Date</td>
          <td>{end_date ? renderDateTime(end_date.iso) : null}</td>
        </tr>
        <tr>
          <td>Banner</td>
          <td>
            {image ? <img className="show-image img-responsive" src={image} alt="" /> : null}
          </td>
        </tr>
				<tr>
          <td>Plans</td>
          <td>
            <SeriesListPlanList plans={plans}></SeriesListPlanList>
          </td>
        </tr>
        <tr>
          <td>Latitude</td>
          <td>{location.latitude}</td>
        </tr>
        <tr>
          <td>Longitude</td>
          <td>{location.longitude}</td>
        </tr>
        <tr>
          <td>Created</td>
          <td>{renderDateTime(createdAt)}</td>
        </tr>
        <tr>
          <td>Updated</td>
          <td>{renderDateTime(updatedAt)}</td>
        </tr>
        </tbody>
      </table>
    </div>
  );
}

export default SeriesItem;
