import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchASeries, updateSeries } from '../../actions/SeriesActions';

import { SeriesForm } from '../../components';
import { Loading, Tabs } from '../../helpers';

class SeriesEditPage extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    fetchASeries: PropTypes.func.isRequired
  };

  state = {
    fetched: false
  };

  componentDidMount() {
    const { params: { itemID }, fetchASeries } = this.props;
    fetchASeries(itemID, {}).then(() => this.setState({ fetched: true }));
  }

  render() {
    const { params: { itemID }, item, errorMessage, updateSeries } = this.props;
    const { fetched } = this.state;
    return (
      <Loading className="container" loaded={fetched}>
        <Tabs modelsName="series" itemID={itemID} />
        <SeriesForm item={item} errorMessage={errorMessage} onSave={series => updateSeries(itemID, series, item)} />
      </Loading>
    );
  }
}

export default connect(({ series: { item, errorMessage } }) => ({ item, errorMessage }), { updateSeries, fetchASeries })(SeriesEditPage);
