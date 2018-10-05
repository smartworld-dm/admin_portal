import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { deleteEventTag } from '../../actions/EventTagActions';

import { EventTagDelete } from '../../components';
import { Tabs } from '../../helpers';

class EventTagDeletePage extends Component {
  render() {
    const { params: { itemID }, deleteEventTag } = this.props;
    return (
      <div className="container">
        <Tabs modelsName="eventTags" itemID={itemID} />
        <EventTagDelete itemID={itemID} onDelete={id => deleteEventTag(id)} />
      </div>
    );
  }
}

export default connect(null, { deleteEventTag })(EventTagDeletePage);