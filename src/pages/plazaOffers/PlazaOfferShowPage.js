import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchPlazaOffer } from '../../actions/PlazaOffersActions';

import { PlazaOfferItem } from '../../components';
import { Loading, Tabs } from '../../helpers';

class PlazaOfferShowPage extends Component {

  static propTypes = {
    item: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    fetchPlazaOffer: PropTypes.func.isRequired
  };

  state = {
    fetched: false
  };

  componentDidMount() {
    const { params: { itemID }, fetchPlazaOffer } = this.props;
    fetchPlazaOffer(itemID, {}).then(() => this.setState({ fetched: true }));
  }

  render() {
    const { params: { itemID }, item } = this.props;
    const { fetched } = this.state;
    return (
      <Loading className="container" loaded={fetched}>
        <Tabs modelsName="plazaOffers" itemID={itemID} />
        <PlazaOfferItem item={item} />
      </Loading>
    );
  }
}

export default connect(({ plazaOffers: { item } }) => ({ item }), { fetchPlazaOffer })(PlazaOfferShowPage);
