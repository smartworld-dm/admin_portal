import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import uniq from 'lodash/uniq';

import { createPlan, fetchPlans } from '../../actions/PlanActions';
import { fetchPlanTemplates } from '../../actions/PlanTemplateActions';
import { fetchLocations } from '../../actions/LocationActions';
import { fetchLocationTypes } from '../../actions/LocationTypeActions';
import { fetchMetroCities } from '../../actions/DataActions';
import { fetchRules } from '../../actions/RuleActions';
import { fetchEvents } from '../../actions/EventActions';
import { fetchSpecials } from '../../actions/SpecialActions';

import { PlanForm } from '../../components';

import { Loading } from '../../helpers';

class PlanAddPage extends Component {
  state = {
    search: '',
    order: '-createdAt',
    fetchedPlanTemplates: false,
    fetchedLocations: false,
    fetchedLocationTypes: false,
    fetchedMetroCities: false,
    fetchedPlans: false,
    fetchedRules: false,
    fetchedEvents: false,
    fetchedSpecials: false,
    neighborhoodsReady: false,
    locationTagsReady: false,
    isReady: false,
    planTemplates: [],
    locations: [],
    locationTypes: [],
    metroCities:[],
    planTemplate: [],
    rules: [],
    plans: [],
    events: [],
    specials:[],
    neighborhoods: [],
    locationTags: []
  }

  componentDidMount() {
    const { order } = this.state;
    this.fetchPlanTemplatesData({ order });
    this.fetchLocationTypesData({ order });
    this.fetchMetroCityData();
    this.fetchPlansData({ order });
    this.fetchRulesData({ order });
    this.fetchEventsData({ include: 'event_type', order });
    this.fetchSpecialsData({ order });
    this.fetchLocationsData({ order });
  }

  componentWillReceiveProps (newProps) {
    const { fetchedLocations, fetchedLocationTypes, fetchedPlanTemplates, fetchedMetroCities, fetchedPlans, fetchedRules, fetchedEvents, fetchedSpecials } = this.state;
    const { planTemplates, locations, locationTypes, metroCities, plans, rules, events, specials } = newProps;

    if (!fetchedLocationTypes && locationTypes && locationTypes.length > 0) {
      // console.log('LocationTypes - ', locationTypes);

      this.setState({ 
        locationTypes,
        fetchedLocationTypes: true
      }, () => this.afterSetState());
    }

    if (!fetchedPlanTemplates && planTemplates && planTemplates.length > 0) {
      // console.log('Plan_locationTypes', planTemplates);

      this.setState({
        fetchedPlanTemplates: true,
        planTemplates
      }, () => this.afterSetState());
    }

    if (!fetchedLocations && locations && locations.length > 0) {
      // console.log('Locations - ', locations);

      this.setState({
        fetchedLocations: true,
        locations
      }, () => this.getFilterItems());
    }

    if (!fetchedMetroCities && metroCities && metroCities.length > 0) {
      // console.log('Metro cities - ', metroCities);

      this.setState({
        fetchedMetroCities: true,
        metroCities
      }, () => this.afterSetState());
    }

    if (fetchedPlans && plans && plans.length > 0) {
      // console.log('Plans - ', plans);

      this.setState({
        plans
      }, () => this.afterSetState())
    }

    if (!fetchedRules && rules && rules.length > 0) {
      // console.log('Rules - ', rules);

      this.setState({
        fetchedRules: true,
        rules
      }, () => this.afterSetState())
    }

    if (!fetchedEvents && events && events.length > 0) 
      this.setState({ fetchedEvents: true, events }, () => this.afterSetState())

    if (!fetchedSpecials && specials && specials.length > 0)
      this.setState({ fetchedSpecials: true, specials }, () => this.afterSetState());
  }

  getFilterItems() {
    const { locations } = this.state;
    let neighborhoods = [];
    let locationTags = [];

    for (let i = 0; i < locations.length; i++) {
      if (locations[i].neighborhood) {
        let items = locations[i].neighborhood.split(", ");

        for (let j = 0; j < items.length; j++)
          neighborhoods.push(items[j]);
      }

      if (locations[i].tags)
        for (let j = 0; j < locations[i].tags.length; j++)
          locationTags.push(locations[i].tags[j]);
    }

    this.setState({ neighborhoods: uniq(neighborhoods), locationTags: uniq(locationTags)}, () => this.afterSetState());
  }

  afterSetState() {
    const { planTemplates, fetchedLocations, fetchedLocationTypes, fetchedPlanTemplates, fetchedMetroCities, fetchedPlans, fetchedRules, fetchedEvents, fetchedSpecials } = this.state;
    // console.log(fetchedPlans, fetchedRules, fetchedLocations, fetchedPlanTemplates, fetchedMetroCities, fetchedLocationTypes, fetchedSpecials, fetchedEvents);

    if (fetchedPlanTemplates && fetchedLocationTypes && fetchedLocations && fetchedMetroCities && fetchedPlans && fetchedRules && fetchedEvents && fetchedSpecials)
      this.setState({ isReady: true });
  }

  fetchPlanTemplatesData({ search, order, include }) {
    const { fetchPlanTemplates } = this.props;
    this.setState({ fetchedPlanTemplates: false }, () => fetchPlanTemplates({ order, search, include }));
  }

  fetchMetroCityData() {
    const { fetchMetroCities } = this.props;
    this.setState({ fetchedMetroCities: false }, () => fetchMetroCities());
  }

  fetchLocationsData({ search, order, include, filters }) {
    const { fetchLocations } = this.props;
    this.setState({ fetchedLocations: false }, () => fetchLocations({ order, search, include, filters }));
  }

  fetchLocationTypesData({ search, order, filters }) {
    const { fetchLocationTypes } = this.props;
    this.setState({ search, fetchedLocationTypes: false }, () => fetchLocationTypes({ order, search, filters }));
  }

  fetchRulesData({ search, order, filters, limit, page }) {
    const { fetchRules } = this.props;
    this.setState({ fetchedRules: false }, () => fetchRules({ order, search, filters, limit, page }));
  }

  fetchPlansData({ search, order, include, filters, limit, page }) {
    const { fetchPlans } = this.props;
    this.setState({ search, fetchedPlans: false }, () => fetchPlans({ order, include, search, filters, limit, page })
      .then(() => this.setState({fetchedPlans: true})));
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

  render() {
    const { errorMessage, createPlan } = this.props;
    const { isReady, locations, locationTypes, metroCities, planTemplates, plans, rules, events, specials, locationTags, neighborhoods } = this.state;

    return (
      <Loading className="container" loaded={ isReady }>
        <PlanForm 
          isAutomate={true}
          errorMessage={errorMessage} 
          metroCities={metroCities} 
          locations={locations}
          locationTypes={locationTypes}
          planTemplates={planTemplates}
          plans={plans}
          rules={rules}
          events={events}
          specials={specials}
          neighborhoods={neighborhoods}
          locationTags={locationTags}
          onSave={plan => createPlan(plan)} 
        />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    planTemplates: state.planTemplates.items,
    locations: state.locations.items,
    locationTypes: state.locationTypes.items,
    metroCities: state.data.cities,
    plans: state.plans.items,
    rules: state.rules.items,
    events: state.events.items,
    specials: state.specials.items,
    currentUser: state.auth.currentUser
  }
}

export default connect(mapStateToProps, { createPlan, fetchPlanTemplates, fetchLocations, fetchLocationTypes, fetchMetroCities, fetchPlans, fetchRules, fetchEvents, fetchSpecials })(PlanAddPage);
