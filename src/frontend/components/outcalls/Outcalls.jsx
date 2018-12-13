import React, {Component} from 'react';
//import $ from 'jquery';
import {sdt, cDate} from '../../helpers/dateHelper';

import {
    STATE_READY,
} from '../../constants/phoneStates';


import './outcallsStyle.scss'

export default class Outcalls extends Component {
    state = {outcalls:[], types:[], loading:true, error:false}
    componentDidMount(){
        const self = this;
        const s = this.state;
        $.get('callcenter/get-outcalls',{},(r) => {
            console.log(r)
            self.state = {outcalls:r.outcalls, types:r.types, loading:false, error:false};
            for(const o of self.state.outcalls){
                self.addOutcallType(o);
            }
            self.setState(self.state)
        }, 'json').fail((e) => {
                console.log(e)
                self.setState({outcalls:[],types:[], loading:false, error:e.responseText})
            })
    }
    addOutcallType(o){
        for(const n in this.state.types){
            if(o.type_id == this.state.types[n].id){
                o.type_name =this.state.types[n].name;
                o.type_desc =this.state.types[n].desc;
                return;
            }
        }
    }
    handleClickSelectClient = (id) => {
        this.props.onClickClient(id)
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
                                <td className="o-type">{o.type_name}</td>
                                <td className="o-name">{o.name}</td>
                                <td className="o-phone">{o.phone}</td>
                                <td className="o-desc">
                                    <button className="btn btn-info btn-block btn-xs"
                                            onClick={p.onClickClient.bind(this, o.user_id)}>
                                        <span className="glyphicon glyphicon-user"></span>
                                    </button>
                                </td>
                                <td className="o-attempt">{o.attempt}1</td>
                                <td className="o-call-button">
                                    <button className="btn btn-success btn-block btn-xs"
                                            onClick={p.onClickCall.bind(this, o.phone, o.user_id, o.id)}
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