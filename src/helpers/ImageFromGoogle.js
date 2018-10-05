import React, { Component, PropTypes } from 'react';
import { Button, Modal, Panel, FormGroup, FormControl, ControlLabel, Checkbox  } from 'react-bootstrap';
import axios from 'axios';
import size from 'lodash/size';

import { GOOGLE_HOST_URI } from '../config';

export default class ImageFromGoogle extends Component {
	state = {
		metro_city: null,
		location: null,
		keyword: '',
		errorMessage: '',
		bigImages: [],
		thumbnails: [],
		selectedImgInd: -1,
    curPage: 0
	}

	constructor(props) {
		super(props);
	}

	componentDidMount() {
  }

  componentWillReceiveProps(newProps) {
  	const { defaultMetroCity, defaultLocation, showImgModal } = newProps;
  	const { metro_city, location } = this.state;
  	var that = this;

  	if (defaultMetroCity && defaultLocation)
  		this.setState({ metro_city: {'name': defaultMetroCity.name}, location: {'name': defaultLocation.name} });

  	if (defaultMetroCity && defaultLocation && showImgModal) 
  		setTimeout(function(){ that.onSearch() }, 200);
  }

  afterSetState() {
  	this.onSearch();
  }

  onSelectMetroCity(e) {
  	this.setState({ metro_city: {'name': e.target.value}, curPage: 0 }, () => this.afterSetState());
  }

  onSelectLocation(e) {
  	this.setState({ location: {'name': e.target.value}, curPage: 0 }, () => this.afterSetState());
  }

  onChangeKeyword(e) {
  	this.setState({ keyword: e.target.value, curPage: 0 });
  }

  onNext() {
    this.setState({ curPage: this.state.curPage + 1 }, () => this.afterSetState());
  }

  onClear() {
  	this.setState({ keyword: '' });
  }

  onSelect() {
		const { onSelectImage, defaultLocation, defaultMetroCity } = this.props;
		const { bigImages, selectedImgInd } = this.state;

		if (selectedImgInd < 0) alert('Please select one thumbnail');
		else onSelectImage(bigImages[selectedImgInd]);
  }

  onSearch() {
  	const { keyword, metro_city, location, curPage } = this.state;
  	let searchKeyword = '';

    if (keyword.length > 0) {
  		searchKeyword = keyword;
  	} else {
  		if (!metro_city || !location)
  			alert('Please select a Metro City and Location');
  		else
  			searchKeyword = location.name + ' ' + metro_city.name;
  	}
    
  	if (searchKeyword.length > 0)
		  axios.get(`${GOOGLE_HOST_URI}/place?keyword=${searchKeyword}&page=${curPage}`)
	     .then(( data ) => {
	        this.setState({ bigImages: data.data.bigImages, thumbnails: data.data.thumbnails });
	     })
	     .catch(({ errorMessage }) => this.setState({ errorMessage }));	
  }

	render() {
		const { showImgModal, onSelectImage, onHide, metroCities, locations, defaultMetroCity, defaultLocation } = this.props;
		const { keyword, bigImages, thumbnails, selectedImgInd, metro_city, location } = this.state;

		return (
      <Modal aria-labelledby='modal-label' show={showImgModal} className="img-modal">
        <div className="row header">
          <div className="col-md-12">
            <h2><center>Select An Image</center></h2>
          </div>
        </div>
        <div className="row search-terms">
          <div className="col-md-3">
            <FormGroup controlId="metroCity">
							<ControlLabel>Metro City</ControlLabel>
							<FormControl
								type="select"
								componentClass="select"
								placeholder="select"
								name="metro_city"
								onChange={(e) => this.onSelectMetroCity(e)}
								value={(this.state.metro_city ? this.state.metro_city.name : '')}
							>
								{
									(size(metroCities || []) > 0 && defaultMetroCity) ?
										metroCities.map((metroCity, index) => {
											return(<option key={index} value={metroCity.name}>{metroCity.name}</option>)
										})
									: null
								}
							</FormControl>
						</FormGroup>
          </div>
          <div className="col-md-5">
            <FormGroup controlId="location">
							<ControlLabel>Location</ControlLabel>
							<FormControl
								componentClass="select"
								placeholder="select"
								name="location"
								onChange={(e) => this.onSelectLocation(e)}
								value={(this.state.location ? this.state.location.name : '')}
							>
								{
									size(locations || []) > 0 ?
										locations.map((location, index) => {
											return(<option key={index} value={location.id}>{location.name}</option>)
										})
									: null
								}
							</FormControl>
						</FormGroup>
          </div>
        </div>
        <div className="row search-terms">
        	<div className="col-md-8">
        		<label>Keywords</label>
        		<input type="text" value={keyword} onChange={(e) => this.onChangeKeyword(e)}/>
        	</div>
        	<div className="col-md-2">
          	<button className="btn btn-primary" onClick={() => this.onSearch()}>Search</button>
          </div>
          <div className="col-md-2">
          	<button className="btn btn-danger" onClick={() => this.onClear()}>Clear</button>
          </div>
        </div>
        {
        	size(thumbnails || []) > 0 ? 
	    			<div className="row thumbnails">
	      		{
	      			thumbnails.map((thumbnail, index) => {
	      				return (
	      					<div className={ index === selectedImgInd ? "col-md-3 selected" : "col-md-3" } key={index} onClick={() => this.setState({ selectedImgInd: index })}>
		      					<img src={thumbnail} alt="Smiley face" width="100%" height="100%"/>
		      				</div>
		      			)		
	      			})
	      		}
	      		</div>
        	: null
        }
        <div className="row footerz">
          <div className="col-md-12 ctrl-btns">
            <center className="">
              <button className="btn btn-primary" onClick={() => this.onNext()}>
                Next Images
              </button>
              <button className="btn btn-primary" onClick={() => this.onSelect()}>
                Select
              </button>
              <button className="btn btn-primary" onClick={() => onHide()}>
                Cancel
              </button>
            </center>
          </div>
        </div>
      </Modal>
	  )
	}
}