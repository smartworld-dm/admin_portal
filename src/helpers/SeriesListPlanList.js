import React, { Component, PropTypes } from 'react';
import {DisplayDate} from './';

export default class SeriesListPlanList extends Component {

	static propTypes = {
		plans: PropTypes.array.isRequired,
	};

	render() {
		const { plans } = this.props;
		return (
			<table className="table table-hover table-striped table-bordered">
			<tbody>
			{plans.map((val, index) => (
				<tr key={index}>
				<td>{val.title_event}</td>
				<td><DisplayDate date={val.start_day}></DisplayDate></td>
				</tr>
			))}
			</tbody>
			</table>
		);
	}
}
