import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import React, { PropTypes, Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import DropzoneComponent from 'react-dropzone-component';
import cl from 'classnames';
import * as XLSX from 'xlsx';
import { renderDate, renderDateTime } from '../../../utils';
import {makeObjects} from '../../../utils/eventBulkUpload';
import { fetchEventTypes } from '../../../actions/EventTypeActions';
import { fetchLocations } from '../../../actions/LocationActions';
import { Loading } from '../../../helpers';

import {
    LinkTo,
    renderFileUploadField
} from '../../../helpers';

const make_cols = refstr => Array(XLSX.utils.decode_range(refstr).e.c + 1).fill(0).map((x,i) => ({name:XLSX.utils.encode_col(i), key:i}));

class EventBulkUploadForm extends Component {

    state = {
      items: [],
      confirmDialog: 'show',
      error: null,
      fetched: false
    };

    djsConfig = {
        addRemoveLinks: true,
        acceptedFiles: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        autoProcessQueue: false
    };

    componentConfig = {
        iconFiletypes: ['.xlsx'],
        showFiletypeIcon: true,
        postUrl: 'no-url'
    };

    componentDidMount() {
      const { fetchEventTypes, fetchLocations } = this.props;

      Promise.all([
        fetchEventTypes({}),
		fetchLocations({})
      ]).then(() => this.setState({fetched:true}));
    }

    hideConfirmDialog(){
        this.setState({confirmDialog: 'hide'});
    }

    saveItems(){
            this.props.onSave(this.state.items);
    }

    initCallback = (dropzone) => {
      this.dropzone = dropzone;
    }

    eventsList(items ) {
        if (items.length > 0) {
            return (
                <table className="table table-bordered table-hover table-striped table-responsive">
                    <thead>
                    <tr>
                        <th>Event Type</th>
                        <th>Dates</th>
                        <th>Redemption</th>
                        <th>Cost</th>
						<th>Location</th>
						<th>Start Date</th>
						<th>End Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map(({ event_type, dates, location, redemption, cost, special, boost, url, start_time, end_time }, index) => (
                        <tr key={index + dates[0].name}>
                            <td>
                                {event_type ? event_type.name : null}
                            </td>
                            <td>
							<table className="table table-bordered table-hover table-striped table-responsive">
							<tbody>
							{dates ? dates.map(({name, date, start, end},index) =>(<tr key={index}><td>{name}: {date} {start} - {end}</td></tr>)):null}
							</tbody>
							</table>
                            </td>
                            <td>{redemption.name}</td>
							<td>{cost}</td>
							<td>{location.name}</td>
							<td>{start_time}</td>
							<td>{end_time}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            );
        }

        return (
            <h2>No items were found in the Excel file</h2>
        );
    }

    confirmationModal(items){

        if (items.length > 0){
            return (
                <div className={'modal ' + this.state.confirmDialog} id="myModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title" id="exampleModalLabel">Confirm</h3>
                            </div>
                            <div className="modal-body">
                                {
                                    this.eventsList(items)
                                }
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.hideConfirmDialog.bind(this)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={this.saveItems.bind(this)}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return null;

    }


    onDrop(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.setState({items:[], confirmDialog: 'show', errorMessage: null});

            /* Parse data */
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, {type:'binary'});
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_json(ws, {header:1});
            let items = [];
            try {
              items = makeObjects(data, this.props.eventTypes, this.props.locations);
              this.setState({items});
            }
            catch(e) {
              console.error(e);
              this.setState({errorMessage: e.message});
              this.dropzone.removeFile(file);
            }


        };
        reader.readAsBinaryString(file);
    }

    render () {

        const { onSave } = this.props;
        const { fetched } = this.state;
        const errorMessage = this.props.errorMessage || this.state.errorMessage;
        const eventHandlers = {
            addedfile: this.onDrop.bind(this),
            init: this.initCallback
        }

        return (
              <Loading className="container" loaded={fetched}>
                <form>
                    {this.confirmationModal(this.state.items)}

                    <div className="row">
                        <div className="col-md-8">

                            <div className="col-md-12">
                                <div className="ibox-content text-center"><h4>Please download the Excel template from the link below</h4><br/>
                                        <a className="btn btn-success" href="https://admin.joinleaf.com/partners/excel_template_admin.xlsx">Download Excel Template</a>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <h4>Upload</h4>
                                <fieldset className={cl('form-group', { 'has-error': ( errorMessage) })}>

                                    <DropzoneComponent
                                        config={this.componentConfig}
                                        djsConfig={this.djsConfig}
                                        eventHandlers={eventHandlers}
                                    >
                                        <p><center>Drop the excel file here, or click to select the file.</center></p>
                                    </DropzoneComponent>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    {errorMessage ? (
                        <div className="alert alert-danger">
                            <strong>Error</strong> {errorMessage}
                        </div>
                    ) : null}
                    <div className="btn-group">
                        <LinkTo className="btn btn-default" url="events">Cancel</LinkTo>
                        <button action="submit" className="btn btn-primary">
                            Confirm
                        </button>
                    </div>
                </form>
              </Loading>

        );
    }
}


EventBulkUploadForm.defaultProps = {
    items: []
};

EventBulkUploadForm.propTypes = {
    items: PropTypes.array,
    onSave: PropTypes.func.isRequired
};

export default connect(({
  auth: { currentUser },
  eventTypes: { items: eventTypes },
  locations: { items: locations }
}) => ({ currentUser, eventTypes, locations }), ({fetchEventTypes, fetchLocations}))(reduxForm({ form: 'eventbulkupload' })(EventBulkUploadForm));
