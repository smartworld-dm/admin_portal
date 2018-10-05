import take from 'lodash/take';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { fetchData, fetchMetroCities, downloadsCount, usersCount, tagsCount, maleCount, sentInviteCount, inviteAcceptedCount, plansCount, activePlanCount, topNeighborhoods, topLocations, popularPlans, popularDateTime, acceptedPlansByStop, initiatedPlans, acceptedTagsByStops } from '../../actions/DataActions';
import { LinkTo } from '../../helpers';
import { Tabs, Tab } from 'react-bootstrap';
import './Box.css';

import {
  renderDropdownList
} from '../../helpers';

class DataTable extends Component {

  state ={
	  citiesFetched: false,
	  downloadsFetched: false,
	  usersFetched: false,
	  tagsFetched: false,
	  maleFetched: false,
	  sentInvCountFetched: false,
	  sent_invite_count: 0,
	  AcceptedInvCountFetched: false,
	  plansCountFetched: false,
	  activePlanCountFetched: false,
	  topNeighborhoodsFetched: false,
	  locationsListFetched: false,
	  plansListFetched: false,
	  popularDateTimeFetched: false,
	  acceptedPlansByStopFetched: false,
	  accepted_plans_by_Stop: {},
	  initiatedPlansFetched: false,
	  acceptedTagsByStopsFetched:false
  };
  componentDidMount() {
    this.props.fetchData();
	this.props.fetchMetroCities().then(() => this.setState({citiesFetched:true}));
	this.props.downloadsCount().then(() => this.setState({downloadsFetched: true}));
	this.props.usersCount().then(() => this.setState({ usersFetched: true}));
	this.props.tagsCount().then(() =>  this.setState({tagsFetched: true}));
	this.props.maleCount().then(() => this.setState({maleFetched: true}));
	this.props.sentInviteCount().then((resp) => { this.setState({sentInvCountFetched: true, sent_invite_count: resp.sent_invite_count})});
	this.props.inviteAcceptedCount().then(() => this.setState({AcceptedInvCountFetched: true}));
	this.props.plansCount().then(() => this.setState({plansCountFetched: true}));
	this.props.activePlanCount().then(() => this.setState({activePlanCountFetched: true}));
	this.props.topNeighborhoods().then(() => this.setState({topNeighborhoodsFetched: true}));
	this.props.topLocations().then(() => this.setState({locationsListFetched: true}));
	this.props.popularPlans().then(() => this.setState({plansListFetched: true}));
	this.props.popularDateTime().then(() => this.setState({popularDateTimeFetched: true}));
	this.props.acceptedPlansByStop().then((response) => {this.setState({acceptedPlansByStopFetched: true,accepted_plans_by_Stop: response.accepted_plans_by_Stop})});
	this.props.initiatedPlans().then(() => this.setState({initiatedPlansFetched: true}));
	this.props.acceptedTagsByStops().then(()=> this.setState({acceptedTagsByStopsFetched: true}));
  }
  
  updateDashboard = (dashboard) => {
	  this.setState({activePlanCountFetched: false, topNeighborhoodsFetched: false, plansListFetched: false, popularDateTimeFetched: false, acceptedPlansByStopFetched: false, acceptedTagsByStopsFetched: false, initiatedPlansFetched: false})
	  this.props.activePlanCount(dashboard.metro_cities2.value).then(() => this.setState({activePlanCountFetched: true}));
	  this.props.topNeighborhoods(dashboard.metro_cities2.value).then(() => this.setState({topNeighborhoodsFetched: true}));
	  this.props.popularPlans(dashboard.metro_cities2.value).then(() => this.setState({plansListFetched: true}));
	  this.props.popularDateTime(dashboard.metro_cities2.value).then(() => this.setState({popularDateTimeFetched: true}));
	  this.props.acceptedPlansByStop(dashboard.metro_cities2.value).then((response) => {this.setState({acceptedPlansByStopFetched: true,accepted_plans_by_Stop: response.accepted_plans_by_Stop})});
	  this.props.acceptedTagsByStops(dashboard.metro_cities2.value).then(()=> this.setState({acceptedTagsByStopsFetched: true}));
	  this.props.initiatedPlans(dashboard.metro_cities2.value).then(() => this.setState({initiatedPlansFetched: true}));
  } 
  
