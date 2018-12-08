import React, {Component} from 'react';

import './phoneStyle.scss'

export default class Phone extends Component {
    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="cc-phone-outher">
                <div className="p-o-block-wrapper p-o-logo">
                    <div className="o-l-img">Лого</div>
                    <div className="o-l-power"
                         onClick={p.onClickPower}>Вкл</div>
                </div>
                <div className="p-o-block-wrapper p-o-number">
                    <div className="o-n-lights">
                        <div className={'n-lighs-ws'+(p.register?' green':'')}></div>
                        <div className="n-lighs-sip"></div>
                        <div className="n-lighs-query"></div>
                    </div>
                    <div className="o-n-digits">
                        <span>88888888888888</span>
                    </div>
                </div>
                <div className="p-o-block-wrapper p-o-buttons">
                    <button className="btn btn-xl btn-danger">l</button>
                    <button className="btn btn-xl btn-success">l</button>
                </div>
                <div className="p-o-block-wrapper p-o-transfer">
                    <button className="btn btn-default"></button>
                    <select className="form-control">
                        <option>888888888</option>
                        <option>777777777</option>
                    </select>
                    <button className="btn btn-default"></button>
                </div>
                <div className="p-o-block-wrapper p-o-custom">пользовательские</div>

            </div>
        )
    }
}