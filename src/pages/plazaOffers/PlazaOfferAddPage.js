import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { createPlazaOffer } from '../../actions/PlazaOffersActions';

import { PlazaOfferForm } from '../../components';

class PlazaOfferAddPage extends Component {

  render() {
    const { errorMessage, createPlazaOffer } = this.props;
    return (
      <div className="container">
        <PlazaOfferForm errorMessage={errorMessage} onSave={plazaOffer => createPlazaOffer(plazaOffer)} />
      </div>
    );
  }
}

export default connect(({ plazaOffers: { errorMessage } }) => ({ errorMessage }), { createPlazaOffer })(PlazaOfferAddPage);