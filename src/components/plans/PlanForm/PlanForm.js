import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { Modal } from 'react-bootstrap';
import Promise from 'bluebird';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import first from 'lodash/first';
import range from 'lodash/range';
import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import reduce from 'lodash/reduce';
import uniq from 'lodash/uniq';

import { fetchLocations, updateLocation } from '../../../actions/LocationActions';
import { fetchTags, hasEvent } from '../../../actions/TagActions';

import {
  LinkTo,
  LocationsTimeArray,
  renderField,
  renderCheckboxField,
  renderTextareaField,
  renderDatePicker,
  renderDropdownList,
  renderMultiselect,
	PlanLocationFinder,
  ImageFromGoogle
} from '../../../helpers';

import { YELP_HOST_URI } from '../../../config';

import { weekDays, capitalize, getDistanceWithLatLong, snakenText, selectOneWithPercents, getRandomInt, hasEventInPlanTemplate, renderDate, renderHours, renderDateTime } from '../../../utils';

class PlanForm extends Component {

	state = {
		tempLocations: [],
		showModal: false,
    showImgModal: false,
    locationTimeDatas: [],    // produced Automatically
    locationTimes:[],         // produced Manually
    currentMetroCity: null,
    tags: [],
    beginTime: 0,
    isSpecial: false,
    hasEvent: false,
    selectedEvent: null,
    selectedSpecials: null,
    selectedNeighborhoods: [],
    selectedLocationTags: [],
    isAutomating: false,
    automateCnt: 0,
    planTemplateType: 0     // 0: Activity/Event, 1: Activity/Event with one location, 2: Special, 3: Normal
	};

  componentDidMount() {
    const { fetchTags, fetchLocations } = this.props;
    Promise.all([
      fetchTags({}),
      fetchLocations({include: 'location_type', limit:500})
    ]).then(() => this.handleInitialize());

    this.checkDataFromMap();
  }

  handleInitialize() {
    const { item, item: {
      metro_city,
      title_event, description_event, image, type_event,
      tags, locations,
      partner, start_day, count_attended, count_attended_range, is21_age, estimated_cost, end_day,
      reoccur_monday, reoccur_tuesday, reoccur_wednesday, reoccur_thursday, reoccur_friday, reoccur_saturday, reoccur_sunday,
      featured, featured_image_url, featured_name, featured_link, first_message,is_series_plan
    }, initialize } = this.props;

    if (!isEmpty(item)) {
      initialize({
        metro_city,
        start_day: (start_day ? start_day.iso : null),
        end_day: (end_day ? end_day.iso : null),
        title_event, description_event, image, type_event,
        tags, locations,
        partner, count_attended, count_attended_range, is21_age, estimated_cost,
        reoccur_monday, reoccur_tuesday, reoccur_wednesday, reoccur_thursday, reoccur_friday, reoccur_saturday, reoccur_sunday,
        featured, featured_image_url, featured_name, featured_link, first_message,is_series_plan
      });
    }
  }

  checkDataFromMap() {
    let isUsed = localStorage.getItem('isUsed');

    if (isUsed === 'false') {
      let metroCity = localStorage.getItem('metroCity');
      let locationArrays = JSON.parse(localStorage.getItem('locationArrays'));

      this.startAutomateWithMapLocs(locationArrays, metroCity);
    }
  }

  componentWillReceiveProps (newProps) {
  }

  afterSetState(num, data = {}) {
    var that = this;
    let automateCnt = this.state.automateCnt;
    automateCnt++;

    if (automateCnt > 20) {
      alert("Automate 20 times without result, Please check criterias.");
      this.setState({ automateCnt: 0, isAutomating: false });
      return 0;      
    } else {
      this.setState({ automateCnt: automateCnt + 1 });
    }

    // let planTemplateType = getRandomInt(4);
    let planTemplateType = 1;

    if (num === 0)
      setTimeout(function(){ that.startAutomate(planTemplateType) }, 200);
    else if (num === 1)
      setTimeout(function(){ that.startAutomate(planTemplateType) }, 200);
    else if (num === 10)
      alert("There is no available Locations. Please check rules.");
  }

  async startAutomateWithMapLocs(locationArrays, metroCity) {
    const { initialize } = this.props;
    let is21_age = false;
    let beginTime = '';
    let active_days = [];
    let selectedSpecials = [];
    let hasActiveDay = false;
    let description = '';
    console.log('Automating with locations from MapView get started!');
    console.log('metroCity - ', metroCity);
    console.log('locationArrays - ', locationArrays);

    let hasEvent = false;
    let isSpecial = false;
    let upcomingEvent = null;
    let eventInd = -1;
    let specialInd = 0;

    for (let i = 0; i < locationArrays.length; i++) {
      eventInd = i
      upcomingEvent = this.getUpcomingEventWithLocId(locationArrays[i].objectId);

      if (upcomingEvent !== false)
        break;
    }

    if (upcomingEvent !== false) {
      console.log('hasEvent - ', upcomingEvent);
      hasEvent = true;      
    }

    if (!hasEvent) {
      eventInd = -1;

      for (let i = 0; i < locationArrays.length; i++) {        
        let special = this.getSpecialFromLocationId(locationArrays[i].objectId);

        if (special) {
          if (special.status === 'active') {
            isSpecial = true;
            hasEvent = true;

            if (isSpecial && eventInd === -1)
              eventInd = i;

            break;
          }
        }
      }
    }

    let planTemplate = this.getPlanTemplateFromLocations(locationArrays, hasEvent, eventInd);
    let locationTimeDatas = this.convertArray2Data(locationArrays, planTemplate, hasEvent, isSpecial);
    console.log('location and time - ', locationTimeDatas);

    if (hasEvent) {
      beginTime = this.getBeginTime(metroCity, hasEvent, isSpecial, locationTimeDatas, planTemplate);
      console.log('begintime: ', beginTime)
      locationTimeDatas = this.convertTime(locationTimeDatas, metroCity, beginTime);
      // console.log('convertTime - ', locationTimeDatas);
      active_days = this.getActiveDays(locationTimeDatas, planTemplate, hasEvent, isSpecial);

      for (let i = 0; i < active_days.length; i++) {
        if (active_days[i] === true) {
          hasActiveDay = true;
          break;
        }
      }

      if (!isSpecial)
        locationTimeDatas = this.checkActivityLen(locationTimeDatas, planTemplate, isSpecial);
      else
        locationTimeDatas = locationTimeDatas;

      console.log('final - ', locationTimeDatas);
    } else {
      for (let i = 0; i < 5; i++) {
        beginTime = this.getDayBreakdown(i);
        locationTimeDatas = this.convertTime(locationTimeDatas, metroCity, beginTime);
        active_days = this.getActiveDays(locationTimeDatas, planTemplate, false, false);
        
        if (active_days !== 0) {
          hasActiveDay = true;
          break;
        }
      }
    }  

    if (hasActiveDay) {
      if (hasEvent && !isSpecial)
        description = this.getDescription(locationTimeDatas);

      if (isSpecial) {
        locationTimeDatas = this.setSpecialDate(locationTimeDatas);
        selectedSpecials = this.getAvailableSpecials(locationTimeDatas);
      }

      is21_age = this.hasBar(locationTimeDatas, planTemplate);
      await this.addYelpReview(locationTimeDatas);
      this.addNeighborhood(locationTimeDatas);
      let start_day = this.getStartDate(locationTimeDatas, hasEvent, planTemplate, isSpecial);
      let end_day = this.getEndDate(locationTimeDatas, start_day, hasEvent, planTemplate, isSpecial);
      let tags = this.getLocationTags(locationTimeDatas, planTemplate);
      let estimated_cost = this.getEstimatedCost(locationTimeDatas);
      let type_event = this.getTypeEvent(locationTimeDatas);
      let first_message = this.getAdditionalNotes(locationTimeDatas);

      setTimeout(function(){ 
        initialize({ 
          metro_city: metroCity,
          start_day: start_day, 
          end_day: end_day,
          type_event: type_event,
          locations: locationTimeDatas,
          tags: tags, 
          count_attended: 4,
          estimated_cost: estimated_cost,
          is21_age: is21_age,
          count_attended_range: {"name": "1-4", "value": "1-4"},
          reoccur_monday: active_days[0],
          reoccur_tuesday: active_days[1],
          reoccur_wednesday: active_days[2],
          reoccur_thursday: active_days[3],
          reoccur_friday: active_days[4],
          reoccur_saturday: active_days[5],
          reoccur_sunday: active_days[6],
          first_message: first_message,
          description_event: description
        })
      }, 1000);

      this.setState({ 
        locationTimeDatas,
        metroCity,
        beginTime,
        isSpecial,
        hasEvent,
        planTemplateType: 0,
        selectedSpecials
      });
    } else {
      console.log('Can not make a plan with locations from Map.');
      alert('Can not make a plan with locations from Map because of location open time.');
    } 

    localStorage.setItem('isUsed', true);
  }

  getUpcomingEventWithLocId(locationId) {
    let comingEvents = this.getComingEvents();
    let comingEventsWithLocId = [];
    
    for (let i = 0; i < comingEvents.length; i++)
      if(comingEvents[i].location)
        if (comingEvents[i].location.objectId === locationId)
          return comingEvents[i];

    return false;
  }

