
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import Outcalls from './components/outcalls/Outcalls.jsx'
import Client   from './components/client/Client.jsx'
import Wiki     from './components/wiki/Wiki.jsx'
import Phone    from './components/phone/Phone.jsx'
import SIP      from 'sip.js'

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
} from './constants/phoneStates'

import './index.scss'


class CallcenterRoot extends Component {
    state = {
        soundPhone:document.getElementById('sound-phone'),
        session:false,
        phoneState:STATE_OFF,
        answer:false,
        callId:0,
        userId:0,
        display:'',
    }
    componentDidMount(){
        const self = this;
        const p = this.props;
        const s = this.state;
        const o = p.options;
        const c = o.sip;

        const options = {
            sessionDescriptionHandlerOptions: {
                constraints: {audio: true, video: false},
            }//,
            // extraHeaders:[
            //     'X-user-domain: ' + 'hhhjjj'//p.sip.sip_host
            // ]
        };

        s.ua = new SIP.UA({
            uri: c.name+'@'+c.url,
            transportOptions: {
                wsServers: [c.ws],
                traceSip: true,
                maxReconnectionAttempts:1000000000
            },
            log:{
                level:'debug',
            },
            authorizationUser:  c.name,
            password:           c.password,
            hackIpInContact:    false,
            hackWssInTransport: false,
            hackViaTcp:         false

        })
        s.ua.on('invite', (session) => {
            const self = this;
            const s = this.state;
            if(s.phoneState == STATE_READY) {

                try {
                    const stats = JSON.parse(session.request.headers['X-Stats'][0].raw);
                    s.userId = stats.id;
                    s.callId = stats.call_id;
                    self.selectClient(s.userId);
                } catch (e) {
                    console.log(e);
                }
                
                self.logCall(8, 'Включен сигнал вызова');
                self.refs.soundPhoneRing.play();
                s.session = session;
                s.phoneState = STATE_RINGING;
                s.display = s.session.remoteIdentity.displayName;
                self.setState(s);


                //session.accept();

                session.on('accepted', function (e) {

                    self.refs.soundPhoneRing.pause();
                    self.refs.soundPhoneRing.currentTime = 0;

                    const pc = session.sessionDescriptionHandler.peerConnection;
                    const remoteStream = new MediaStream();
                    pc.getReceivers().forEach(function (receiver) {
                        const track = receiver.track;
                        if (track) {
                            remoteStream.addTrack(track);
                        }
                    });
                    s.soundPhone.srcObject = remoteStream;

                    s.phoneState = STATE_TALKING;
                    self.setState(s);
                    console.log('Incoming call accepted', session);
                    self.logCall(10, 'Начало разговора');

                });
                session.on('failed', function (e, cause) {
                    self.logCall(3, "Неудачное завершение входящего звонка", 0, cause);
                })
                session.on('bye', function (e) {
                    self.logCall(13, 'Окончание разговора');
                })
                session.on('muted', (data) => {
                    if (data.audio) {
                        self.logCall(17, 'Сall is Muted');
                    }
                });

                session.on('unmuted', (data) => {
                    if (data.audio) {
                        self.logCall(18, 'Сall is Unmuted');
                    }
                });
            }
            session.on('terminated', (cause) => {

                //if(session)
                console.log('incoming call terminated' + cause);

                if(self.state.phoneState == STATE_READY) {
                    // Здесь делаем
                    return;
                } else if(self.state.answer == false){
                    self.state.phoneState = STATE_READY;
                } else if(self.state.phoneState == STATE_GO_OFF){
                    self.state.phoneState = STATE_OFF;
                } else {
                    self.state.phoneState = STATE_BUSY;
                }
                self.state.answer = false;
                self.refs.soundPhoneRing.pause();
                self.refs.soundPhoneRing.currentTime = 0;
                self.state.session = false;
                self.setState(self.state);
            });
        });
        s.ua.on('registered', () => {
            const s = this.state;
            if(s.phoneState == STATE_GO_ON || s.phoneState == STATE_OFF){
                s.phoneState = STATE_READY;
                s.display = '';
            }
            self.setState(s)
            console.log('Sip phone registered', s)
        })
        s.ua.on('unregistered', (response, cause) => {
            const s = this.state;
            if(s.phoneState == STATE_GO_OFF){
                s.phoneState = STATE_OFF;
            }
            console.log('Sip phone ubregistered', cause, s);

            self.setState(s)

        })
        s.ua.on('registrationFailed', (response, cause) => {
            const s = this.state;
            console.log('Sip phone registration failed', cause)
            if(s.phoneState == STATE_GO_ON){
                s.phoneState = STATE_OFF;
            }
            self.setState(s)
        })
    }
    onClickPower = (e) => {
        console.log('onClickPower', this.state)
        const self = this;
        if(this.state.phoneState == STATE_OFF){
            this.state.phoneState = STATE_GO_ON;
            this.setState(this.state, () => {
                self.state.ua.register();
            })
        }else if (this.state.phoneState == STATE_READY){
            this.state.phoneState = STATE_GO_OFF;
            this.setState(this.state, () => {
                self.state.ua.unregister();
            })
        }
    };
    onClickCancel = (e) => {
        console.log('clickCancel', this)
        this.logCall(14, 'Нажата кнопка Завершить звонок');
        if(this.state.phoneState == STATE_BUSY){
            this.state.phoneState = STATE_READY;
            this.state.callId = 0;
            this.state.display = '';
            this.setState(this.state)
        }else if(this.state.session){
            this.state.session.terminate()
            this.state.session = false;
            this.setState(this.state)
        }
    };
    onClickAnswer = () => {
        if(this.state.session && this.state.phoneState == STATE_RINGING){
            this.logCall(9, 'Нажата кнопка Взять звонок');
            this.state.answer = true;
            this.state.session.accept({
                sessionDescriptionHandlerOptions: {
                    constraints: {audio: true, video: false},
                },
            })
            this.state.phoneState = STATE_GO_TALK;
            this.setState(this.state)
        }
        console.log('cliclAccept')
    }
    onClickHold = () => {

    }
    onClickTransfer = () => {

    }
    onClickCustom = (phone) => {
        this.makeCall(phone)
    }
    onClickCall = (phone, uid, callId) => {
        this.selectClient(uid)
        this.makeCall(phone, callId);
    }
    onClickInfo = (userId) => {
        console.log('clickInfo', userId)
    }
    selectClient = (id) =>{
         if(typeof this.props.options == 'object' &&
             typeof this.props.options.client == "object" &&
             this.props.options.client.select
         ) {
            window[this.props.options.client.select](id)
         }
    }
    makeCall(phoneNumber, callId){
        const self = this;
        if(self.state.phoneState != STATE_READY){
            return;
        }
        const options = {
            sessionDescriptionHandlerOptions: {
                constraints: {audio: true, video: false},
            },
             extraHeaders: [
                 'X-user-domain: ' + this.props.options.sip.url,
                 'X-callid: ' + callId,
             ]
        };
        self.state.callId = callId;
        self.state.display = phoneNumber;
        self.state.phoneState = STATE_CALLING;
        self.setState(self.state)
        self.state.session = this.state.ua.invite(phoneNumber + '@'+this.props.options.sip.url, options);
        self.state.session.on('progress', (response) => {
            self.logCall(2, 'Старт вызова');  // старт вызова
            if(self.state.phoneState == STATE_CALLING){
                self.state.phoneState = STATE_PROGRESS;
                try {
                    self.refs.soundPhoneRingback.play();
                }catch (e) {
                    console.log(e)
                }
                self.setState(self.state)
            }
        })
        self.state.session.on('accepted', (e, a) => {  // поднятие трубки на том конце
            console.log('Outgoing  call accepted', e, a, this);
            self.refs.soundPhoneRingback.pause();
            self.refs.soundPhoneRingback.currentTime = 0;

            const pc = self.state.session.sessionDescriptionHandler.peerConnection;
            const remoteStream = new MediaStream();
            pc.getReceivers().forEach(function (receiver) {
                const track = receiver.track;
                if (track) {
                    remoteStream.addTrack(track);
                }
            });
            self.state.soundPhone.srcObject = remoteStream;
            try {
                self.state.soundPhone.play();
            }catch (e) {
                console.log(e)
            }
            self.state.phoneState = STATE_TALKING;
            self.setState(self.state)
            self.logCall(10, 'Начало разговора');
        })
        self.state.session.on('failed', (e, cause) => {
            console.log('Outgoing  call failed '+ cause);
            if(cause==='Busy') {// Номер занят
                self.logCall(3,"Номер занят", 0, cause);
            }else if (cause==='No Answer') { // Номер не отвечает
                self.logCall(4, "Номер не отвечает", 0,  cause)
            }else { // ошибка соединения
                self.logCall(1, "Ошибка соединения", 0, cause);
            }

        })
        self.state.session.on ('muted', (data) => {
            if (data.audio) {
                self.logCall(17, 'Сall is Muted');
            }
        });

        self.state.session.on ('unmuted', (data) => {
            if (data.audio) {
                self.logCall(18, 'Сall is Unmuted');
            }
        });

        self.state.session.on('bye', (e) => {
            self.logCall(13,'Окончание разговора');

        })
        self.state.session.on('terminated',(cause) => {
            console.log('outgoing call terminated' + cause);
            self.refs.soundPhoneRingback.pause();
            self.refs.soundPhoneRingback.currentTime = 0;
            if(self.state.phoneState == STATE_GO_OFF){
                self.state.phoneState = STATE_OFF;
            }else{
                self.state.phoneState = STATE_BUSY;
            }
            self.state.session = false;
            self.setState(self.state);

        })
    }
    logCall = (event, comment, goal, data) => {

        if (this.state.callId == -10 //||
            // (
            //     this.props.phoneState != P.PHONE_STATUS_RINGING &&
            //     this.propsphoneState  != P.PHONE_STATUS_TALKING &&
            //     this.props.phoneState != P.PHONE_STATUS_SWITCH_IN_USE  &&
            //     this.props.phone.phoneStatus != P.PHONE_STATUS_IN_USE)
            ) {
            return;
        }
        if (goal===undefined) {goal = 0;}
        if (comment===undefined) {comment = '';}
        if (data===undefined) {data = 0;}

        $.get('callcenter/call-log',
            {
                call_id:    this.state.callId,
                event_id:   event,
                goal:       goal,
                comment:    comment,
                data:       data,
            }).fail((e) => {
                console.log('LogCall Error: ', e);
            })
    };

