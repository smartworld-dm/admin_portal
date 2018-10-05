export default function(planTemplate) {
	let isContained = false;
	for (let i = 0; i < planTemplate.location_types.length; i++) {
		let locationType = planTemplate.location_types[i];
		if (locationType.includes('Activity') || locationType.includes('Event'))
			return true;
	}

  return false;
}