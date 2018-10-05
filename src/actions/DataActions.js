import axios from 'axios';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';

import { ADD_DATA, CITY_DATA, DOWNLOADS, USERS, TAGS, MALE, SENT_INVITES_COUNT, ACCEPT_INVITES_COUNT, NO_OF_PLANS, NO_OF_ACTIVE_PLANS, TOP_NEIGHBORHOODS, TOP_LOCATIONS, POPULAR_PLANS, POP_DATE_TIME, ACCEPTED_PLANS_BY_STOPS, INITIATED_PLANS_COUNT, ACCEPTED_TAGS_STOP } from '../constants/Data';

import { UPLOAD_HOST } from '../config';
import { apiRequest } from '../utils';

export function addData(item = {}) {
  return {
    type: ADD_DATA,
    item
  };
}

export function addMetroCity(metro_cities = {}, count = 0) {
	
	var cities = [];
	var temp = [];
	for(var i=0; i< metro_cities.length; i++){
		if(temp.indexOf(metro_cities[i].metro_city2.value)<0){
			temp.push(metro_cities[i].metro_city2.value);
			cities.push(metro_cities[i].metro_city2);
		}
	}
	
	cities.push({name: "ALL", value: "all"});
	return {
		type: CITY_DATA,
		cities
	  };
}

export function addDownloads(results = 0, downloads_count= 0){
	return {
		type: DOWNLOADS,
		downloads_count
	  };
}

export function addUsers(results = 0, users_count= 0){
	return {
		type: USERS,
		users_count
	  };
}

export function addTags(results = 0, count = 0){
	var tags = [];
	var temp_list = [];
	var temp = [];
	var tags_counter = 0;
	var temp_names = [];
	
	for(var i = 0; i < results.length; i++){
		if(results[i].tags){
			for(var j=0; j < results[i].tags.length; j++){
				if(temp_list[results[i].tags[j]]){
					temp_list[results[i].tags[j]] = temp_list[results[i].tags[j]]+1;
				}
				else{
					temp_list[results[i].tags[j]] = 1;
				}
				tags_counter++;
				
				if(temp_names.indexOf(results[i].tags[j])<0){
					temp_names.push(results[i].tags[j]);
				}
			}
		}
	}
	
	for(var i = 0; i < temp_names.length; i++){
		var perc = parseInt(temp_list[temp_names[i]])*100/parseInt(tags_counter);
		temp.push({"tag": temp_names[i], "perc" : perc});
	}
	
	temp.sort((a, b) => {if (a.perc < b.perc){return -1;}if (a.perc > b.perc){return 1;}return 0;});
	temp.reverse();
	var temp = temp.slice(0,10);
	tags = temp;

	return {
		type: TAGS,
		tags
	  };
}

export function addMale(results = 0, male = 0){
	return {
		type: MALE,
		male
	  };
}

export function addSentInviteCount(results = 0, sent_invite_count = 0){
	return {
		type: SENT_INVITES_COUNT,
		sent_invite_count
	  };
}

export function addAcceptInviteCount(results = 0, accept_invite_count = 0){
	return {
		type: ACCEPT_INVITES_COUNT,
		accept_invite_count
	  };
}

export function addPlansCount(results = 0, plans_count = 0){
	return {
		type: NO_OF_PLANS,
		plans_count
	  };
}

