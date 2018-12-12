import React, {Component} from 'react';

import './phoneStyle.scss'
import {
    STATE_OFF,
    STATE_GO_ON,
    STATE_READY,
    STATE_CALLING,
    STATE_PROGRESS,
    STATE_RINGING,
    STATE_GO_TALK,
    STATE_TALKING,
    STATE_ENDING,
    STATE_BUSY,
    STATE_GO_OFF
} from '../../constants/phoneStates';


export default class Phone extends Component {
    getDisplayValue = () => {
        const data  = this.props.display + '';

        const empty = '888888888888888';
        const el = empty.length;
        const dl = data.length
        const ps = this.props.state;
        const blink = ps == STATE_PROGRESS ||ps == STATE_RINGING || ps == STATE_CALLING || ps == STATE_GO_TALK;
        if(dl>el){
            return (
                <span className="n-d-full">
                    <span className={'d-f-data'+(blink?' blink':'')}>{data.substring(0,el)}</span>
                </span>)
        }

        const bl = Math.floor((el-dl)/2);
        const al = el - bl - dl;
        return (
            <span className="n-d-full">
                {empty.substring(0,bl)}
                <span className={'d-f-data'+(blink?' blink':'')}>{data}</span>
                {empty.substring(0, al)}
            </span>)

    }
    render() {
        const p = this.props;
        const s = this.state;
        const ps = p.state;
        
        let logo = '';
        let style;
        if(p.options.logo){
            const l = p.options.logo;
            if(typeof l == 'object'){
                style = {backgroundColor:l.bgColor, padding:l.padding};
                logo = <img className="yii2-callcenter-logo" src={l.url}/>
            }
        }
        
        const cancelEnabled = (ps == STATE_PROGRESS || ps == STATE_RINGING || ps == STATE_TALKING ||
            ps == STATE_GO_TALK || ps == STATE_ENDING || ps == STATE_BUSY)
        console.log('Phone render ', cancelEnabled, ps)
        let powerClass;
        switch (ps){
            case STATE_OFF:
                powerClass = " red";
                break;
            case STATE_GO_OFF:
            case STATE_GO_ON:
                powerClass = ' disabled';
                break;
            default:
                powerClass = ' green';
        }
        return (
            <div className="cc-phone-outher">
                <div className="p-o-block-wrapper p-o-logo">
                    <div className="o-l-lines">0</div>
                    <div className="o-l-img" style={style}>{logo}</div>
                    <div className={'o-l-power'+powerClass}
                         onClick={p.onClickPower}>
                        <span className="glyphicon glyphicon-off"/>
                    </div>
                </div>
                <div className="p-o-block-wrapper p-o-number">
                    <div className="o-n-lights">
                        <div className="n-lighs-ws"></div>
                        <div className={'n-lighs-sip'+(p.register?' green':'')}></div>
                        <div className="n-lighs-query"></div>
                    </div>
                    <div className="o-n-display">
                        {this.getDisplayValue()}
                    </div>
                </div>
                <div className="p-o-block-wrapper p-o-buttons">
                    <button className="btn btn-xl btn-danger"
                            disabled={!cancelEnabled}
                            onClick={p.onClickCancel}>
                        <span className="glyphicon glyphicon-phone-alt"/>
                        </button>
                    <button className="btn btn-xl btn-success"
                            disabled={!(ps == STATE_RINGING)}
                            onClick={p.onClickAnswer}>
                        <span className="glyphicon glyphicon-earphone"/>
                    </button>
                </div>
                <div className="p-o-block-wrapper p-o-transfer">
                    <button className="btn btn-default"
                            onClick={p.onClickTransfer}>
                        <span className="glyphicon glyphicon-arrow-right"/>
                    </button>
                    <select className="form-control">
                        <option>888888888</option>
                        <option>777777777</option>
                    </select>
                    <button className="btn btn-default"
                            onClick={p.onClickHold}>
                        <span className="glyphicon gluphicon-mic"/>
                    </button>
                </div>
                <div className="p-o-block-wrapper p-o-custom">
                    <button className="btn btn-default"
                            onClick={p.onClickCustom.bind(this, '0')}>Прайслист по СМС</button>
                    <button className="btn btn-default"
                            onClick={p.onClickCustom.bind(this, '2002')}>Контакты по СМС</button>
                </div>
                <div className="p-o-block-wrapper p-o-custom">
                    <button className="btn btn-default"
                            onClick={p.onClickCustom.bind(this, '0980966206')}>098-096-62-06</button>
                    <button className="btn btn-default"
                            onClick={p.onClickCustom.bind(this, '9694')}>9694</button>
                </div>
                <div className="p-o-block-wrapper p-o-custom">
                    <button className="btn btn-default"
                            onClick={p.onClickCustom.bind(this, '2002')}>2002</button>
                    <button className="btn btn-default"
                            onClick={p.onClickCustom.bind(this, '2003')}>2003</button>
                    <button className="btn btn-default"
                            onClick={p.onClickCustom.bind(this, '5000')}>5000</button>
                </div>

            </div>
        )
    }
}