  getPlanTemplateFromLocations(locations, hasEvent, eventInd) {
    const { locationTypes } = this.props;
    let location_types = [];

    for (let i = 0; i < locations.length; i++)
      if (locations[i].location_type)
        for (let j = 0; j < locationTypes.length; j++)
          if (locations[i].location_type.objectId === locationTypes[j].objectId)
            location_types.push(locationTypes[j].name)

    if (hasEvent)
      location_types[eventInd] = 'Activity/Event';
    
    console.log('PlanTemplate from Map selection: ', location_types);
    return {'location_types': location_types, 'isFromMap': true};
  }

  async startAutomate(planTemplateType) {
    const { initialize } = this.props;
    let currentMetroCity = this.state.currentMetroCity;
    let locationTimeDatas = [];
    let locationArrays = [];
    let is21_age = false;
    let beginTime = '';
    let active_days = [];
    let selectedSpecials = [];
    let description = '';
    console.log('Automating get started!');
    console.log('PlanTemplate type - ', planTemplateType);

    if (!currentMetroCity) 
      currentMetroCity = this.setDefaultMetroCity();
    console.log('Metro city - ', currentMetroCity);

    let planTemplate = this.getRandomPlanTemplate(planTemplateType);
    let hasEvent = hasEventInPlanTemplate(planTemplate);
    let locationsInActivePlan = this.getLocationsInActivePlan();
    let availableLocations = this.getAvailableLocationsInMetroCity(locationsInActivePlan, currentMetroCity);

    if (availableLocations.length === 0) {
      this.afterSetState(10);
      return 0;
    }

    let isSpecial = this.isSpecial(currentMetroCity);

    if (planTemplateType === 2)
      isSpecial = true;
      
    if (hasEvent) {
      locationArrays = this.getLocationsWithEvent(availableLocations, locationsInActivePlan, currentMetroCity, planTemplate, hasEvent, isSpecial);

      if (locationArrays === 0) {
        this.afterSetState(1);
        return 0;
      }

      is21_age = this.hasBar(locationArrays, planTemplate);
      beginTime = this.getBeginTime(currentMetroCity, hasEvent, isSpecial, locationArrays, planTemplate);
      console.log("beginTime - ", beginTime);
      locationArrays = this.convertTime(locationArrays, currentMetroCity, beginTime);
      active_days = this.getActiveDays(locationArrays, planTemplate, hasEvent, isSpecial);

      if (active_days === 0) {
        this.afterSetState(1);
        return 0;
      }

      if (!isSpecial)
        locationTimeDatas = this.checkActivityLen(locationArrays, planTemplate, isSpecial);
      else
        locationTimeDatas = locationArrays;

      console.log('Location arrays(check event length, Final) - ', locationTimeDatas);
    } else {
      locationTimeDatas = this.getLocationsWithoutEvent(availableLocations, locationsInActivePlan, currentMetroCity, planTemplate, hasEvent);
      console.log('Location arrays(Final) - ', locationTimeDatas);

      if (locationTimeDatas === 0 || locationTimeDatas.length === 0) {
        this.afterSetState(1);
        return 0;
      }

      is21_age = this.hasBar(locationTimeDatas, planTemplate);
      beginTime = this.getBeginTime(currentMetroCity);
      console.log("beginTime - ", beginTime);
      locationTimeDatas = this.convertTime(locationTimeDatas, currentMetroCity, beginTime);
      active_days = this.getActiveDays(locationTimeDatas, planTemplate, hasEvent, isSpecial);

      if (active_days === 0) {
        this.afterSetState(1);
        return 0;
      }
    }

    if (locationTimeDatas === 0) {
      this.afterSetState(1);
      return 0;
    }

    if (hasEvent && !isSpecial)
      description = this.getDescription(locationTimeDatas);

    if (isSpecial) {
      locationTimeDatas = this.setSpecialDate(locationTimeDatas);
      selectedSpecials = this.getAvailableSpecials(locationTimeDatas);
    }

    await this.addYelpReview(locationTimeDatas);
    this.addNeighborhood(locationTimeDatas);
    let start_day = this.getStartDate(locationTimeDatas, hasEvent, planTemplate, isSpecial);
    let end_day = this.getEndDate(locationTimeDatas, start_day, hasEvent, planTemplate, isSpecial);
    let tags = this.getLocationTags(locationTimeDatas, planTemplate);
    let estimated_cost = this.getEstimatedCost(locationTimeDatas);
    let type_event = this.getTypeEvent(locationTimeDatas);
    let first_message = this.getAdditionalNotes(locationTimeDatas);
    // console.log("start_day - ", start_day);
    // console.log("end_day - ", end_day);
    // console.log("tags - ", tags);
    // console.log("is21_age - ", is21_age);
    
    setTimeout(function(){ 
      initialize({ 
        metro_city: currentMetroCity,
        start_day: start_day, 
        end_day: end_day,
        type_event: type_event,
        locations: locationTimeDatas,
        tags: tags, 
        count_attended: 4,
        estimated_cost: estimated_cost,
        is21_age: is21_age,
        count_attended_range: {"name": "1-4", "value": "1-4"},
        reoccur_monday: active_days[0],
        reoccur_tuesday: active_days[1],
        reoccur_wednesday: active_days[2],
        reoccur_thursday: active_days[3],
        reoccur_friday: active_days[4],
        reoccur_saturday: active_days[5],
        reoccur_sunday: active_days[6],
        first_message: first_message,
        description_event: description
      })
    }, 1000);

    this.setState({ 
      automateCnt: 0,
      locationTimeDatas,
      currentMetroCity,
      beginTime,
      isSpecial,
      hasEvent,
      isAutomating: false,
      planTemplateType: 0,
      selectedSpecials
    });
  }

  addYelpReview(locationTimeDatas) {
    locationTimeDatas.map((item) => {
      axios.post(`${YELP_HOST_URI}/reviews`, { id: item.location.yelp_id })
      .then(({ data }) => {
        for (let i = 0; i < locationTimeDatas.length; i++)
          if (locationTimeDatas[i].location.yelp_id === data.yelp_id) {
            let reviews = [];
            data.reviews.reviews.map((review) => {
              reviews.push(review.text);
            });
            locationTimeDatas[i]["reviews"] = reviews;
          }
      })
      .catch(({ errorMessage }) => this.setState({ errorMessage }));
    });
  }

  getAvailableSpecials(locationTimeDatas) {
    let activeSpecials = this.getActiveSpecials();
    let retData = [];

    for (let i = 0; i < locationTimeDatas.length; i++) {
      for (let j = 0; j < activeSpecials.length; j++) {
        if (activeSpecials[j].location_pointer)
          if (locationTimeDatas[i].location.objectId === activeSpecials[j].location_pointer.objectId) {
            let special = activeSpecials[j];
            special['location_name'] = locationTimeDatas[i].location.name;
            retData.push(special);
            break;
          }
      }
    }

    return retData;
  }

  getAdditionalNotes(locationTimeDatas) {
    let additionalNotes = '';

    locationTimeDatas.map((item) => {
      if (item.location.additional_notes)
        additionalNotes = item.location.additional_notes + ' ';
    });

    return additionalNotes;
  }

  getDescription(locationTimeDatas) {
    let description = '';

    for (let i = 0; i < locationTimeDatas.length; i++) {
      if (locationTimeDatas[i].activity === "Event") {
        let event = this.getEventFromLocationId(locationTimeDatas[i].location.objectId);

        if (event.description) {
          description = event.description;
          break;
        }
      }
    }

    return description;
  }

  setSpecialDate(locationTimeDatas) {
    let activityInd = 0;

    for (let i = 0; i < locationTimeDatas.length; i++) {
      if (locationTimeDatas[i].activity === "Special") {
        activityInd = i;
        break;
      }
    }

    if (!locationTimeDatas[activityInd].start_day || locationTimeDatas[activityInd].start_day === null) {
      locationTimeDatas[activityInd].start_day = moment().format('MM/DD/YYYY');
      locationTimeDatas[activityInd].end_day = moment().add(90, 'd').format('MM/DD/YYYY');
    } else {
      if (moment(locationTimeDatas[activityInd].start_day.iso) < moment()) {
        locationTimeDatas[activityInd].start_day = moment().format('MM/DD/YYYY');
        locationTimeDatas[activityInd].end_day = moment().add(90, 'd').format('MM/DD/YYYY');
      } 
      if (locationTimeDatas[activityInd].end_day === null) {
        locationTimeDatas[activityInd].end_day = moment(locationTimeDatas[activityInd].start_day.iso).add(90, 'd').format('MM/DD/YYYY');
        locationTimeDatas[activityInd].start_day = moment(locationTimeDatas[activityInd].start_day.iso).format('MM/DD/YYYY');
      }  
    }

    return locationTimeDatas;
  }

  addNeighborhood(locationTimeDatas) {
    locationTimeDatas.map((item) => {
      item["neighborhood"] = this.getFirstNeighborhood(item.location);
    });
  }

  getFirstNeighborhood(location) {
    if (location.neighborhood)
      if (location.neighborhood.indexOf(',') > -1)
        return location.neighborhood.substring(0, location.neighborhood.indexOf(','));
      else
        return location.neighborhood;
    else
      return '';
  }

