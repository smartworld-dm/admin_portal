import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchSpecials } from '../../actions/SpecialActions';
import { fetchLocations } from '../../actions/LocationActions';

import { SpecialsList, SearchForm } from '../../components';

import { LinkTo, Loading } from '../../helpers';

import uniq from 'lodash/uniq';

class SpecialsIndexPage extends Component {

  static propTypes = {
    fetchSpecials: PropTypes.func.isRequired,
    fetchLocations: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
    fetchedAllSpecials: false,
    fetchedLocations: false,
    search: null,
    order: '-createdAt',
    specials: [],
    locations: [],
    allSpecials: [],
    locationNames: [],
    filteredNames: [],
    filteredSpecial: []
  };

  componentDidMount() {
    const { order } = this.state;
    this.fetchData({ order });
    this.fetchLocationsData({ order });
  }

  componentWillReceiveProps (newProps) {
    const { fetched, fetchedAllSpecials, fetchedLocations, search, allSpecials } = this.state;
    const { specials, locations, count } = newProps;

    if (!search) {
      if (allSpecials.length > 0)
        this.setState({ fetched: true, count }, () => this.afterSetState(2, allSpecials));
      else
        this.setState({ specials: specials, fetched: true, count });
    } else {
      this.setState({ fetched: true }, () => this.afterSetState(2, specials));
    }

    if (!fetchedAllSpecials && specials && specials.length > 0) {
      this.setState({ 
        allSpecials: specials,
        fetchedAllSpecials: true
      }, () => this.afterSetState(1));
    }

    if (!fetchedLocations && locations && locations.length > 0) {
      this.setState({ 
        locations,
        fetchedLocations: true
      }, () => this.afterSetState(1));
    }
  }

  afterSetState(num, specials) {
    const { fetched, fetchedAllSpecials, fetchedLocations, search, allSpecials } = this.state;

    if (num === 2 && !search)
      this.setState({ filteredNames: this.getLocationNames(), specials: allSpecials, count: allSpecials.length });

    if (num === 1 && fetchedAllSpecials && fetchedLocations) {
      let locationNames = this.getLocationNames();
      this.setState({ filteredNames: locationNames });
    }

    if (num === 2 && search && fetched) {
      let locationNames = this.getLocationNames();
      let filteredSpecials = [];

      for (let i = 0; i < locationNames.length; i++) {
        if (locationNames[i].toLowerCase().indexOf(search) > -1) {
          filteredSpecials.push(allSpecials[i]);
        }
      }

      let temp = [];
      for (let i = 0; i < specials.length; i++)
        temp.push(specials[i]);
      for (let j = 0; j < filteredSpecials.length; j++)
        temp.push(filteredSpecials[j]);

      let names = [];
      let newSpecials = [];
      for (let i = 0; i < allSpecials.length; i++) {
        for (let j = 0; j < temp.length; j++) {
          if (allSpecials[i].objectId === temp[j].objectId) {
            names.push(locationNames[i]);
            newSpecials.push(allSpecials[i]);
            break;
          }
        }
      }

      this.setState({ filteredNames: names, specials: newSpecials, count: newSpecials.length });
    }
  }

  fetchData({ search, order, filters, include }) {
    const { currentUser, fetchSpecials } = this.props;
    let fakeUser = {"is_admin": true};
    this.setState({ search, fetched: false }, () => fetchSpecials({ order, search, filters }, fakeUser));
  }

  fetchLocationsData({ search, order, include, filters }) {
    const { fetchLocations } = this.props;
    this.setState({ fetchedLocations: false }, () => fetchLocations({ order, search, include, filters }));
  }

  getLocationNames() {
    const { allSpecials, locations } = this.state;
    let locationNames = [];

    allSpecials.map((special, index) => {
      let flag = false;
      locationNames[index] = '';

      locations.map((location) => {
        if (special.location_pointer)
          if (special.location_pointer.objectId === location.objectId)
            locationNames[index] = location.name;
      });
    });

    return locationNames;
  }

  onSearch({ search }) {
    const { order } = this.state;
    this.fetchData({ search, order });
    this.setState({ search });
  }

  render() {
    const { fetched, fetchedLocations, fetchedAllSpecials, order, specials, locations, filteredNames, count } = this.state;

    return (
      <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="specials/new">Create Special</LinkTo>
          </div>
          <div className="col-md-4">
            {fetched ? <h4>Specials ({count})</h4> : null}
          </div>
          <div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.onSearch({ search })} />
          </div>
        </div>
      )} loaded={(fetched && fetchedLocations && fetchedAllSpecials)}>
        <SpecialsList items={specials} locationNames={filteredNames} />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    locations: state.locations.items,
    specials: state.specials.items,
    count: state.specials.count,
    currentUser: state.auth.currentUser
  }
}

export default connect(mapStateToProps, { fetchSpecials, fetchLocations })(SpecialsIndexPage);