export function addActivePlansCount(results = [], active_plans_count = 0, metro_city_val = null){
	var temp=0;
	var estimated_cost_count = [];
	var estimate_cost_array = ['FREE', '$', '$$', '$$$', '$$$$', '$$$$$'];
	var estimated_cost_list = [];
	var plans_neighborhoods = [];
	for(var i = 0; i < results.length; i++){
		if(results[i].start_day && results[i].end_day){
			if(moment()>=moment(results[i].start_day.iso) && moment()<=moment(results[i].end_day.iso)){
				
				if(!isEmpty(metro_city_val) && metro_city_val!='all'){
					if(!results[i].locations || !results[i].locations[0].location || !results[i].locations[0].location.metro_city2 
					|| results[i].locations[0].location.metro_city2.value != metro_city_val){
						continue;
					}
				}
				temp++;
				if(results[i].estimated_cost){
					if(results[i].estimated_cost=='FREE' || results[i].estimated_cost=='free'){
						if(estimated_cost_count['FREE']){
							estimated_cost_count['FREE']=estimated_cost_count['FREE']+1;
						}
						else{
							estimated_cost_count['FREE']=1;
						}
					}
					else{
						 
						 if(estimated_cost_count[results[i].estimated_cost]){
							 estimated_cost_count[results[i].estimated_cost]=estimated_cost_count[results[i].estimated_cost]+1;
						 }
						 else{
							 estimated_cost_count[results[i].estimated_cost]=1;
						 }
					}
				}
				
				if(results[i].locations && results[i].locations[0].location && results[i].locations[0].location.neighborhood){
					var updated=false;
					if(plans_neighborhoods.length>0){
						for(var j=0;j<plans_neighborhoods.length;j++){
							if(plans_neighborhoods[j].neighborhood==results[i].locations[0].location.neighborhood){
								plans_neighborhoods[j] = {"neighborhood":plans_neighborhoods[j].neighborhood, "count": plans_neighborhoods[j].count+1};
								updated=true;
							}
						}
					}	
					
					if(!updated){
						plans_neighborhoods.push({"neighborhood":results[i].locations[0].location.neighborhood, "count": 1});
					}
				}
			}
		}
	}
	
	for(var i = 0;i < estimate_cost_array.length; i++){
		if(estimated_cost_count[estimate_cost_array[i]]){
			estimated_cost_list.push({"cost_type": estimate_cost_array[i], cost_occur: estimated_cost_count[estimate_cost_array[i]]});
		}
		else{
			estimated_cost_list.push({"cost_type": estimate_cost_array[i], cost_occur: 0});
		}
	}
	plans_neighborhoods.sort((a, b) => {if (a.count < b.count){return -1;}if (a.count > b.count){return 1;}return 0;});
	plans_neighborhoods=plans_neighborhoods.reverse().slice(0,10);
	
	active_plans_count = temp;
	return {
		type: NO_OF_ACTIVE_PLANS,
		active_plans_count,
		estimated_cost_list,
		plans_neighborhoods
	  };
}

export function addTopNeighborhoods(results = [], count = 0, metro_city_val = null){
	var temp_list = [];
	var neighborhoods = [];
	var counter = 0;
	var temp_names = [];
	var temp = [];
	
	for(var i = 0; i < results.length; i++){
		if(results[i].status && results[i].status=='Accepted' && results[i].group && results[i].group.event && results[i].group.event.locations && results[i].group.event.locations[0] && results[i].group.event.locations[0].location.neighborhood){
			
			if(!isEmpty(metro_city_val) && metro_city_val!='all'){
				if(!results[i].group.event.locations[0].location || !results[i].group.event.locations[0].location.metro_city2 
				|| results[i].group.event.locations[0].location.metro_city2.value != metro_city_val){
					continue;
				}
			}
			
			var nghd = results[i].group.event.locations[0].location.neighborhood;
			if(temp_list[nghd]){
			temp_list[nghd] = temp_list[nghd]+1;
			}
			else{
				temp_list[nghd] = 1;
			}
			counter++;
			
			if(temp_names.indexOf(nghd)<0){
				temp_names.push(nghd);
			}
		}
	}
	
	for(var i = 0; i < temp_names.length; i++){
		var perc = parseInt(temp_list[temp_names[i]])*100/parseInt(counter);
		temp.push({"neighborhood": temp_names[i], "perc" : perc});
	}
	
	temp.sort((a, b) => {if (a.perc < b.perc){return -1;}if (a.perc > b.perc){return 1;}return 0;});
	temp.reverse();
	var temp = temp.slice(0,10);
	neighborhoods = temp;

	return {
		type: TOP_NEIGHBORHOODS,
		neighborhoods
	  };
}

