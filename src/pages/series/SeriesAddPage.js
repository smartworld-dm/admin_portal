import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { createSeries } from '../../actions/SeriesActions';

import { SeriesForm } from '../../components';

class SeriesAddPage extends Component {

  static propTypes = {
    createSeries: PropTypes.func.isRequired
  };

  render() {
    const { errorMessage, createSeries } = this.props;
    return (
      <div className="container">
        <SeriesForm errorMessage={errorMessage} onSave={series => createSeries(series)} />
      </div>
    );
  }
}

export default connect(({ series: { errorMessage } }) => ({ errorMessage }), { createSeries })(SeriesAddPage);