  getTypeEvent(locationTimeDatas) {
    let location = null;

    if (locationTimeDatas.length === 1)
      location = locationTimeDatas[0].location;
    else
      location = locationTimeDatas[1].location;

    if (location.category) {
      if (location.category.indexOf("City Park") > -1)
        return "Adventure";
      else if (location.category.indexOf("Café") > -1)
        return "Coffee";
      else if (location.category.indexOf("Dancing Clubs") > -1)
        return "Dance";
      else if (location.category.indexOf("Bar") > -1)
        return "Drinks";
      else if (location.category.indexOf("Restaurant") > -1)
        return "Food";
      else if (location.category.indexOf("Museum") > -1)
        return "Museum";
      else if (location.category.indexOf("Music Hall") > -1)
        return "Music";
      else if (location.category.indexOf("Spa") > -1)
        return "Relax";
      else if (location.category.indexOf("Arena") > -1)
        return "Sports";
      else if (location.category.indexOf("Theatre") > -1)
        return "Theatre";
    }
  }

  hasBar(array, planTemplate) {
    for (let i = 0; i < planTemplate.location_types.length; i++)
      if (planTemplate.location_types[i].includes('Bar'))
        return true;

    return false;
  }

  getEstimatedCost(locationTimeDatas) {
    let estimate_cost = 0;

    locationTimeDatas.map((locationTimeData) => {
      if (locationTimeData.location.estimate_cost) 
        if (locationTimeData.location.estimate_cost.name.split("$").length - 1 > estimate_cost)
          estimate_cost = locationTimeData.location.estimate_cost.name.split("$").length - 1;
    });

    return Array(estimate_cost + 1).join('$');
  }

  setDefaultMetroCity() {
    const { initialize } = this.props;
    var defaultMetroCity = {name: "New York", value: "new_york"};

    this.setState({ currentMetroCity: defaultMetroCity });
    return defaultMetroCity;
  }

  getRandomPlanTemplate(planTemplateType) {
    const { planTemplates } = this.props;
    let planTemplate = null;
    let isChoosed = false;

    do {
      planTemplate = planTemplates[getRandomInt(planTemplates.length)];

      if (planTemplateType === 0 && hasEventInPlanTemplate(planTemplate))
        isChoosed = true;
      else if (planTemplateType === 2 && hasEventInPlanTemplate(planTemplate))
        isChoosed = true;
      else if (planTemplateType === 1 && hasEventInPlanTemplate(planTemplate) && planTemplate.location_types.length === 2)
        isChoosed = true;
      else if (planTemplateType === 3 && !hasEventInPlanTemplate(planTemplate))
        isChoosed = true;
    } while(!isChoosed)

    console.log('PlanTemplate location types - ', planTemplate.location_types);
    return planTemplate;
  }

  getLocationsWithEvent(availableLocations, locationsInActivePlan, metroCity, planTemplate, hasEvent, isSpecial) {
    let locationPairSetsInMile = [];
    let activityLocations = this.getComingEventLocations(availableLocations, locationsInActivePlan, metroCity);

    if (activityLocations.length === 0 || isSpecial)
      activityLocations = this.getActiveSpecialLocations(availableLocations, locationsInActivePlan, metroCity);

    locationPairSetsInMile = this.getLocationPairsInMile(availableLocations, planTemplate, metroCity, activityLocations);
    if (locationPairSetsInMile === 0) return 0;

    let locationArrays = this.getLocationArraysFromPairs(locationPairSetsInMile, planTemplate);
    if (planTemplate.location_types.length === 1 && hasEvent)
      locationArrays = activityLocations;
    console.log('Location arrays from pairs - ', locationArrays);
    locationArrays = this.mileFilter(locationArrays, metroCity, planTemplate);
    console.log('Location arrays(mile filter) - ', locationArrays);
    locationArrays = this.chooseOne(locationArrays, planTemplate);

    if (locationArrays === 0) return 0;

    console.log('Location arrays(choose one) - ', locationArrays);
    locationArrays = this.convertArray2Data(locationArrays, planTemplate, hasEvent, isSpecial);
    console.log('Location and Time - ', locationArrays);

    for (let i = 0; i < locationArrays.length; i++)
      for (let j = 0; j < locationsInActivePlan.length; j++)
        if (locationArrays[i].location.objectId === locationsInActivePlan[j].location.objectId) {
          console.log('@1 - ', locationArrays[i].location.objectId, ' - ', locationsInActivePlan[j].location.objectId);
          return 0;
        }

    return locationArrays;
  }

  getLocationsWithoutEvent(locations, locationsInActivePlan, metroCity, planTemplate, hasEvent) {
    let locationPairSetsInMile = [];
    let locationAndTime = [];
    let availableLocations = this.getLocationsInPlanTemplate(locations, planTemplate)
    console.log('availableLocations - ', availableLocations);

    if (availableLocations.length > 0){
      let locationPairSetsInMile = this.getLocationPairsInMile(availableLocations, planTemplate, metroCity);

      if (locationPairSetsInMile === 0) return 0;

      let locationArrays = this.getLocationArraysFromPairs(locationPairSetsInMile, planTemplate);
      console.log('Location arrays from pairs - ', locationArrays);
      locationArrays = this.mileFilter(locationArrays, metroCity, planTemplate);
      // console.log('Location arrays(mile filter) - ', locationArrays);
      locationArrays = this.chooseOne(locationArrays, planTemplate);

      if (locationArrays === 0) return 0;

      console.log('Location arrays(choose one) - ', locationArrays);
      locationAndTime = this.convertArray2Data(locationArrays, planTemplate, hasEvent, false);
      console.log('Location and Time - ', locationAndTime);
    }
    else
      console.log('Can not find available Locations');

    return locationAndTime;
  }

  getActiveDays(array, planTemplate, hasEvent, isSpecial) {
    let active_days = [0, 0, 0, 0, 0, 0, 0];
    let activityInd = 0;

    if (!hasEvent) {
      active_days = [1, 1, 1, 1, 1, 1, 1];
    } else {
      for (let i = 0; i < planTemplate.location_types.length; i++)
        if (planTemplate.location_types[i] === "Activity/Event")
          activityInd = i;

      if (isSpecial) {
        var special = this.getSpecialFromLocationId(array[activityInd].location.objectId);

        if (special.days)
          special.days.map((day) => {
            active_days[day.day] = 1;
          });
      } else {
        var event = this.getEventFromLocationId(array[activityInd].location.objectId);
        this.setState({ selectedEvent: event });

        if (event.dates)
          event.dates.map((date) => {
            var tempDate = moment(date.date, "MM-DD-YYYY");
            active_days[tempDate.day() - 1] = 1;
          });
      }
    }

    if (hasEvent) {
      let newActive_days = this.checkLocationOpen(array, active_days);
      let isAllZero = true;
    
      for (let i = 0; i < 7; i++) {
        if (newActive_days[i] === 1) {
          isAllZero = false;
          break;
        }
      }
      
      if (isAllZero) {
        if (!isSpecial)
          array[activityInd]["hasConflict"] = true;
        else
          return 0;
      } else {
        active_days = newActive_days;
      }

      for (let i = 0; i < 7; i++) {
        if (active_days[i] === 1) active_days[i] = true;
        else active_days[i] = false;
      }
    } else {
      let newActive_days = this.checkLocationOpen(array, active_days);
      let isAllZero = true;

      for (let i = 0; i < 7; i++) {
        if (newActive_days[i] === 1) {
          isAllZero = false;
          break;
        }
      }

      if (isAllZero)
          return 0;
      else
        active_days = newActive_days;

      for (let i = 0; i < 7; i++) {
        if (active_days[i] === 1) active_days[i] = true;
        else active_days[i] = false;
      }
    }

    console.log('Active days - ', active_days);
    return active_days;
  }

  checkLocationOpen(array, active_days) {
    let newActive_days = [];

    for (let i = 0; i < 7; i++)
      newActive_days.push(active_days[i]);

    for (let i = 0; i < 7; i++) {
      let cnt = 0;

      for (let j = 0; j < array.length; j++)
        for (let k = 0; k < array[j].location.hours.length; k++)
          if (array[j].location.hours[k].day - i === 0)
            cnt++;

      if (cnt < array.length)
        newActive_days[i] = 0;
    }

    for (let i = 0; i < 7; i++) {
      if (newActive_days[i] === 1) {
        let isAvailable = true;
        var openTime = true;

        for (let j = 0; j < array.length; j++) {
          for (let k = 0; k < array[j].location.hours.length; k++) {
            if (parseInt(array[j].location.hours[k].day) === i) {
              openTime = array[j].location.hours[k];
              break;
            }
          }

          if (openTime.start && openTime.end) {
            if (openTime.end[0] === "0" && openTime.is_overnight)
              openTime.end = "2" + (4 + parseInt(openTime.end[1])) + "00";

            if (this.time2Float(openTime.start) > this.time2Float(array[j].time) ||
              this.time2Float(openTime.end) < this.time2Float(array[j].time) + parseFloat(array[j].duration)) {
              isAvailable = false;
              console.log('Location(plan) time & location openTime: ', array[j].time, ' duration: ', array[j].duration, ' start: ', openTime.start, ' end: ', openTime.end);
              break;
            }
          }
        }

        if (!isAvailable)
          newActive_days[i] = 0;
      }
    }

    return newActive_days;
  }

  time2Float(time) {
    let float = 0;

    if (time.indexOf(':') > -1)
      float = parseFloat(time.substring(0, time.indexOf(':'))) + parseFloat(time.substring(time.indexOf(':') + 1, time.indexOf(':') + 3)) / 60;
    else
      float = parseFloat(time.substring(0, 2)) + parseFloat(time.substring(2, 4)) / 60;

    if (time.indexOf('PM') > -1 && parseInt(time.substring(0, 2)) !== 12)
      float += 12;

    return float.toFixed(1);
  }

