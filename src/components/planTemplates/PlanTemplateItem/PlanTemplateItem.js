import React, { PropTypes } from 'react';

import { renderDateTime } from '../../../utils';

function PlanTemplateItem({
  item: {
    objectId, location_types
  }
}) {
  return (
    <div>
      <h1>PlanTemplate #{objectId}</h1>
      <table className="table table-bordered table-hover table-striped table-responsive">
        <tbody>
          <tr>
            <td>ObjectId</td>
            <td>{objectId}</td>
          </tr>
          <tr>
            <td>LocationType #1</td>
            <td>{location_types[0]}</td>
          </tr>
          <tr>
            <td>LocationType #2</td>
            <td>{location_types[1]}</td>
          </tr>
          <tr>
            <td>LocationType #3</td>
            <td>{location_types[2]}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

PlanTemplateItem.propTypes = {
  item: PropTypes.shape({
    objectId: PropTypes.string.isRequired,
  }).isRequired
};

export default PlanTemplateItem;