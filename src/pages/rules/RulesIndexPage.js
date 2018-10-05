import React, { Component, PropTypes } from 'react';
import { Pagination } from 'react-bootstrap';
import { connect } from 'react-redux';

import { fetchRules } from '../../actions/RuleActions';
import { fetchLocationTypes } from '../../actions/LocationTypeActions';
import { RulesList, SearchForm } from '../../components';
import { LinkTo, Loading } from '../../helpers';

class RulesIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    locationTypeItems: PropTypes.array.isRequired,
    fetchRules: PropTypes.func.isRequired,
    fetchLocationTypes: PropTypes.func.isRequired
  };

  state = {
    fetchedRules: false,
    fetchedLocationTypes: false,
    search: '',
    limit: 30,
    page: 1,
    order: '-createdAt',
    items: [],
    locationTypeItems: []
  };

  componentDidMount() {
    const { order, limit, page } = this.state;
    this.fetchRuleData({ order, limit, page });
    this.fetchLocationTypeData({ order });
  }

  componentWillReceiveProps (newProps) {
    this.setState({
      items: newProps.items,
      count: newProps.count, 
      locationTypeItems: newProps.locationTypeItems
    });
  }

  fetchLocationTypeData({ search, order, filters }) {
    const { fetchLocationTypes } = this.props;
    this.setState({ search, fetchedLocationTypes: false }, () => fetchLocationTypes({ order, search, filters })
      .then(() => this.setState({ fetchedLocationTypes: true })));
  }

  fetchRuleData({ search, order, filters, limit, page }) {
    const { fetchRules } = this.props;
    this.setState({ search, fetchedRules: false }, () => fetchRules({ order, search, filters, limit, page })
      .then(() => this.setState({ fetchedRules: true })));
  }

  render() {
    const { items, count, locationTypeItems } = this.state;
    const { fetchedRules, fetchedLocationTypes, order, limit, page } = this.state;
    return (
      <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="rules/new">Create Rule</LinkTo>
          </div>
          <div className="col-md-4">
            {fetchedRules && fetchedLocationTypes? <h4>Rules ({count})</h4> : null}
          </div>
          <div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.fetchRuleData({ search, order, limit, page: 1 })} />
          </div>
        </div>
      )} loaded={fetchedRules && fetchedLocationTypes}>
      <RulesList items={items} locationTypeItems={locationTypeItems} />
      </Loading>
    );
  }
}

function mapStateToProps(state) {
  return {
    items: state.rules.items,
    count: state.rules.count,
    locationTypeItems: state.locationTypes.items
  }
}

export default connect(mapStateToProps, { fetchRules, fetchLocationTypes })(RulesIndexPage);