  getStartDate(array, hasEvent, planTemplate, isSpecial) {
    if (array.length > 0) {
      if (hasEvent) {
        for (let i = 0; i < array.length; i++) {
          if (array[i].hasOwnProperty('start_day')) {
            if (isSpecial)
              return array[i].start_day;
            else
              return array[i].start_day;
          }
        }
      } else {
        var now = moment();
        if (this.hasContainZoo(array) || this.hasRooftopTag(array)){
          if (this.isDateInApr2Oct(now) === 0)
            return new Date;
          else if (this.isDateInApr2Oct(moment()) === -1)
            return moment(now.year() + " 4", "YYYY MM")._d;
          else if (this.isDateInApr2Oct(moment()) === 1)
            return moment((now.year() + 1) + " 4", "YYYY MM")._d;
        }
        else
          return new Date;
      }
    } else {
      if (hasEvent) {
        if (isSpecial) {
          var special = this.getSpecialFromLocationId(array.objectId);
          console.log('Special, start_date - ', special, special.start_date);

          if (special.start_date.length === 10)
            return moment(special.start_date, "MM-DD-YYYY").format("MM/DD/YYYY");
          else
            return moment(special.start_date).format("MM/DD/YYYY");
        } else {
          var event = this.getEventFromLocationId(array.objectId);
          console.log('Event, start_time - ', event, event.start_time);

          if (event.start_time.length === 10)
            return moment(event.start_time, "YYYY-MM-DD").format("MM/DD/YYYY");
          else
            return moment(event.start_time).format("MM/DD/YYYY");
        }
      }
    }
  }

  getEndDate(array, start_day, hasEvent, planTemplate, isSpecial) {
    if (array.length > 0) {
      if (hasEvent) {
        for (let i = 0; i < array.length; i++) {
          if (array[i].hasOwnProperty('end_day'))
            if (array[i].end_day === null) {
              return '';
            } else {
              if (isSpecial)
                return array[i].end_day;
              else
                return array[i].end_day;
            }
        }
      } else {
        var end_day = moment(start_day).add(90, 'days');
        var now = moment();
        
        if (this.hasContainZoo(array) || this.hasRooftopTag(array)){
          if (this.isDateInApr2Oct(end_day) === 0)
            return end_day;
          else if (this.isDateInApr2Oct(moment(end_day)) === 1)
            return moment(now.year() + " 10", "YYYY MM")._d;
        }
        else
          return moment(start_day).add(90, 'days')._d;
      }
    } else {
      if (hasEvent) {
        if (isSpecial) {
          var special = this.getSpecialFromLocationId(array.objectId);
          
          if (special.start_date.length === 10)
            return moment(special.end_date, "MM-DD-YYYY").format("MM/DD/YYYY");
          else
            return moment(special.end_date).format("MM/DD/YYYY");
        } else {
          var event = this.getEventFromLocationId(array.objectId);
          
          if (event.start_time.length === 10)
            return moment(event.end_time, "YYYY-MM-DD").format("MM/DD/YYYY");
          else
            return moment(event.end_time).format("MM/DD/YYYY");
        }
      }
    }
  }

  dayBreakdown(rule) {
    let percents = [];

    percents.push(parseInt(rule.morning_percent));
    percents.push(parseInt(rule.noon_percent));
    percents.push(parseInt(rule.afternoon_percent));
    percents.push(parseInt(rule.evening_percent));
    percents.push(parseInt(rule.late_percent));

    let day_break = selectOneWithPercents(percents);

    if (day_break === 0)
      return moment("0600", "hmm").format("H:mm");
    if (day_break === 1)
      return moment("1000", "hmm").format("H:mm");
    if (day_break === 2)
      return moment("1400", "hmm").format("H:mm");
    if (day_break === 3)
      return moment("1800", "hmm").format("H:mm");
    if (day_break === 4)
      return moment("2200", "hmm").format("H:mm");
  }

  getDayBreakdown(day_break) {
    if (day_break === 0)
      return moment("0600", "hmm").format("H:mm");
    if (day_break === 1)
      return moment("1000", "hmm").format("H:mm");
    if (day_break === 2)
      return moment("1400", "hmm").format("H:mm");
    if (day_break === 3)
      return moment("1800", "hmm").format("H:mm");
    if (day_break === 4)
      return moment("2200", "hmm").format("H:mm");
  }

  getBeginTime(metroCity, hasEvent = false, isSpecial = false, array, planTemplate) {
    const rule = this.getCurrentRule(metroCity);

    if (!hasEvent) {
      return this.dayBreakdown(rule);
    } else {
      let ind = 0;
      let activity = '';
      let start_time = '';

      planTemplate.location_types.map((location_type, index) => {
        if (location_type === "Activity/Event")
          ind = index;
      });

      if (isSpecial) {
        activity = this.getSpecialFromLocationId(array[ind].location.objectId);

        if (activity.days[0].allDay === true)
          return this.dayBreakdown(rule);

        start_time = activity.days[0].start;
        if (start_time.indexOf(':') === -1) {
          start_time = start_time.substring(0, 2) + ':' + start_time.substring(2);
        }
      } else {
        activity = this.getEventFromLocationId(array[ind].location.objectId);
        start_time = activity.dates[0].start;

        if (start_time.indexOf('PM') > 0 && parseInt(start_time.substring(0, 2)) !== 12) {
          let hour = start_time.substring(0, start_time.indexOf(':'));
          start_time = start_time.substring(0, start_time.length - 2);
          start_time = (parseInt(hour) + 12) + start_time.substring(start_time.indexOf(':'));
        }
      }

      let sum = 0;
      if (ind > 0) {
        do {
          ind--;
          sum += parseFloat(array[ind].duration);
        } while (ind > 0)

        let now = moment("0000", "hmm");
        now = now.hour(parseInt(start_time.substring(0, 2)));
        now = now.minute(parseInt(start_time.substring(3)));
        now = now.subtract(sum, 'h');
        return now.format("H:mm");
      } else {
        return start_time;
      }
    }
  }

  convertTime(array, metroCity, begin_time) {
    let newArray = array;
    let now = moment("0000", "hmm");

    now = now.hour(parseInt(begin_time.substring(0, 2)));
    now = now.minute(parseInt(begin_time.substring(begin_time.indexOf(':') + 1)));

    newArray.map((item, index) => {
      if (index === 0)
        item.time = now.format("H:mm A");
      else
        item.time = now.add(parseFloat(newArray[index - 1].duration), 'h').format("H:mm A");

      if (item.time.indexOf("PM") > 0 && parseInt(item.time.substring(0, 2)) !== 12) {
        item.time = (parseInt(item.time.substring(0, 2)) - 12) + item.time.substring(2);
      }
    });

    return newArray;
  }

  hasContainZoo(locations) {
    for (let i = 0; i < locations.length; i++) {
      var category = locations[i].location.category;
        if (category.includes("Zoo") || 
          category.includes("City Park") ||
          category.includes("Amusement Park"))
          return true;
    };

    return false;
  }

  hasRooftopTag(locations) {
    for (let i = 0; i < locations.length; i++)
      if (_.indexOf(locations[i].location.tags, 'Rooftops') > -1) 
        return true;

    return false;
  }

  isDateInApr2Oct(date) {
    let now = moment();
    let apr = moment(date.year() + " 4", "YYYY MM");
    let oct = moment(date.year() + " 10", "YYYY MM");

    if (date > apr && date < oct)
      return 0;
    else if (date < apr)
      return  -1;
    else if (date > oct)
      return 1;
  }

  getAvailableLocationsInMetroCity(locationsInActivePlan, metroCity) {
    let locations = [];
    let locationsInMetroCity = this.getLocationsInMetroCity(metroCity);

    locationsInMetroCity.map((location) => {
      let used = false;
      
      locationsInActivePlan.map((usedLocation) => {
        if (location.objectId === usedLocation.location.objectId) // location in ActivePlan filter
          used = true;
      });
 
      if (!used)
        locations.push(location);
    });

    if (locations.length === 0) return [];
    console.log('Location filter(metroCity & locationsInActivePlans) - ', locations);
    let filteredBySkipAutomation = this.getFilteredBySkipAutomation(locations);
    console.log('Location filter(skip_automation) - ', filteredBySkipAutomation);
    let filteredByNeighborhoods = this.getFilteredByNeighborhoods(filteredBySkipAutomation, metroCity);
    console.log('Location filter(Neighborhoods) - ', filteredByNeighborhoods);
    if (filteredByNeighborhoods.length === 0) return [];
    let filteredByLocationTags = this.getFilteredByLocationTags(filteredByNeighborhoods, metroCity);
    console.log('Location filter(LocationTags) - ', filteredByLocationTags);
    if (filteredByLocationTags.length === 0) return [];
 
    console.log('Available locations in MetroCity - ', filteredByLocationTags);
    return filteredByLocationTags;
  }

  getFilteredBySkipAutomation(locations) {
    let filteredLocations = []

    for (let i = 0; i < locations.length; i++)
      if (locations[i].skip_automation !== true)
        filteredLocations.push(locations[i]);

    return filteredLocations;
  }

