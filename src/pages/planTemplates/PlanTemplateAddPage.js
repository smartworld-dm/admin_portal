import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { createPlanTemplate } from '../../actions/PlanTemplateActions';
import { fetchLocationTypes } from '../../actions/LocationTypeActions';

import { PlanTemplateForm } from '../../components';

import { Loading, Tabs } from '../../helpers';

class PlanTemplateAddPage extends Component {
  state = {
    locationTypes: [],
    fetchedLocationTypes: false,
    order: '-createdAt'
  }

  static propTypes = {
    createPlanTemplate: PropTypes.func.isRequired,
    fetchLocationTypes: PropTypes.func.isRequired
  };

  componentDidMount() {
    const { order } = this.state;
    this.fetchLocationTypesData({ order });
  }

  fetchLocationTypesData({ search, order, filters }) {
    const { fetchLocationTypes } = this.props;
    this.setState({ search, fetchedLocationTypes: false }, 
      () => fetchLocationTypes({ order, search, filters })
      .then(() => this.setState({ fetchedLocationTypes: true })));
  }

  onSave(planTemplate) {
    const { createPlanTemplate } = this.props;
    let newPlanTemplate = { location_types: [] };
    console.log(planTemplate);
    for (let i = 0; i < 3; i++)
      if (planTemplate.hasOwnProperty('location_type_' + i))
        newPlanTemplate.location_types.push(planTemplate['location_type_' + i].name);

    createPlanTemplate(newPlanTemplate);
  }

  render() {
    const { errorMessage, createPlanTemplate, locationTypes } = this.props;
    const { fetchedLocationTypes } = this.state;

    return (
      <Loading className="container" loaded={fetchedLocationTypes}>
        <PlanTemplateForm errorMessage={errorMessage} locationTypes={locationTypes} onSave={planTemplate => this.onSave(planTemplate)} />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    errorMessage: state.planTemplates.errorMessage,
    locationTypes: state.locationTypes.items,
  }
}

export default connect(mapStateToProps, { createPlanTemplate, fetchLocationTypes })(PlanTemplateAddPage);