import compact from 'lodash/compact';
import React, { PropTypes } from 'react';

import { LinkTo, SeriesListPlanList } from '../../../helpers';
import { renderDate } from '../../../utils';

function SeriesList({ items }) {
  return (
    <table className="table table-bordered table-hover table-striped table-responsive">
      <thead>
      <tr>
        <th>Banner</th>
        <th>Title</th>
        <th> Start </th>
        <th> End </th>
				<th> Plans </th>
        <th />
        <th />
        <th />
      </tr>
      </thead>
      <tbody>
      {items.map(({ objectId, image, title, start_date, end_date, plans }) => (
        <tr key={objectId}>
          <td>
            {image ? (
                <LinkTo url={`series/${objectId}`}>
                  <img className="list-image img-responsive" src={image} alt="" />
                </LinkTo>
              ) : null}
          </td>
          <td>{title}</td>
          <td>{start_date ? renderDate(start_date.iso) : null}</td>
          <td>{end_date ? renderDate(end_date.iso) : null}</td>
					<td><SeriesListPlanList plans={plans}> </SeriesListPlanList></td>
          <td>
            <LinkTo className="btn btn-info" url={`series/${objectId}`}>Show</LinkTo>
          </td>
          <td>
            <LinkTo className="btn btn-primary" url={`series/${objectId}/edit`}>Edit</LinkTo>
          </td>
          <td>
            <LinkTo className="btn btn-danger" url={`series/${objectId}/delete`}>Delete</LinkTo>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}

SeriesList.propTypes = {
  items: PropTypes.array.isRequired
};

export default SeriesList;
