import React, { PropTypes } from 'react';

import { renderDateTime } from '../../../utils';

function EventTagItem({
  item: {
    objectId, tag, is_feature_tag, createdAt
  }
}) {
  return (
    <div>
      <h1>EventTag #{objectId}</h1>
      <table className="table table-bordered table-hover table-striped table-responsive">
        <tbody>
        <tr>
          <td>ObjectId</td>
          <td>{objectId}</td>
        </tr>
        <tr>
          <td>Tag</td>
          <td>{tag}</td>
        </tr>
		<tr>
          <td>Feature Tag</td>
          <td>{is_feature_tag ? 'true': 'false'}</td>
        </tr>
        <tr>
          <td>Created</td>
          <td>{renderDateTime(createdAt)}</td>
        </tr>
        </tbody>
      </table>
    </div>
  );
}

EventTagItem.propTypes = {
  item: PropTypes.shape({
    objectId: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired
};

export default EventTagItem;