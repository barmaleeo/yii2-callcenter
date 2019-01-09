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
    state = {ajaxNum:0, ajaxError:false};
    getButtonsBlock = (b, n) => {
        const blocks = [];
        for(const prop in b){
            if(b.hasOwnProperty(prop)){
                blocks.push({name:prop, items:b[prop]})
            }
        }
        const self = this;
        function renderItem(item, k){
            
            let handleClick = () => {}
            if(typeof item.action == 'string'){
                handleClick = () => {window[item.action](self.props.parent)}
            }else if(parseInt(item.event) > 0){
                handleClick = () => {self.props.logCall(item.event, item.comment, item.goal, item.data)}
            }
            
            return (
                <button key={k}
                        className={'btn btn-default'+(item.width?' width-'+item.width:'')}
                        onClick={handleClick}>
                    {item.name}
                </button>
            )
        }
        return (
            <div className="p-o-block-wrapper p-o-custom">
                {blocks.map((block, n) => (
                    <fieldset key={n}>
                        <legend>{block.name}</legend>
                        {block.items.map(renderItem)}
                    </fieldset>)
                )}
            </div>
        )
    }
    componentDidMount = () => {
        //перехватываем все запросы ajax от офиса
        let self = this;
        $(document).ajaxSend(function (evt, request, settings) {
            self.state.ajaxNum++;
            self.setState(self.state);
        }).ajaxSuccess(function (evt, request, settings) {
            if(self.state.ajaxNum>0){
                self.state.ajaxNum--;
            }
            self.state.ajaxError = false;
            self.setState(self.state);
        }).ajaxError(function (evt, request, settings) {
            if(self.state.ajaxNum>0){
                self.state.ajaxNum--;
            }
            self.state.ajaxError = true;
            self.setState(self.state);
        });

    }
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
        const o = this.props.options;
        
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
        
        let ajaxBg;
        let ajaxTitle;
        if(s.ajaxError){
            ajaxBg = 'red';
            ajaxTitle = 'Последний запрос к серверу выполнен с ошибкой.';
        }else if(s.ajaxNum>0){
            ajaxBg = 'yellow';
            ajaxTitle = 'Запрос к серверу выполняется.';
        }else{
            ajaxBg = '#008000';
            ajaxTitle = 'Система работает нормально. Запросы к серверу выполняются без ошибок.';
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
                        <div className={'n-lighs-ws'+(p.wsState?' green':'')}></div>
                        <div className={'n-lighs-sip'+(p.register?' green':'')}></div>
                        <div className="n-lighs-query" title={ajaxTitle} style={{background:ajaxBg}}/>
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
                {this.getButtonsBlock(o.buttons)}
            </div>
        )
    }
}