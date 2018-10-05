import React, { Component, PropTypes } from 'react';
import { Pagination } from 'react-bootstrap';
import { connect } from 'react-redux';
import orderBy from 'lodash';
import uniq from 'lodash/uniq';
import moment from 'moment';
import { browserHistory } from 'react-router';

import { fetchPlans } from '../../actions/PlanActions';
import { fetchLocations } from '../../actions/LocationActions';
import { fetchLocationTypes } from '../../actions/LocationTypeActions';
import { fetchMetroCities } from '../../actions/DataActions';
import { fetchEvents } from '../../actions/EventActions';
import { fetchSpecials } from '../../actions/SpecialActions';
import { fetchRules } from '../../actions/RuleActions';

import { PlansList, SearchForm } from '../../components';

import { LinkTo, Loading, MapModal } from '../../helpers';

import { getCenterOfNPoints, getDistanceWithLatLong } from '../../utils';

class PlansIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    fetchPlans: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
    fetchedAll: false,
    fetchedLocations: false,
    fetchedLocationTypes: false,
    fetchedMetroCities: false,
    fetchedEvents: false,
    fetchedSpecials: false,
    fetchedRules: false,
    isShowMapModal: false,
    search: '',
    limit: 30,
    page: 1,
    order: '-createdAt',
    include: 'bundle,locations.location',
    sortItem: '',
    sortOrder: true,
    sortedPlans: [],
    expiringSoonPlans: [],
    startingSoonPlans: [],
    filterPlan: 0,           // 0: no filter, 1: expiringSoon filter, 2: startingSoon filter
    locations: [],
    locationTypes: [],
    metroCities:[],
    specials: [],
    events: [],
    rules: [],
    planPositions: [],
    locPositions: [],
    locTags: [],
    locTypes: [],
    allPlans: [],
    specialsLoc: [],
    eventsLoc: [],
    comingEvents: [],
    activeSpecials: [],
    selectedLocs: [],
    metro_city: ''
  };

  componentDidMount() {
    let that = this;
    const { order, include, limit, page } = this.state;
    this.fetchAllPlans({ order });

    setTimeout(function(){ 
      that.fetchEventsData({ order });
      that.fetchSpecialsData({ order });
      that.fetchRulesData({ order });
      that.fetchLocationTypesData({ order });
      that.fetchLocationsData({ include: 'location_type', order });
      that.fetchMetroCityData();
    }, 500);
  }

  componentWillReceiveProps(newProps) {
    const { items, locations, metroCities, locationTypes, specials, events, rules } = newProps;
    const { fetchedAll, fetchedLocations, fetchedMetroCities, fetchedLocationTypes, fetchedSpecials, fetchedEvents, fetchedRules } = this.state;

    if (!fetchedLocations && locations && locations.length > 0 && !fetchedAll && items && items.length > 0) {
      this.setState({
        fetchedAll: true,
        fetchedLocations: true,
        locations,
        allPlans: items
      }, () => this.afterSetState(1));
    }

    if (!fetchedLocationTypes && locationTypes && locationTypes.length > 0) 
      this.setState({ fetchedLocationTypes: true, locationTypes }, () => this.afterSetState(3));

    if (!fetchedMetroCities && metroCities && metroCities.length > 0)
      this.setState({ fetchedMetroCities: true, metroCities }, () => this.afterSetState());
    
    if (!fetchedEvents && events && events.length)
      this.setState({ fetchedEvents: true, events }, () => this.afterSetState(4));

    if (!fetchedSpecials && specials && specials.length)
      this.setState({ fetchedSpecials: true, specials }, () => this.afterSetState(5));

    if (!fetchedRules && rules && rules.length > 0)
      this.setState({ fetchedRules: true, rules }, () => this.afterSetState());
  }

  fetchAllPlans({ search, order, include, filters, limit, page }) {
    const { fetchPlans } = this.props;
    this.setState({ search, fetchedAll: false }, () => fetchPlans({ order, include, search, filters, limit, page }));
  }

  fetchData({ search, order, include, filters, limit, page }) {
    const { fetchPlans } = this.props;
    this.setState({ search, fetched: false }, () => fetchPlans({ order, include, search, filters, limit, page })
      .then(() => this.setState({ fetched: true })));
  }

  fetchLocationsData({ search, order, include, filters }) {
    const { fetchLocations } = this.props;
    this.setState({ fetchedLocations: false }, () => fetchLocations({ order, search, include, filters }));
  }

  fetchLocationTypesData({ search, order, filters }) {
    const { fetchLocationTypes } = this.props;
    this.setState({ search, fetchedLocationTypes: false }, () => fetchLocationTypes({ order, search, filters }));
  }

  fetchMetroCityData() {
    const { fetchMetroCities } = this.props;
    this.setState({ fetchedMetroCities: false }, () => fetchMetroCities());
  }

  fetchEventsData({ search, order, filters, include }) {
    const { currentUser, fetchEvents } = this.props;
    let fakeUser = {}
    fakeUser["is_admin"] = true;
    this.setState({ search, fetchedEvents: false }, () => fetchEvents({ order, search, filters, include }, fakeUser));
  }

  fetchSpecialsData({ search, order, filters, include }) {
    const { currentUser, fetchSpecials } = this.props;
    let fakeUser = {}
    fakeUser["is_admin"] = true;
    this.setState({ search, fetchedSpecials: false }, () => fetchSpecials({ order, search, filters }, fakeUser));
  }

  fetchRulesData({ search, order, filters, limit, page }) {
    const { fetchRules } = this.props;
    this.setState({ fetchedRules: false }, () => fetchRules({ order, search, filters, limit, page }));
  }

  afterSetState(num) {
    const { order, include, limit, page, locations, locationTypes, events, specials } = this.state;
    const { items } = this.props;

    if (num === 1) {
      this.getPlanPositions(items);
      this.fetchData({ order, include, limit, page });
      this.getLocPositions(items, locations);
      this.getLocTags(locations);
    } else if (num === 3) {
      this.getLocTypes(locationTypes);
    } else if (num === 4) {
      this.getComingEvents(events);
    } else if (num === 5) {
      this.getActiveSpecials(specials);
    }
  }

  sortPlans(number, order) {
    const { items } = this.props;
    let sortedPlans = [];

    for (let i = 0; i < items.length; i++)
      sortedPlans.push(items[i]);

    if (number === 0)
      for (let i = 0; i < items.length - 1; i++) {
        for (let j = i + 1; j < items.length; j++) {
          if (sortedPlans[i].locations && 
            sortedPlans[j].locations && 
            sortedPlans[i].locations[0].location.neighborhood &&
            sortedPlans[j].locations[0].location.neighborhood)
            if (order)
              if (sortedPlans[i].locations[0].location.neighborhood.localeCompare(sortedPlans[j].locations[0].location.neighborhood) < 0) {
                let temp = sortedPlans[i];
                sortedPlans[i] = sortedPlans[j];
                sortedPlans[j] = temp;
              }
            else
              if (sortedPlans[i].locations[0].location.neighborhood.localeCompare(sortedPlans[j].locations[0].location.neighborhood) > 0) {
                let temp = sortedPlans[i];
                sortedPlans[i] = sortedPlans[j];
                sortedPlans[j] = temp;
              }
        }
      }
    else if (number === 1)
      for (let i = 0; i < items.length - 1; i++) {
        for (let j = i + 1; j < items.length; j++) {
          if (sortedPlans[i].start_day && 
            sortedPlans[j].start_day) 
            if (order)
              if (moment(sortedPlans[i].start_day.iso) < moment(sortedPlans[j].start_day.iso)) {
                let temp = sortedPlans[i];
                sortedPlans[i] = sortedPlans[j];
                sortedPlans[j] = temp;
              }
            else
              if (moment(sortedPlans[i].start_day.iso) > moment(sortedPlans[j].start_day.iso)) {
                let temp = sortedPlans[i];
                sortedPlans[i] = sortedPlans[j];
                sortedPlans[j] = temp;
              }
        }
      }
    else if (number === 2)
      for (let i = 0; i < items.length - 1; i++) {
        for (let j = i + 1; j < items.length; j++) {
          if (sortedPlans[i].start_day && 
            sortedPlans[j].start_day) 
            if (order)
              if (moment(sortedPlans[i].end_day.iso) < moment(sortedPlans[j].end_day.iso)) {
                let temp = sortedPlans[i];
                sortedPlans[i] = sortedPlans[j];
                sortedPlans[j] = temp;
              }
            else
              if (moment(sortedPlans[i].end_day.iso) > moment(sortedPlans[j].end_day.iso)) {
                let temp = sortedPlans[i];
                sortedPlans[i] = sortedPlans[j];
                sortedPlans[j] = temp;
              }
        }
      }

    this.setState({ sortedPlans }, () => this.afterSetState());
  }

  onSort(query) {
    const { sortItem, sortOrder } = this.state;
    const { items, count, fetchPlans } = this.props;
    let order = '';
    // console.log('query - ', query, 'items - ', items, ' sortItem: ', sortItem, ' sortOrder: ', sortOrder);

    if (query === 'neighborhood')
      this.setState({ fetched: false }, this.sortPlans(0, sortOrder));
    else if (query === 'start')
      this.setState({ fetched: false }, this.sortPlans(1, sortOrder));
    else if (query === 'end')
      this.setState({ fetched: false }, this.sortPlans(2, sortOrder));

    if (query.length === sortItem.length)
      this.setState({ sortOrder: !sortOrder });
    else
      this.setState({ sortItem: query, sortOrder: false });
  }

  getExpiringSoon() {
    const { items, count } = this.props;
    let expiringSoonPlans = [];

    items.map((item) => {
      if (moment(item.end_day.iso) > moment() && 
        moment(item.end_day.iso) < moment().add(7, 'd'))
        expiringSoonPlans.push(item);
    });

    this.setState({ expiringSoonPlans, filterPlan: 1 });
  }

  getStartingSoon() {
    const { items, count } = this.props;
    let startingSoonPlans = [];
    items.map((item) => {
      if (moment(item.start_day.iso) > moment() && 
        moment(item.start_day.iso) < moment().add(7, 'd'))
        startingSoonPlans.push(item);
    });

    this.setState({ startingSoonPlans, filterPlan: 2 });
  }

  getAll() {
    this.setState({ filterPlan: 0 });
  }

  getPlanPositions(plans) {
    const { locations } = this.state;
    let planPositions = [];
    let cnt = 0;

    for (let i = 0; i < plans.length; i++) {
      let latLon = [];
      for (let j = 0; j < plans[i].locations.length; j++) {
        for (let k = 0; k < locations.length; k++) {
          if (plans[i].locations[j].location.objectId === locations[k].objectId)
            latLon.push(locations[k].location);
        }
      }

      let data = {};
      data['id'] = cnt;
      data['latitude'] = getCenterOfNPoints(latLon).latitude;
      data['longitude'] = getCenterOfNPoints(latLon).longitude;
      data['objectId'] = plans[i].objectId;
      data['selected'] = false;
      data['origin'] = 'plan';

      // infoWindow data
      data['info'] = {};
      data.info['name'] = plans[i].title_event;
      data.info['tags'] = plans[i].tags;
      data.info['locations_cnt'] = plans[i].locations.length;
      data.info['categories'] = this.getCategoriesFromPlan(plans[i], locations);

      if (moment(plans[i].end_day.iso) > moment())
        data['active'] = true;
      else
        data['active'] = false;
        
      planPositions.push(data);
      cnt++;   
    }

    this.setState({planPositions});
  }

  getLocPositions(plans, locations) {
    let locPositions = [];
    let cnt = 0;
    let activePlans = [];
    let locationsInActivePlans = [];
    
    for (let i = 0; i < plans.length; i++)
      if (moment(plans[i].end_day.iso) > moment())
        activePlans.push(plans[i]);

    for (let i = 0; i < activePlans.length; i++)
      for (let j = 0; j < activePlans[i].locations.length; j++)
        for (let k = 0; k < locations.length; k++)
          if (activePlans[i].locations[j].location.objectId === locations[k].objectId)
            locationsInActivePlans.push(locations[k].objectId);

    for (let i = 0; i < locations.length; i++)
      if (locations[i].metro_city2) {
        let isActive = false;
        let data = {};

        for (let j = 0; j < locationsInActivePlans.length; j++) {
          if (locations[i].objectId === locationsInActivePlans[j]) {
            data['active'] = true;
            isActive = true;
            break;
          } 
        }

        if (!isActive)
          data['active'] = false;

        if (this.isComingEventLocation(locations[i]))
          data['isComingEvent'] = true;
        else
          data['isComingEvent'] = false;

        if (this.isSpcialLocation(locations[i]))
          data['isActiveSpecial'] = true;
        else
          data['isActiveSpecial'] = false;

        data['id'] = cnt;
        data['origin'] = 'location';
        data['latitude'] = locations[i].latitude;
        data['longitude'] = locations[i].longitude;
        data['objectId'] = locations[i].objectId;
        data['metro_city'] = locations[i].metro_city2.name;
        data['selected'] = false;

        // infoWindow data
        data['info'] = {};
        data.info['name'] = locations[i].name;
        data.info['tags'] = locations[i].tags;
        data.info['specials'] = this.getSpecialNamesWithLocationId(locations[i].objectId);
        data.info['events'] = this.getEventInfosWithLocationId(locations[i].objectId);

        // if (data.info['events'].length > 0)
        //   console.log(locations[i].objectId, data.info['events'])

        if (locations[i].location_type)
          data.info['location_type'] = locations[i].location_type.name;
        else
          data.info['location_type'] = '';

        if (locations[i].notes)
          data.info['notes'] = locations[i].notes;
        else
          data.info['notes'] = '';

        locPositions.push(data);

        cnt++;
      }

    this.setState({ locPositions });
  }

  getCategoriesFromPlan(plan, locations) {
    let categories = [];

    for (let i = 0; i < plan.locations.length; i++) {
      let location = this.getLocationWithId(plan.locations[i].location.objectId);
      let items = [];

      if (location) {
        if (location.category)
          items = location.category.split(", ");

        for (let j = 0; j < items.length; j++)
          categories.push(items[j]);
      }
    }

    return categories;
  }

  getSpecialNamesWithLocationId(locationId) {
    const {specials} = this.state;
    let names = [];

    for (let i = 0; i < specials.length; i++) 
      if (specials[i].location_pointer.objectId === locationId)
        names.push(specials[i].incentive_name)

    return names;
  }

  getEventInfosWithLocationId(locationId) {
    const {events} = this.state;
    let infos = [];
    let cnt = 0;

    for (let i = 0; i < events.length; i++) {
      if (events[i].location)
        if (events[i].location.objectId === locationId)
          if (events[i].dates) {
            let info = [];

            for (let j = 0; j < events[i].dates.length; j++) {
              if (events[i].dates[j].name)
                info.push({'name': events[i].dates[j].name, 'date': events[i].dates[j].date});
            }

            infos[cnt] = info;
            cnt++;
          }
    }

    return infos;
  }

  getLocationWithId(id) {
    const { locations } = this.state;

    for (let i = 0; i < locations.length; i++)
      if (locations[i].objectId === id)
        return locations[i];
  }

  getLocationTypesWithId(id) {
    const {locationTypes} = this.state;

    for (let i = 0; i < locationTypes.length; i++)
      if (locationTypes[i].objectId === id)
        return locationTypes[i];
  }

  isComingEventLocation(location) {
    const { comingEvents } = this.state;

    for (let i = 0; i < comingEvents.length; i++)
      if (comingEvents[i].location)
        if (comingEvents[i].location.objectId === location.objectId)
          return true;

    return false;
  }

  isSpcialLocation(location) {
    const { specials } = this.state;

    for (let i = 0; i < specials.length; i++)
      if (specials[i].location_pointer)
        if (specials[i].location_pointer.objectId === location.objectId)
          return true;

    return false;
  }

  getLocTypes(locationTypes) {
    let locTypes = [];

    for (let i = 0; i < locationTypes.length; i++)
      locTypes.push(locationTypes[i].name);

    this.setState({ locTypes });
  }

  getLocTags(locations) {
    let locTags = [];

    for (let i = 0; i < locations.length; i++) {
      if (locations[i].tags)
        for (let j = 0; j < locations[i].tags.length; j++)
          locTags.push(locations[i].tags[j]);
    }

    this.setState({ locTags: uniq(locTags) });
  }

  getComingEvents(events) {
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

    // console.log('Coming Events - ', comingEvents);
    this.setState({ comingEvents });
  }

  getActiveSpecials(specials) {
    let activeSpecials = [];

    specials.map((special) => {
      if (special.status === "active")
        activeSpecials.push(special)
    });

    this.setState({ activeSpecials });
  }

  showMapModal() {
    this.setState({ isShowMapModal: true });
  }

  onClickMarker(id, origin) {
    if (origin === 'plan') {
      this.clearSelection();
      this.setSelection(id, origin);
    } else if (origin === 'location') {
      this.setSelection(id, origin);
    }
  }

  setSelection(id, origin) {
    const { planPositions, locPositions, selectedLocs } = this.state;
    let newSelectedLocs = [];
    let newPlanPositions = planPositions;

    if (origin === 'plan') {
      if (newPlanPositions[id].selected === true) {
        newPlanPositions[id].selected = false;
      } else {
        newSelectedLocs.push(id);
        newPlanPositions[id].selected = true;
      }

      this.setState({ planPositions: newPlanPositions, selectedLocs: newSelectedLocs });
    } else if (origin === 'location') {
      newSelectedLocs = selectedLocs;

      if (locPositions[id].selected === true) {
        locPositions[id].selected = false;

        for (let i = 0; i < newSelectedLocs.length; i++)
          if (newSelectedLocs[i] === id)
            newSelectedLocs.splice(i, 1);
      } else {
        locPositions[id].selected = true;
        newSelectedLocs.push(id);
      }
      
      this.setState({ locPositions, selectedLocs: newSelectedLocs });
    }
  }

  clearSelection() {
    const { planPositions, locPositions } = this.state;

    for (let i = 0; i < planPositions.length; i++)
      planPositions[i].selected = false;

    for (let i = 0; i < locPositions.length; i++)
      locPositions[i].selected = false;

    this.setState({ planPositions, locPositions, selectedLocs: [] });
  }

  showSelection(origin) {
    const { planPositions, locPositions, selectedLocs } = this.state;

    if (origin === 'plan') {
      if (selectedLocs.length === 0)
        alert('Please select on plan');
      else if (selectedLocs.length === 1)
        browserHistory.push('/plans/' + planPositions[selectedLocs[0]].objectId);
    } else if (origin === 'location') {
      if (selectedLocs.length === 1)
        browserHistory.push('/locations/' + locPositions[selectedLocs[0]].objectId);
      else if (selectedLocs.length > 1)
        alert('You selected several locations, please select only one.');
      else if (selectedLocs.length === 0)
        alert('Please select one location.');
    }
  }

  editSelection(origin) {
    const { planPositions, locPositions, selectedLocs } = this.state;

    if (origin === 'plan') {
      if (selectedLocs.length === 0)
        alert('Please select on plan');
      else if (selectedLocs.length === 1)
        browserHistory.push('/plans/' + planPositions[selectedLocs[0]].objectId + '/edit');
    } else if (origin === 'location') {
      if (selectedLocs.length === 1)
        browserHistory.push('/locations/' + locPositions[selectedLocs[0]].objectId + '/edit');
      else if (selectedLocs.length > 1)
        alert('You selected several locations, please select only one.');
      else if (selectedLocs.length === 0)
        alert('Please select one location.');
    }
  }

  onCreatePlanWithLocations(origin) {
    const { locPositions, selectedLocs, locations, metro_city } = this.state;
    const mile = parseFloat(this.getMile(metro_city));
    let locObjects = [];

    if (metro_city === 'ALL' || metro_city === '') {
      alert("Please select a Metro City. 'ALL' is not allowed.");
    } else {
      if (origin === 'plan')
        alert('You selected plans, please select locations to create a plan');
      if (origin === 'location') {
        if (selectedLocs.length === 0) {
          alert('Please select at least one location to create a plan');
        } else {
          let temp = 10;

          for (let i = 0; i < selectedLocs.length; i++) {
            locObjects.push(this.getLocationWithId(locPositions[selectedLocs[i]].objectId));

            if (locPositions[selectedLocs[i]].active === true) {    // active location filter
              temp = 3;
              break;
            }
          }

          // for (let i = 0; i < locObjects.length - 1; i++) {      // mileFilter
          //   for(let j = i + 1; j < locObjects.length; j++) {
          //     let locationA = locObjects[i];
          //     let locationB = locObjects[j];

          //     if (mile < getDistanceWithLatLong(locationA.latitude, locationA.longitude, locationB.latitude, locationB.longitude)){
          //       temp = 1;
          //       break;
          //     }
          //   }

          //   if (temp === 1)
          //     break;
          // }

          for (let i = 0; i < locObjects.length; i++) {               // hasLocationType filter
            if (locObjects[i].location_type.name === '') {
              temp = 2;
            }
          }

          if (temp === 10) {
            localStorage.setItem('locationArrays', JSON.stringify(locObjects));
            localStorage.setItem('metroCity', metro_city);
            localStorage.setItem('isUsed', false);
            browserHistory.push('/plans/new');
          } else if (temp === 1) {
            alert('Selected locations are far away from each other.');
          } else if (temp === 2) {
            alert('One of selected locations have no locationType. Please choose another.');
          } else if (temp === 3) {
            alert ('One of selected locations is a part of Active Plan. Please choose another');
          }
        }
      }
    }
  }

  getMile(metroCity) {
    const { rules } = this.props;

    for (let i = 0; i < rules.length; i++)
      if (rules[i].metro_city.name.includes(metroCity))
        return rules[i].mile;

    return 0;
  }

  render() {
    const { items, count } = this.props;
    const { fetched, order, include, limit, page, sortedPlans, sortItem, startingSoonPlans, expiringSoonPlans, filterPlan, isShowMapModal, planPositions, locPositions, metroCities, locations, locTypes, locationTypes, allPlans, locTags, selectedLocs, metro_city } = this.state;
    let plans = items;

    if (filterPlan === 0 && sortItem.length > 0)
      plans = sortedPlans;

    if (filterPlan === 1)
      plans = expiringSoonPlans;

    if (filterPlan === 2)
      plans = startingSoonPlans;

    return (
      <Loading className="container plans-index" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="plans/new">Create Plan</LinkTo>
          </div>
          <div className="col-md-2">
            {fetched ? <h4>Plans ({count})</h4> : null}
          </div>
          <div className="filter col-md-4">
            <a onClick={() => this.showMapModal()}>Map</a>
            <a onClick={() => this.getExpiringSoon()}>Expiring Soon</a>
            <a onClick={() => this.getStartingSoon()}>Starting Soon</a>
            <a onClick={() => this.getAll()}>All</a>
          </div>
          <div className="col-md-4 text-right">
            <SearchForm onSearch={({ search }) => this.fetchData({ search, order, include, limit, page: 1 })} />
          </div>
        </div>
      )} loaded={fetched}>
        <PlansList items={plans} onSort={(query) => this.onSort(query)}/>
        {count > limit ? (
            <Pagination
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
              bsSize="medium"
              items={Math.floor(count / limit)}
              maxButtons={5}
              activePage={page}
              onSelect={p => this.setState({ page: p }, () => this.fetchData({ order, limit, include, page: this.state.page }))}
            />
          ) : null}
        <MapModal
          showModal={isShowMapModal}
          onHide={() => this.setState({ isShowMapModal: false })}
          plans={allPlans}
          locations={locations}
          locationTypes={locationTypes}
          metroCities={metroCities}
          planPositions={planPositions}
          locPositions={locPositions}
          locTypes={locTypes}
          locTags={locTags}
          onClickMarker={(id, origin) => this.onClickMarker(id, origin)}
          onSelectMetroCity={(metro_city) => this.setState({metro_city})}
          onClearSelection={() => this.clearSelection()}
          onShowSelection={(origin) => this.showSelection(origin)}
          onEditSelection={(origin) => this.editSelection(origin)}
          onCreatePlanWithLocations={(origin) => this.onCreatePlanWithLocations(origin)}
        >
        </MapModal>
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    locations: state.locations.items,
    locationTypes: state.locationTypes.items,
    items: state.plans.items,
    count: state.plans.count,
    events: state.events.items,
    specials: state.specials.items,
    metroCities: state.data.cities,
    rules: state.rules.items
  }
}

export default connect(mapStateToProps, { fetchPlans, fetchLocations, fetchMetroCities, fetchLocationTypes, fetchSpecials, fetchEvents, fetchRules })(PlansIndexPage);
