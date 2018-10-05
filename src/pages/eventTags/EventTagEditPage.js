import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchEventTag, updateEventTag } from '../../actions/EventTagActions';

import { EventTagForm } from '../../components';
import { Loading, Tabs } from '../../helpers';

class EventTagAddPage extends Component {

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
    const { params: { itemID }, item, errorMessage, updateEventTag } = this.props;
    const { fetched } = this.state;
    return (
      <Loading className="container" loaded={fetched}>
        <Tabs modelsName="eventTags" itemID={itemID} />
        <EventTagForm item={item} errorMessage={errorMessage} onSave={eventTag => updateEventTag(itemID, eventTag, item)} />
      </Loading>
    );
  }
}

export default connect(({ eventTags: { item, errorMessage } }) => ({ item, errorMessage }), { updateEventTag, fetchEventTag })(EventTagAddPage);