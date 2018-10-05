import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchEventTags } from '../../actions/EventTagActions';
import { EventTagsList, SearchForm } from '../../components';
import { LinkTo, Loading } from '../../helpers';

class EventTagsIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    fetchEventTags: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
    search: '',
    order: '-is_feature_tag'
  };

  componentDidMount() {
    const { order } = this.state;
    this.fetchData({ order });
  }

  fetchData({ search, order, filters }) {
    const { fetchEventTags } = this.props;
    this.setState({ search, fetched: false }, () => fetchEventTags({ order, search, filters })
      .then(() => this.setState({ fetched: true })));
  }

  render() {
    const { items, count } = this.props;
    const { fetched, order } = this.state;

    return (
      <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="eventTags/new">Create Tag</LinkTo>
          </div>
          <div className="col-md-4">
            {fetched ? <h4>Tags ({count})</h4> : null}
          </div>
          <div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.fetchData({ search, order })} />
          </div>
        </div>
      )} loaded={fetched}>
        <EventTagsList items={items} />
      </Loading>
    );
  }
}

export default connect(({ eventTags: { items, count } }) => ({ items, count }), { fetchEventTags })(EventTagsIndexPage);
