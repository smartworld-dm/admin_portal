import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchGroup, updateGroup } from '../../actions/GroupActions';
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
    fetched: false,
    fetchedMetroCities: false,
    fetchedTags: false,
    metroCities:[],
    tags:[]
  };

  componentDidMount() {
    const { params: { itemID }, fetchGroup } = this.props;
    fetchGroup(itemID).then(() => this.setState({ fetched: true }));
    this.fetchMetroCityData();
    this.fetchTagData();
  }

  componentWillReceiveProps (newProps) {
    const { fetchedMetroCities, fetchedTags } = this.state;
    const { tags, metroCities } = newProps;

    if (!fetchedMetroCities && metroCities && metroCities.length > 0) {

      this.setState({ 
        metroCities,
        fetchedMetroCities: true
      });
    }

    if (!fetchedTags && tags && tags.length > 0) {
      this.setState({ 
        tags,
        fetchedTags: true
      });
    }
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
    const { params: { itemID }, item, errorMessage, updateGroup } = this.props;
    const { tags, metroCities, fetchedTags, fetchedMetroCities, fetched } = this.state;

    return (
      <Loading className="container" loaded={fetched && fetchedTags && fetchMetroCities}>
        <Tabs modelsName="Groups" itemID={itemID} />
        <GroupForm item={item} errorMessage={errorMessage} tags={tags} metroCities={metroCities} onSave={Group => updateGroup(itemID, Group, item)} />
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

export default connect(mapStateToProps, { updateGroup, fetchGroup, fetchMetroCities, fetchTags })(GroupAddPage);