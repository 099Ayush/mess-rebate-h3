import React, {Component} from 'react';
import './historyEntry.css';

class HistoryEntry extends Component<any> {
    state = {
        value: this.props.value,
        deleteStatus: 0
    };

    openFile = () => {
        const url = 'http://localhost:8000/download.php?id=' + encodeURIComponent(this.state.value.file);
        window.open(url);
    }

    timeout = setTimeout(() => {}, 0);

    deleteEntry = (e: any) => {
        e.preventDefault();

        if (this.state.deleteStatus === 0) {
            this.setState({
                deleteStatus: 1
            });
            this.timeout = setTimeout(() => {
                this.setState({
                    deleteStatus: 0
                });
            }, 2500);
        } else if (this.state.deleteStatus === 1) {
            this.setState({
                deleteStatus: 2
            });
            clearTimeout(this.timeout);
            this.props.delete(this.state.value.id);
        }
    }

    render() {
        const from = new Date(this.state.value.from * 1000);
        const to = new Date(this.state.value.to * 1000);
        return (
            <div className={'entry ' + (this.state.value.status === 0 ? 'red' : (this.state.value.status === 1 ? '' : 'green'))}>
                <div>
                    <p className="from">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][from.getMonth()] + ' ' + from.getDate() + ', ' + from.getFullYear()}</p>
                    <p className="reason">{this.state.value.reason}</p>
                    <p className="to">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'][to.getMonth()] + ' ' + to.getDate() + ', ' + to.getFullYear()}</p>
                </div>
                <div>
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <button className="delete" onClick={this.deleteEntry} style={
                                    this.state.value.status !== 1 ? {display: 'none'}
                                    : (this.state.deleteStatus === 0 ? {} : (this.state.deleteStatus === 1 ? {
                                            backgroundColor: '#662222'
                                        } : {
                                        backgroundColor: '#66222288'
                                        }))
                                }>{this.state.deleteStatus === 0 ? 'Delete' : (this.state.deleteStatus === 1 ? 'Click Again to Delete' : 'Deleting...')}</button>
                                {this.state.value.file !== '' && <button className="download" onClick={this.openFile}>File <span style={{textDecoration: 'underline'}}>↓</span></button>}
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