  getFilteredByNeighborhoods(locations, metroCity) {
    const { selectedNeighborhoods } = this.state;
    let newLocations = [];

    if (selectedNeighborhoods && selectedNeighborhoods.length > 0) {
      for (let i = 0; i < locations.length; i++)
        if (locations[i].neighborhood) {
          let sum = [];
          let neighborhoodsInLoc = locations[i].neighborhood.split(", ");

          for (let j = 0; j < selectedNeighborhoods.length; j++)
            sum.push(selectedNeighborhoods[j]);

          for (let k = 0; k < neighborhoodsInLoc.length; k++)
            sum.push(neighborhoodsInLoc[k]);

          if (uniq(sum).length < selectedNeighborhoods.length + neighborhoodsInLoc.length)
            newLocations.push(locations[i]);
        }
    } else {
      return locations;
    }

    if (newLocations.length === 0) return [];
    return newLocations;
  }

  getFilteredByLocationTags(locations, metroCity) {
    const { selectedLocationTags } = this.state;
    let newLocations = [];

    if (selectedLocationTags && selectedLocationTags.length > 0) {
      for (let i = 0; i < locations.length; i++)
        if (locations[i].tags) {
          let sum = [];
          let tagsInLoc = locations[i].tags;

          for (let j = 0; j < selectedLocationTags.length; j++)
            sum.push(selectedLocationTags[j]);

          for (let k = 0; k < tagsInLoc.length; k++)
            sum.push(tagsInLoc[k]);

          if (uniq(sum).length < selectedLocationTags.length + tagsInLoc.length)
            newLocations.push(locations[i]);
        }
    } else {
      return locations;
    }

    if (newLocations.length === 0) return [];
    return newLocations;
  }

  getComingEventLocations(availableLocations, locationsInActivePlan, metroCity) {
    let locations = [];
    let locationsNotInActivePlan = [];
    let locationIdsWithComingEvents = this.getLocationIdsWithComingEvents();
    let unUsedLocationIds = [];

    locationIdsWithComingEvents.map((locationId) => {
      let used = false;
      locationsInActivePlan.map((usedLocation) => {      
        if (usedLocation.location.objectId === locationId)
          used = true;
      });

      if (!used)
        unUsedLocationIds.push(locationId);
    });

    // console.log("New LocationIds(Event) - ", unUsedLocationIds);

    availableLocations.map((location) => {
      unUsedLocationIds.map((locationId) => {
        if (location.objectId === locationId)
          locations.push(location);
      });
    })

    console.log('Available locations with upcoming events - ', locations);
    return locations;
    // return []; // For special test
  }

  getActiveSpecialLocations(availableLocations, locationsInActivePlan, metroCity) {
    let locations = [];
    let locationIdsWithActiveSpecials = this.getLocationIdsWithActiveSpecials();
    let unUsedLocationIds = [];

    locationIdsWithActiveSpecials.map((locationId) => {
      let used = false;
      locationsInActivePlan.map((usedLocation) => {
        if (usedLocation.location.objectId === locationId)
          used = true;
      });

      if (!used)
        unUsedLocationIds.push(locationId);
    });

    console.log("Not used Location Ids(Special) - ", unUsedLocationIds);

    availableLocations.map((location) => {
      unUsedLocationIds.map((locationId) => {
        if (location.objectId === locationId)
          locations.push(location);
      });
    })

    console.log('Available locations in MetroCity with active specials - ', locations);
    return locations;
  }

  getComingEvents() {
    const { events } = this.props;
    let comingEvents = [];

    events.map((event) => {
      if (event.dates)
        for (let i = 0; i < event.dates.length; i++) {
          let dateInfo = event.dates[i];

          if (dateInfo.date) {
            if (moment(dateInfo.date) > moment()) {
              comingEvents.push(event);
              break;
            }    
          }
        }
    });

    console.log('Coming Events - ', comingEvents);
    return comingEvents;
  }
  
  getActiveSpecials() {
    const { specials } = this.props;
    let activeSpecials = [];

    specials.map((special) => {
      if (special.status === "active")
        activeSpecials.push(special)
    });

    console.log('Active Specials - ', activeSpecials);
    return activeSpecials;
  }  

  getLocationIdsWithComingEvents() {
    const { events, locations } = this.props;
    let comingEvents = [];
    let locationIds = [];
    let now = new Date;

    events.map((event) => {
      if (event.start_time)
        if (moment(event.start_time) > now) {
          comingEvents.push(event)
        }
    });

    console.log('Coming Events - ', comingEvents);

    comingEvents.map((event) => {
      if (event.location)
        locationIds.push(event.location.objectId);
    });

    console.log("Coming event's location objectId - ", locationIds);
    return locationIds;
  }

  getLocationIdsWithActiveSpecials() {
    const { specials, locations } = this.props;
    let activeSpecials = [];
    let locationIds = [];
    let now = new Date;

    specials.map((special) => {
      if (special.status === "active")
        activeSpecials.push(special)
    });

    console.log('Active Specials - ', activeSpecials);

    activeSpecials.map((special) => {
      if (special.location_pointer)
        locationIds.push(special.location_pointer.objectId);
    });

    console.log("Active special's location objectId - ", uniq(locationIds));
    return uniq(locationIds);
  }

  getLocationsInActivePlan() {
    const { plans } = this.props;
    let locations = [];

    for (let i = 0; i < plans.length; i++)
      if (moment(plans[i].end_day.iso) > moment())
        for (let j = 0; j < plans[i].locations.length; j++)
          locations.push(plans[i].locations[j]);

    console.log("Locations in ActivePlan - ", locations);
    return locations;
  }

  convertArray2Data(locationArray, planTemplate, hasEvent, isSpecial) {
    let retData = [];

    if (planTemplate.location_types.length > 2 || planTemplate.isFromMap)
      for (let i = 0; i < locationArray.length; i++) {
        let eachItem = {};
        eachItem["location"] = locationArray[i];
        eachItem["duration"] = this.getTime(locationArray[i].metro_city2, locationArray[i].location_type, i, locationArray[i], planTemplate, hasEvent, isSpecial);
        
        if (planTemplate.location_types[i] === 'Activity/Event') {
          eachItem["start_day"] = this.getStartDate(locationArray[i], hasEvent, planTemplate, isSpecial);
          eachItem["end_day"] = this.getEndDate(locationArray[i], eachItem["start_day"], hasEvent, planTemplate, isSpecial);
          
          if (isSpecial)
            eachItem["activity"] = 'Special';
          else
            eachItem["activity"] = 'Event';
        }

        retData.push(eachItem);
      }
    else if (planTemplate.location_types.length === 2){
      let eachItem = {};
      eachItem["location"] = locationArray['a'];
      eachItem["duration"] = this.getTime(locationArray['a'].metro_city2, locationArray['a'].location_type, 0, locationArray['a'], planTemplate, hasEvent, isSpecial);
      
      if (planTemplate.location_types[0] === 'Activity/Event') {
        eachItem["start_day"] = this.getStartDate(locationArray['a'], hasEvent, planTemplate, isSpecial);
        eachItem["end_day"] = this.getEndDate(locationArray['a'], eachItem["start_day"], hasEvent, planTemplate, isSpecial);

        if (isSpecial)
          eachItem["activity"] = 'Special';
        else
          eachItem["activity"] = 'Event';
      }
      
      retData.push(eachItem);
      eachItem = {};
      eachItem["location"] = locationArray['b'];
      eachItem["duration"] = this.getTime(locationArray['b'].metro_city2, locationArray['b'].location_type, 1, locationArray['b'], planTemplate, hasEvent, isSpecial);
      
      if (planTemplate.location_types[1] === 'Activity/Event') {
        eachItem["start_day"] = this.getStartDate(locationArray['b'], hasEvent, planTemplate, isSpecial);
        eachItem["end_day"] = this.getEndDate(locationArray['b'], eachItem["start_day"], hasEvent, planTemplate, isSpecial);

        if (isSpecial)
          eachItem["activity"] = 'Special';
        else
          eachItem["activity"] = 'Event';
      }
      
      retData.push(eachItem);
    } else if (planTemplate.location_types.length === 1) {
      let eachItem = {};
      eachItem["location"] = locationArray;
      eachItem["duration"] = this.getTime(locationArray.metro_city2, locationArray.location_type, 0, locationArray, planTemplate, hasEvent, isSpecial);

      if (planTemplate.location_types[0] === 'Activity/Event') {
        eachItem["start_day"] = this.getStartDate(locationArray, hasEvent, planTemplate, isSpecial);
        eachItem["end_day"] = this.getEndDate(locationArray, eachItem["start_day"], hasEvent, planTemplate, isSpecial);

        if (isSpecial)
          eachItem["activity"] = 'Special';
        else
          eachItem["activity"] = 'Event';
      }

      retData.push(eachItem);
    }

    return retData;
  }

