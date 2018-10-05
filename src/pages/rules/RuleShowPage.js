import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchRule } from '../../actions/RuleActions';
import { fetchLocationTypes } from '../../actions/LocationTypeActions';

import { RuleItem } from '../../components';
import { Loading, Tabs } from '../../helpers';
import { snakenText } from '../../utils';

class RuleShowPage extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    fetchRule: PropTypes.func.isRequired,
    fetchLocationTypes: PropTypes.func.isRequired,
    locationTypeItems: PropTypes.array.isRequired
  };

  state = {
    order: '-createdAt',
    fetchedRule: false,
    fetchedLocationTypes: false,
    item: {},
    locationTypeItems: [],
    locationTypes: []
  };

  componentDidMount() {
    const { order } = this.state;
    const { params: { itemID }, fetchRule } = this.props;
    fetchRule(itemID).then(() => this.setState({ fetchedRule: true }));
    this.fetchLocationTypeData({ order });
  }

  componentWillReceiveProps (newProps) {
    const locationTypeItems = newProps.locationTypeItems;
    var locationTypes = [];

    if (locationTypeItems.length > 0){
      locationTypeItems.map(locationType => (
        locationTypes.push('locationtype_' + snakenText(locationType.name))
      ));
    }

    this.setState({
      locationTypeItems: newProps.locationTypeItems,
      item: newProps.item,
      locationTypes
    });
  }

  fetchLocationTypeData({ search, order, filters }) {
    const { fetchLocationTypes } = this.props;
    this.setState({ search, fetchedLocationTypes: false }, () => fetchLocationTypes({ order, search, filters })
      .then(() => this.setState({ fetchedLocationTypes: true })));
  }

  render() {
    const { params: { itemID } } = this.props;
    const { item, locationTypes, locationTypeItems, fetchedRule, fetchedLocationTypes } = this.state;
    return (
      <Loading className="container" loaded={ fetchedRule && fetchedLocationTypes }>
        <Tabs modelsName="rules" itemID={itemID} />
        <RuleItem item={item} locationTypes={locationTypes} locationTypeItems={locationTypeItems} />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    item: state.rules.item,
    locationTypeItems: state.locationTypes.items
  }
}

export default connect(mapStateToProps, { fetchRule, fetchLocationTypes })(RuleShowPage);