export function addTopLocations(locations_list = [], count = 0){
	return {
		type: TOP_LOCATIONS,
		locations_list
	  };
}

export function addpopularPlans(results = [], count = 0, metro_city_val = null){
	var temp = [];
	var temp_cat = [];
	var cat_list = [];
	var cat_plans = [];
	var cat_plan_names = [];
	var plans_list = [];
	var temp_plans = [];
	var inv_count = [];
	var inv_count_cat = [];
	var accept_count = [];
	var category_list = [];
	
	
	
	for(var i = 0; i < results.length; i++){
		if(results[i].group && results[i].group.event && results[i].group.event.objectId){
			
			if(!isEmpty(metro_city_val) && metro_city_val!='all'){
				if(!results[i].group.event.locations || !results[i].group.event.locations[0].location || !results[i].group.event.locations[0].location.metro_city2 
				|| results[i].group.event.locations[0].location.metro_city2.value != metro_city_val){
					continue;
				}
			}
			
			if(!temp[results[i].group.event.objectId]){
				temp[results[i].group.event.objectId] = results[i].group.event.title_event;
				temp_plans.push({"objectId": results[i].group.event.objectId, "name": results[i].group.event.title_event});
			}
			
			if(!temp_cat[results[i].group.event.type_event]){
				temp_cat[results[i].group.event.type_event] = results[i].group.event.type_event;
				cat_list.push({"cat": results[i].group.event.type_event});
			}
			
			if(!cat_plan_names[results[i].group.event.type_event+'_'+results[i].group.event.objectId]){
				cat_plan_names[results[i].group.event.type_event+'_'+results[i].group.event.objectId]=results[i].group.event.objectId;
				if(cat_plans[results[i].group.event.type_event]){
					cat_plans[results[i].group.event.type_event]=cat_plans[results[i].group.event.type_event]+1;
				}
				else{
					cat_plans[results[i].group.event.type_event]=1;
				}
			}
			
			if(inv_count_cat[results[i].group.event.type_event]){
				inv_count_cat[results[i].group.event.type_event] = inv_count_cat[results[i].group.event.type_event]+1;
			}
			else {
				inv_count_cat[results[i].group.event.type_event] = 1;
			}
			
			if(inv_count[results[i].group.event.objectId]){
				inv_count[results[i].group.event.objectId] = inv_count[results[i].group.event.objectId]+1;
			}
			else {
				inv_count[results[i].group.event.objectId] = 1;
			}
			
			if(results[i].status && results[i].status == 'Accepted'){
				if(accept_count[results[i].group.event.objectId]){
					accept_count[results[i].group.event.objectId] = accept_count[results[i].group.event.objectId]+1;
				}
				else{
					accept_count[results[i].group.event.objectId] = 1;	
				}
			}
		}
	}

	for(var i = 0; i < temp_plans.length; i++){
		var check_inv = 0;
		var check_accept = 0;
		if(inv_count[temp_plans[i].objectId]){
			check_inv = inv_count[temp_plans[i].objectId];
		}
		if(accept_count[temp_plans[i].objectId]){
			check_accept = accept_count[temp_plans[i].objectId];
		}
		
		plans_list.push({"objectId":temp_plans[i].objectId, "name": temp_plans[i].name, "inv_sent": check_inv, "inv_accept": check_accept});
	}
	plans_list.sort((a,b)=>{if (a.inv_sent < b.inv_sent){return -1;}if (a.inv_sent > b.inv_sent){return 1; }return 0;});
	plans_list.reverse();
	plans_list = plans_list.slice(0,10);
	
	for(var i = 0; i < cat_list.length; i++){
		category_list.push({"name": cat_list[i].cat, plans_count: cat_plans[cat_list[i].cat], "inv_sent": (inv_count_cat[cat_list[i].cat]/cat_plans[cat_list[i].cat])});
	}

	category_list.sort((a,b)=>{if (a.inv_sent < b.inv_sent){return -1;}if (a.inv_sent > b.inv_sent){return 1; }return 0;});
	category_list.reverse();
	category_list = category_list.slice(0,10);
	
	return {
		type: POPULAR_PLANS,
		plans_list,
		category_list
	  };
}

