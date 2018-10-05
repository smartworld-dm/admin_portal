import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchPlazaOffer, updatePlazaOffer } from '../../actions/PlazaOffersActions';

import { PlazaOfferForm } from '../../components';
import { Loading, Tabs } from '../../helpers';

class PlazaOfferAddPage extends Component {

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
    const { params: { itemID }, item, errorMessage, updatePlazaOffer } = this.props;
    const { fetched } = this.state;
    return (
      <Loading className="container" loaded={fetched}>
        <Tabs modelsName="plazaOffers" itemID={itemID} />
        <PlazaOfferForm item={item} errorMessage={errorMessage} onSave={plazaOffer => updatePlazaOffer(itemID, plazaOffer, item)} />
      </Loading>
    );
  }
}

export default connect(({ plazaOffers: { item, errorMessage } }) => ({ item, errorMessage }), { updatePlazaOffer, fetchPlazaOffer })(PlazaOfferAddPage);