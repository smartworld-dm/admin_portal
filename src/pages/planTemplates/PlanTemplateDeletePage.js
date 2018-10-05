import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { deletePlanTemplate } from '../../actions/PlanTemplateActions';

import { PlanTemplateDelete } from '../../components';
import { Tabs } from '../../helpers';

class PlanTemplateDeletePage extends Component {
  render() {
    const { params: { itemID }, deletePlanTemplate } = this.props;
    return (
      <div className="container">
        <Tabs modelsName="planTemplates" itemID={itemID} />
        <PlanTemplateDelete itemID={itemID} onDelete={id => deletePlanTemplate(id)} />
      </div>
    );
  }
}

export default connect(null, { deletePlanTemplate })(PlanTemplateDeletePage);