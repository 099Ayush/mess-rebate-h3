import React, {Component} from "react";
import axios from 'axios';
import './mainForm.css';
import HistoryEntry from "./historyEntry";

class MainForm extends Component {
    state = {
        rollNo: 0,
        rollNoEnc: 'Q82AjvO1f70Cn54HdjbEAZU9',
        name: '',
        email: '',
        roomNo: '',
        nDaysLeft: 0,
        displayText: 'Loading...',
        displayColor: '#666622',
        loading: true,
        showingHistory: false,
        historyLoaded: false,
        history: [],
        networkOut: false
    };

    formData = {
        rollNoEnc: 'Q82AjvO1f70Cn54HdjbEAZU9',
        from: 0,
        to: 0,
        file: undefined,
        reason: ''
    }

    alertClass = 'hidden';
    alertString = '';
    tmOut = setTimeout(() => {
    }, 0);
    submitStatus = 0;
    checkOverlapStatus = 0;

    componentDidMount() {
        axios.get('http://localhost:8000/get-userdata.php', {
            params: {
                rollNo: this.formData.rollNoEnc
            }
        }).then(
            (response) => {
                this.setState(response.data);
            },
            () => {
                const newState = JSON.parse(JSON.stringify(this.state));
                newState.displayText = 'Some error encountered. Please check your internet connection.';
                newState.displayColor = '#662222';
                newState.loading = false;
                newState.networkOut = true;
                this.setState(newState);
            }
        );

        axios.get('http://localhost:8000/get-history.php', {
            params: {
                rollNo: this.formData.rollNoEnc
            }
        }).then(response => {
            const data: any = {
                history: response.data,
                historyLoaded: true,
                loading: false
            };
            this.setState(data);
            if (this.nDaysLeft() <= 2) {
                data.displayText = 'You have reached the limit of 13-15 days for this semester.';
                data.displayColor = '#662222';
            }
            this.setState(data);
        }, error => {
            this.updateState('showingHistory', false);
            this.alert('Some error encountered while fetching history. Please check your network connection.', 'red', 3000);
        });
    }

    handleFocus = (e: any): void => {
        e.target.parentElement.querySelector('label').classList.add('active');
    }

    handleBlur = (e: any): void => {
        if (e.target.value === '' || e.target.value === null)
            e.target.parentElement.querySelector('label').classList.remove('active');
    }

