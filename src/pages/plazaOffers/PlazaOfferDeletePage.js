import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { deletePlazaOffer } from '../../actions/PlazaOffersActions';

import { PlazaOfferDelete } from '../../components';
import { Tabs } from '../../helpers';

class PlazaOfferDeletePage extends Component {
  render() {
    const { params: { itemID }, deletePlazaOffer } = this.props;
    return (
      <div className="container">
        <Tabs modelsName="plazaOffers" itemID={itemID} />
        <PlazaOfferDelete itemID={itemID} onDelete={id => deletePlazaOffer(id)} />
      </div>
    );
  }
}

export default connect(null, { deletePlazaOffer })(PlazaOfferDeletePage);