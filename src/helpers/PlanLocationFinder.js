import compact from 'lodash/compact';
import size from 'lodash/size';
import React, { Component, PropTypes } from 'react';
import { Button, Modal, Panel, FormGroup, FormControl, ControlLabel, Checkbox  } from 'react-bootstrap';
import cl from 'classnames';
import axios from 'axios';
import Loader from 'react-loader';
import geolib from 'geolib';
import TimePicker from 'react-bootstrap-time-picker';
import moment from 'moment';
import {BuildEventList} from './'

import { YELP_HOST_URI, UPLOAD_HOST } from '../config';

export default class PlanLocationFinder extends Component {

  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string,
    type: PropTypes.string
  };

  state = {
    modalOpened: false,
    errorMessage: null,
		locations: [],
		nearByFilter: [],
		selectedLocations:[],
		locationTypes: [],
		cities : [],
		filterOptions : {
			location_city : "",
			location_type : "",
			enable : false,
			specials: false,
			events: false
		},
		loaded : true,
		searchResultTitle : "",
		events : [],
		specialsData: [],
		eventsData: [],
		isEventsLocations: false,
		eventShouldDisplayResult : false
  };

	constructor(props) {
		super(props);
		this.onShow = this.onShow.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleTimeChange = this.handleTimeChange.bind(this);
	}

  toggleModal(cb = null) {
    this.setState({ showModal: !this.state.showModal }, () => {
		const {selectedLocations} = this.state;
		const {tempLocations} = this.props;
		this.setState({selectedLocations: tempLocations});
      if (cb) {
        cb();
      }
    });
  }

	onSelectLocation(location) {
		const { onSelectLocation } = this.props;
		onSelectLocation(location);
		this.toggleModal();
		this.setState({locations : []});
	}

	selectLocation(location) {
		const foundLocation = this.state.selectedLocations.filter((obj,i) => obj.objectId == location.objectId);
		if (foundLocation.length == 0) {
			this.setState({ selectedLocations : [...this.state.selectedLocations, location] });
		}
	}

	clearEvents (){
		this.setState({
	     events: [],
			 eventShouldDisplayResult : false
	   });
	}

	removeLocation(location) {
		this.setState({
	     selectedLocations: this.state.selectedLocations.filter((obj, i) => obj !== location)
	   });
	}

	useCurrentLocations() {
		const { onSelectLocation } = this.props;
		const { selectedLocations } = this.state;
		onSelectLocation(selectedLocations);
		this.toggleModal();
		this.setState({
			locations : [],
			selectedLocations : []
		});
	}

	findEvents(location) {
		const options = { params: { locationId:location.objectId }};
		this.setState({
			loaded : false
		});
		axios.get(`${UPLOAD_HOST}/find/location/events`, options).then(({ data }) => {
			if (data) {
				this.setState({
					events : data,
					loaded : true,
					eventShouldDisplayResult : true,
					specialsData: [],
					eventsData: []
				});
			}
		});
	}

	findNearybyLocations(location) {
		this.setSearchResultTitle(`Location Nearby "${location.name}"`)
		this.setState({
			loaded : false});
		
		const options = { params: { excludeId : location.objectId, latitude: location.latitude, longitude : location.longitude }};
		if (this.state.filterOptions.enable == true) {
			options.params =  this.state.filterOptions;
		}
		axios.get(`${UPLOAD_HOST}/find/location/nearby`, options).then(({ data }) => { 
			if (data) { 
				var loc_data=data.resp;
				var nearByTemp = [];
				for(var i = 0; i < loc_data.length; i++){
					if(this.state.nearByFilter.indexOf(loc_data[i].objectId)<0){
						var meters =  geolib.getDistance(
							{latitude: location.latitude, longitude: location.longitude},
							{latitude: loc_data[i].location.latitude , longitude: loc_data[i].location.longitude}
						);
						loc_data[i].miles= (0.000621371192 * meters).toFixed(2);
						nearByTemp.push(loc_data[i]);
					}
				}
				nearByTemp.sort((a, b) => {if (a.miles < b.miles){return -1;}if (a.miles > b.miles){return 1;}return 0;});
				this.setState({locations : nearByTemp, loaded : true, nearByFilter: [], specialsData: data.specials, eventsData: data.events, isEventsLocations: (data.specials.length>0 || data.events.length>0)? true: false});
			}
		});
	}

	findUnUsedLocations() {
		this.setState({
			loaded : false
		});
		const options = { params: {}};
		if (this.state.filterOptions.enable == true) {
			options.params =  this.state.filterOptions;
		}
		this.setSearchResultTitle("Non Used locations")
		axios.get(`${UPLOAD_HOST}/find/location/unused`, options).then(({ data }) => {
			if (data) { 
				this.setState({locations : data.resp, loaded : true, specialsData: data.specials, eventsData: data.events, isEventsLocations: (data.specials.length>0 || data.events.length>0)? true: false});
			}
		});
	}

	findLocationTypes() {
		axios.get(`${UPLOAD_HOST}/find/location/location_types`).then(({ data }) => {
			if (data) {
				this.setState({locationTypes : data});
			}
		});
	}

	findMetroCity() {
		axios.get(`${UPLOAD_HOST}/find/location/cities`).then(({ data }) => {
			if (data) {
				this.setState({cities : data});
			}
		});
	}

	buildLocationTypeOptions() {
		const { locationTypes } = this.state;
		var arr = [];
		for (let i = 0; i < locationTypes.length; i++) {
			const name = locationTypes[i].name;
			const id = locationTypes[i].objectId;
			arr.push(<option key={i} value={id}>{name}</option>)
		}
		return arr;
	}

	buildMetroCityOptions() {
		const { cities } = this.state;
		var arr = [];
		for (let i = 0; i < cities.length; i++) {
			const name = cities[i].name;
			const value = cities[i].value;
			arr.push(<option key={i} value={value}>{name}</option>)
		}
		return arr;
	}

	handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		var filterOptions = {...this.state.filterOptions}
		filterOptions[name] = value;
		this.setState({
			 filterOptions
		 });
	 }

	 setSearchResultTitle(title) {
		 this.setState({searchResultTitle : title });
	 }

	 handleTimeChange(location, value) {
		 const selectedLocations = this.state.selectedLocations.map(function(item) {
			 if (item == location) {
			 	return {...item, time: value};
			} else {
				return item;
			}
		 });
		 this.setState({
			 selectedLocations
		 });
	}

