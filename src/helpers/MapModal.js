import React, { Component, PropTypes } from 'react';
import { Button, Modal, Panel, FormGroup, FormControl, ControlLabel, Checkbox  } from 'react-bootstrap';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import axios from 'axios';
import size from 'lodash/size';
import GoogleMap from './GoogleMap';
import Multiselect from 'react-widgets/lib/Multiselect'

import { GOOGLE_HOST_URI } from '../config';

export default class MapModal extends Component {
	state = {
    plans: [],
    metro_city: null,
    metroCities: [],
    filteredPositions: [],
    isFiltered: false,
    origins: ['plan', 'location'],
    viewType: 'plan',
    activeTypes: ['All', 'Active', 'Non-Active'],
    activeStatus: 'All',
    selectedLocationTypes: [],
    selectedLocationTags: [],
    isEnableEvent: false,
    isEnableSpecial: false
	}

	constructor(props) {
		super(props);
	}

	componentDidMount() {
    this.setState({ metro_city: 'ALL' });
  }

  componentWillReceiveProps(newProps) {
    const { metroCities } = newProps;
    const { metro_city, location } = this.state;

    if (metroCities && metroCities.length > 0)
      this.setState({ metroCities: metroCities });
  }

  afterSetState() {
    const { viewType, metro_city, activeStatus, selectedLocationTypes, selectedLocationTags, isEnableSpecial, isEnableEvent } = this.state;
    const { plans, locations, locPositions, planPositions } = this.props;
    let filteredPositions = [];
    
    // console.log('@1 ViewType - ', viewType, ', MetroCity - ', metro_city, ', ActiveStatus - ', activeStatus, ', locationTypes - ', selectedLocationTypes, ', locationTags - ', selectedLocationTags, ', isEnableEvent - ', isEnableEvent, ', isEnableSpecial - ', isEnableSpecial);

    let filtered0 = [];     // ViewType & MetroCity | ComingEvent & ActiveSpecial filter
    if (isEnableEvent || isEnableSpecial) {
      let subFiltered0 = [];
      if (metro_city !== "ALL") {
        for (let i = 0; i < locPositions.length; i++)
          if (locPositions[i].metro_city === metro_city)
            subFiltered0.push(locPositions[i]);
      } else {
        subFiltered0 = locPositions;
      }

      let subFiltered1 = [];
      for (let i = 0; i < subFiltered0.length; i++) {
        if (isEnableEvent && isEnableSpecial) {
          if (subFiltered0[i]['isComingEvent'] === true || subFiltered0[i]['isActiveSpecial'] === true)
            filtered0.push(subFiltered0[i])
        } else if (isEnableEvent) {
          if (subFiltered0[i]['isComingEvent'] === true)
            filtered0.push(subFiltered0[i])
        } else if (isEnableSpecial) {
          if (subFiltered0[i]['isActiveSpecial'] === true)
            filtered0.push(subFiltered0[i])
        } 
      }
    } else {
      if (viewType === "plan") {
        if (metro_city !== "ALL") {
          for (let i = 0; i < plans.length; i++) {
            for (let k = 0; k < locations.length; k++) {
              if (plans[i].locations[0].location.objectId === locations[k].objectId)
                if (locations[k].metro_city2) {
                  if (locations[k].metro_city2.name === metro_city) {
                    filtered0.push(planPositions[i]);
                    break;
                  }
                }
            }
          }
        } else {
          filtered0 = planPositions;
        }
      } else if (viewType === "location") {
        if (metro_city !== "ALL") {
          for (let i = 0; i < locPositions.length; i++)
            if (locPositions[i].metro_city === metro_city)
              filtered0.push(locPositions[i]);
        } else {
          filtered0 = locPositions;
        }
      }
    }

    let filtered1 = [];     // All & Active & Non-Active filter
    for (let i = 0; i < filtered0.length; i++) {
      if (activeStatus === 'All') {
        filtered1.push(filtered0[i]);
      } else if (activeStatus === 'Active') {
        if (filtered0[i].active === true)
          filtered1.push(filtered0[i]);
      } else if (activeStatus === 'Non-Active') {
        if (filtered0[i].active === false)
          filtered1.push(filtered0[i]);
      }
    }

    let filtered2 = [];     // LocationType filter
    if (selectedLocationTypes.length > 0)
      for (let i = 0; i < filtered1.length; i++) {
        let place = 0;
        let hasLocType = false;

        if (viewType === "plan") {
          place = this.getPlanWithId(filtered1[i].objectId);

          for (let j = 0; j < place.locations.length; j++) {
            let locationObj = this.getLocationWithId(place.locations[j].location.objectId);
            
            if (locationObj && locationObj.location_type && locationObj.location_type.objectId !== "undefined") {
              let locationType = this.getLocationTypeWithId(locationObj.location_type.objectId);

              if (locationType) {
                for (let j = 0; j < selectedLocationTypes.length; j++)
                  if (selectedLocationTypes[j] === locationType.name) {
                    hasLocType = true;
                    break;
                  }
              }
            }

            if (hasLocType)
              break;
          }

          if (hasLocType)
            filtered2.push(filtered1[i]);
        } else {
          place = this.getLocationWithId(filtered1[i].objectId);

          if (place.location_type && place.location_type.objectId !== "undefined") {
            let locationType = this.getLocationTypeWithId(place.location_type.objectId);

            if (locationType) {
              for (let j = 0; j < selectedLocationTypes.length; j++)
                if (selectedLocationTypes[j] === locationType.name) {
                  hasLocType = true;
                  break;
                }

              if (hasLocType)
                filtered2.push(filtered1[i]);
            }
          }
        }
      }
    else
      filtered2 = filtered1;

    let filtered3 = [];     // LocationTag filter
    if (selectedLocationTags.length > 0) {
      for (let i = 0; i < filtered2.length; i++) {
        let place = 0;
        let hasLocTag = false;

        if (viewType === "plan") {
          place = this.getPlanWithId(filtered2[i].objectId);

          for (let j = 0; j < place.locations.length; j++) {
            let locationObj = this.getLocationWithId(place.locations[j].location.objectId);
            
            if (locationObj && locationObj.tags) {
              for (let k = 0; k < locationObj.tags.length; k++) {
                for (let l = 0; l < selectedLocationTags.length; l++) {
                  if (locationObj.tags[k] === selectedLocationTags[l]) { 
                    hasLocTag = true;
                    break;
                  }
                }

                if (hasLocTag)
                  break;
              }
            }

            if (hasLocTag)
              break;
          }

          if (hasLocTag)
            filtered3.push(filtered2[i]);
        } else {
          let locationObj = this.getLocationWithId(filtered2[i].objectId);

          if (locationObj && locationObj.tags) {
            for (let k = 0; k < locationObj.tags.length; k++) {
              for (let l = 0; l < selectedLocationTags.length; l++) {
                if (locationObj.tags[k] === selectedLocationTags[l]) { 
                  hasLocTag = true;
                  break;
                }
              }

              if (hasLocTag)
                break;
            }
          }

          if (hasLocTag)
            filtered3.push(filtered2[i]);
        }
      }
    } else {
      filtered3 = filtered2;
    }

    this.setState({ filteredPositions: filtered3, isFiltered: true });
  }

