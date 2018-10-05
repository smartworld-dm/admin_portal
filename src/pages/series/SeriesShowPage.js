import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchASeries } from '../../actions/SeriesActions';

import { SeriesItem } from '../../components';
import { Loading, Tabs } from '../../helpers';

class SeriesShowPage extends Component {

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
    const { params: { itemID }, item } = this.props;
    const { fetched } = this.state;
    return (
      <Loading className="container" loaded={fetched}>
        <Tabs modelsName="series" itemID={itemID} />
        <SeriesItem item={item} />
      </Loading>
    );
  }
}

export default connect(({ series: { item } }) => ({ item }), { fetchASeries })(SeriesShowPage);
