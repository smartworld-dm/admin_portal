import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { createEventTag } from '../../actions/EventTagActions';

import { EventTagForm } from '../../components';

class EventTagAddPage extends Component {

  static propTypes = {
    createEventTag: PropTypes.func.isRequired
  };

  render() {
    const { errorMessage, createEventTag } = this.props;
    return (
      <div className="container">
        <EventTagForm errorMessage={errorMessage} onSave={EventTag => createEventTag(EventTag)} />
      </div>
    );
  }
}

export default connect(({ eventTags: { errorMessage } }) => ({ errorMessage }), { createEventTag })(EventTagAddPage);