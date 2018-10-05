import React, { PropTypes } from 'react';
import compact from 'lodash/compact';

import { LinkTo } from '../../../helpers';
import { renderDate } from '../../../utils';

function GroupsList({ items }) {
  return (
    <table className="table table-bordered table-hover table-striped table-responsive">
      <thead>
      <tr>
        <th>Banner</th>
        <th>Name</th>
        <th>Description</th>
		    <th>Tags</th>
        <th>Metro Cities</th>
        <th>CreatedAt</th>
        <th />
        <th />
        <th />
        <th />
      </tr>
      </thead>
      <tbody>
      {items.map(({ objectId, group_banner_url, tags, name, description, createdAt, metro_cities }) => (
        <tr key={objectId}>
          <td>
            {group_banner_url ? (
                <LinkTo url={`groups/${objectId}`}>
                  <img className="list-image img-responsive" src={group_banner_url} alt="" />
                </LinkTo>
              ) : null}
          </td>
          <td>{name}</td>
		      <td>{description}</td>
          <td>{compact((tags || []).map(l => l )).join(', ')}</td>
          <td>{compact((metro_cities || []).map(l => l )).join(', ')}</td>
          <td>{renderDate(createdAt)}</td>
          <td>
            <LinkTo className="btn btn-primary" url={`groups/${objectId}/`}>Show</LinkTo>
          </td>
          <td>
            <LinkTo className="btn btn-primary" url={`groups/${objectId}/edit`}>Edit</LinkTo>
          </td>
          <td>
            <LinkTo className="btn btn-primary" url={`groups/${objectId}/copy`}>Copy</LinkTo>
          </td>
          <td>
            <LinkTo className="btn btn-danger" url={`groups/${objectId}/delete`}>Delete</LinkTo>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}

GroupsList.propTypes = {
  items: PropTypes.array.isRequired
};

export default GroupsList;