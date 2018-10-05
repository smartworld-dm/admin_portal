import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { createGroup } from '../../actions/GroupActions';
import { fetchMetroCities } from '../../actions/DataActions';
import { fetchTags } from '../../actions/TagActions';

import { GroupForm } from '../../components';

import { Loading } from '../../helpers';

class GroupAddPage extends Component {
  state = {
    fetchedMetroCities: false,
    fetchedTags: false,
    metroCities:[],
    tags:[]
  }

  componentDidMount() {
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

  static propTypes = {
    createGroup: PropTypes.func.isRequired,
    fetchTags: PropTypes.func.isRequired,
    fetchMetroCities: PropTypes.func.isRequired
  };

  fetchMetroCityData() {
    const { fetchMetroCities } = this.props;
    this.setState({ fetchedMetroCities: false }, () => fetchMetroCities());
  }

  fetchTagData() {
    const { fetchTags } = this.props;
    this.setState({ fetchedTags: false }, () => fetchTags({}));
  }

  render() {
    const { errorMessage, createGroup } = this.props;
    const { tags, metroCities, fetchedTags, fetchedMetroCities } = this.state;

    return (
      <Loading className="container" loaded={ fetchedTags && fetchedMetroCities }>
        <GroupForm errorMessage={errorMessage} tags={tags} metroCities={metroCities} onSave={Group => createGroup(Group)} />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    metroCities: state.data.cities,
    tags: state.tags.items,
    errorMessage: state.groups.errorMessage
  }
}

export default connect(mapStateToProps, { createGroup, fetchMetroCities, fetchTags })(GroupAddPage);