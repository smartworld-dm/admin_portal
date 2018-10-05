import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchBoosts, fetchBoostsUnVerified } from '../../actions/BoostActions';
import { BoostsList, SearchForm } from '../../components';
import { LinkTo, Loading } from '../../helpers';

class BoostsIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    fetchBoosts: PropTypes.func.isRequired,
	fetchBoostsUnVerified: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
	fetchedUnVerified: false,
    search: '',
    order: '-createdAt',
  };

  componentDidMount() {
    const { order } = this.state;
    this.fetchData({ order });
  }

  fetchData({ search, order, filters, include }) {
    const { currentUser, fetchBoosts, fetchBoostsUnVerified } = this.props;
    this.setState({ search, fetched: false }, () => fetchBoosts({ order, search, filters }, currentUser)
  .then((res) => { this.setState({ fetched: true })}));
	fetchBoostsUnVerified({ order, search, filters }, currentUser).then((response) => { this.setState({ fetchedUnVerified: true })});  
  }

  render() {
    const { items, count, items_unverified, count_unverified } = this.props;
    const { fetched, fetchedUnVerified, order } = this.state;
	
    return (
	  <div>
      <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-4">
            {fetched ? <h4>Unverified Boosts ({count_unverified})</h4> : null}
          </div>
        </div>
      )} loaded={fetchedUnVerified}>
        <BoostsList items={items_unverified} />
      </Loading>
	  
	  <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="boosts/new">Create Boost</LinkTo>
          </div>
          <div className="col-md-4">
            {fetched ? <h4>Boosts ({count})</h4> : null}
          </div>
          <div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.fetchData({ search, order })} />
          </div>
        </div>
      )} loaded={fetched}>
        <BoostsList items={items} />
      </Loading>
	  </div>
    );
  }
}

export default connect(({
  auth: { currentUser },
  boosts: { items, count, items_unverified, count_unverified }
}) => ({ items, count, items_unverified, count_unverified, currentUser }), { fetchBoosts, fetchBoostsUnVerified })(BoostsIndexPage);
