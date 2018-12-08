import React, {Component} from 'react';
//import $ from 'jquery';

import './outcallsStyle.scss'

export default class Outcalls extends Component {
    state = {outcalls:[],loading:true, error:false}
    componentDidMount(){
        const self = this;
        const s = this.state;
        $.get('callcenter/get-outcalls',{},(r) => {
            console.log(r)
            self.setState({outcalls:r, loading:false, error:false})
        }, 'json').fail((e) => {
                console.log(e)
                self.setState({outcalls:[], loading:false, error:e.responseText})
            })
    }
    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="cc-outcalls-outher">
                <table>
                    <tbody>
                {s.outcalls.map((o,n) => (
                    <tr>
                        <td>{o.created}</td>
                        <td>{o.type}</td>
                        <td>{o.name}</td>
                        <td><button>{o.phone}</button></td>
                    </tr>
                ))}
                    </tbody>
                </table>
            </div>
        )
    }
}