import React, { Component, PropTypes } from 'react';
import { Pagination } from 'react-bootstrap';
import { connect } from 'react-redux';

import { fetchSeries } from '../../actions/SeriesActions';
import { SeriesList, SearchForm } from '../../components';
import { LinkTo, Loading } from '../../helpers';

class SeriesIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    fetchSeries: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
    search: '',
    limit: 30,
    page: 1,
    order: '-createdAt',
    include: 'plans,plans.locations.location'
  };

  componentDidMount() {
    const { order, include, limit, page } = this.state;
    this.fetchData({ order, include, limit, page });
  }

  fetchData({ search, order, include, filters, limit, page }) {
    const { fetchSeries } = this.props;
    this.setState({ search, fetched: false }, () => fetchSeries({ order, include, search, filters, limit, page })
      .then(() => this.setState({ fetched: true })));
  }

  render() {
    const { items, count } = this.props;
    const { fetched, order, include, limit, page } = this.state;
    return (
      <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="series/new">Create Series</LinkTo>
          </div>
          <div className="col-md-4">
            {fetched ? <h4>Series ({count})</h4> : null}
          </div>
          <div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.fetchData({ search, order, include, limit, page: 1 })} />
          </div>
        </div>
      )} loaded={fetched}>
        <SeriesList items={items} />
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
              onSelect={p => this.setState({ page: p }, () => this.fetchData({ order, limit, page: this.state.page }))}
            />
          ) : null}
      </Loading>
    );
  }
}

export default connect(({ series: { items, count } }) => ({ items, count }), { fetchSeries })(SeriesIndexPage);
