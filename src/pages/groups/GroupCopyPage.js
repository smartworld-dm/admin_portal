import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchGroup, createGroup } from '../../actions/GroupActions';
import { fetchMetroCities } from '../../actions/DataActions';
import { fetchTags } from '../../actions/TagActions';

import { GroupForm } from '../../components';
import { Loading, Tabs } from '../../helpers';

class GroupAddPage extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    fetchGroup: PropTypes.func.isRequired
  };

  state = {
    fetchedMetroCities: false,
    fetchedTags: false,
    fetched: false,
    metroCities:[],
    tags:[]
  }

  componentDidMount() {
    const { params: { itemID }, fetchGroup } = this.props;
    fetchGroup(itemID, {}).then(() => this.setState({ fetched: true }));
    this.fetchMetroCityData();
    this.fetchTagData();
  }

  componentWillReceiveProps (newProps) {
    const { fetchedMetroCities, fetchedTags } = this.state;
    const { tags, metroCities } = newProps;

    if (!fetchedMetroCities && metroCities && metroCities.length > 0)
      this.setState({ metroCities, fetchedMetroCities: true });

    if (!fetchedTags && tags && tags.length > 0)
      this.setState({ tags, fetchedTags: true });
  }

  fetchMetroCityData() {
    const { fetchMetroCities } = this.props;
    this.setState({ fetchedMetroCities: false }, () => fetchMetroCities());
  }

  fetchTagData() {
    const { fetchTags } = this.props;
    this.setState({ fetchedTags: false }, () => fetchTags({}));
  }

  render() {
    const { params: { itemID  }, item, errorMessage, createGroup } = this.props;
    const { fetched, fetchedTags, fetchedMetroCities, tags, metroCities } = this.state;
    return (
      <Loading className="container" loaded={fetched && fetchedTags && fetchedMetroCities}>
        <GroupForm item={item} tags={tags} metroCities={metroCities} copy='copy' errorMessage={errorMessage} onSave={group => createGroup(group)} />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    metroCities: state.data.cities,
    tags: state.tags.items,
    errorMessage: state.groups.errorMessage,
    item: state.groups.item
  }
}

export default connect(mapStateToProps, { createGroup, fetchGroup, fetchTags, fetchMetroCities })(GroupAddPage);