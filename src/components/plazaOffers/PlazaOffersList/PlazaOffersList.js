import compact from 'lodash/compact';
import React, { PropTypes } from 'react';

import { LinkTo } from '../../../helpers';
import { renderDate } from '../../../utils';

function PlazaOffersList({ items }) {
	console.log(items);
  return (
    <table className="table table-bordered table-hover table-striped table-responsive">
      <thead>
      <tr>
        <th>Banner</th>
        <th>Title</th>
        <th>Description</th>
        <th>Posting Live Date</th>
		 <th>Start Date</th>
		<th>End Date</th>
        <th />
        <th />
      </tr>
      </thead>
      <tbody>
      {items.map(({ objectId, title, banner_url, description, posting_live_date, start_day, end_day }) => (
        <tr key={objectId}>
          <td>
            {banner_url ? (
                <LinkTo url={`plazaOffers/${objectId}`}>
                  <img className="list-image img-responsive" src={banner_url} alt="" />
                </LinkTo>
              ) : null}
          </td>
          <td>{title}</td>
		  <td>{description}</td>
          <td>{posting_live_date ? renderDate(posting_live_date) : null}</td>
		   <td>{renderDate(start_day)}</td>
		    <td>{renderDate(end_day)}</td>
          <td>
            <LinkTo className="btn btn-primary" url={`plazaOffers/${objectId}/edit`}>Edit</LinkTo>
          </td>
          <td>
            <LinkTo className="btn btn-danger" url={`plazaOffers/${objectId}/delete`}>Delete</LinkTo>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}

PlazaOffersList.propTypes = {
  items: PropTypes.array.isRequired
};

export default PlazaOffersList;
