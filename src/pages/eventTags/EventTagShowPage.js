import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchEventTag } from '../../actions/EventTagActions';

import { EventTagItem } from '../../components';
import { Loading, Tabs } from '../../helpers';

class EventTagShowPage extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    fetchEventTag: PropTypes.func.isRequired
  };

  state = {
    fetched: false
  };

  componentDidMount() {
    const { params: { itemID }, fetchEventTag } = this.props;
    fetchEventTag(itemID).then(() => this.setState({ fetched: true }));
  }

  render() {
    const { params: { itemID }, item } = this.props;
    const { fetched } = this.state;
    return (
      <Loading className="container" loaded={fetched}>
        <Tabs modelsName="eventTags" itemID={itemID} />
        <EventTagItem item={item} />
      </Loading>
    );
  }
}

export default connect(({ eventTags: { item } }) => ({ item }), { fetchEventTag })(EventTagShowPage);
