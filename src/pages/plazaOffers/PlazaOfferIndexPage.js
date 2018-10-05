import React, { Component, PropTypes } from 'react';
import { Pagination } from 'react-bootstrap';
import { connect } from 'react-redux';

import { fetchPlazaOffers } from '../../actions/PlazaOffersActions';
import { PlazaOffersList, SearchForm } from '../../components';
import { LinkTo, Loading } from '../../helpers';

class PlazaOfferIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    fetchPlazaOffers: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
    search: '',
    limit: 30,
    page: 1,
    order: '-createdAt',
    include: 'locations.location'
  };

  componentDidMount() {
    const { order, include, limit, page } = this.state;
    this.fetchData({ order, include, limit, page });
  }

  fetchData({ search, order, include, filters, limit, page }) {
    const { fetchPlazaOffers } = this.props;
    this.setState({ search, fetched: false }, () => fetchPlazaOffers({ order, include, search, filters, limit, page })
  .then((aa) => this.setState({ fetched: true })));
  }

  render() {
    const { items, count } = this.props;
    const { fetched, order, include, limit, page } = this.state;
    return (
      <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="plazaOffers/new">Create Plaza Offer</LinkTo>
          </div>
          <div className="col-md-4">
            {fetched ? <h4>Plaza Offers ({count})</h4> : null}
          </div>
          <div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.fetchData({ search, order, include, limit, page: 1 })} />
          </div>
        </div>
      )} loaded={fetched}>
        <PlazaOffersList items={items} />
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
      </Loading>
    );
  }
}

export default connect(({ plazaOffers: { items, count } }) => ({ items, count }), { fetchPlazaOffers })(PlazaOfferIndexPage);