    render() {
        const p = this.props;
        const s = this.state;
        const o = p.options;
        return (
            <div className="cc-outher">
                <audio ref="soundPhoneRingback" src="/sound/phone_wait.mp3" loop />
                <audio ref="soundPhoneRing" src="/sound/phone_ring.mp3" loop />
                <audio ref="soundPhoneBusy" src="/sound/phone_busy.mp3"/>
                <div className="c-o-left">
                    <Outcalls state={s.phoneState}
                              onClickInfo={this.onClickInfo}
                              onClickClient={this.selectClient}
                              onClickCall={this.onClickCall}/>
                    <Client options={o}/>
                    <Wiki/>
                </div>
                <div className="c-o-right">
                    <Phone onClickPower={this.onClickPower}
                           onClickAnswer={this.onClickAnswer}
                           onClickCancel={this.onClickCancel}
                           onClickTransfer={this.onClickTransfer}
                           onClickHold={this.onClickHold}
                           onClickCustom={this.onClickCustom}
                           logCall={this.logCall}
                           display={s.display}
                           state={s.phoneState}
                           options={o}
                           register={s.ua && s.ua.isRegistered()}/>
                </div>
            </div>
        )
    }
}

const root = document.getElementById('yii2-callcenter-root')

const options = JSON.parse(root.dataset.options)

ReactDOM.render(<CallcenterRoot options={options}/>, root)