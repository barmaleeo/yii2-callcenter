import React, {Component} from 'react';

import './phoneStyle.scss'
import {STATE_RINGING, STATE_GO_TALK, STATE_TALKING, STATE_ENDING, STATE_BUSY} from '../../index';

export default class Phone extends Component {
    render() {
        const p = this.props;
        const s = this.state;
        const ps = p.state;
        const cancelEnabled = (ps == STATE_RINGING || ps == STATE_TALKING ||
            ps == STATE_GO_TALK || ps == STATE_ENDING || ps == STATE_BUSY)
        console.log()
        return (
            <div className="cc-phone-outher">
                <div className="p-o-block-wrapper p-o-logo">
                    <div className="o-l-img">Лого</div>
                    <div className="o-l-power"
                         onClick={p.onClickPower}>Вкл</div>
                </div>
                <div className="p-o-block-wrapper p-o-number">
                    <div className="o-n-lights">
                        <div className="n-lighs-ws"></div>
                        <div className={'n-lighs-sip'+(p.register?' green':'')}></div>
                        <div className="n-lighs-query"></div>
                    </div>
                    <div className="o-n-digits">
                        <span>88888888888888</span>
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