import React, { PropTypes } from 'react';

import { LinkTo } from '../../../helpers';
import { renderDate } from '../../../utils';

function PlanTemplatesList({ items }) {
  return (
    <table className="table table-bordered table-hover table-striped table-responsive">
      <thead>
      <tr>
        <th>Location Type 1</th>
        <th>Location Type 2</th>
        <th>Location Type 3</th>
        <th />
        <th />
      </tr>
      </thead>
      <tbody>
      {items.map(({ location_types, objectId }, index) => (
        <tr key={index}>
          <td>{location_types.length > 0 ? location_types[0] : null}</td>
          <td>{location_types.length > 1 ? location_types[1] : null}</td>
          <td>{location_types.length > 2 ? location_types[2] : null}</td>
          <td>
            <LinkTo className="btn btn-primary" url={`planTemplates/${objectId}/edit`}>Edit</LinkTo>
          </td>
          <td>
            <LinkTo className="btn btn-danger" url={`planTemplates/${objectId}/delete`}>Delete</LinkTo>
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}

PlanTemplatesList.propTypes = {
  items: PropTypes.array.isRequired
};

export default PlanTemplatesList;