export function addpopularDateTime(results = [], count = 0, metro_city_val = null){
	
	var popular_date_time = [];
	var morn_array = ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM"];
	var noon_array = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
	var afternoon_array = ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"];
	var evening_array = ["4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "3:30 PM"];
	
	var temp_time='';
	var temp_time_date_array = [];
	temp_time_date_array['Sunday'] = [];
	temp_time_date_array['Monday'] = [];
	temp_time_date_array['Tuesday'] = [];
	temp_time_date_array['Wednesday'] = [];
	temp_time_date_array['Thursday'] = [];
	temp_time_date_array['Friday'] = [];
	temp_time_date_array['Saturday'] = [];
	var date_array = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	
	
	for(var i = 0; i < results.length; i++){
		if(results[i].group && results[i].group.event && results[i].group.event.locations && results[i].group.event.locations[0].time){
			
			if(!isEmpty(metro_city_val) && metro_city_val!='all'){
				if(!results[i].group.event.locations || !results[i].group.event.locations[0].location || !results[i].group.event.locations[0].location.metro_city2 
				|| results[i].group.event.locations[0].location.metro_city2.value != metro_city_val){
					continue;
				}
			}
			
			var time=results[i].group.event.locations[0].time;
			if(morn_array.indexOf(time)>=0){
				temp_time='Morning';
			}
			else if(noon_array.indexOf(time)>=0){
				temp_time='Noon';
			}
			else if(afternoon_array.indexOf(time)>=0){
				temp_time='Afternoon';
			}
			else if(evening_array.indexOf(time)>=0){
				temp_time='Evening';
			}
			else{
				temp_time='Late Night';
			}
		}

		if(results[i].group && results[i].group.event){
			if(results[i].group.event.reoccur_sunday){
				if(temp_time_date_array['Sunday'][temp_time]){
					temp_time_date_array['Sunday'][temp_time]=temp_time_date_array['Sunday'][temp_time]+1; 
				}
				else{
					temp_time_date_array['Sunday'][temp_time]=1; 
				}
			}
			
			if(results[i].group.event.reoccur_monday){
				if(temp_time_date_array['Monday'][temp_time]){
					temp_time_date_array['Monday'][temp_time]=temp_time_date_array['Monday'][temp_time]+1; 
				}
				else{
					temp_time_date_array['Monday'][temp_time]=1; 
				}
			}
		
			if(results[i].group.event.reoccur_tuesday){
				if(temp_time_date_array['Tuesday'][temp_time]){
					temp_time_date_array['Tuesday'][temp_time]=temp_time_date_array['Tuesday'][temp_time]+1; 
				}
				else{
					temp_time_date_array['Tuesday'][temp_time]=1; 
				}
			}
			
			if(results[i].group.event.reoccur_wednesday){
				if(temp_time_date_array['Wednesday'][temp_time]){
					temp_time_date_array['Wednesday'][temp_time]=temp_time_date_array['Wednesday'][temp_time]+1; 
				}
				else{
					temp_time_date_array['Wednesday'][temp_time]=1; 
				}
			}
		
			if(results[i].group.event.reoccur_thursday){
				if(temp_time_date_array['Thursday'][temp_time]){
					temp_time_date_array['Thursday'][temp_time]=temp_time_date_array['Thursday'][temp_time]+1; 
				}
				else{
					temp_time_date_array['Thursday'][temp_time]=1; 
				}
			}
			
			if(results[i].group.event.reoccur_friday){
				if(temp_time_date_array['Friday'][temp_time]){
					temp_time_date_array['Friday'][temp_time]=temp_time_date_array['Friday'][temp_time]+1; 
				}
				else{
					temp_time_date_array['Friday'][temp_time]=1; 
				}
			}
		
			if(results[i].group.event.reoccur_saturday){
				if(temp_time_date_array['Saturday'][temp_time]){
					temp_time_date_array['Saturday'][temp_time]=temp_time_date_array['Saturday'][temp_time]+1; 
				}
				else{
					temp_time_date_array['Saturday'][temp_time]=1; 
				}
			}
		}
	}
	
	for(var i =0; i < date_array.length; i++){
		var mrn_count=0;
		var noon_count=0;
		var afternoon_count=0;
		var evng_count=0;
		var late_count=0;
		var data=temp_time_date_array[date_array[i]];
		if(data['Morning']){
			mrn_count=data['Morning'];
		}
		if(data['Noon']){
			noon_count=data['Noon'];
		}
		if(data['Afternoon']){
			afternoon_count=data['Afternoon'];
		}
		if(data['Evening']){
			evng_count=data['Evening'];
		}
		if(data['Late Night']){
			late_count=data['Late Night'];
		}
		var temp_no_array=[mrn_count,noon_count,afternoon_count,evng_count,late_count];
		temp_no_array.sort(function(a, b){return a-b});
		temp_no_array.reverse();
		var max_inv_accept=temp_no_array[0];
		var max_inv_accept_time='';
		if(max_inv_accept==mrn_count){
			max_inv_accept_time='Morning';
		}
		else if(max_inv_accept==noon_count){
			max_inv_accept_time='Noon';
		}
		else if(max_inv_accept==afternoon_count){
			max_inv_accept_time='Afternoon';
		}
		else if(max_inv_accept==evng_count){
			max_inv_accept_time='Evening';
		}
		else if(max_inv_accept==late_count){
			max_inv_accept_time='Late Night';
		}
		popular_date_time.push({"day": date_array[i], "time": max_inv_accept_time, "accept_count": max_inv_accept});
	}
	popular_date_time.sort((a, b) =>{if (a.accept_count < b.accept_count){return -1;}if (a.accept_count > b.accept_count){return 1;} return 0;});
	popular_date_time.reverse();
	return {
		type: POP_DATE_TIME,
		popular_date_time
	  };
}

export function addAcceptedPlansByStop(results = [], count = 0, metro_city_val = null){
	var loc_count_plans_obj_array = [];
	var accepted_plans_by_Stop = [];
	var total_plans = results.length;
	for(var i = 0; i < results.length; i++){
		if(results[i].group && results[i].group.event && results[i].group.event.locations){
			
			if(!isEmpty(metro_city_val) && metro_city_val!='all'){
				if(!results[i].group.event.locations || !results[i].group.event.locations[0].location || !results[i].group.event.locations[0].location.metro_city2 
				|| results[i].group.event.locations[0].location.metro_city2.value != metro_city_val){
					continue;
				}
			}
			
			var loc_counter = results[i].group.event.locations.length;
			if(loc_counter>0){
				var updated = false;
				for(var j = 0;j < loc_count_plans_obj_array.length; j++){
					if(loc_count_plans_obj_array[j].loc_count == loc_counter){
						loc_count_plans_obj_array[j]={"loc_count": loc_counter, "plans_count": loc_count_plans_obj_array[j].plans_count+1};
						updated=true;
					}
				}
				
				if(!updated){
					loc_count_plans_obj_array.push({"loc_count": loc_counter, "plans_count": 1});
				}
			}
			else{
				loc_count_plans_obj_array.push({"loc_count": loc_counter, "plans_count": 1});
			}
		}
	}
	
	loc_count_plans_obj_array.sort((a, b) =>{if (a.loc_count < b.loc_count){return -1;}if (a.loc_count > b.loc_count){return 1;} return 0;});
	accepted_plans_by_Stop=loc_count_plans_obj_array.slice(0,4);
	
	for(var i = 0; i < accepted_plans_by_Stop.length; i++){
		accepted_plans_by_Stop[i]={"loc_count": accepted_plans_by_Stop[i].loc_count, "plans_count": accepted_plans_by_Stop[i].plans_count*100/total_plans};
	}
	
	return {
		type: ACCEPTED_PLANS_BY_STOPS,
		accepted_plans_by_Stop
	  };
}

export function addInitiatedPlans(results = [], count = 0, metro_city_val = null){
	var initiated_plans=0;
	var initiated_plans_users=0;
	var temp_array = [];
	
	for(var i = 0; i < results.length; i++){
		if(results[i].user){
			
			if(!isEmpty(metro_city_val) && metro_city_val!='all'){
				if(!results[i].event.locations || !results[i].event.locations[0].location || !results[i].event.locations[0].location.metro_city2 
				|| results[i].event.locations[0].location.metro_city2.value != metro_city_val){
					continue;
				}
			}
			
			if(!temp_array[results[i].user.objectId]){
				temp_array[results[i].user.objectId]=results[i].user.objectId;
				initiated_plans_users++;
			}
			initiated_plans++;
		}
	}
	
	return {
		type: INITIATED_PLANS_COUNT,
		initiated_plans,
		initiated_plans_users
	}
	
}

export function addAcceptedTagsByStop(results = [], count = 0, metro_city_val = null){
	var accepted_tags_by_stop = [];
	var temp_array = [];
	for(var i = 0; i < results.length; i++){
		if(results[i].group && results[i].group.event && results[i].group.event.locations && results[i].group.event.tags){
			
			if(!isEmpty(metro_city_val) && metro_city_val!='all'){
				if(!results[i].group.event.locations || !results[i].group.event.locations[0].location || !results[i].group.event.locations[0].location.metro_city2 
				|| results[i].group.event.locations[0].location.metro_city2.value != metro_city_val){
					continue;
				}
			}
			
			var loc=results[i].group.event.locations[0].location;
			var tags = results[i].group.event.tags;
			for(var j = 0; j < tags.length; j++){
				temp_array.push({"objectId": loc.objectId, "name": loc.name, "tag": tags[j], "count": 1});
			}
		}
	}
	
	var obj_name_array = [];
	var obj_tag_count_array = [];
	var loop_array = [];
	for(var i = 0; i < temp_array.length; i++){
		
		if(!obj_name_array[temp_array[i].objectId]){
			obj_name_array[temp_array[i].objectId]=temp_array[i].name;
		}
		
		if(obj_tag_count_array[temp_array[i].objectId+'_'+temp_array[i].tag]){
			obj_tag_count_array[temp_array[i].objectId+'_'+temp_array[i].tag]=obj_tag_count_array[temp_array[i].objectId+'_'+temp_array[i].tag]+1;
		}
		else{
			obj_tag_count_array[temp_array[i].objectId+'_'+temp_array[i].tag]=1;
			loop_array.push({"objectId": temp_array[i].objectId, "tag": temp_array[i].tag});
		}
	}
	
	for(var i = 0; i < loop_array.length; i++){
		accepted_tags_by_stop.push({"stop": obj_name_array[loop_array[i].objectId],"tag": loop_array[i].tag, "count": obj_tag_count_array[loop_array[i].objectId+'_'+loop_array[i].tag]*100/temp_array.length});
	}
	
	accepted_tags_by_stop.sort((a, b) =>{if (a.count < b.count){return -1;}if (a.count > b.count){return 1;} return 0;});
	accepted_tags_by_stop.reverse();
	accepted_tags_by_stop=accepted_tags_by_stop.slice(0,10);

	return {
		type: ACCEPTED_TAGS_STOP,
		accepted_tags_by_stop
	}
}

export function fetchData() {
  return dispatch => axios.get(`${UPLOAD_HOST}/data`).then(({ data }) => dispatch(addData(data)));
}

export function fetchMetroCities() {
  const query={"$and": [{"metro_city2.name":{"$exists" : true}}]};	
  const url = [
    'Location?count=1',
    `&order=name` : null,
    `&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addMetroCity(results, count)));
}

export function downloadsCount(){
  const query={"$and": [{"createdAt":{$gte :"2017-01-01T00:00:00Z"}}]};	
  const url = [
    '_Installation?count=1&limit=0',
    //`&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addDownloads(results, count)));
}

