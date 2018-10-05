import size from 'lodash/size';
import React, { PropTypes, Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BooleanField, LinkTo } from '../../../helpers';
import { renderDate, renderDateTime, weekDays, capitalize } from '../../../utils';
import {connect} from 'react-redux';
import { pauseBoost } from '../../../actions/BoostActions';
import { browserHistory } from 'react-router';

function renderOccursResults(occurs){
	  switch (occurs) {
	  case 'any_day_and_any_time':
		return 'Any Day and Time';
	  case 'weekdays_only':
		return 'Weekdays Only';
	  case 'weekends_only': 
		return 'Weekends Only';	
	}
}
  
function showPause(end_time){
	
	var cur_date = new Date();
	var allowed_date=new Date(end_time)			  
	var diff =(cur_date.getTime() - allowed_date.getTime()) / 1000;
	diff /= 60;
	if(Math.abs(Math.round(diff)>1))
	{
	   return false;
	}
	return true;
}  

class BoostsList extends Component {	
	state = {showModel: false, defaultMessage:true, pauseMessage:false, invAccepetedMessage:false, showDefaultBtn: true, paused: false, activeMessage: false, activeBtn: false, boostId: 0, boostType: '', refreshPage: false};
	
	showPopup(objectId, boost_type,isPaused){
		if(isPaused){
			this.setState({showModel: true, defaultMessage: false, pauseMessage: false, invAccepetedMessage: false, showDefaultBtn: false, activeMessage: true, activeBtn: true, boostId: objectId, boostType: boost_type});
		}
		else {
			this.setState({showModel: true, defaultMessage: true, pauseMessage: false, invAccepetedMessage: false, showDefaultBtn: true, activeMessage: false, activeBtn: false, boostId: objectId, boostType: boost_type});
		}
	}
	
	pauseBoostEvent(isPause){
		var {boostId, boostType} = this.state;
		this.props.pauseBoost(boostId, isPause).then((response) => {
			if(isPause){
				if(boostType=='invites_sent'){
					this.setState({defaultMessage: false, pauseMessage: true, showDefaultBtn: false, paused: true, refreshPage: true});
				}
				else{
					this.setState({defaultMessage: false, pauseMessage: true,invAccepetedMessage: true, showDefaultBtn: false, paused: true, refreshPage: true});
				}
			}
			else{
				this.setState({showModel: false, defaultMessage:true, pauseMessage:false, invAccepetedMessage:false, showDefaultBtn: true, paused: false, activeMessage: false, activeBtn: false});
				window.location.reload();
			}
			}).catch( err => console.log('errors'));
	}
	
	hidePopup()
	{
		this.setState({showModel: false});
		if(this.state.refreshPage==true){
			window.location.reload();
		}
	}
	
