import React, { PropTypes } from 'react';
import compact from 'lodash/compact';
import size from 'lodash/size';

import { LinkTo, BooleanField } from '../../../helpers';
import { renderDateTime } from '../../../utils';

function GroupItem({
  item,
  item: {
    objectId, name, tags, description, criteria, group_banner_url, group_profile_photo_url, age_small, age_big, metro_cities, gender, 
    group_question, first_msg, verify_question, verify_answer, is_private, reservations, 
    is_one_location, createdAt, access_code, active_days, active_times, email_verification, skip_group_suggestion, require_availability
  }
}) {
  return (
    <div>
      <h1>Group #{objectId}</h1>
      <table className="table table-bordered table-hover table-striped table-responsive">
        <tbody>
        <tr>
          <td>ObjectId</td>
          <td>{objectId}</td>
        </tr>
        <tr>
          <td>Name</td>
          <td>{name}</td>
        </tr>
        <tr>
          <td>Description</td>
          <td>{description}</td>
        </tr>
		    <tr>
          <td>Tags</td>
          <td>{compact((tags || []).map(l => l )).join(', ')}</td>
        </tr>
        <tr>
          <td>Group Criteria</td>
          <td>
            {size(criteria || []) > 0 ? (
                <table className="table table-bordered table-hover table-striped table-responsive">
                  <tbody>
                  {criteria.map((item, index) => (
                    <tr key={index}>
                      <td>{item}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              ) : null}
          </td>
        </tr>
        <tr>
          <td>Group Banner URL</td>
          <td>{group_banner_url}</td>
        </tr>
        <tr>
          <td>Group Profile Photo URL</td>
          <td>{group_profile_photo_url}</td>
        </tr>
        <tr>
          <td>Age Criteria</td>
          <td>{age_small} ~ {age_big}</td>
        </tr>
        <tr>
          <td>Metro Cities</td>
          <td>{compact((metro_cities || []).map(l => l )).join(', ')}</td>
        </tr>
        <tr>
          <td>Gender Criteria</td>
          <td>{gender.value}</td>
        </tr>
        <tr>
          <td>Group Questions</td>
          <td>
            {size(group_question || []) > 0 ? (
                <table className="table table-bordered table-hover table-striped table-responsive">
                  <tbody>
                  {group_question.map((item, index) => (
                    <tr key={index}>
                      <td>{item}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              ) : null}
          </td>
        </tr>
        <tr>
          <td>First Message</td>
          <td>{first_msg}</td>
        </tr>
        <tr>
          <td>Group Verification Question</td>
          <td>{verify_question}</td>
        </tr>
        <tr>
          <td>Verification Answer</td>
          <td>
            {size(verify_answer || []) > 0 ? (
                <table className="table table-bordered table-hover table-striped table-responsive">
                  <tbody>
                  {verify_answer.map((item, index) => (
                    <tr key={index}>
                      <td>{item}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              ) : null}
          </td>
        </tr>
        <tr>
          <td>Private</td>
          <td>
            <BooleanField value={is_private} />
          </td>
        </tr>
        <tr>
          <td>Access Code</td>
          <td>{access_code}</td>
        </tr>
        <tr>
          <td>Take Reservation</td>
          <td>
            <BooleanField value={reservations} />
          </td>
        </tr>
        <tr>
          <td>1 Location</td>
          <td>
            <BooleanField value={is_one_location} />
          </td>
        </tr>
        <tr>
          <td>Email Verification</td>
          <td>
            <BooleanField value={email_verification} />
          </td>
        </tr>
        <tr>
          <td>Skip Group Suggestion</td>
          <td>
            <BooleanField value={skip_group_suggestion} />
          </td>
        </tr> 
        <tr>
          <td>Require Availability</td>
          <td>
            <BooleanField value={require_availability} />
          </td>
        </tr>        
        <tr>
          <td>Active Days</td>
          <td>
            {size(active_days || []) > 0 ? (
                <table className="table table-bordered table-hover table-striped table-responsive">
                  <tbody>
                  {active_days.map((item, index) => (
                    <tr key={index}>
                      <td>{item}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              ) : null}
          </td>
        </tr>
        <tr>
          <td>Active Times</td>
          <td>
            {size(active_times || []) > 0 ? (
                <table className="table table-bordered table-hover table-striped table-responsive">
                  <tbody>
                  {active_times.map((item, index) => (
                    <tr key={index}>
                      <td>{item}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              ) : null}
          </td>
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

GroupItem.propTypes = {
  item: PropTypes.shape({
    objectId: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired
};

export default GroupItem;