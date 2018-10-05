import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchPlanTemplate, updatePlanTemplate } from '../../actions/PlanTemplateActions';
import { fetchLocationTypes } from '../../actions/LocationTypeActions';

import { PlanTemplateForm } from '../../components';
import { Loading, Tabs } from '../../helpers';

class PlanTemplateAddPage extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    fetchPlanTemplate: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
    locationTypes: [],
    fetchedLocationTypes: false,
    order: '-createdAt',
  };

  componentDidMount() {
    const { params: { itemID }, fetchPlanTemplate, fetchLocationTypes } = this.props;
    const { order } = this.state;
    this.fetchLocationTypesData({ order });
    fetchPlanTemplate(itemID).then(() => this.setState({ fetched: true }));
  }

  fetchLocationTypesData({ search, order, filters }) {
    const { fetchLocationTypes } = this.props;
    this.setState({ search, fetchedLocationTypes: false }, 
      () => fetchLocationTypes({ order, search, filters })
      .then(() => this.setState({ fetchedLocationTypes: true })));
  }

  onSave(planTemplate) {
    const { params: { itemID }, item, errorMessage, updatePlanTemplate } = this.props;
    let newPlanTemplate = { location_types: [] };

    for (let i = 0; i < 3; i++)
      if (planTemplate.hasOwnProperty('location_type_' + i))
        newPlanTemplate.location_types.push(planTemplate['location_type_' + i].name);

    updatePlanTemplate(itemID, newPlanTemplate);
  }

  render() {
    const { params: { itemID }, item, errorMessage, updatePlanTemplate, locationTypes } = this.props;
    const { fetched, fetchedLocationTypes } = this.state;

    return (
      <Loading className="container" loaded={fetched && fetchedLocationTypes}>
        <Tabs modelsName="planTemplates" itemID={itemID} />
        <PlanTemplateForm item={item} errorMessage={errorMessage} locationTypes={locationTypes} onSave={planTemplate => this.onSave(planTemplate)} />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    errorMessage: state.planTemplates.errorMessage,
    locationTypes: state.locationTypes.items,
    item: state.planTemplates.item
  }
}

export default connect(mapStateToProps, { updatePlanTemplate, fetchPlanTemplate, fetchLocationTypes })(PlanTemplateAddPage);