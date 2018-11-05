
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import Outcalls from './components/outcalls/Outcalls.jsx'
import Client   from './components/client/Client.jsx'
import Wiki     from './components/wiki/Wiki.jsx'
import Phone    from './components/phone/Phone.jsx'

import './index.scss'

class CallcenterRoot extends Component {
    state = {}
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