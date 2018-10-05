import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { deleteRule } from '../../actions/RuleActions';

import { RuleDelete } from '../../components';
import { Tabs } from '../../helpers';

class RuleDeletePage extends Component {
  render() {
    const { params: { itemID }, deleteRule } = this.props;
    return (
      <div className="container">
        <Tabs modelsName="rules" itemID={itemID} />
        <RuleDelete itemID={itemID} onDelete={id => deleteRule(id)} />
      </div>
    );
  }
}

export default connect(null, { deleteRule })(RuleDeletePage);