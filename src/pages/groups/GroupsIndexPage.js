import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchGroups } from '../../actions/GroupActions';
import { GroupsList, SearchForm } from '../../components';
import { LinkTo, Loading } from '../../helpers';

class GroupsIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    fetchGroups: PropTypes.func.isRequired
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
    const { fetchGroups } = this.props;
    this.setState({ search, fetched: false }, () => fetchGroups({ order, search, filters })
      .then(() => this.setState({ fetched: true })));
  }

  render() {
    const { items, count } = this.props;
    const { fetched, order } = this.state;

    return (
      <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="groups/new">Create Group</LinkTo>
          </div>
          <div className="col-md-4">
            {fetched ? <h4>Groups ({count})</h4> : null}
          </div>
          <div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.fetchData({ search, order })} />
          </div>
        </div>
      )} loaded={fetched}>
        <GroupsList items={items} />
      </Loading>
    );
  }
}

export default connect(({ groups: { items, count } }) => ({ items, count }), { fetchGroups })(GroupsIndexPage);
