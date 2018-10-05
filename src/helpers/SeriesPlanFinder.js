import compact from 'lodash/compact';
import size from 'lodash/size';
import sortBy from "lodash/sortBy";
import React, { Component, PropTypes } from 'react';
import { Button, Modal, Panel, FormGroup, FormControl, ControlLabel, Checkbox  } from 'react-bootstrap';
import cl from 'classnames';
import axios from 'axios';
import Loader from 'react-loader';
import geolib from 'geolib';
import TimePicker from 'react-bootstrap-time-picker';
import moment from 'moment';

import { renderDate } from '../utils';
import { YELP_HOST_URI, UPLOAD_HOST } from '../config';

export default class SeriesPlanFinder extends Component {

  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    label: PropTypes.string,
    type: PropTypes.string
  };

  state = {
    modalOpened: false,
    errorMessage: null,
		locationTypes: [],
		cities : [],
		filterOptions : {
			location_city : "",
			location_type : "",
			enable : false
		},
		loaded : true,
		searchResultTitle : "",
		shouldCalculateDistance : false,
		plans : [],
		selectedPlans: []
  };

	constructor(props) {
		super(props);
		this.onShow = this.onShow.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
	}

  toggleModal(cb = null) {
    this.setState({ showModal: !this.state.showModal }, () => {
      if (cb) {
        cb();
      }
    });
  }

	selectPlan(plan) {
		const foundPlan = this.state.selectedPlans.filter((obj,i) => obj.objectId == plan.objectId);
		if (foundPlan.length == 0) {
			this.setState({ selectedPlans : [...this.state.selectedPlans, plan] }, () => {
				const sorted = sortBy(this.state.selectedPlans,function(a) {
					const oldDate = moment([2000, 0, 1]);
					const planDate = moment(a.start_day.iso);
					return planDate.diff(oldDate, 'days');
				});
				this.setState({selectedPlans : sorted});
			});
		}
	}

	removePlan(plan) {
		this.setState({
	     selectedPlans: this.state.selectedPlans.filter((obj, i) => obj !== plan)
	   });
	}

	useCurrentPlans() {
		const { onSelectPlans } = this.props;
		const { selectedPlans } = this.state;
		onSelectPlans(selectedPlans);
		this.toggleModal();
		this.setState({
			plans : [],
			selectedPlans : []
		});
	}

	findPlans() {
		this.setState({
			loaded : false,
			shouldCalculateDistance  : false
		});
		const options = { params: {}};
		if (this.state.filterOptions.enable == true) {
			options.params =  this.state.filterOptions;
		}
		this.setSearchResultTitle("Plans")
		axios.get(`${UPLOAD_HOST}/find/series/plans`, options).then(({ data }) => {
			if (data) {
				this.setState({plans : data, loaded : true});
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

	onShow() {
		this.setState({plans : []});
		this.findLocationTypes();
		this.findMetroCity();
	}
	
	calcuateDistance(targetLocation) {
		const { refrenceLocation } = this.state;
		const meters =  geolib.getDistance(
			{latitude: refrenceLocation.latitude, longitude: refrenceLocation.longitude},
			{latitude: targetLocation.latitude , longitude: targetLocation.longitude}
		);
		const miles = (0.000621371192 * meters).toFixed(2);
		return ` (${miles} miles)`;
	}

  render() {
    const { input, label, placeholder, meta: { touched, error, warning } } = this.props;
    const { showModal, plans, loaded, selectedPlans, searchResultTitle, shouldCalculateDistance, events, eventShouldDisplayResult } = this.state;

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
									<Button bsStyle="primary" onClick={() => this.findPlans()}>Find Plans</Button>
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
								</Panel>
							</div>
							<div className="col-md-12">
							<Panel header="Selected Plans">
								{size(selectedPlans) > 0 ? (
									<div>
									<Button bsStyle="primary" onClick={() => this.useCurrentPlans()} > Select Plans </Button> <br/><br/>
									<table className="table table-striped table-bordered table-hover">
										<tbody>
										<tr>
											<th>Banner</th>
							        <th>Title</th>
							        <th>Tags</th>
							        <th>Neighborhood</th>
							        <th>Start</th>
							        <th>End</th>
							        <th>Action</th>
										</tr>
										{selectedPlans.map( plan => (
											<tr key={plan.objectId}>
												<td>
													{plan.image ? (
														<img className="list-image img-responsive" src={plan.image} alt="" />
													) : null}
												</td>
												<td>{plan.title_event}</td>
							          <td>{(plan.tags || []).join(', ')}</td>
							          <td>{compact((plan.locations || []).map(l => l.location ? l.location.neighborhood : null)).join(', ')}</td>
							          <td>{plan.start_day ? renderDate(plan.start_day.iso) : null}</td>
							          <td>{plan.end_day ? renderDate(plan.end_day.iso) : null}</td>
												<td>
													<Button bsStyle="danger" onClick={() => this.removePlan(plan)}>Remove</Button>
												</td>
											</tr>
										))}
										</tbody>
									</table>
									</div>
								) : (<div>No Plan Selected</div>) }
							</Panel>
							</div>
								<div className="col-md-12">
									{size(plans) > 0 ? (
											<table className="table table-striped table-bordered table-hover">
												<tbody>
												<tr>
													<th colSpan="7">{searchResultTitle}</th>
												</tr>
												<tr>
													<th>Banner</th>
									        <th>Title</th>
									        <th>Tags</th>
									        <th>Neighborhood</th>
									        <th>Start</th>
									        <th>End</th>
									        <th>Action</th>
												</tr>
												{plans.map( plan => (<tr key={plan.objectId}>
													<td>
														{plan.image ? (
															<img className="list-image img-responsive" src={plan.image} alt="" />
														) : null}
													</td>
													<td>{plan.title_event}</td>
								          <td>{(plan.tags || []).join(', ')}</td>
								          <td>{compact((plan.locations || []).map(l => l.location ? l.location.neighborhood : null)).join(', ')}</td>
								          <td>{plan.start_day ? renderDate(plan.start_day.iso) : null}</td>
								          <td>{plan.end_day ? renderDate(plan.end_day.iso) : null}</td>
													<td>
														<Button bsStyle="success" onClick={() => this.selectPlan(plan)}>Select
														 Plan</Button>
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
