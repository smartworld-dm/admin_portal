import React, { Component, PropTypes } from 'react';
import size from 'lodash/size';
import { LinkTo, BooleanField } from './';
import { renderDate, renderDateTime } from '../utils';
import { Button } from 'react-bootstrap';

export default class BuildEventList extends Component {

	static propTypes = {
		items : PropTypes.array.isRequired,
		displayResult : PropTypes.bool.isRequired
	};

	render() {
		const { items, clear, displayResult } = this.props;
		if (displayResult == false) {
			return (<div></div>);
		}
		return (
			<div>
			<table className="table table-bordered table-hover table-striped table-responsive">
        <thead>
					<tr>
						<th colSpan="9">Events</th>
						<th> <Button className="pull-right" bsSize="small" bsStyle="danger" onClick={clear}> Close </Button> </th>
					</tr>
        <tr>
          <th>Event Type</th>
          <th>Dates</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Location</th>
          <th>Redemption</th>
          <th>Cost</th>
          <th>Special</th>
          <th>Boost</th>
          <th>Created</th>
        </tr>
        </thead>
        <tbody>
        {items.map(({ objectId, event_type, dates, start_time, end_time, location, redemption, cost, special, boost, createdAt }) => (
          <tr key={objectId}>
            <td>
              {event_type ? <LinkTo url={`eventTypes/${event_type.objectId}`}>{event_type.name}</LinkTo> : null}
            </td>
            <td>
              {size(dates || []) > 0 ? (
                  <table className="table table-bordered table-hover table-striped table-responsive">
                    <tbody>
                    {(dates || []).map(({ date, name, start, end }, index) => (
                      <tr key={index}>
                        <td>{date}</td>
                        <td>{name}</td>
                        <td>{start}</td>
                        <td>{end}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                ) : null}
            </td>
            <td>{renderDateTime(start_time)}</td>
            <td>{renderDateTime(end_time)}</td>
            <td>{location ? <LinkTo url={`locations/${location.objectId}`}>{location.name}</LinkTo> : null}</td>
            <td>{redemption ? redemption.name : null}</td>
            <td>{cost ? cost : 'Free'}</td>
            <td>{special ? <LinkTo url={`specials/${special.objectId}`}>{special.incentive_name}</LinkTo> : null}</td>
            <td><BooleanField value={boost} /></td>
            <td>{renderDate(createdAt)}</td>
          </tr>
        ))}
				{size(items) == 0 ?
					<tr>
						<td colSpan="10">No Events Found</td>
					</tr>
					 : nil }
        </tbody>
      </table>
			</div>
		);
	}
}
