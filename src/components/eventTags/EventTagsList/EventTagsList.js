import React, { PropTypes } from 'react';

import { LinkTo } from '../../../helpers';
import { renderDate } from '../../../utils';

function EventTagsList({ items }) {
  return (
    <table className="table table-bordered table-hover table-striped table-responsive">
      <thead>
      <tr>
        <th>Tag</th>
		<th>Feature Tag</th>
        <th>Created</th>
        {/*<th />*/}
        <th />
        <th />
      </tr>
      </thead>
      <tbody>
      {items.map(({ objectId, tag, is_feature_tag, createdAt }) => (
        <tr key={objectId}>
          <td>{tag}</td>
		  <td>{is_feature_tag ? 'true': 'false'}</td>
          <td>{renderDate(createdAt)}</td>
			  {/*<td>
            <LinkTo className="btn btn-info" url={`EventTags/${objectId}`}>Show</LinkTo>
			  </td>*/}
          <td>
            <LinkTo className="btn btn-primary" url={`eventTags/${objectId}/edit`}>Edit</LinkTo>
          </td>
          <td>
            <LinkTo className="btn btn-danger" url={`eventTags/${objectId}/delete`}>Delete</LinkTo>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}

EventTagsList.propTypes = {
  items: PropTypes.array.isRequired
};

export default EventTagsList;