  getTime(metroCity, locationType, index, location, planTemplate, hasEvent, isSpecial) {
    const rule = this.getCurrentRule(metroCity);
    let time = 1; // Default time

    if (locationType)
      if (!hasEvent && locationType.name === "Museum") // Location timing rule #1
        return 2;
      else if (locationType.name === "Restaurant") // Location timing rule #3
        return 1.5;
  
    if (planTemplate.location_types[index] == "Activity/Event") {
      if (isSpecial) {
        // var special = this.getSpecialFromLocationId(location.objectId);
        // var hours = this.getSpecialDuration(special);
        // return hours;
        
        console.log("Activity/Event(Special) duration - ", rule["locationtype_" + snakenText(location.location_type.name)]);
        return rule["locationtype_" + snakenText(location.location_type.name)];
      } else {
        var event = this.getEventFromLocationId(location.objectId);
        var hours = this.getEventDuration(event);
        console.log("Activity/Event(Event) duration - ", hours);
        return hours;
      }
    }

    // console.log('LocationType duration: ', rule["locationtype_" + snakenText(locationType.name)])
    return rule["locationtype_" + snakenText(locationType.name)];
  }

  canChooseOne(arrays, planTemplate) {
    let array = [];
    let cnt = 0;

    for (let i = 0; i < arrays.length; i++) {
      let hasHours = true;

      if (planTemplate.location_types.length === 1) {
        array = arrays[i];

        if (array.hours.length === 0 && planTemplate.locationTypes[0] !== "Activity/Event")
          hasHours = false;
      } else if (planTemplate.location_types.length === 2) {
        array = arrays[i];

        if (array["a"].hours.length === 0 && planTemplate.locationTypes[0] !== "Activity/Event" || 
            array["b"].hours.length === 0 && planTemplate.locationTypes[1] !== "Activity/Event")
          hasHours = false;
      } else if (planTemplate.location_types.length > 2) {
        array = arrays[i];

        for (let j = 0; j < array.length; j++) {
          if (array[j].hours.length === 0 && planTemplate.locationTypes[j] !== "Activity/Event") {
            hasHours = false;
            break;
          }
        }
      }

      if (hasHours) cnt++;
    }

    if (cnt === 0)
      return false;
    else
      return true;
  }

  chooseOne(arrays, planTemplate) {
    let array = [];
    let hasHours = false;
    let noHours = false;

    if (this.canChooseOne(arrays, planTemplate) === true) {
      // Location timing rule #5

      do {
        hasHours = false;

        if (planTemplate.location_types.length > 2) {
          let cnt = 0;
          array = arrays[getRandomInt(arrays.length)];

          for (let j = 0; j < array.length; j++) {
            // console.log('eachLocation - ', eachLocation);
            if (array[j].hours.length > 0 || planTemplate.location_types[j] === 'Activity/Event')
              cnt++;
          }

          if (cnt === array.length)
            hasHours = true;
        } else if (planTemplate.location_types.length === 2) {
          array = arrays[getRandomInt(arrays.length)];

          if (array["a"].hours.length > 0 && array["b"].hours.length > 0)
            hasHours = true;
        } else if (planTemplate.location_types.length === 1) {
          array = arrays[getRandomInt(arrays.length)];

          if (array.hours.length > 0)
            hasHours = true;
        }

      } while (!hasHours);
    } else {
      console.log("No one candidates has hours, please check DB");
      return 0;
    }

    return array;
  }

  checkActivityLen(array, planTemplate, isSpecial) {
    let newLocationTypes = planTemplate.location_types;
    let newArray = array;
    let hours = 0;
    let activity = '';

    if (planTemplate.location_types.length < 3)
      return array;

    do { 
      let ind = 0;
      var tempArray = [];
      var tempLocationTypes = [];
      newLocationTypes.map((location_type, index) => {
        if (location_type === 'Activity/Event')
          ind = index;
      });

      if (isSpecial) {
        activity = this.getSpecialFromLocationId(newArray[ind].location.objectId);
        hours = this.getEventDuration(activity);
      } else {
        activity = this.getEventFromLocationId(newArray[ind].location.objectId);
        hours = this.getEventDuration(activity);
      }

      if (hours >= 1.5) {
        if (ind === 0) {
          newArray.pop();
          newLocationTypes.pop();
        } else {
          for (let j = 1; j < newArray.length; j++) {
            tempArray.push(newArray[j]);
            tempLocationTypes.push(newLocationTypes[j]);
          }
          newArray = tempArray;
          newLocationTypes = tempLocationTypes;
        }
      }
    } while (newArray.length > 2 && hours >= 1.5)

    return newArray;
  }

  getEventFromLocationId(locationId) {
    var events = this.getComingEvents();
    
    for (let i = 0; i < events.length; i++)
      if(events[i].location)
        if (events[i].location.objectId === locationId)
          return events[i];
  }

  getSpecialFromLocationId(locationId) {
    var specials = this.getActiveSpecials();
    
    for (let i = 0; i < specials.length; i++){
      if (specials[i].location_pointer.objectId === locationId)
        return specials[i];
    }
  }

  getEventDuration(event) {
    var millisec = moment(event.dates[0].end, "HH:mm A") - moment(event.dates[0].start, "HH:mm A");
    var hours = (millisec / (1000 * 60 * 60)).toFixed(1)
    // console.log('Event duration - ', hours);

    return hours;
  }

  getSpecialDuration(special) {
    var millisec = moment(special.days[0].end, "HH:mm") - moment(special.days[0].start, "HH:mm");
    var hours = (millisec / (1000 * 60 * 60)).toFixed(1)
    // console.log('Special duration - ', hours);

    return hours;
  }  

  mileFilter(locationArrays, metroCity, planTemplate) {
    const mile = parseFloat(this.getMile(metroCity));
    let newLocationArrays = [];
    let cnt = 0;

    if (planTemplate.location_types.length == 1)
      return locationArrays;

    locationArrays.map((locationArray) => {
      let temp = true;

      for (let i = 0; i < locationArray.length - 1; i++) {
        for(let j = i + 1; j < locationArray.length; j++) {
          let locationA = locationArray[i];
          let locationB = locationArray[j];

          if (mile < getDistanceWithLatLong(locationA.latitude, locationA.longitude, locationB.latitude, locationB.longitude)){
            temp = false;
            break;
          }
        }

        if (!temp)
          break;
      }

      if (temp) {
        newLocationArrays[cnt] = locationArray
        cnt++;
      }
    });

    return newLocationArrays;
  }

  getLocationArraysFromPairs(pairSets, planTemplate) {
    let locationArrays = [];
    const length = pairSets.length;
    let cnt = 0;

    if (planTemplate.location_types.length === 1) // if planTemplate has 1 location_types
      return pairSets;

    if (length == 1)          // if planTemplate has 2 location_types
      return pairSets[0];

    for (let k = 0; k < pairSets[0].length; k++) {
      var pair = pairSets[0][k];
      let locationArray = [];
      let second = pair["b"];
      let cnt1 = 0;
      locationArray.push(pair["a"]);

      do {
        let tcnt = cnt1;

        for (let i = 0; i < pairSets[cnt1 + 1].length; i++) {
          let cmpPair = pairSets[cnt1 + 1][i];

          if (second.objectId === cmpPair["a"].objectId) {
            locationArray.push(second);
            second = cmpPair["b"];
            cnt1++;

            if (cnt1 === length - 1){
              locationArray.push(second);
              cnt1 = tcnt;
            }
          }

          if(i === pairSets[cnt1 + 1].length - 1)
            cnt1 = tcnt;
        } 

        if (tcnt === cnt1)
          cnt1 = length;
      } while(cnt1 < length - 1);

      if (locationArray.length === length + 1){
        // console.log('Location array - ', locationArray);
        locationArrays[cnt] = locationArray;
        cnt++;
      }
    }

    return locationArrays;
  }

  getLocationPairsInMile(locations, planTemplate, metroCity, comingEventLocations) {
    const mile = parseFloat(this.getMile(metroCity));
    // console.log(mile);
    let locationSets = [];
    let pairSets = [];
    

    if (planTemplate.location_types.length === 1) {   // if planTemplate has one location_types
      pairSets = locations;
    } else {
      locationSets = this.getLocationSetsFromPlanTemplate(locations, planTemplate, comingEventLocations);

      if (locationSets === 0) return 0;
      
      for (let i = 0; i < locationSets.length - 1; i++){
        let locationSet_A = locationSets[i];
        let locationSet_B = locationSets[i + 1];
        let pairSet = [];

        for (let j = 0; j < locationSet_A.length; j++) {
          for (let k = 0; k < locationSet_B.length; k++) {
            let locationA = locationSet_A[j];
            let locationB = locationSet_B[k];
            let pair = {};

            if (locationA.objectId === locationB.objectId)
              continue;

            if (mile > getDistanceWithLatLong(locationA.latitude, locationA.longitude, locationB.latitude, locationB.longitude)){
              pair['a'] = locationA;
              pair['b'] = locationB;
              // console.log('Pair - ', pair);
              pairSet.push(pair);
            }
          }          
        }
        // console.log('Pair set - ', pairSet);
        pairSets[i] = pairSet;
      }
      console.log('Pair sets - ', pairSets);
    }

    return pairSets;
  }

  getLocationSetsFromPlanTemplate(locations, planTemplate, comingEventLocations) {
    let locationSets = [];

    planTemplate.location_types.map((location_type) => {
      var locationSet = [];

      locations.map((location) => {
        if (location.location_type)
          if (location.location_type.name === location_type)
            locationSet.push(location);
      });

      if (location_type === "Activity/Event")
        locationSet = comingEventLocations;

      console.log('Each locationSet - ', locationSet);
      locationSets.push(locationSet);
    });

    for (let i = 0; i < locationSets.length; i++)
      if (locationSets[i].length === 0) return 0;

    return locationSets;
  }