export function usersCount(){
  const query={"$and": [{"createdAt":{$gte :"2017-01-01T00:00:00Z"}}]};	
  const url = [
    '_User?count=1&limit=0',
    //`&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addUsers(results, count)));
}

export function tagsCount(){
  const query={"$and": [{"createdAt":{$gte :"2017-01-01T00:00:00Z"}}]};	
  const url = [
    '_User?count=1&limit=count',
    //`&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addTags(results, count)));
}

export function maleCount(){
	const query={"$and": [{"gender": "male"}]};	
  const url = [
    '_User?count=1&limit=0',
    `&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addMale(results, count)));
}

export function sentInviteCount(){	
  const url = [
    'EventNotification?count=1&limit=0',
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addSentInviteCount(results, count)));
}

export function inviteAcceptedCount(){
	const query = {"$and": [{"status" :{"$exists": true}}, {"status": "Accepted"}]};
	const url = [
    'EventNotification?count=1&limit=0',
	`&where=${JSON.stringify(query)}`
	
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addAcceptInviteCount(results, count)));
}

export function plansCount(){
	const url = [
    'EventDetail?count=1&limit=0',
	
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addPlansCount(results, count)));
}

export function activePlanCount(metro_city_val = null){
	const url = [
    'EventDetail?count=1&limit=count&include=locations.location',
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addActivePlansCount(results, count, metro_city_val)));
}

export function topNeighborhoods(metro_city_val = null){
	const query = {"$and":[{"status":"Accepted"}]};
	const url = [
    'EventNotification?count=1&limit=count&include=group.event.locations.location',
	`&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addTopNeighborhoods(results, count, metro_city_val)));
}

export function topLocations(){
	const url = [
    'EventRequest?count=1&limit=10&order=-request_count',
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addTopLocations(results, count)));
}