/**
	Before displaying model load locations and city
*/
	onShow() {
		this.setState({locations : []});
		this.findLocationTypes();
		this.findMetroCity();
	}
	
	showSpecialsData(objectId){
		for(var i=0;i<this.state.specialsData.length;i++){
			if(this.state.specialsData[i].objectId==objectId){
				return this.state.specialsData[i].data;
			}
		}
		return [];
	}
	
	showEventsData(objectId){
		for(var i=0;i<this.state.eventsData.length;i++){
			if(this.state.eventsData[i].objectId==objectId){
				return this.state.eventsData[i].data;
			}
		}
		return [];
	}

  render() {
    const { input, label, placeholder, tempLocations, meta: { touched, error, warning } } = this.props;
    const { showModal, locations, loaded, selectedLocations, searchResultTitle, events, eventShouldDisplayResult, nearByFilter, filterOptions, isEventsLocations } = this.state;
	const styleDisplay={display:"none"};
	const captStyle={fontWeight: "bold", textAlign: "center", color: "#000"};
    return (
      <fieldset className={cl('form-group', { 'has-error': (touched && error) })}>
        <a
          href="#"
          className="btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            this.toggleModal();
          }}
        >
          {label}
        </a>
        {touched && ((error && <div className="error help-block">{error}</div>) || (warning && <div className="error">{warning}</div>))}

        <Modal dialogClassName="big-modal" bsSize="lg" show={showModal} onHide={() => this.toggleModal()} onEntered={this.onShow}>
          <Modal.Header closeButton>
            <Modal.Title>{placeholder}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
						<div className="row">
							<div className="col-md-8">
								<Panel header="Search">
									<Button bsStyle="primary" onClick={() => this.findUnUsedLocations()}>Find Unused Locations </Button>
									<Loader loaded={loaded}  className="spinner" />
								</Panel>
							</div>
							<div className="col-md-4">
								<Panel header="Filter">
									<FormGroup>
										<Checkbox
										name="enable"
										inline
										value="this.state.filterOptions.enable"
										onChange={this.handleInputChange}>
											Enable
										</Checkbox>
										</FormGroup>
										<FormGroup controlId="locationType">
											<ControlLabel>Location Type</ControlLabel>
											<FormControl
											componentClass="select"
											placeholder="select"
											name="location_type"
											onChange={this.handleInputChange}
											value={this.state.filterOptions.location_type}>
												<option value="">Any</option>
												{this.buildLocationTypeOptions()}
											</FormControl>
										</FormGroup>
										<FormGroup controlId="metroCity">
											<ControlLabel>Metro City</ControlLabel>
											<FormControl
											componentClass="select"
											placeholder="select"
											name="location_city"
											onChange={this.handleInputChange}
											value={this.state.filterOptions.location_city}>
												<option value="">Any</option>
												{this.buildMetroCityOptions()}
											</FormControl>
										</FormGroup>
										<Checkbox
										name="specials"
										inline
										value="this.state.filterOptions.special"
										onChange={this.handleInputChange}>
											Special
										</Checkbox>
										<Checkbox
										name="events"
										inline
										value="this.state.filterOptions.event"
										onChange={this.handleInputChange}>
											Event
										</Checkbox>
								</Panel>
							</div>
							<div className="col-md-12">
							<Panel header="Selected Locations">
								{size(selectedLocations) > 0 ? (
									<div>
									<Button bsStyle="primary" onClick={() => this.useCurrentLocations()} > Select Locations </Button> <br/><br/>
									<table className="table table-striped table-bordered table-hover">
										<tbody>
										<tr>
											<th>Name</th>
											<th>Neighborhood</th>
											<th>Location Type</th>
											<th>Metro City</th>
											<th>Tags</th>
											<th>Time</th>
											<th>Action</th>
										</tr>
										{selectedLocations.map(location => (
											<tr key={location.objectId}>
												<td>{location.name}</td>
												<td>{location.neighborhood || ''}</td>
												<td>{location.location_type ? location.location_type.name: ''}</td>
												<td>{location.metro_city}</td>
												<td>{location.tags ? location.tags.join(', ') : null}</td>
												<td> <TimePicker step={30} value={location.time ? location.time : 0} onChange={ (e) => this.handleTimeChange(location, e) }
												/>
												</td>
												<td>
													<Button bsStyle="danger" onClick={() => this.removeLocation(location)}>Remove</Button>
													{' '}
													<Button bsStyle="success" onClick={() => this.findNearybyLocations(location)}>Find Nearby</Button>
													{' '}
													<Button bsStyle="success" onClick={() => this.findEvents(location) } >Find Events</Button>
												</td>
											</tr>
										))}
										</tbody>
									</table>
									</div>
								) : (<div>No Location Selected</div>) }
							</Panel>
							</div>
							<div className="col-md-12">
								<BuildEventList items={events} clear={() => this.clearEvents() } displayResult={eventShouldDisplayResult}></BuildEventList>
							</div>
								<div className="col-md-12">
									{size(locations) > 0 ? (
											<table className="table table-striped table-bordered table-hover">
												<tbody>
												<tr>
													<th colSpan={isEventsLocations ? "8":"7"}>{searchResultTitle}</th>
												</tr>
												<tr>
													<th>Name</th>
													<th>Neighborhood</th>
													<th>Location Type</th>
													<th>Metro City</th>
													<th>Tags</th>
													<th>Estimated Cost</th>
													{
														isEventsLocations ? (<th>Events/Specials</th>):null
													}
													<th>Action</th>
												</tr>
												{locations.map(location => (
													<tr key={location.objectId}>
														<td>{location.name} {location.miles? `(${location.miles} miles)`: null}</td>
														<td>{location.neighborhood}
															<span style={styleDisplay}>{nearByFilter.push(location.objectId)}</span>
														</td>
														<td>{location.location_type ? location.location_type.name : null}</td>
														<td>{location.metro_city}</td>
														<td>{location.tags ? location.tags.join(', ') : null}</td>
														<td>{ location.estimated_cost ? location.estimated_cost.name : ''}</td>
														
														{isEventsLocations ?(<td>
														<table className="table table-striped table-bordered table-hover">
														{this.showSpecialsData(location.objectId).length>0 ?(<caption style={captStyle}>Specials Details</caption>):null}
														<tbody>
														{this.showSpecialsData(location.objectId).length>0 ?(<tr><th>Name</th><th>Description</th></tr>):null}
														{this.showSpecialsData(location.objectId).map(({name, description}, index) => (<tr key={index}><td>{name}</td><td>{description}</td></tr>))}
														</tbody>
														</table>
														<table className="table table-striped table-bordered table-hover">
														{this.showEventsData(location.objectId).length>0 ?
														(<caption style={captStyle}>Events Details</caption>):null}
														<tbody>
														{this.showEventsData(location.objectId).length>0 ?
														(<tr><th>Name</th><th>Description</th></tr>):null}
														{this.showEventsData(location.objectId).map(({name, description}, index) => (<tr key={index}><td>{name}</td><td>{description}</td></tr>))}
														</tbody>
														</table>
														</td>):null}
														
														<td>
															<Button bsStyle="success" onClick={() => this.selectLocation(location)}>Select
															 Location</Button>
														</td>
													</tr>
												))}
												</tbody>
											</table>
										) : null}
								</div>
						</div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.toggleModal()}>Close</Button>
          </Modal.Footer>
        </Modal>
      </fieldset>
    );
  }
}
