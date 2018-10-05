import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchGroup } from '../../actions/GroupActions';

import { GroupItem } from '../../components';
import { Loading, Tabs } from '../../helpers';

class GroupShowPage extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    fetchGroup: PropTypes.func.isRequired
  };

  state = {
    fetched: false
  };

  componentDidMount() {
    const { params: { itemID }, fetchGroup } = this.props;
    fetchGroup(itemID).then(() => this.setState({ fetched: true }));
  }

  render() {
    const { params: { itemID }, item } = this.props;
    const { fetched } = this.state;
    return (
      <Loading className="container" loaded={fetched}>
        <Tabs modelsName="groups" itemID={itemID} />
        <GroupItem item={item} />
      </Loading>
    );
  }
}

export default connect(({ groups: { item } }) => ({ item }), { fetchGroup })(GroupShowPage);