	render() {
		const {showModel, defaultMessage, pauseMessage, invAccepetedMessage, showDefaultBtn, paused, activeMessage, activeBtn} = this.state;
		
		const { items } = this.props;
		
		const modalStyle = {position: 'fixed', zIndex: 1040, top: 0, bottom: 0, left: 0, right: 0};
		const dialogStyle = function() {
		  let rand = ()=> (Math.floor(Math.random() * 20) - 10);
		  let top = 50 + rand();
		  let left = 50 + rand();

		  return {
			position: 'absolute',
			width: 500,
			top: top + '%', left: left + '%',
			transform: `translate(-${top}%, -${left}%)`,
			border: '1px solid #e5e5e5',
			backgroundColor: 'white',
			boxShadow: '0 5px 15px rgba(0,0,0,.5)',
			paddingTop: 25,
			textAlign:'center'
		  };
		};
	
		const backdropStyle = {
		  ...modalStyle,
		  zIndex: 'auto',
		  backgroundColor: '#000',
		  opacity: 0.5
		};
		
	  if (size(items) > 0) {
		return (
		  <table className="table table-bordered table-hover table-striped table-responsive">
			<thead>
			<tr>
			  <th>Boost Name</th>
			  <th>Dates</th>
			  <th>Start Date</th>
			  <th>End Date</th>
			  <th>Max Budget</th>
			  <th>Approved?</th>
			  <th>Boost Type</th>
			  <th>Created</th>
			  <th />
			  <th />
			  <th />
			</tr>
			</thead>
			<tbody>
			{items.map(({objectId, name, occurs, dates, start_time, end_time, with_max_budget, max_budget, approved, boost_type, createdAt, boost_pause}) => (
			  <tr key={objectId}>
				<td>
				  <LinkTo url={`boosts/${objectId}`}>{name}</LinkTo>
				</td>
				<td>
				  {occurs ? renderOccursResults(occurs) : (size(dates || []) > 0 ? (
					  <table className="table table-bordered table-hover table-striped table-responsive">
						<tbody>
						{(dates || []).map(({ day, times, parts }, index) => (
						  <tr key={index}>
							<td>{capitalize(weekDays[day - 1])}</td>
							<td>{(times || parts || []).map(time => time.name).join(', ')}</td>
						  </tr>
						))}
						</tbody>
					  </table>
					) : null)}
				</td>
				<td>{renderDate(start_time)}</td>
				<td>{with_max_budget ? null : renderDate(end_time)}</td>
				<td>{with_max_budget ? max_budget : null}</td>
				<td><BooleanField value={approved} /></td>
				<td>{boost_type ? boost_type.name : null}</td>
				<td>{renderDate(createdAt)}</td>
				<td>
				{/*<LinkTo className="btn btn-info" url={`boosts/${objectId}`}>Show</LinkTo>*/}
					{ showPause(end_time) && (!boost_pause) ? (<Button bsStyle="danger" onClick={() => this.showPopup(`${objectId}`, `${boost_type.value}`,false)}>Pause</Button>): (!showPause(end_time)? (<LinkTo className="btn btn-info" url={`boosts/${objectId}`}>View</LinkTo>):(<Button bsStyle="primary" onClick={() => this.showPopup(`${objectId}`, `${boost_type.value}`,true)}>Paused</Button>))}
				</td>
				<td>
				  <LinkTo className="btn btn-primary" url={`boosts/${objectId}/edit`}>Edit</LinkTo>
				</td>
				<td>
				  <LinkTo className="btn btn-danger" url={`boosts/${objectId}/delete`}>Delete</LinkTo>
				</td>
			  </tr>
			))}
			</tbody>
			<Modal
			  aria-labelledby='modal-label'
			  style={modalStyle}
			  backdropStyle={backdropStyle}
			  show={showModel}
			>
			  <div style={dialogStyle()} >
				<h3 id='modal-label'> 
				<p>{ defaultMessage ? ('Are you sure you want to disable this Boost?') : null }</p> 
				{ pauseMessage ? ('Your Boost has been paused') : null } <br/>{ invAccepetedMessage ? ('Please Note: You may still be charged for accepted invites on invites sent while the Boost was active') : null} { activeMessage ? ('Are you sure you want to activate this Boost?') : null  }</h3>
				<p>
				
				{showDefaultBtn ? ( <span><Button bsStyle="danger" onClick={() => this.pauseBoostEvent(true)}>
					Pause
				  </Button><Button bsStyle="primary" onClick={() => this.hidePopup()}>
					Cancel
				  </Button> </span>):null}
				  {activeBtn ? (<span><Button bsStyle="primary" onClick={() => this.pauseBoostEvent(false)}>
					Activate
				  </Button><Button bsStyle="primary" onClick={() => this.hidePopup()}>
					Cancel
				  </Button> </span>) : null } 
				  { (!showDefaultBtn && !activeBtn) ?(<Button bsStyle="primary" onClick={() => this.hidePopup()}>
					ok
				  </Button>): null}
				  
				  </p>
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

BoostsList.propTypes = {
  items: PropTypes.array.isRequired
};

const makeMapStateToProps = () => {
  return (state, props) => ({
  })
}

export default connect(makeMapStateToProps, {pauseBoost})(BoostsList);
//export default BoostsList;