  getMile(metroCity) {
    const { rules } = this.props;

    for (let i = 0; i < rules.length; i++)
      if (rules[i].metro_city.value.includes(metroCity.value))
        return rules[i].mile;

    return 0;
  }

  getCurrentRule(metroCity) {
    const { rules } = this.props;

    for (let i = 0; i < rules.length; i++)
      if (rules[i].metro_city.value.includes(metroCity.value))
        return rules[i];

    return 0;
  }

  getLocationsInMetroCity(metroCity) {
    const { locations } = this.props;
    let locationsInMetrocity = [];

    locations.map((location) => {
      if (location.metro_city2)
        if (location.metro_city2.value === metroCity.value)
          locationsInMetrocity.push(location);
    });

    return locationsInMetrocity;
  }

  getLocationsInPlanTemplate(locations, planTemplate) {
    let availableLocations = [];

    locations.map((location) => {
      if (location.location_type)
        planTemplate.location_types.map((location_type) => {
          if (location.location_type.name === location_type)
            availableLocations.push(location);
        })
    })

    return availableLocations;
  }

  isSpecial(metroCity) {
    let locationsInActivePlan = this.getLocationsInActivePlan();
    let availableLocations = this.getAvailableLocationsInMetroCity(locationsInActivePlan, metroCity);
    let activityLocations = this.getComingEventLocations(availableLocations, locationsInActivePlan, metroCity);

    if (activityLocations.length === 0)
      return true;
    return false;
  }

	selectLocationSelection(loc) {
		this.setLocationTags(loc);
		this.locationTimeArrayCallbacks.selectLocation(loc);

		const newValues = loc.map(( value, index ) => {
			if(!value.time || value.time.toString().indexOf('M')<0){
				var timeString = moment(new Date((value.time || 0) * 1000)).utcOffset(0).format('LT');
			}
			else{
				var timeString=moment(value.time, 'hh:mm A').diff(moment().startOf('day'), 'seconds');
			}

			return {
				location:{
					objectId : value.objectId,
					address : value.address,
					name : value.name,
					tags : value.tags || [],
					hours: value.hours || []
				},
				time : timeString
			};
		});
		this.props.change('locations', newValues);

		var temp=[];
		for(var j=0;j<loc.length; j++) {
			const locs=this.props.locations;
			for(var i=0; i<locs.length;i++){
				if(locs[i].objectId==loc[j].objectId){
					if(!loc[j].time || loc[j].time.toString().indexOf('M')<0){
						var timeString = moment(new Date((loc[j].time || 0) * 1000)).utcOffset(0).format('LT');
					}
					else{
						var timeString=moment(loc[j].time, 'hh:mm A').diff(moment().startOf('day'), 'seconds');
					}

					locs[i].time=timeString;
					temp.push(locs[i]);
				}
			}
			this.setState({tempLocations: temp});
		}
	}

	locationTimeArrayMounted (callbacks) {
		console.log("locationTimeArrayMounted");
		this.locationTimeArrayCallbacks = callbacks
	}

	setLocationTags(locations) {
		const newTags = locations.map(function(item, index) {
			return item.tags || [];
		});
		const merged = reduce(newTags, function(result, arr) {
			return result.concat(arr);
		}, []);
		this.props.change('tags', uniq(merged));
	}

  getLocationTags(array, planTemplate) {
    const newTags = array.map(function(item, index) {
      return item.location.tags || [];
    });

    const merged = reduce(newTags, function(result, arr) {
      return result.concat(arr);
    }, []);

    return uniq(merged);
  }

  onUpdateLocation(objectId, location, locationTimes) {
    const { updateLocation } = this.props;

    delete location.createdAt;
    delete location.updatedAt;
    updateLocation(objectId, location, true);
    this.refreshFirstMsg(locationTimes);
  }

  onChangeLocationTime(locationTimes) {
    let selectedSpecials = this.getAvailableSpecials(locationTimes);
    this.setState({ locationTimes, selectedSpecials });
    this.refreshFirstMsg(locationTimes);
  }

  refreshFirstMsg(locationTimes) {
    var first_message = '';

    for (let i = 0; i < locationTimes.length; i++)
      if (locationTimes[i].location.additional_notes)
        first_message = first_message + locationTimes[i].location.additional_notes + ' ';
    
    this.props.change('first_message', first_message);
  }

	onSave = (plan) => {
		var time_out_of_range=false;
		if(!this.state.showModal){
			for(var i=0; i< plan.locations.length;i++){
				var isPM=false;
				var time=_.lowerCase(plan.locations[i].time.toString());
				if(_.includes(time,'pm')){isPM=true;}
				time=_.trim(_.replace(_.replace(_.replace(time,'pm',''),'am',''),' ',''));
				if(isPM && _.parseInt(time) < 1200){time=_.parseInt(time)+1200;}
				if(plan.locations[i].location.hours){
					for(var j=0; j<plan.locations[i].location.hours.length;j++){
            if (plan.active_days && plan.active_days[plan.locations[i].location.hours[j].day]) {
  						var start=plan.locations[i].location.hours[j].start;
  						var end=plan.locations[i].location.hours[j].end;
  						if(_.parseInt(end)==0 || (_.parseInt(end)<_.parseInt(start))){
  							end=_.parseInt(end)+2400;
  						}
  						if(_.parseInt(time)<_.parseInt(start) || _.parseInt(time)>_.parseInt(end)){
                // console.log('Time out of range: time: ', _.parseInt(time), ' start: ', _.parseInt(start), ' end: ', _.parseInt(end) );
  							this.setState({showModal: true});
  							time_out_of_range=true;
  						}
            }
					}
				}
			}
		}

		if(!time_out_of_range){
			this.setState({showModal: false});
			this.props.onSave(plan);
		}
	}

  onSelectImage(imgUrl) {
    this.setState({ showImgModal: false });
    this.props.change('image', imgUrl);
  }

  onClickImageModal() {
    const { currentMetroCity, locationTimes, locationTimeDatas } = this.state;
    if ((size(locationTimeDatas || []) > 0 || size(locationTimes || []) > 0) && currentMetroCity)
      this.setState({ showImgModal: true });
  }

