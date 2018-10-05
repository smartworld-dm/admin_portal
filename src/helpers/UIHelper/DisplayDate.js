import React, { Component, PropTypes } from 'react';
import moment from 'moment';

export default class DisplayDate extends Component {

	static propTypes = {
		date: PropTypes.object.isRequired,
	};

	render() {
		const { date } = this.props;
		const displayDate = moment(date.iso).format('MM/DD/YYYY')
		return (
			<span>{displayDate}</span>
		);
	}
}
