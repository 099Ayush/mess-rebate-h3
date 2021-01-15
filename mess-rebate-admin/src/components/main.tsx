import React, {Component} from "react";
import './main.css';
import HistoryEntry from "./historyEntry";
import axios from "axios";

class Main extends Component {
    state = {
        historyLoaded: false,
        history: [],
        rollNoEnc: 'Q82AjvO1f70Cn54HdjbEAZU9',
        error: false,
        alertClass: 'hidden',
        alertString: ''
    };

    componentDidMount() {
        this.fetchHistory();
    }

    fetchHistory: any = () => {
        this.alert('Fetching history...', '', 3600000);
        this.setState({
            historyLoaded: false
        });
        axios.get('http://localhost:8000/get-all-history.php', {
            params: {
                rollNoEnc: encodeURIComponent(this.state.rollNoEnc)
            }
        }).then(response => {
            this.setState({history: response.data, historyLoaded: true});
            this.alert('Fetching history...', '', 0);
        }, error => {
            this.alert('Some error encountered while fetching history. Please check your network connection.', 'red', 3000);
        });
    }

    tmOut = setTimeout(() => {}, 0);

    alert: any = (message: string, cls: string, t: number) => {
        this.setState({
            alertString: message,
            alertClass: cls
        });
        clearTimeout(this.tmOut);
        this.tmOut = setTimeout(() => {
            this.setState({
                alertClass: 'hidden'
            });
        }, t);
    };

    render() {
        if (!this.state.error)
        return (
            <React.Fragment>
                <div id="historyDiv">
                    <button id="logOutButton" style={{marginBottom: '30px'}}>Log Out</button>
                    <button id="refreshButton" style={{marginBottom: '30px'}} onClick={this.fetchHistory}>Refresh</button>
                    {(this.state.history.length === 0 ?
                            <div style={{textAlign: 'center'}}>No request yet.</div> :
                            this.state.history.reverse().map(el => <div key={this.state.history.indexOf(el)}>
                                <HistoryEntry key={this.state.history.indexOf(el)} update={this.fetchHistory}
                                              value={el} alert={this.alert}/>
                            </div>)
                    )}
                </div>
                <div id="alertBg" className={this.state.alertClass}/>
                <div id="alert" className={this.state.alertClass}>
                    {this.state.alertString}
                </div>
            </React.Fragment>
        );
        else return (
            <div id="notAvailable" style={{backgroundColor: '#662222'}}>
                <p>
                    An error encountered while fetching history. Please check your network connection.
                </p>
                <button id="logOutButton">Log Out</button>
            </div>
        );
    }
}

export default Main;
