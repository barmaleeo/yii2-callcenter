import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './clientStyle.scss'

export default class Client extends Component {
    componentDidMount = () => {
        if(this.props.options.client){
            const c = this.props.options.client;
            let name;
            if(c.name){
                name = c.name;
            }else{
                name = 'CallcenterClient';
            }
            switch (c.type){
                case 'react':
                    ReactDOM.render(window[name], this.refs.container);
                    break;
                case 'function':
                    window[name](this, this.refs.container);
                    break;
                case 'html':
                    break;
                case 'url':
                    break;
            }
        }

    }
    clickArea = () => {

    }
    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="cc-client-outher" ref="container">Loading...</div>
        )
    }
}