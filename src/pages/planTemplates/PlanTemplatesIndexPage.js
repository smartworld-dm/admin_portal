import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchPlanTemplates } from '../../actions/PlanTemplateActions';
import { PlanTemplatesList, SearchForm } from '../../components';
import { LinkTo, Loading } from '../../helpers';

class PlanTemplatesIndexPage extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    fetchPlanTemplates: PropTypes.func.isRequired
  };

  state = {
    fetched: false,
    search: '',
    order: '-createdAt'
  };

  componentDidMount() {
    const { order } = this.state;
    this.fetchData({ order });
  }

  fetchData({ search, order, filters }) {
    const { fetchPlanTemplates } = this.props;
    this.setState({ search, fetched: false }, () => fetchPlanTemplates({ order, search, filters })
      .then(() => this.setState({ fetched: true })));
  }

  render() {
    const { items, count } = this.props;
    const { fetched, order } = this.state;

    return (
      <Loading className="container" ignoreLoader={(
        <div className="row m-b">
          <div className="col-md-2">
            <LinkTo className="btn btn-success" url="planTemplates/new">Create PlanTemplate</LinkTo>
          </div>
          <div className="col-md-4">
            {fetched ? <h4>PlanTemplates ({count})</h4> : null}
          </div>
          <div className="col-md-6 text-right">
            <SearchForm onSearch={({ search }) => this.fetchData({ search, order })} />
          </div>
        </div>
      )} loaded={fetched}>
        <PlanTemplatesList items={items} />
      </Loading>
    );
  }
}

export default connect(({ planTemplates: { items, count } }) => ({ items, count }), { fetchPlanTemplates })(PlanTemplatesIndexPage);
