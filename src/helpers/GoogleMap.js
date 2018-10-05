import React, { PropTypes, Component } from 'react';
import { Gmaps, Marker, InfoWindow } from 'react-gmaps';
import size from 'lodash/size';

import { GOOGLE_MAP_API_KEY } from '../config';

export default class GoogleMap extends Component {
  constructor(props) {
    super(props);
  }

  onClick(id, origin) {
    const { onClickMarker } = this.props;
    onClickMarker(id, origin);
  }

  render() {
    const { positions, onClickMarker } = this.props;
    const normalImage = 'http://maps.google.com/mapfiles/ms/icons/red.png';
    const activeImage = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    const selectedImage = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';

    const CustomMarker = (props) => {
      const {id, origin, onClickMarker} = props;
      
      const onMarkerClick = (evt) => {
        onClickMarker(id, origin);
      };

      return (
        <Marker
          onClick={onMarkerClick}
          {...props}
        />
      );
    };

    return (
      <Gmaps
        width={'100%'}
        height={'500px'}
        lat={positions[0].latitude}
        lng={positions[0].longitude}
        zoom={12}
        params={{ v: '3.exp', key: GOOGLE_MAP_API_KEY }}
      >
        {
          size(positions || []) > 0 ? (
            positions.map((position, index) => {
              return (
                (position.selected) ?
                  <CustomMarker
                    key={index}
                    id={position.id}
                    origin={position.origin}
                    onClickMarker={this.onClick.bind(this)}
                    lat={position.latitude}
                    lng={position.longitude}
                    draggable={false}
                    icon={selectedImage}
                  />
                : (position.active) ?
                    <CustomMarker
                      key={index}
                      id={position.id}
                      origin={position.origin}
                      onClickMarker={this.onClick.bind(this)}
                      lat={position.latitude}
                      lng={position.longitude}
                      draggable={false}
                      icon={activeImage}
                    />
                  : <CustomMarker
                      key={index}
                      id={position.id}
                      origin={position.origin}
                      onClickMarker={this.onClick.bind(this)}
                      lat={position.latitude}
                      lng={position.longitude}
                      draggable={false}
                      icon={normalImage}
                    />
              )
            })
          )
          : <p>No Active Plans</p>
        }
        {
          size(positions || []) > 0 ? (
            positions.map((position, index) => {
              let eventContent = '';

              if (position.info) {
                if (position.info.events) {
                  eventContent = '<table class="event-table table table-bordered table-hover table-striped table-responsive"><tbody>';

                  for (let i = 0; i < position.info.events.length; i++) {
                    for (let j = 0; j < position.info.events[i].length; j++) {
                      eventContent += '<tr>';  
                      eventContent += '<td style="padding-right: 5px">' + position.info.events[i][j].name + '</td>';
                      eventContent += '<td>' + position.info.events[i][j].date + '</td>';
                      eventContent += '</tr>';
                    }
                  }

                  eventContent += '</tbody></table>';
                }
              }

              return (
                (position.selected && position.origin == 'plan') ?
                  <InfoWindow
                    key={index}
                    lat={position.latitude}
                    lng={position.longitude}
                    content={
                      '<h5>Plan info</h5>' 
                      + '<div style="text-align: left; width: 250px">'
                        + '<p><strong>name:</strong> ' + position.info.name + '</p>'
                        + '<p><strong>category:</strong> ' + (position.info.categories || []).join(', ') + '</p>'
                        + '<p><strong>stops:</strong> ' + position.info.locations_cnt + '</p>'
                        + '<p><strong>tags:</strong> ' + (position.info.tags || []).join(', ') + '</p>'
                      + '</div>'
                    } />
                : (position.selected && position.origin == 'location') ?
                    <InfoWindow
                      key={index}
                      lat={position.latitude}
                      lng={position.longitude}
                      content={
                        '<h5>Location info</h5>' 
                        + '<div class="info-content" style="text-align: left; width: 250px">'
                          + '<p><strong>name:</strong> ' + position.info.name + '</p>'
                          + '<p><strong>tags:</strong> ' + (position.info.tags || []).join(', ') + '</p>'
                          + '<p><strong>location type:</strong> ' + position.info.location_type + '</p>'
                          + '<p><strong>notes:</strong> ' + position.info.notes + '</p>'
                          + '<p><strong>specials:</strong> ' + (position.info.specials || []).join(', ') + '</p>'
                          + '<strong>events:</strong>' + eventContent
                        + '</div>'
                      } />
                  : null
              )
            })
          )
          : <p>No Active Plans</p>
        }
      </Gmaps>
    );
  }
}