import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { deleteSeries } from '../../actions/SeriesActions';

import { SeriesDelete } from '../../components';
import { Tabs } from '../../helpers';

class SeriesDeletePage extends Component {
  render() {
    const { params: { itemID }, deleteSeries } = this.props;
    return (
      <div className="container">
        <Tabs modelsName="series" itemID={itemID} />
        <SeriesDelete itemID={itemID} onDelete={id => deleteSeries(id)} />
      </div>
    );
  }
}

export default connect(null, { deleteSeries })(SeriesDeletePage);