  render () {
    const { item, copy, locations, tags, errorMessage, handleSubmit, metroCities, isAutomate, neighborhoods, locationTags, onSave, change } = this.props;
	  const { showModal, showImgModal, locationTimeDatas, locationTimes, hasEvent, isSpecial, selectedEvent, selectedSpecials, isAutomating, currentMetroCity, selectedNeighborhoods, selectedLocationTags } = this.state;
    let location4ImgModal = null;
    
    if (size(locationTimeDatas || []) > 0) {
      if (size(locationTimeDatas) > 1)
        location4ImgModal = locationTimeDatas[1].location;
      else
        location4ImgModal = locationTimeDatas[0].location;
    }

    if (size(locationTimes || []) > 0) {
      if (size(locationTimes) > 1)
        location4ImgModal = locationTimes[1].location;
      else
        location4ImgModal = locationTimes[0].location;
    }

		const addTagsOfLocation = otherField => (value, previousValue, allValues) => {
		  const tags =  allValues['tags'] || [];
      
			var temp=[];
			for(var j=0;j<value.length; j++) {
				for(var i=0; i<locations.length;i++){
					if(locations[i].objectId==value[j].location.objectId){
						if(!value[j].time || value[j].time.toString().indexOf('M')<0){
							locations[i].time = moment(new Date((value[j].time || 0) * 1000)).utcOffset(0).format('LT');
						}
						else{
							locations[i].time=moment(value[j].time, 'hh:mm A').diff(moment().startOf('day'), 'seconds');
						}
						temp.push(locations[i]);
					}
				}
				this.setState({tempLocations: temp});
			}

			const newTags = value.map(function(item, index) {
				return item.location.tags || [];
			});
			const merged = reduce(newTags, function(result, arr) {
				return result.concat(arr);
			}, tags);
			change('tags', uniq(merged)	);
			return value;
		}

    return (
      <form onSubmit={handleSubmit(plan => {this.onSave(plan)})}>
        <div className="row newplan">
          <div className="col-md-6">
            {errorMessage ? (
                <div className="alert alert-danger">
                  <strong>Oops!</strong> {errorMessage}
                </div>
              ) : null}
            <div className="btn-group">
              <LinkTo className="btn btn-default" url="plans">Cancel</LinkTo>
              <button action="submit" className="btn btn-primary">
                {(isEmpty(item) || (copy!=undefined && copy=='copy')) ? 'Create Plan' : 'Update Plan'}
              </button>
            </div>
            <div className="btn-group">
              <button className="btn btn-info btn-automate" disabled={isAutomating} onClick={() => this.setState({ isAutomating: true }, () => this.afterSetState(0))}>
              {
                isAutomating ? "Automating" : "Automate"
              }
              </button>
            </div>
          </div>
					<div className="col-md-6">
  					<Field
  						name="planFinder"
  						component={PlanLocationFinder}
  						label="Build"
  						tempLocations={this.state.tempLocations}
  						placeholder="Find Locations"
  						onSelectLocation={(locations) => { this.selectLocationSelection( locations ) } }
  					 />
					</div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <Field
              name="metro_city"
              valueField="value"
              textField="name"
              component={renderDropdownList}
              data={metroCities}
              label="Select Metro city"
              afterChange={(selectedMetroCity) => this.setState({ currentMetroCity: selectedMetroCity })}
            />
            <Field
              name="filter_neighborhoods"
              component={renderMultiselect}
              data={neighborhoods}
              label="Neighborhoods"
              afterChange={(selectedNeighborhoods) => this.setState({ selectedNeighborhoods: selectedNeighborhoods })}
            />
            <Field
              name="filter_location_tags"
              component={renderMultiselect}
              data={locationTags}
              label="Location Tags"
              afterChange={(selectedLocationTags) => this.setState({ selectedLocationTags: selectedLocationTags })}
            />
            <div className="row img-select">
              <div className="col-md-10">
                <Field name="image" component={renderField} label="URL of banner"/>
              </div>
              <div className="col-md-2">
                <a className="img-select-btn btn" onClick={() => this.onClickImageModal()}>Select</a>
              </div>
            </div>
            <Field name="title_event" component={renderField} label="Title"/>
            <Field name="description_event" component={renderTextareaField} max={250} label="Description" />
            <Field
              name="tags"
              component={renderMultiselect}
              data={tags.map(({ tag }) => tag)}
              label="Tags"
            />
          </div>
          <div className="col-md-6">
            {weekDays.map(day => (
              <Field
                key={day}
                name={`reoccur_${day}`}
                component={renderCheckboxField}
                label={`Every ${capitalize(day)}`}
              />
            ))}
            <Field name="featured" component={renderCheckboxField} label="Featured" />
            <Field name="is_series_plan" component={renderCheckboxField} label="Series Plan" />
          </div>
          <div className="col-md-12">
            <Field
              name="locations"
              valueField="objectId"
              textField="name"
              component={LocationsTimeArray}
              data={locations.map((location) => (location))}
              label="Select Location"
							normalize={addTagsOfLocation('tags')}
              initials={locationTimeDatas}
              isAutomate={isAutomate}
              onUpdateLocation={this.onUpdateLocation.bind(this)}
              onChangeLocationTime={this.onChangeLocationTime.bind(this)}
							onMounted={this.locationTimeArrayMounted.bind(this)}
            />
          </div>
          <div className="col-md-6">
            <Field name="partner" component={renderCheckboxField} label="Partner" />
            <Field
              name="start_day"
              component={renderDatePicker}
              label="Start Day"
            />
            <Field
              name="end_day"
              component={renderDatePicker}
              label="End Day"
            />
            {/*<Field
              name="count_attended"
              component={renderDropdownList}
              data={range(2, 21)}
              label="Number of Attendees"
            />*/}
			      <Field
              name="count_attended_range"
			        valueField="value"
              textField="name"
              component={renderDropdownList}
			        data={[
                {name: '1-4', value: '1-4'},
                {name: '5-10', value: '5-10'},
                {name: '10+', value: '10+'}
              ]}
              label="Number of Attendees"
            />
            <Field
              name="type_event"
              component={renderDropdownList}
              data={[
                'Adventure',
                'Coffee',
                'Dance',
                'Drinks',
                'Food',
                'Ladies Only',
                'Museum',
                'Music',
                'Relax',
                'Sports',
                'Theatre',
                'Tours',
                'VIP',
                'Volunteer',
                'Workout',
                'Test'
              ]}
              label="Experience Type"
            />
            <Field name="is21_age" component={renderCheckboxField} label="Only 21+ Allowed" />
            <Field
              name="estimated_cost"
              component={renderDropdownList}
              data={['FREE', '$', '$$', '$$$', '$$$$', '$$$$$']}
              label="Estimate Cost"
            />
            {errorMessage ? (
                <div className="alert alert-danger">
                  <strong>Oops!</strong> {errorMessage}
                </div>
              ) : null}
            <div className="btn-group">
              <LinkTo className="btn btn-default" url="plans">Cancel</LinkTo>
              <button action="submit" className="btn btn-primary">
                {(isEmpty(item) || (copy!=undefined && copy=='copy')) ? 'Create Plan' : 'Update Plan'}
              </button>
            </div>
          </div>
          <div className="col-md-6">
            {
              hasEvent ?
                isSpecial ?
                  selectedSpecials.map((selectedSpecial, mainIndex) => {
                    console.log('@1 - ', selectedSpecial, mainIndex)
                    return (
                      <div className="special" key={mainIndex}>
                        <table className="table table-bordered table-hover table-striped table-responsive">
                          <tbody>
                          <tr>
                            <td>Incentive Name</td>
                            <td>{selectedSpecial.incentive_name}</td>
                          </tr>
                          <tr>
                            <td>Location Name</td>
                            <td>{selectedSpecial.location_name}</td>
                          </tr>
                          <tr>
                            <td>Description</td>
                            <td>{selectedSpecial.description}</td>
                          </tr>
                          <tr>
                            <td>Days</td>
                            <td>
                              {size(selectedSpecial.days || []) > 0 ? (
                                <table className="table table-bordered table-hover table-striped table-responsive">
                                  <tbody>
                                  {selectedSpecial.days.map(({ day, start, end }, index) => (
                                    <tr key={index}>
                                      <td>{capitalize(weekDays[day])}</td>
                                      <td>{renderHours(start)}</td>
                                      <td>{renderHours(end)}</td>
                                    </tr>
                                  ))}
                                  </tbody>
                                </table>
                                ) : null}
                            </td>
                          </tr>
                          <tr>
                            <td>Start Date</td>
                            <td>{selectedSpecial.start_date ? renderDateTime(selectedSpecial.start_date.iso) : ''}</td>
                          </tr>
                          <tr>
                            <td>End Date</td>
                            <td>{selectedSpecial.without_end_date ? 'Without End date' : renderDateTime(selectedSpecial.end_date.iso)}</td>
                          </tr>
                          </tbody>
                        </table>
                      </div>
                    )
                  })
                : <div className="event">
                    <table className="table table-bordered table-hover table-striped table-responsive">
                      <tbody>
                        <tr>
                          <td>Event Type</td>
                          <td>
                            {selectedEvent.event_type.name}
                          </td>
                        </tr>
                        <tr>
                          <td>Dates</td>
                          <td>
                            {size(selectedEvent.dates || []) > 0 ? (
                                <table className="table table-bordered table-hover table-striped table-responsive">
                                  <tbody>
                                  {selectedEvent.dates.map(({ date, name, start, end }, index) => (
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
                        </tr>
                        <tr>
                          <td>Start Date</td>
                          <td>{renderDate(selectedEvent.start_time)}</td>
                        </tr>
                        <tr>
                          <td>End Date</td>
                          <td>{renderDate(selectedEvent.end_time)}</td>
                        </tr>
                        <tr>
                          <td>Description</td>
                          <td>{selectedEvent.description}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
              : null
            }
          </div>
          <div className="col-md-6 float-right">
            <Field name="featured_image_url" component={renderField} label="Featured Image Url" />
            <Field name="featured_name" component={renderField} label="Featured Name" />
            <Field name="featured_link" component={renderField} label="Featured Link" />
            <Field name="first_message" component={renderTextareaField} label="First Chat Message" />
          </div>
        </div>
    		<div className="row">
          <div className="col-md-12">
      			<Modal aria-labelledby='modal-label' show={showModal}>
      			  <div className="row">
        				<div className="col-md-12">
        					<h4><center>One or more locations might fall outside of open location hours.</center></h4>
        				</div>
      			  </div>
      			  <div className="row">
        				<div className="col-md-12">
        					<center><button action="submit" className="btn btn-primary" onClick={handleSubmit(plan => {this.onSave(plan)})}>OK</button></center>
        				</div>
      			  </div>
      			</Modal>
    		  </div>
    		</div>
        <ImageFromGoogle
          showImgModal={showImgModal}
          onHide={() => this.setState({ showImgModal: false })}
          onSelectImage={(imgUrl) => this.onSelectImage(imgUrl)}
          metroCities={metroCities}
          locations={locations}
          defaultMetroCity={currentMetroCity}
          defaultLocation={location4ImgModal}
        >
        </ImageFromGoogle>
      </form>
    );
  }
}

PlanForm.defaultProps = {
  item: {}
};

PlanForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    objectId: PropTypes.string
  })
};

function validate(values) {
  const { description_event, tags, locations, start_day, end_day, is_series_plan, image, title_event } = values;

  const errors = {};

  if (size(tags) === 0) {
    errors.tags = 'Tags are required';
  }

  if (size(locations) === 0) {
    errors.locations = 'Location is required';
  }

  if (description_event && description_event.length > 250) {
    errors.description_event = 'Description must be less 250';
  }

  if(is_series_plan) {
    var startDate = moment(start_day).format('MM/DD/YYYY');
    var endDate = moment(end_day).format('MM/DD/YYYY');
    if(startDate != endDate) {
      errors.start_day = 'Start Day and End Day must be same for Series Plan';
      errors.end_day = 'Start Day and End Day must be same for Series Plan';
      errors.is_series_plan = 'Start Day and End Day must be same for Series Plan';
    }
  }

  [
    'title_event',
    'description_event',
    'image',
    'start_day',
    'end_day',
    'count_attended_range',
    'type_event',
    'estimated_cost'
  ].map(field => {
    if (!values[field]) {
      errors[field] = `${capitalize(first(field.split('_')))} is required`;
    }
  });

  return errors;
}

export default connect(({
  locations: { items: locations },
  tags: { items: tags }
}) => ({ locations, tags }), ({ fetchTags, fetchLocations, updateLocation }))(reduxForm({ form: 'plan', validate })(PlanForm));
