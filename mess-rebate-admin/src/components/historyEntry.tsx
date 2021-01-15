import React, {Component} from 'react';
import './historyEntry.css';
import axios from "axios";

class HistoryEntry extends Component<any, any> {
    state = {
        updatingStatus: 2
    };
    timeout = setTimeout(() => {
    }, 0);

    openFile = () => {
        const url = 'http://localhost:8000/download.php?id=' + encodeURIComponent(this.props.value.file);
        window.open(url);
    }

    updateStatus = (e: any, status_: number) => {
        e.preventDefault();
        if ((status_ - 1) * this.state.updatingStatus < 2 * status_) {
            this.setState({
                updatingStatus: this.state.updatingStatus + status_ - 1
            }, () => {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.setState({
                        updatingStatus: this.state.updatingStatus - status_ + 1
                    });
                }, 2000);
                if (this.state.updatingStatus === 2 * status_) {
                    clearTimeout(this.timeout);
                    axios.get('http://localhost:8000/update-status.php', {
                        params: {
                            id: this.props.value.id,
                            rollNoEnc: this.props.value.rollNoEnc,
                            status: status_
                        }
                    }).then(response => {
                        this.props.update();
                    }, error => {
                        this.props.alert('Could not update. Please check your internet connectivity.', 'red', 3000);
                        this.setState({
                            updatingStatus: 2
                        });
                    });
                }
            });
        }
    }

    render() {
        const from = new Date(this.props.value.from * 1000);
        const to = new Date(this.props.value.to * 1000);
        return (
            <div
                className={'entry ' + (this.props.value.status === 0 ? 'red' : (this.props.value.status === 1 ? '' : 'green'))}>
                <div>
                    <p className="from">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][from.getMonth()] + ' ' + from.getDate() + ', ' + from.getFullYear()}</p>
                    <div className="reason">
                        <p className="userInfo">
                            {this.props.value.rollNo}, {this.props.value.userName}, {this.props.value.roomNo},
                            <a href={'mailto:' + this.props.value.email}>{this.props.value.email}</a>
                        </p>
                        <p>
                            {this.props.value.reason}
                        </p>
                        {this.props.value.file !== '' && <p>
                            <button className="download" onClick={this.openFile}>View File</button>
                        </p>}
                    </div>
                    <p className="to">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][to.getMonth()] + ' ' + to.getDate() + ', ' + to.getFullYear()}</p>
                </div>
                <div>
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                {this.props.value.status === 1 && (() => {
                                    if (this.state.updatingStatus === 2) {
                                        return (
                                            <React.Fragment>
                                                <button onClick={(e) => this.updateStatus(e, 2)}>Accept</button>
                                                <button onClick={(e) => this.updateStatus(e, 0)}>Reject</button>
                                            </React.Fragment>
                                        );
                                    } else {
                                        return (
                                            <button onClick={
                                                this.state.updatingStatus > 2 ? (e) => this.updateStatus(e, 2)
                                                    : (e) => this.updateStatus(e, 0)
                                            } style={
                                                this.state.updatingStatus > 2 ? {
                                                    backgroundColor: '#226622'
                                                } : {
                                                    backgroundColor: '#662222'
                                                }
                                            }>{
                                                this.state.updatingStatus % 2 === 1 ?
                                                    ('Click Again to ' +
                                                        (this.state.updatingStatus === 1 ? 'Reject' : 'Accept'))
                                                    : (this.state.updatingStatus === 0 ? 'Rejecting...' : 'Accepting...')
                                            }</button>
                                        );
                                    }
                                })()}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default HistoryEntry;
