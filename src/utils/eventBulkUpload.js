import _ from 'lodash';
import {validate, redemptionMethods} from '../components/events/EventForm/EventForm';
import moment from 'moment';

const headers = [
  'Event Type',
  'Event Name',
  'Date',
  'Event Start Time',
  'Event End Time',
  'Description',
  'Redemption',
  'Cost',
  'Location',
  'Ticket Purchase URL',
  'Start Date',
  'End Date'
]

export const makeObjects = (rows, eventTypes, locations) => {
  let headers = rows[0];

  const headerValidation = validateHeaders(headers);
  if(headerValidation !== true) {
    throw new Error(headerValidation);
  }

  // remove header row
  const data = _.filter(rows.slice(1), (row) => !_.isEmpty(row));
  if(data.length < 1) {
    throw new Error('No data!');
  }
  
  let item_array = [];
  let temp = []; 
  let temp_index = 0;
  data.forEach((row, i) => {
    const rowValidation = validateRow(row, eventTypes, locations);
    if(rowValidation !== true) {
	  if(_.isEmpty(row[0]) && i>0){
		 if(!_.isEmpty(row[1])){
			item_array[temp_index][1]=item_array[temp_index][1]+"_"+row[1];
		 }
		 if(!_.isEmpty(row[2])){
			 item_array[temp_index][2]=item_array[temp_index][2]+"_"+row[2];
		 }
		 if(!_.isEmpty(row[3])){
			 item_array[temp_index][3]=item_array[temp_index][3]+"_"+row[3];
		 } 
		 if(!_.isEmpty(row[4])){
			 item_array[temp_index][4]=item_array[temp_index][4]+"_"+row[4];
		 }
	  }
	  else{
		throw new Error(`Row ${i+1}: ${_.valuesIn(rowValidation).join(', ')}`);  
	  }
    }
	else{
		temp=row;
		item_array.push(row);
		temp_index=item_array.length-1;
	}
  });
  
  let items = [];
  item_array.forEach((row, i) => {
    const rowValidation = validateRow(row, eventTypes, locations);
    if(rowValidation !== true) {
		throw new Error(`Row ${i+1}: ${_.valuesIn(rowValidation).join(', ')}`);  
    }
    items.push(makeObject(row, eventTypes, locations));
  });
  return items;

}

export const makeObject = (row, eventTypes, locations) => {
  return transformRow(row, eventTypes, locations);
}

export const transformRow = (row, eventTypes, locations) => {
  let item = {};
  item.dates =[];
  let dates = [];
  var names_array=[];
  var dates_array=[];
  var start_array=[];
  var end_array=[];
  
  if(row[1]){
	  names_array=row[1].split("_");
  }
 
  if(row[2]){
	  dates_array=row[2].split("_");
  }
  
  if(row[3]){
	  start_array=row[3].split("_");
  }
  
  if(row[4]){
	  end_array=row[4].split("_");
  }
  
  item.event_type = row[0] ? _.find(eventTypes, type => type.name === row[0].trim()) || {value:null} : undefined;
  
  for(var i=0; i< dates_array.length; i++){
	  item.dates.push({name: names_array[i] || names_array[0], date: dates_array[i] || dates_array[0], start: start_array[i] || start_array[0], end: end_array[i] || end_array[0]});
  }
  /*item.dates = [
    {
      name: row[1],
      date: row[2],
      start: row[3],
      end: row[4]
    }
  ];*/
  item.description = row[5];
  item.redemption = row[6] ? _.find(redemptionMethods, method => method.name === row[6]) || {value:null} : undefined;
  item.cost = row[7];
  item.location = row[8] ? _.find(locations, loc => loc.name === row[8].trim()) || {value:null} : undefined;
  item.url = row[9];
  item.start_time = row[10];
  item.end_time = row[11];
  return item;
}

export const validateRow = (row, eventTypes, locations) => {
  const errors = validate(transformRow(row, eventTypes, locations), {eventTypes, locations});
  return _.isEmpty(errors) ? true : errors;
}

export const validateHeaders = (headerRow) => {
  const difference = _.difference(headers, headerRow);

  if(difference.length > 0) {
    return `Header mismatch: [${difference}]. Expected [${headers.join(', ')}], but got [${headerRow.join(', ')}]`;
  }

  return true;
}
