import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import moment from 'moment';

import { fetchPlans } from '../../actions/PlanActions';
import { fetchLocations, fetchLocationsVerified } from '../../actions/LocationActions';
import { fetchMetroCities } from '../../actions/DataActions';

import { LocationsList, SearchForm } from '../../components';

import { LinkTo, Loading } from '../../helpers';

class LocationsIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    fetchLocations: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
	  fetchedVerified: false,
    fetchedMetroCities: false,
    fetchedPlans: false,
    search: '',
    metroCities:[],
    include: 'location_type',
    order: '-createdAt',
    locations: [],
    plans: [],
  };

  componentDidMount() {
    const { include, order } = this.state;
    this.fetchAllPlans({ order });
    this.fetchData({ include, order });
	  this.fetchDataVerified({ include, order });
    this.fetchMetroCityData();
  }

  componentWillReceiveProps(newProps) {
    const { metroCities, locations, plans } = newProps;
    const { fetchedMetroCities, fetched, fetchedPlans } = this.state;

    if (!fetched && fetchedPlans && locations && locations.length > 0) {
      this.setState({ fetched: true, locations }, () => this.afterSetState());
    }

    if (!fetchedMetroCities && metroCities && metroCities.length > 0)
      this.setState({ fetchedMetroCities: true, metroCities });

    if (!fetchedPlans && plans && plans.length > 0)
      this.setState({ fetchedPlans: true, plans });
  }

  afterSetState() {
  }

  fetchData({ search, include, order, filters }) {
    const { fetchLocations } = this.props;
    this.setState({ search, fetched: false }, () => fetchLocations({ order, search, include, filters }));
  }
  
  fetchDataVerified({ search, include, order, filters }) {
    const { fetchLocationsVerified } = this.props;
    this.setState({ search, fetchedVerified: false }, () => fetchLocationsVerified({ order, search, include, filters })
      .then(() => this.setState({ fetchedVerified: true })));
  }

  fetchAllPlans({ search, order, include, filters, limit, page }) {
    const { fetchPlans } = this.props;
    this.setState({ search, fetchedPlans: false }, () => fetchPlans({ order, include, search, filters, limit, page }));
  }

  fetchMetroCityData() {
    const { fetchMetroCities } = this.props;
    this.setState({ fetchedMetroCities: false }, () => fetchMetroCities());
  }

  render() {
    const { items, count, itemsVerified, countVerified } = this.props;
    const { include, fetched, order, fetchedVerified, metroCities, locations } = this.state;

    return (
	  <div>
       <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          {/*<div className="col-md-2">
            <LinkTo className="btn btn-success" url="locations/new">Create Location</LinkTo>
          </div>*/}
          <div className="col-md-4">
            {fetched ? <h4>Verified Locations ({countVerified})</h4> : null}
          </div>
          {/*<div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.fetchData({ search, include, order })} />
          </div>*/}
        </div>
      )} loaded={fetchedVerified}>
        <LocationsList items={itemsVerified} />
      </Loading>
	  
	  <Loading className="container locations-list" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="locations/new">Create Location</LinkTo>
          </div>
          <div className="col-md-4">
            {fetched ? <h4>Locations ({count})</h4> : null}
          </div>
          <div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.fetchData({ search, include, order })} />
          </div>
        </div>
      )} loaded={fetched}>
        <LocationsList items={items} />
      </Loading>
	  </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    plans: state.plans.items,
    items: state.locations.items,
    locations: state.locations.items,
    count: state.locations.count,
    itemsVerified: state.locations.itemsVerified,
    countVerified: state.locations.countVerified,
    metroCities: state.data.cities
  }
}

export default connect(mapStateToProps, { fetchLocations, fetchLocationsVerified, fetchMetroCities, fetchPlans })(LocationsIndexPage);
