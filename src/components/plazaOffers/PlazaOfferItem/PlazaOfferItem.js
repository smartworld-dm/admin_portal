import size from 'lodash/size';
import React, { PropTypes } from 'react';

import { LinkTo, BooleanField } from '../../../helpers';
import { renderDateTime, weekDays, capitalize } from '../../../utils';

function PlazaOfferItem({
  item, item: {
    objectId, title, description, icon_url, posting_live_date, tags, locations, radius, createdAt, updatedAt
  }
}) {
  return (
    <div>
      <h1>Plaza Offer #{objectId}</h1>
      <table className="table table-bordered table-hover table-striped table-responsive">
        <tbody>
        <tr>
          <td>ObjectId</td>
          <td>{objectId}</td>
        </tr>
        <tr>
          <td>Title</td>
          <td>{title}</td>
        </tr>
        <tr>
          <td>Description</td>
          <td>{description}</td>
        </tr>
        <tr>
          <td>Tags</td>
          <td>{(tags || []).join(', ')}</td>
        </tr>
        <tr>
          <td>Radius</td>
          <td>
		  {radius}
          </td>
        </tr>
        <tr>
          <td>Posting Live Date</td>
          <td>{posting_live_date ? renderDateTime(posting_live_date) : null}</td>
        </tr>
        <tr>
          <td>Locations</td>
          <td>
            {locations && size(locations) > 0 ? (
                <table className="table table-bordered table-hover table-striped table-responsive">
                <tbody>
                {locations.map(({ location, time }, index) => (
                  <tr key={index}>
                    <td>{location.name}</td>
                    <td>{time}</td>
                  </tr>
                ))}
                </tbody>
              </table>
              ) : null}
          </td>
        </tr>
        <tr>
          <td>Banner</td>
          <td>
            {icon_url ? <img className="show-image img-responsive" src={icon_url} alt="" /> : null}
          </td>
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
export default PlazaOfferItem;