  getLocationWithId(id) {
    const { locations } = this.props;

    for (let i = 0; i < locations.length; i++)
      if (locations[i].objectId === id)
        return locations[i];
  }

  getPlanWithId(id) {
    const { plans } = this.props;

    for (let i = 0; i < plans.length; i++)
      if (plans[i].objectId === id)
        return plans[i];
  }

  getLocationTypeWithId(id) {
    const { locationTypes } = this.props;

    for (let i = 0; i < locationTypes.length; i++)
      if (locationTypes[i].objectId === id)
        return locationTypes[i];
  }

  onSelectMetroCity(e) {
    const { onSelectMetroCity, onClearSelection } = this.props;

    this.setState({ metro_city: e.target.value }, () => this.afterSetState());
    onClearSelection();
    onSelectMetroCity(e.target.value);
  }

  onSelectViewType(e) {
    const { onClearSelection } = this.props;
    
    this.setState({ viewType: e.target.value }, () => this.afterSetState());
    onClearSelection();
  }

  onSelectActiveStatus(e) {
    this.setState({ activeStatus: e.target.value }, () => this.afterSetState());
  }

  onHide() {
    const { onHide } = this.props;
    onHide();
  }

	render() {
		const { showModal, onHide, onClearSelection, onShowSelection, onEditSelection, onCreatePlanWithLocations, plans, positions, onClickMarker, metroCities, planPositions, locPositions, locTypes, locTags } = this.props;
    const { origins, filteredPositions, isFiltered, viewType, activeTypes, isEnableEvent, isEnableSpecial, metro_city } = this.state;
    let positionsToShow = planPositions;

    if (viewType === "location")
      positionsToShow = locPositions;

    if (isFiltered) {
      if (filteredPositions && filteredPositions.length > 0)
        positionsToShow = filteredPositions;
      else
        positionsToShow = [];
    }

		return (
      <Modal aria-labelledby='modal-label' show={showModal} className="map-modal">
        <div className="row header">
          <div className="col-md-12">
            <h2><center>Map View</center></h2>
          </div>
        </div>
        <div className="row search-terms">
          <div className="col-md-6">
            <FormGroup controlId="viewType">
              <ControlLabel>Select View Type</ControlLabel>
              <FormControl
                disabled={isEnableEvent || isEnableSpecial ? "disabled" : null}
                type="select"
                componentClass="select"
                name="view_type"
                onChange={(e) => this.onSelectViewType(e)}
                value={(this.state.viewType ? this.state.viewType : '')}
              >
                {
                  size(origins || []) > 0 ?
                    origins.map((origin, index) => {
                      return(<option key={index} value={origin}>{origin}</option>)
                    })
                  : null
                }
              </FormControl>
            </FormGroup>
            <FormGroup controlId="activeTypes">
              <ControlLabel>Select Active Status</ControlLabel>
              <FormControl
                type="select"
                componentClass="select"
                name="active_type"
                onChange={(e) => this.onSelectActiveStatus(e)}
                value={(this.state.activeStatus ? this.state.activeStatus : '')}
              >
                {
                  size(activeTypes || []) > 0 ?
                    activeTypes.map((activeType, index) => {
                      return(<option key={index} value={activeType}>{activeType}</option>)
                    })
                  : null
                }
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Select LocationTypes</ControlLabel>
              <Multiselect
                name="location_types"
                data={locTypes}
                value={this.state.selectedLocationTypes}
                onChange={(selectedLocationTypes) => this.setState({ selectedLocationTypes: selectedLocationTypes }, () => this.afterSetState())}
              />
            </FormGroup>
          </div>
          <div className="col-md-6">
            <FormGroup controlId="metroCity">
              <ControlLabel>Metro City</ControlLabel>
              <FormControl
                type="select"
                componentClass="select"
                placeholder="select"
                name="metro_city"
                onChange={(e) => this.onSelectMetroCity(e)}
                value={(this.state.metro_city ? this.state.metro_city : '')}
              >
                {
                  size(metroCities || []) > 0 ?
                    metroCities.map((metroCity, index) => {
                      return(<option key={index} value={metroCity.name}>{metroCity.name}</option>)
                    })
                  : null
                }
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Select Location Tags</ControlLabel>
              <Multiselect
                name="location_tags"
                data={locTags}
                value={this.state.selectedLocationTags}
                onChange={(selectedLocationTags) => this.setState({ selectedLocationTags: selectedLocationTags }, () => this.afterSetState())}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Events And Specials</ControlLabel>
              <div className="row">
                <div className="col-md-6">
                  <Checkbox
                    name="upcoming_event"
                    inline
                    value="isEnableEvent"
                    onChange={(e) => this.setState({ isEnableEvent: e.target.checked, viewType: 'location' }, () => this.afterSetState())}>
                    Upcoming Events
                  </Checkbox>
                </div>
                <div className="col-md-6">
                  <Checkbox
                    name="active_special"
                    inline
                    value="isEnableSpecial"
                    onChange={(e) => this.setState({ isEnableSpecial: e.target.checked, viewType: 'location' }, () => this.afterSetState())}>
                    Active Specials
                  </Checkbox>
                </div>
              </div>
            </FormGroup>
          </div>
        </div>
        <div className="row map-div">
        {
          size(positionsToShow || []) > 0 ?
            <GoogleMap
              onClickMarker={(id, origin) => onClickMarker(id, origin)}
              positions={positionsToShow}>
            </GoogleMap>
          : <p>No Data To Show!</p>
        }
        </div>
        <div className="row footer">
          <div className="col-md-12 ctrl-btns">
            <center className="">
              <button className="btn count" disabled>
                {positionsToShow.length} {viewType}s
              </button>
              <button className="btn btn-danger" onClick={() => onClearSelection()}>
                Clear selection
              </button>
              <button className="btn btn-primary" onClick={() => onShowSelection(viewType)}>
                Show
              </button>
              <button className="btn btn-primary" onClick={() => onEditSelection(viewType)}>
                Edit
              </button>
              <button className="btn btn-primary" onClick={() => onCreatePlanWithLocations(viewType)}>
                Create Plan
              </button>
              <button className="btn btn-primary" onClick={() => this.onHide()}>
                Cancel
              </button>
            </center>
          </div>
        </div>
      </Modal>
	  )
	}
}