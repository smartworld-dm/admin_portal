import size from 'lodash/size';
import React, { PropTypes, Component } from 'react';

import { LinkTo, BooleanField } from '../../../helpers';
import { renderDate, renderDateTime } from '../../../utils';
import { fetchEvent } from '../../../actions/EventActions';
import { connect } from 'react-redux';
import {Modal} from 'react-bootstrap';

class EventsList extends Component {
	
	state={fetched: false};
	
	showPopUp = (objectId) => {
		this.props.fetchEvent(objectId).then(() => this.setState({ fetched: true }));
	}
	
	hidePopUp = () => {
		this.setState({fetched: false});
	}
	
	render(){
		const { items, item } = this.props;
		const {fetched}=this.state;
		  var style={cursor:"pointer", fontWeight:"normal", fontSize:"10px"};
		  var btnAlign={textAlign:"right"};
		  if (size(items) > 0) {
			return (
			  <table className="table table-bordered table-hover table-striped table-responsive">
				<thead>
				<tr>
				  <th>Event Type</th>
				  <th>Dates</th>
				  <th>Start Date</th>
				  <th>End Date</th>
				  <th>Location</th>
				  <th>Redemption</th>
				  <th>Cost</th>
				  <th>Special</th>
				  <th>Boost</th>
				  <th>Created</th>
				  <th />
				  <th />
				  <th />
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
							{(dates.slice(0, 2) || []).map(({ date, name, start, end }, index) => (
							  <tr key={index}>
								<td>{date}</td>
								<td>{name}</td>
								<td>{start}</td>
								<td>{end}</td>
							  </tr>
							))}
							{dates.length > 2 ? (<tr key={dates.length} style={style} onClick={() => this.showPopUp(objectId)}>
								<td colSpan="4">+{dates.length-2} more</td>
							  </tr>): null}
							</tbody>
						  </table>
						) : null}
					</td>
					<td>{renderDate(start_time)}</td>
					<td>{renderDate(end_time)}</td>
					<td>{location ? <LinkTo url={`locations/${location.objectId}`}>{location.name}</LinkTo> : null}</td>
					<td>{redemption ? redemption.name : null}</td>
					<td>{cost ? cost : 'Free'}</td>
					<td>{special ? <LinkTo url={`specials/${special.objectId}`}>{special.incentive_name}</LinkTo> : null}</td>
					<td><BooleanField value={boost} /></td>
					<td>{renderDate(createdAt)}</td>
					<td>
					  <LinkTo className="btn btn-info" url={`events/${objectId}`}>Show</LinkTo>
					</td>
					<td>
					  <LinkTo className="btn btn-primary" url={`events/${objectId}/edit`}>Edit</LinkTo>
					</td>
					<td>
					  <LinkTo className="btn btn-danger" url={`events/${objectId}/delete`}>Delete</LinkTo>
					</td>
				  </tr>
				))}
				</tbody>
				<Modal aria-labelledby='modal-label' show={fetched}>
				  <div className="row">
					<div className="col-md-12">
						<h2><center>Dates Details</center></h2>
					</div>
				  </div>	
				  <div className="row">
					<div className="col-md-12">
						<table className="table table-bordered table-hover table-striped table-responsive">
						<tbody>
						{(item.dates || []).map(({ date, name, start, end }, index) => (
						  <tr key={index}>
							<td>{date}</td>
							<td>{name}</td>
							<td>{start}</td>
							<td>{end}</td>
						  </tr>
						))}
						</tbody>
					  </table>
					</div>
				  </div>
				  <div className="row">
					<div className="col-md-12" style={btnAlign}>
						<button className="btn" onClick={() => this.hidePopUp()}>Close</button>
					</div>
				  </div>	
				</Modal>
			  </table>
			);
		  }
	  return (
		<h2>No Items</h2>
	  );
	}
}

EventsList.propTypes = {
  items: PropTypes.array.isRequired
};

export default connect(({ events: { item } }) => ({ item }), { fetchEvent })(EventsList);
