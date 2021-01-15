import React from 'react';
import './App.css';
import MainForm from './components/mainForm';
import axios from 'axios';

class App extends React.Component {
    uriComps = {
        clientId: 'PQ9NCXcuhn8PiRA4JgquG5WUOIF4LC1iUXHJsT4J',
        redirectURI: 'http://localhost:3000/'
    }

    state = {
        isLogging: false,
        userToken: undefined,
        loginError: false
    }

    componentDidMount() {
        if (!localStorage.getItem('h3mrToken5347')) {
            const retCode = (new URL(window.location.href)).searchParams.get('code');
            if (retCode) {
                this.setState({
                    isLogging: true
                });
                axios.post('http://localhost:8000', {
                    code: retCode
                }).then(value => {
                    console.log(value);
                }, reason => {
                    console.log(reason);
                });
            }
        } else {
            this.setState({
                userToken: localStorage.getItem('h3mrToken5347')
            });
        }
    }

    render() {
        return (
            <div className="App">
                <header>
                    <h2>Mess Rebate Portal</h2>
                    <h4>Hostel 3</h4>
                </header>
                {this.state.userToken ?
                    <MainForm/>
                    :
                    <div style={{
                        textAlign: 'center',
                        padding: '50px'
                    }}>
                        <a href={'https://gymkhana.iitb.ac.in/profiles/oauth/authorize/?client_id=' + this.uriComps.clientId + '&response_type=code&scope=profile+ldap+insti_address+send_mail&redirect_uri=' + this.uriComps.redirectURI}
                           style={{
                               color: 'inherit'
                           }}>
                            <button disabled={this.state.isLogging}
                                    className={this.state.isLogging ? 'disabled' : ''}>
                                {this.state.isLogging ? 'Logging in...' : 'Login with SSO'}
                            </button>
                        </a>
                    </div>
                }
            </div>
        );
    }
}

export default App;