    onSubmit = (e: any) => {
        e.preventDefault();
        if (this.submitStatus !== 0 || this.checkOverlapStatus !== 0) {
            return;
        }
        let minDate = new Date((new Date()).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata'
        }));
        const timeLeftToday = (-minDate.getTime() + minDate.setHours(17, 0, 0, 0)) / 1000;
        minDate.setHours(0, 0, 0, 0);
        minDate.setDate(minDate.getDate() + 1);
        if (timeLeftToday < 0) minDate.setDate(minDate.getDate() + 1);
        const minTime = minDate.getTime() / 1000;
        if (this.formData.from === 0) {
            this.alert('Enter starting date.', 'red', 2500);
        } else if (this.formData.to === 0) {
            this.alert('Enter ending date.', 'red', 2500);
        } else if (this.formData.from > this.formData.to) {
            this.alert('Enter dates in correct order.', 'red', 2500);
        } else if (this.formData.from < minTime) {
            this.alert('All dates must be on or after ' + minDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) + '.', 'red', 2500);
        } else if (this.formData.to - this.formData.from < 2 * 24 * 3600) {
            this.alert('You must apply for at least 3 days.', 'red', 2500);
        } else if (this.formData.to - this.formData.from > (this.nDaysLeft() - 1) * 24 * 3600) {
            this.alert('The application crosses the limit of 15 days.', 'red', 2500);
        } else if (this.formData.reason === '' || this.formData.reason === null) {
            this.alert('State a valid reason for the rebate.', 'red', 2500);
        } else {
            // @ts-ignore
            if (this.formData.file !== undefined && this.formData.file.type !== 'application/pdf') {
                this.alert('Required file type: PDF.', 'red', 2500);
            } else {
                this.checkOverlapStatus = 1;
                this.alert('Checking for overlapping requests...', '', 100000000);

                axios.get('http://localhost:8000/check-overlap.php', {
                    params: {
                        rollNo: this.formData.rollNoEnc,
                        from: this.formData.from,
                        to: this.formData.to
                    }
                }).then(response => {
                    if (response.data === 0) {

                        this.alert('Submitting...', '', 100000000);
                        const fD = new FormData(); // @ts-ignore
                        fD.append('file', this.formData.file); // @ts-ignore
                        fD.append('post', new Blob([JSON.stringify(this.formData)], {
                            type: 'application/json'
                        }));

                        this.submitStatus = 1;
                        this.checkOverlapStatus = 0;
                        axios.post('http://localhost:8000/upload.php', fD, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        })
                            .then((response) => {
                                console.log(response.data);
                                this.alert('Submitted.', 'green', 2500);
                                this.submitStatus = 2;
                                setTimeout(() => { // @ts-ignore
                                    window.location.href = window.location;
                                }, 2500);
                            }, () => {
                                this.alert('Some error encountered.', 'red', 3000);
                                this.submitStatus = 0;
                            });
                    } else {
                        this.alert('Overlap found. Please check your request history.', 'red', 3500);
                        this.checkOverlapStatus = 0;
                    }
                }, () => {
                    this.alert('Some error encountered.', 'red', 3000);
                    this.checkOverlapStatus = 0;
                });
            }
        }
        return 0;
    };

    alert: any = (message: string, cls: string, t: number) => {
        this.alertString = message;
        this.alertClass = cls;
        clearTimeout(this.tmOut);
        this.tmOut = setTimeout(() => {
            this.alertClass = 'hidden';
            this.forceUpdate();
        }, t);
        this.forceUpdate();
    };

    showHistory: any = (e: any) => {
        e.preventDefault();
        this.updateState('showingHistory', true);
        this.alert('', '', 3600000);
        if (this.state.historyLoaded) return;
        axios.get('http://localhost:8000/get-history.php', {
            params: {
                rollNo: this.formData.rollNoEnc
            }
        }).then(response => {
            this.updateState('history', response.data);
            this.updateState('historyLoaded', true);
        }, error => {
            this.updateState('showingHistory', false);
            this.alert('Some error encountered while fetching history. Please check your network connection.', 'red', 3000);
        });
    };

    updateState(property: string, value: any) {
        const newState = JSON.parse(JSON.stringify(this.state));
        newState[property] = value;
        this.setState(newState);
    }

    closeHistoryDialogBox: any = () => {
        this.alertString = '';
        this.alert('', '', 0);
        setTimeout(() => {
            this.updateState('showingHistory', false);
            this.updateState('historyLoaded', false);
        }, 300);
    };

    deleteEntry = (id: string) => {
        const ret = axios.get('http://localhost:8000/delete-request.php', {
            params: {
                id
            }
        });

        ret.then(response => {
            this.updateState('historyLoaded', false);
            this.showHistory({
                preventDefault: () => {
                }
            });
        });

        return ret;
    }

    nDaysLeft = () => {
        let s = 0;
        for (const entry of this.state.history) {
            s += (entry['to'] - entry['from']) / 3600 / 24 + 1;
        }
        return 15 - s;
    }

    render() {
        return (
            <div>
                {this.nDaysLeft() > 2 && !this.state.networkOut && !this.state.loading ?
                    <form action="" className="MainForm" onSubmit={this.onSubmit} encType="multipart/form-data">
                        <button id="viewHistoryButton" style={this.state.loading ? {display: 'none'} : {}}
                                onClick={this.showHistory}>View History
                        </button>
                        <button id="logOutButton">Log Out</button>
                        <div className="inputField">
                            <label className="active" htmlFor="rollNoInput">Roll No.</label>
                            <input name="rollNo" id="rollNoInput" type="number" value={this.state.rollNo}
                                   disabled={true}/>
                        </div>
                        <div className="inputField">
                            <label className="active" htmlFor="nameInput">Name</label>
                            <input id="nameInput" type="text" value={this.state.name} disabled={true}/>
                        </div>
                        <div className="inputField">
                            <label className="active" htmlFor="emailInput">Email</label>
                            <input name="email" id="emailInput" type="email" value={this.state.email} disabled={true}/>
                        </div>
                        <div className="inputField">
                            <label className="active" htmlFor="roomNoInput">Room No.</label>
                            <input name="roomNo" id="roomNoInput" type="text" value={this.state.roomNo}
                                   disabled={true}/>
                        </div>
                        <div className="inputField boxField">
                            <div>
                                <label htmlFor="fromInput">From*</label>
                                <input name="fromDate" id="fromInput" type="date" onInput={(e: any) => {
                                    this.formData.from = (new Date(e.target.value)).getTime() / 1000;
                                    this.forceUpdate();
                                }}/>
                            </div>
                            <div>
                                <label htmlFor="toInput">To*</label>
                                <input name="toDate" id="toInput" type="date" onInput={(e: any) => {
                                    this.formData.to = (new Date(e.target.value)).getTime() / 1000;
                                    this.forceUpdate();
                                }}/>
                            </div>
                            <span className="info">{this.nDaysLeft()} days left for this semester<span
                                style={(this.formData.from !== 0 && this.formData.to !== 0 && this.formData.to > this.formData.from) ? {} : {display: 'none'}}>, {(this.formData.to - this.formData.from) / 3600 / 24 + 1} selected</span>.</span>
                        </div>
                        <div className="inputField">
                            <label htmlFor="reasonInput">Reason*</label>
                            <textarea name="reason" onFocus={this.handleFocus} onBlur={this.handleBlur} rows={5}
                                      id="reasonInput" onInput={(e: any) => {
                                this.formData.reason = e.target.value
                            }}/>
                        </div>
                        <div className="inputField boxField" id="fileInputField">
                            <label className="auxLabel">Supporting File</label>
                            <label id="labelForFileInput" htmlFor="fileInput">
                                <button id="LFPIButton1" onClick={(e) => {
                                    e.preventDefault();
                                    // @ts-ignore
                                    document.getElementById('fileInput').click();
                                }}>Add File (PDF)
                                </button>
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    // @ts-ignore
                                    document.getElementById('fileInput').value = '';
                                    // @ts-ignore
                                    document.getElementById('LFPIButton1').innerHTML = "Add File (PDF)";
                                }}>Clear
                                </button>
                            </label>
                            <input name="file" id="fileInput" type="file" onInput={(e: any) => {
                                if ((e.target.files.length === 0 || e.target.files[0].size > 1048576 || e.target.files[0].type !== 'application/pdf') && this.formData.file) {
                                    const dt = new ClipboardEvent('').clipboardData || new DataTransfer();
                                    // @ts-ignore
                                    dt.items.add(this.formData.file);
                                    e.target.files = dt.files;
                                }
                                console.log(e.target.files);
                                if (e.target.files[0].size > 1048576) {
                                    this.alert('File must be under 1 MiB size.', 'red', 2500);
                                    e.target.value = '';
                                    return;
                                } else if (e.target.files[0].type !== 'application/pdf') {
                                    this.alert('Required file type: PDF.', 'red', 2500);
                                    e.target.value = '';
                                    return;
                                }
                                // @ts-ignore
                                document.getElementById('LFPIButton1').innerHTML = e.target.files[0].name;
                                this.formData.file = e.target.files[0];
                            }}/>
                        </div>
                        <div className="inputField">
                            <input type="submit"/>
                        </div>
                    </form> :
                    <div id="notAvailable" style={{backgroundColor: this.state.displayColor}}>
                        <p>
                            {this.state.displayText}
                        </p>
                        <button id="viewHistoryButton"
                                style={this.state.loading || this.state.networkOut ? {display: 'none'} : {}}
                                onClick={this.showHistory}>View History
                        </button>
                        <button id="logOutButton" style={this.state.networkOut ? {display: 'none'} : {}}>Log Out
                        </button>
                    </div>}
                <div id="alertBg" className={this.alertClass}/>
                <div id="alert" className={this.alertClass}>
                    {this.state.showingHistory && <div id="historyDiv">
                        <button id="closeHistory" onClick={this.closeHistoryDialogBox}>Close</button>
                        {this.state.historyLoaded ? (this.state.history.length === 0 ?
                                <div style={{textAlign: 'center'}}>No request yet</div> :
                                this.state.history.reverse().map(el => <div key={this.state.history.indexOf(el)}
                                                                  onClick={() => console.log(el['id'])}>
                                    <HistoryEntry key={this.state.history.indexOf(el)} delete={this.deleteEntry}
                                                  value={el}/>
                                </div>)
                        ) : <div id="loadingPrompt">Loading...</div>}
                    </div>}
                    {!this.state.showingHistory && <div id="alertDiv">{this.alertString}</div>}
                </div>
            </div>
        );
    }
}

export default MainForm;
