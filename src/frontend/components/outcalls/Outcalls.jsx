import React, {Component} from 'react';
//import $ from 'jquery';
import {sdt, cDate} from '../../helpers/dateHelper';

import {
    STATE_READY,
} from '../../constants/phoneStates';


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
                <table className="table table-condensed outcalls">
                    <tbody>
                {s.outcalls.map((o,n) => (
                    <tr key={n}>
                        <td className="o-date">{sdt(cDate(o.created))}</td>
                        <td className="o-desc">
                            <span className="glyphicon glyphicon-question-sign"></span>
                        </td>
                        <td className="o-type">{o.type}</td>
                        <td className="o-name">{o.name}</td>
                        <td className="o-phone">{o.phone}</td>
                        <td className="o-desc">
                            <button className="btn btn-info btn-block btn-xs">
                                <span className="glyphicon glyphicon-user"></span>
                            </button>
                        </td>
                        <td className="o-attempt">{o.attempt}1</td>
                        <td className="o-call-button">
                            <button className="btn btn-success btn-block btn-xs"
                                    onClick={p.onClickCall.bind(this, o.phone)}        
                                    disabled={p.state != STATE_READY}>Позвонить</button>
                        </td>
                    </tr>
                ))}
                    </tbody>
                </table>
            </div>
        )
    }
}