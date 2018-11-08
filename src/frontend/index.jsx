
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import Outcalls from './components/outcalls/Outcalls.jsx'
import Client   from './components/client/Client.jsx'
import Wiki     from './components/wiki/Wiki.jsx'
import Phone    from './components/phone/Phone.jsx'
import SIP      from 'sip.js'

import './index.scss'

class CallcenterRoot extends Component {
    state = {}
    componentDidMount(){
        const p = this.props;
        const s = this.state;
        const c = p.options.sip;
        s.ua = new SIP.UA({
            uri: c.uri,
            transportOptions: {
                wsServers: [c.ws]
            },
            authorizationUser: c.name,
            password: c.password
        })
    }
    render() {
        return (
            <div className="cc-outher">
                <div className="c-o-left">
                    <Outcalls/>
                    <Client/>
                    <Wiki/>
                </div>
                <div className="c-o-right">
                    <Phone/>
                </div>
            </div>
        )
    }
}

const root = document.getElementById('yii2-callcenter-root')

const options = JSON.parse(root.dataset.options)

ReactDOM.render(<CallcenterRoot options={options}/>, root)