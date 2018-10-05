import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { createRule, fetchRules } from '../../actions/RuleActions';
import { fetchLocationTypes } from '../../actions/LocationTypeActions';
import { fetchMetroCities } from '../../actions/DataActions';

import { RuleForm } from '../../components';
import { Loading } from '../../helpers';
import { snakenText } from '../../utils';

class RuleAddPage extends Component {

  static propTypes = {
    locationTypeItems: PropTypes.array.isRequired,
    createRule: PropTypes.func.isRequired,
    fetchRules: PropTypes.func.isRequired,
    fetchLocationTypes: PropTypes.func.isRequired,
    fetchMetroCities: PropTypes.func.isRequired
  };

  state = {
    order: '-createdAt',
    fetchedRules: false,
    fetchedLocationTypes: false,
    fetchedMetroCities: false,
    locationTypeItems: [],
    locationTypes: [],
    metroCities:[],
    rules: []
  };

  componentDidMount() {
    const { order } = this.state;
    this.fetchLocationTypeData({ order });
    this.fetchMetroCityData();
    this.fetchRuleData({ order });
  }

  componentWillReceiveProps (newProps) {
    const { locationTypeItems, errorMessage, rules, metroCityItems } = newProps;

    if (locationTypeItems && rules && metroCityItems) {
      var locationTypes = [];

      if (locationTypeItems.length > 0){
        locationTypeItems.map(locationType => (
          locationTypes.push('locationtype_' + snakenText(locationType.name))
        ));
      }

      this.setState({
        fetchedLocationTypes: true,
        fetchedRules: true,
        fetchedMetroCities: true,
        errorMessage: newProps.errorMessage,
        locationTypeItems,
        locationTypes,
        metroCityItems,
        rules
      });
    }
  }

  fetchLocationTypeData({ search, order, filters }) {
    const { fetchLocationTypes } = this.props;
    this.setState({ search, fetchedLocationTypes: false }, () => fetchLocationTypes({ order, search, filters }));
  }

  fetchMetroCityData() {
    const { fetchMetroCities } = this.props;
    fetchMetroCities();
  }

  fetchRuleData({ search, order, filters, limit, page }) {
    const { fetchRules } = this.props;
    this.setState({ search, fetchedRules: false }, () => fetchRules({ order, search, filters, limit, page }));
  }

  render() {
    const { locationTypeItems, rules, locationTypes, metroCityItems, fetchedLocationTypes, fetchedMetroCities, fetchedRules } = this.state;
    const { errorMessage, createRule } = this.props;
    return (
      <Loading className="container"
        loaded={fetchedLocationTypes && fetchedMetroCities && fetchedRules}>
        <RuleForm errorMessage={errorMessage} rules={rules} locationTypes={locationTypes} locationTypeItems={locationTypeItems} metroCityItems={metroCityItems} onSave={rule => createRule(rule)} />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    rules: state.rules.items,
    errorMessage: state.rules.errorMessage,
    locationTypeItems: state.locationTypes.items,
    metroCityItems: state.data.cities
  }
}

export default connect(mapStateToProps, { createRule, fetchRules, fetchLocationTypes, fetchMetroCities })(RuleAddPage);