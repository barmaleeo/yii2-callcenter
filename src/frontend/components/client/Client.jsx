import React, {Component} from 'react';
import './clientStyle.scss'

export default class Client extends Component {
    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="cc-client-outher">Hello from Clientttttt!</div>
        )
    }
}