  render() {
	const { citiesFetched, downloadsFetched, usersFetched, tagsFetched, maleFetched, sentInvCountFetched, sent_invite_count, AcceptedInvCountFetched, plansCountFetched, activePlanCountFetched, topNeighborhoodsFetched, locationsListFetched, plansListFetched, popularDateTimeFetched, acceptedPlansByStopFetched, accepted_plans_by_Stop, initiatedPlansFetched, acceptedTagsByStopsFetched} = this.state;  
    const { item, cities, downloads_count, users_count, tags, male, accept_invite_count, plans_count, active_plans_count, estimated_cost_list, plans_neighborhoods, neighborhoods, topNeighborhoods, locations_list, plans_list, category_list, popular_date_time, initiated_plans, initiated_plans_users, accepted_tags_by_stop } = this.props;
	
    return (
	  <div>
	  
	  <Tabs defaultActiveKey={1} id="matrices-divisions">
		<Tab eventKey={1} title="User Metrics">
			 <div className="row addMargin">
				<div className="col-md-4">
					<div className="row">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">TOTAL USERS</h3>
								<h3 className="content">{ usersFetched ? users_count : 0 }</h3>
							</div>
						</div>
					</div>
					<div className="row addMargin">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">GENDER</h3>
								<h3 className="content">MALE: { (maleFetched && usersFetched) ? (male*100/users_count).toFixed(0): 0 }%</h3>
								<h3 className="content">FEMALE: { (maleFetched && usersFetched) ? 100-(male*100/users_count).toFixed(0): 0 }%</h3>
							</div>
						</div>
					</div>
					<div className="row addMargin">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">TOTAL DOWNLOADS</h3>
								<h3 className="content">{ downloadsFetched ? downloads_count : 0 }</h3>
							</div>
						</div>
					</div>	
				</div>
				<div className="col-md-4">
					<div className="box">
						<h3 className="title">USER AGES</h3>
						<table className="table table-bordered table-hover table-striped table-responsive">
						<thead>
						<tr>
						<th className="tableHeader">AGE</th>
						<th className="tableHeader">USERS %</th>
						</tr>
						</thead>
						<tbody>
						  {take(item.users_ages || [], 10).map(({ age, per_cent }, index) => (
							<tr key={index}>
							  <td>{age}</td>
							  <td>{per_cent.toFixed(2)}%</td>
							</tr>
						  ))}
						</tbody>
					  </table>
					</div>
				</div>
				<div className="col-md-4">
					<div className="box">
						<h3 className="title">LOCATION REQUESTS</h3>
						<table className="table table-bordered table-hover table-striped table-responsive">
						<thead>
						<tr>
						<th className="tableHeader">NAME</th>
						<th className="tableHeader">REQUESTS</th>
						</tr>
						</thead>
						<tbody>
						{
						locationsListFetched ? (locations_list.map((data, index) => (<tr key={index}>
							  <td>{data.city}</td>
							  <td>{data.request_count}</td>
							</tr>))) :null	
						}
						</tbody>
						</table>
					</div>
				</div>
			 </div>
			 <div className="row addMargin">
				<div className="col-md-4">
					<div className="box">
						<h3 className="title">INVITES SENT</h3>
						<h3 className="content">TOTAL: { sentInvCountFetched  ? sent_invite_count: 0 }</h3>
					</div>
				</div>
				<div className="col-md-4">
					<div className="box">
						<h3 className="title">INVITES ACCEPTED</h3>
						<h3 className="content"> { (sentInvCountFetched && AcceptedInvCountFetched)  ? (accept_invite_count*100/sent_invite_count).toFixed(2): 0 }%</h3>
					</div>
				</div>
				<div className="col-md-4">
					<div className="box">
						<h3 className="title">INVITES PER PLAN</h3>
						<h3 className="content"> { (sentInvCountFetched && plansCountFetched)  ? (sent_invite_count/plans_count).toFixed(2): 0 }</h3>
					</div>
				</div>
			 </div>
		</Tab>
		<Tab eventKey={2} title="Plans Metrics">
		   <br/>
			<form onSubmit={this.props.handleSubmit(dashboard => this.updateDashboard(dashboard))}>
			  <div className="row">
				<div className="col-md-6">
				</div>
				<div className="col-md-5">
					<Field
					  name="metro_cities2"
					  valueField="objectId"
					  textField="name"
					  component={renderDropdownList}
					  data={citiesFetched ? cities.map(({ name, value }) => ({ name, value })): []}
					  label=""
					/>
				</div>
				<div className="col-md-1">	
					<div className="btn-group">
					  <button action="submit" className="btn btn-primary">
						Search
					  </button>
					</div>
				</div>
			  </div>
		  </form>
		  
			<div className="row addMargin">
				<div className="col-md-4">
					<div className="row">
						<div className="col-md-12">
							<div className="boxSmall">
								<h3 className="title">ACTIVE PLANS</h3>
								<h3 className="content"> { (activePlanCountFetched)  ? active_plans_count: 0 }</h3>
							</div>
						</div>
					</div>
					<div className="row addMargin">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">NEIGHBORHOODS ACTIVE PLANS</h3>
								<table className="table table-bordered table-hover table-striped table-responsive">
								<thead>
								<tr>
								<th className="tableHeader">NEIGHBORHOOD</th>
								<th className="tableHeader">PLAN</th>
								</tr>
								</thead>
								<tbody>
								{
								activePlanCountFetched ? (plans_neighborhoods.map(({neighborhood, count}, index) => (<tr key={index}>
									  <td>{neighborhood}</td>
									  <td>{count}</td>
									</tr>))) :null	
								}
								</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<div className="col-md-4">
					<div className="row">
						<div className="col-md-12">
							<div className="boxSmall">
								<h3 className="title">INITIATED PLANS</h3>
								<div className="content">PLANS: { initiatedPlansFetched ? initiated_plans : 0 }</div>
								<h3 className="content">USERS: { initiatedPlansFetched ? initiated_plans_users : 0 }</h3>
							</div>
						</div>
					</div>
					<div className="row addMargin">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">TOP CATEGORIES</h3>
								<table className="table table-bordered table-hover table-striped table-responsive">
								<thead>
								<tr>
								<th className="tableHeader">NAME</th>
								<th className="tableHeader">INVITATIONS</th>
								</tr>
								</thead>
								<tbody>
								{
								plansListFetched ? (category_list.map((data, index) => (<tr key={index}>
									  <td>{data.name}</td>
									  <td>{data.inv_sent.toFixed(2)}%</td>
									</tr>))) :null	
								}
								</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<div className="col-md-4">
					<div className="box">
						<h3 className="title">NEIGHBORHOODS</h3>
						<table className="table table-bordered table-hover table-striped table-responsive">
						<thead>
						<tr>
						<th className="tableHeader">NAME</th>
						<th className="tableHeader">POPULARITY</th>
						</tr>
						</thead>
						<tbody>
						{
						topNeighborhoodsFetched ? (neighborhoods.map((data, index) => (<tr key={index}>
							  <td>{data.neighborhood}</td>
							  <td>{data.perc.toFixed(2)}%</td>
							</tr>))) :null	
						}
						</tbody>
						</table>
					</div>
				</div>
			</div>
			<div className="row addMargin">
				<div className="col-md-4">
					<div className="row">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">TOP PLANS</h3>
								<table className="table table-bordered table-hover table-striped table-responsive">
								<thead>
								<tr>
								<th className="tableHeader">NAME</th>
								<th className="tableHeader">SENT</th>
								<th className="tableHeader">ACCEPTED</th>
								</tr>
								</thead>
								<tbody>
								{
								plansListFetched ? (plans_list.map((data, index) => (<tr key={index}>
									  <td><LinkTo className="btn-link" url={`plans/${data.objectId}/edit`}>{data.name}</LinkTo></td>
									  <td>{data.inv_sent}</td>
									  <td>{data.inv_accept}</td>
									</tr>))) :null	
								}
								</tbody>
								</table>
							</div>
						</div>
					</div>
					{/*<div className="box">
							<h3 className="title">ACCEPTED TAGS BY STOPS</h3>
							<table className="table table-bordered table-hover table-striped table-responsive">
							<thead>
							<tr>
							<th className="tableHeader">LOCATION</th>
							<th className="tableHeader">TAG</th>
							<th className="tableHeader">ACCEPTED</th>
							</tr>
							</thead>
							<tbody>
							{
							acceptedTagsByStopsFetched ? (accepted_tags_by_stop.map((data, index) => (<tr key={index}>
								  <td>{data.stop}</td>
								  <td>{data.tag}</td>
								  <td>{data.count.toFixed(2)}%</td>
								</tr>))) :null	
							}
							</tbody>
							</table>
					</div>*/}
				</div>	
				<div className="col-md-4">
					<div className="row">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">USER TAGS</h3>
								<table className="table table-bordered table-hover table-striped table-responsive">
								<thead>
								<tr>
								<th className="tableHeader">NAME</th>
								<th className="tableHeader">POPULARITY</th>
								</tr>
								</thead>
								<tbody>
								{
								tagsFetched ? (tags.map((data, index) => (<tr key={index}>
									  <td>{data.tag}</td>
									  <td>{data.perc.toFixed(2)}%</td>
									</tr>))) :null	
								}
								</tbody>
								</table>
							</div>
						</div>
					</div>
					<div className="row addMargin">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">ACCEPTED PLANS BY STOPS</h3>
								<table className="table table-bordered table-hover table-striped table-responsive">
								<thead>
								<tr>
								<th className="tableHeader">NAME</th>
								<th className="tableHeader">ACCEPTED</th>
								</tr>
								</thead>
								<tbody>
								{
								acceptedPlansByStopFetched ? (accepted_plans_by_Stop.map((data, index) => (<tr key={index}>
									  <td>{data.loc_count} {data.loc_count>1 ? 'Stops': 'Stop'}</td>
									  <td>{data.plans_count.toFixed(2)}%</td>
									</tr>))) :null	
								}
								</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>	
				<div className="col-md-4">
					<div className="row">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">ESTIMATED COST</h3>
								<table className="table table-bordered table-hover table-striped table-responsive">
								<thead>
								<tr>
								<th className="tableHeader">COST TYPE</th>
								<th className="tableHeader">PLANS</th>
								</tr>
								</thead>
								<tbody>
								{
								activePlanCountFetched ? (estimated_cost_list.map((data, index) => (<tr key={index}>
									  <td>{data.cost_type}</td>
									  <td>{data.cost_occur}</td>
									</tr>))) :null	
								}
								</tbody>
								</table>
							</div>
						</div>
					</div>
					<div className="row addMargin">
						<div className="col-md-12">
							<div className="box">
								<h3 className="title">POPULAR DATE TIME</h3>
								<table className="table table-bordered table-hover table-striped table-responsive">
								<thead>
								<tr>
								<th className="tableHeader">DAY</th>
								<th className="tableHeader">TIME</th>
								<th className="tableHeader">ACCEPTED</th>
								</tr>
								</thead>
								<tbody>
								{
								popularDateTimeFetched ? (popular_date_time.map((data, index) => (<tr key={index}>
									  <td>{data.day}</td>
									  <td>{data.time}</td>
									  <td>{data.accept_count}</td>
									</tr>))) :null	
								}
								</tbody>
								</table>
							</div>
						</div>
					</div>	
				</div>
			</div>
		</Tab>
	 </Tabs>
	{/*<table className="table table-bordered table-hover table-striped table-responsive">
	<tbody>
	  <tr>
		<td>Users</td>
		<td>{item.users_count}</td>
	  </tr>
	  <tr>
		<td>Ages</td>
		<td>
		  <table className="table table-bordered table-hover table-striped table-responsive">
			<tbody>
			  {take(item.users_ages || [], 10).map(({ age, per_cent }, index) => (
				<tr key={index}>
				  <td>{age}</td>
				  <td>{per_cent.toFixed(2)}%</td>
				</tr>
			  ))}
			</tbody>
		  </table>
		</td>
	  </tr>
	  <tr>
		<td>Users Added This Month</td>
		<td>{item.new_users_count}</td>
	  </tr>
	  <tr>
		<td>Available Plans</td>
		<td>{item.available_itineraries}</td>
	  </tr>
	  <tr>
		<td>Plans Expiring In The Next 7 Days</td>
		<td>{item.plans_expiring_count}</td>
	  </tr>
	</tbody>
	</table>*/}
	</div>
    );
  }
}

export default connect(({ data: { item, cities, downloads_count, users_count, tags, male, accept_invite_count, plans_count, active_plans_count, estimated_cost_list, plans_neighborhoods, neighborhoods, locations_list, plans_list, category_list, popular_date_time, initiated_plans, initiated_plans_users, accepted_tags_by_stop } }) => ({ item, cities, downloads_count, users_count, tags, male, accept_invite_count, plans_count, active_plans_count, estimated_cost_list, plans_neighborhoods, neighborhoods, locations_list, plans_list, category_list, popular_date_time, initiated_plans, initiated_plans_users, accepted_tags_by_stop }), { fetchData, fetchMetroCities, downloadsCount, usersCount, tagsCount, maleCount, sentInviteCount, inviteAcceptedCount, plansCount, activePlanCount, topNeighborhoods, topLocations, popularPlans,popularDateTime, acceptedPlansByStop, initiatedPlans, acceptedTagsByStops })(reduxForm({ form: 'dashboard' })(DataTable));
