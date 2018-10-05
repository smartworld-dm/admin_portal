import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchRule, updateRule } from '../../actions/RuleActions';
import { fetchLocationTypes } from '../../actions/LocationTypeActions';
import { fetchMetroCities } from '../../actions/DataActions';

import { RuleForm } from '../../components';
import { Loading, Tabs } from '../../helpers';
import { snakenText } from '../../utils';

class RuleAddPage extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    fetchRule: PropTypes.func.isRequired,
    fetchLocationTypes: PropTypes.func.isRequired,
    locationTypeItems: PropTypes.array.isRequired,
    fetchMetroCities: PropTypes.func.isRequired
  };

  state = {
    order: '-createdAt',
    fetchedRule: false,
    fetchedLocationTypes: false,
    fetchedMetroCities: false,
    item: {},
    locationTypeItems: [],
    metroCities:[],
    locationTypes: []
  };

  componentDidMount() {
    const { order } = this.state;
    const { params: { itemID }, fetchRule } = this.props;
    fetchRule(itemID, {});
    this.fetchLocationTypeData({ order });
    this.fetchMetroCityData();
  }

  componentWillReceiveProps (newProps) {
    const { locationTypeItems, item, metroCityItems } = newProps;

    if (locationTypeItems && item && metroCityItems) {
      var locationTypes = [];

      if (locationTypeItems.length > 0){
        locationTypeItems.map(locationType => (
          locationTypes.push('locationtype_' + snakenText(locationType.name))
        ));
      }

      this.setState({
        fetchedLocationTypes: true,
        fetchedRule: true,
        fetchedMetroCities: true,
        locationTypeItems,
        item,
        locationTypes,
        metroCityItems
      });
    }
  }

  fetchLocationTypeData({ search, order, filters }) {
    const { fetchLocationTypes } = this.props;
    this.setState({ search, fetchedLocationTypes: false }, 
      () => fetchLocationTypes({ order, search, filters }));
  }

  fetchMetroCityData() {
    const { fetchMetroCities } = this.props;
    fetchMetroCities();
  }

  render() {
    const { params: { itemID }, updateRule } = this.props;
    const { item, errorMessage, metroCityItems, locationTypes, locationTypeItems, fetchedRule, fetchedLocationTypes, fetchedMetroCities } = this.state;
    return (
      <Loading className="container" loaded={fetchedRule && fetchedLocationTypes && fetchMetroCities}>
        <Tabs modelsName="rules" itemID={itemID} />
        <RuleForm item={item} errorMessage={errorMessage} locationTypeItems={locationTypeItems} locationTypes={locationTypes} metroCityItems={metroCityItems} onSave={rule => updateRule(itemID, rule, item)} />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    item: state.rules.item,
    errorMessage: state.rules.errorMessage,
    locationTypeItems: state.locationTypes.items,
    metroCityItems: state.data.cities
  }
}

export default connect(mapStateToProps, { updateRule, fetchRule, fetchLocationTypes, fetchMetroCities })(RuleAddPage);