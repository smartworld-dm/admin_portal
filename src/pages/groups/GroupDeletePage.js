import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { deleteGroup } from '../../actions/GroupActions';

import { GroupDelete } from '../../components';
import { Tabs } from '../../helpers';

class GroupDeletePage extends Component {
  render() {
    const { params: { itemID }, deleteGroup } = this.props;
    return (
      <div className="container">
        <Tabs modelsName="Groups" itemID={itemID} />
        <GroupDelete itemID={itemID} onDelete={id => deleteGroup(id)} />
      </div>
    );
  }
}

export default connect(null, { deleteGroup })(GroupDeletePage);