export function popularPlans(metro_city_val = null){
	const query = {"$and": [{"group" :{"$exists": true}}]};
	const url = [
    'EventNotification?count=1&limit=count&include=group.event.locations.location',
	,
	`&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addpopularPlans(results, count, metro_city_val)));
}

export function popularDateTime(metro_city_val = null){
	const query = {"$and":[{"status":"Accepted"}]};
	const url = [
    'EventNotification?count=1&limit=count&include=group.event.locations.location',
	,
	`&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addpopularDateTime(results, count, metro_city_val)));
}

export function acceptedPlansByStop(metro_city_val = null){
	const query = {"$and":[{"status":"Accepted"}]};
	const url = [
    'EventNotification?count=1&limit=count&include=group.event.locations.location',
	,
	`&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addAcceptedPlansByStop(results, count, metro_city_val)));
}

export function initiatedPlans(metro_city_val = null){
	const url = [
    'EventGroup?count=1&limit=count&include=event.locations.location',
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addInitiatedPlans(results, count, metro_city_val)));
}

export function acceptedTagsByStops(metro_city_val = null){
	const query = {"$and":[{"status":"Accepted"}]};
	const url = [
    'EventNotification?count=1&limit=count&include=group.event.locations.location',
	,
	`&where=${JSON.stringify(query)}`
  ].join('');
  return dispatch => apiRequest.get(url)
    .then(({ data: { results, count } }) => dispatch(addAcceptedTagsByStop(results, count, metro_city_val)));
}