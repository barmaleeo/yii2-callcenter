
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import Outcalls from './components/outcalls/Outcalls.jsx'
import Scripts  from './components/scripts/Scripts.jsx'
import Client   from './components/client/Client.jsx'
import Wiki     from './components/wiki/Wiki.jsx'
import Phone    from './components/phone/Phone.jsx'
import * as SIP from 'sip.js'
import Modal    from './components/modal/Modal'

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

    soundPhone          = document.getElementById('sound-phone');
    soundPhoneRingback  = document.getElementById('sound-phone-ringback');
    soundPhoneRing      = document.getElementById('sound-phone-ring');
    soundPhoneBeep      = document.getElementById('sound-phone-beep');

    state = {
        session:false,
        phoneState:STATE_OFF,
        answer:false,
        callId:0,
        userId:0,
        display:'',
        modal:[],
        queue:[],
    }
    acceptSession(session, self){

        //console.log('ACCEPT SESSION', session, self);


        const s = {};

        try {
            const stats = JSON.parse(session.request.headers['X-Stats'][0].raw);
            s.userId = stats.id;
            s.callId = stats.call_id;
            self.selectClient(s.userId);
        } catch (e) {
            console.log(e);
        }

        self.logCall(8, 'Включен сигнал вызова');
        self.soundPhoneRing.play();
        s.session = session;
        s.phoneState = STATE_RINGING;
        s.display = s.session.remoteIdentity.displayName;


        //session.accept();

        session.on('accepted', function (e) {
            //console.log('OnAccepted Entering', session, self.state.phoneState);

            self.soundPhoneRing.pause();
            self.soundPhoneRing.currentTime = 0;

            const pc = session.sessionDescriptionHandler.peerConnection;
            const remoteStream = new MediaStream();
            pc.getReceivers().forEach(function (receiver) {
                const track = receiver.track;
                if (track) {
                    remoteStream.addTrack(track);
                }
            });
            self.soundPhone.srcObject = remoteStream;

            self.setState({phoneState: STATE_TALKING});
            //console.log('Incoming call accepted', session);
            self.logCall(10, 'Начало разговора');

        });
        session.on('failed', function (e, cause) {
            if (self.state.answer) {
                self.logCall(3, "Неудачное завершение входящего звонка", 0, cause);
            }
            self.soundPhoneBeep.currentTime = 0;
            self.soundPhoneBeep.play();
        })
        session.on('bye', function (e) {
            self.logCall(13, 'Окончание разговора');
            self.soundPhoneBeep.currentTime = 0;
            self.soundPhoneBeep.play();
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

        session.on('terminated', (cause) => {

            //if(session)
            //console.log('incoming call terminated', self.state.phoneState);
            const state = {}

            if (self.state.phoneState == STATE_READY) {
                // Здесь делаем сохранение сессии
                //console.log('Terminated - case self.state.phoneState == STATE_READY')

            } else if (self.state.answer == false) {
                //console.log('Terminated - case self.state.answer == false')
                state.phoneState = STATE_READY;
            } else if (self.state.phoneState == STATE_GO_OFF) {
                //console.log('Terminated - case self.state.phoneState == STATE_GO_OFF')
                state.phoneState = STATE_OFF;
            } else {
                //console.log('Terminated - case else')
                self.state.phoneState = STATE_BUSY;
            }
            state.answer = false;
            self.soundPhoneRing.pause();
            self.soundPhoneRing.currentTime = 0;
            state.session = false;
            self.setState(state);
        });

        self.setState(s);

    }
    componentDidMount(){
        const self = this;
        const p = this.props;
        const s = this.state;
        const o = p.options;
        const c = o.sip;

        this.serveWebsockets();
        setInterval(this.serveWebsockets.bind(this), 5000);

        window.callcenterModalOpen = this.pushModal.bind(this);
        window.callcenterModalClose = this.fadeModal.bind(this);
        window.logCall = this.logCall.bind(this)


        const options = {
            sessionDescriptionHandlerOptions: {
                iceCheckingTimeout: 500,
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
                //traceSip: false,
                maxReconnectionAttempts:1000000000
            },
            log:{
                level:'debug',
                //level:'warn',
            },
            authorizationUser:  c.name,
            password:           c.password,
            hackIpInContact:    false,
            hackWssInTransport: false,
            hackViaTcp:         false,
            sessionDescriptionHandlerFactoryOptions: {
                peerConnectionOptions: {
                    // rtcConfiguration: {
                    //     // iceServers: [
                    //     //     { urls: "stun:stun.l.google.com:19302" },
                    //     //     {
                    //     //         urls: "turn:turn-ip:443?transport=tcp",
                    //     //         username: "turnuser",
                    //     //         credential: "turnpass"
                    //     //     }
                    //     // ]
                    // },
                    iceCheckingTimeout: 200,
                }
            }

        })
        s.ua.on('invite', (session) => {
            const self = this;
            const s = this.state;
            if(s.phoneState == STATE_READY) {
                this.acceptSession(session, this)
            }else{
                session.on('terminated', (cause) => {
                    for(let n in self.state.queue){
                        if(self.state.queue[n] === session){
                            self.state.queue.splice(n, 1)
                            self.setState(self.state)
                            break;
                        }
                    }
                });
                self.state.queue.push(session)
                self.setState(self.state)
            }
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
        //console.log('onClickPower', this.state)
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
        //console.log('clickCancel', this.state.phoneState)
        this.logCall(14, 'Нажата кнопка Завершить звонок');
        const self = this;
        if(this.state.phoneState == STATE_BUSY){
                this.state.phoneState = STATE_READY;
                this.state.callId = 0;
                this.state.display = '';
                //console.log('OnClickCancel STATE_BUSY')
                this.setState(this.state, () => {
                    if(self.state.queue.length>0){
                        //console.log('OnClickCancel QUEUE NOT EMPRY', self.state)

                        const session = self.state.queue.shift();
                        //console.log('session to be accepted', session)
                        self.acceptSession(session, self)
                    }
                })
        }else if(this.state.session){
            this.state.session.terminate()
            this.state.session = false;
            this.setState(this.state)
        }
        //console.log('OnClickCancel FINISH')

    };
    onClickAnswer = () => {
        if(this.state.session && this.state.phoneState == STATE_RINGING){
            this.logCall(9, 'Нажата кнопка Взять звонок');
            this.state.answer = true;
            this.state.session.accept({
                sessionDescriptionHandlerOptions: {
                    iceCheckingTimeout: 500,
                    constraints: {audio: true, video: false},
                },
            })
            this.state.phoneState = STATE_GO_TALK;
            this.setState(this.state)
        }
        //console.log('cliclAccept')
    }
    onClickHold = () => {

    }
    onClickTransfer = () => {

    }
    onClickCustom = (phone) => {
//        this.makeCall(phone)
    }
    onClickCall = (phone, uid, callId) => {
        const self = this;
        $.get('callcenter/make-call', {id:callId}, (r) => {
            self.selectClient(uid)
            self.makeCall(phone, callId);

        }).fail((e) => {
            console.error('callcenter/make-call', e)
        })
    }
    onClickInfo = (userId) => {
        console.log('clickInfo', userId)
    }
    selectClient = (id) =>{
         if(typeof this.props.options == 'object' &&
             typeof this.props.options.client == "object" &&
             this.props.options.client.select
         ) {
            const ccc = window[this.props.options.client.select](id)
             //console.log(ccc)
             this.state.userId = id;
         }
    }
    makeCall(phoneNumber, callId){
        console.log(new Date(), "!!!!!!! Start MakeCall")

        const self = this;
        if(self.state.phoneState != STATE_READY){
            return;
        }
        const options = {
            sessionDescriptionHandlerOptions: {
                iceCheckingTimeout: 500,
                constraints: {audio: true, video: false},
                peerConnectionOptions: {
                    iceCheckingTimeout: 500,
                }
            },
             extraHeaders: [
                 'X-user-domain: ' + this.props.options.sip.url,
                 'X-callid: ' + callId,
                 'X-userid: ' + this.props.options.operator.id,
             ]
        };
        const state = {
            callId:     callId,
            display:    phoneNumber,
            phoneState: STATE_CALLING,

        }
        console.log(new Date(), "!!!!!!! Before SetState MakeCall")

        self.setState(state, () => {
            console.log(new Date(), "!!!!!!! Before Invite MakeCall")

            const session = self.state.ua.invite(phoneNumber + '@'+self.props.options.sip.url, options);
            console.log(new Date(), "!!!!!!! After Invite MakeCall")

            session.on('progress', (response) => {
                console.log(new Date(), "!!!!!!! Start Progress MakeCall")
                const state = {}
                //self.logCall(2, 'Старт вызова, code:'+ response.statusCode);  // старт вызова
                if(response.statusCode == 183 && self.state.phoneState == STATE_CALLING){
                    state.phoneState = STATE_PROGRESS;
                    try {
                        self.soundPhoneRingback.play();
                    }catch (e) {
                        console.log(e)
                    }
                    self.setState(state)
                }
            })
            session.on('accepted', (e, a) => {  // поднятие трубки на том конце
                console.log(new Date(), "!!!!!!! Start Accepted MakeCall")
                //console.log('Outgoing  call accepted', e, a, this);
                self.soundPhoneRingback.pause();
                self.soundPhoneRingback.currentTime = 0;

                const pc = session.sessionDescriptionHandler.peerConnection;
                const remoteStream = new MediaStream();
                pc.getReceivers().forEach(function (receiver) {
                    const track = receiver.track;
                    if (track) {
                        remoteStream.addTrack(track);
                    }
                });
                self.soundPhone.srcObject = remoteStream;
                try {
                    self.soundPhone.play();
                }catch (e) {
                    console.log(e)
                }
                self.setState({phoneState:STATE_TALKING})
                self.logCall(10, 'Начало разговора');
            })
            session.on('failed', (e, cause) => {
                //console.log('Outgoing  call failed '+ cause);
                if(cause==='Busy') {// Номер занят
                    self.logCall(3,"Номер занят", 0, cause);
                }else if (cause==='No Answer') { // Номер не отвечает
                    self.logCall(4, "Номер не отвечает", 0,  cause)
                }else { // ошибка соединения
                    self.logCall(1, "Ошибка соединения", 0, cause);
                }
                self.soundPhoneBeep.currentTime = 0;
                self.soundPhoneBeep.play();
            })
            session.on ('muted', (data) => {
                if (data.audio) {
                    self.logCall(17, 'Сall is Muted');
                }
            });

            session.on ('unmuted', (data) => {
                if (data.audio) {
                    self.logCall(18, 'Сall is Unmuted');
                }
            });

            session.on('bye', (e) => {
                self.logCall(13,'Окончание разговора');
                self.soundPhoneBeep.currentTime = 0;
                self.soundPhoneBeep.play();
            })
            session.on('terminated',(cause) => {
                //console.log('outgoing call terminated' + cause);
                self.soundPhoneRingback.pause();
                self.soundPhoneRingback.currentTime = 0;
                if(self.state.phoneState == STATE_GO_OFF){
                    self.state.phoneState = STATE_OFF;
                }else{
                    self.state.phoneState = STATE_BUSY;
                }
                self.state.session = false;
                self.setState(self.state);

            })
            self.setState({session:session})

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
                console.error('LogCall Error: ', e);
            })
    };
    closeModal = () => {
        if(this.state.modal.length>0){
            this.state.modal.pop()
            this.setState(this.state);
        }
    }
    pushModal(data){
        this.state.modal.push(data)
        this.setState(this.state)
    }
    fadeModal(){
        if(this.refs.modal){
            this.refs.modal.handleCloseModal();
        }
    }
    serveWebsockets(){
        const self = this;
        const p = this.props;
        const s = this.state;
        const o = p.options;
        const u = p.user;
        const url = p.websockets.host;

        if(s.wsOk){
            const payload = JSON.stringify({
                mode:       "callcenter",
                type:       'ping',
                hash:       u.hash,
                user_id:    u.id
            });
            s.ws.send(payload);

        }else if(url  && s.ws==null) {
            s.ws = new WebSocket(url);

            s.ws.onerror = (e) => {
                console.log('serveWebsockets', s.ws, e);
                s.wsOk = false;
                s.ws = null;
                self.setState(s);
            };
            s.ws.onclose = (e) =>{
                s.wsOk = false;
                s.ws = null;
                self.setState(s);
            };
            s.ws.onopen = (e) => {
                const auth = {
                    type:'listener',
                    mode:'callcenter',
                    hash:u.hash,
                    user_id: u.id
                };
                s.ws.send(JSON.stringify(auth));
                s.wsOk = true;
                self.setState(s);
            };
            s.ws.onmessage = (e) => {
                if (e.data!=='DONE') {
                    console.log('ws.onmessage',e);
                    const message = JSON.parse(e.data);
                    switch (message.type) {
                        case 'add_outcall':
                            if(message.data!== null) {
                                self.refs.outcalls.addOutcall(message.data);
                            }else{
                                console.log(e);
                            }
                            break;
                        case 'remove_outcall':
                            self.refs.outcalls.removeOutcall(message.data);
                            break;
                        case 'token':
                            s.wsToken = message.msg;
                            console.log('token: '+message.msg);
                            break;
                    }
                }
            }
        }
    }

    render() {
        const p = this.props;
        const s = this.state;
        const o = p.options;
        const showScript = s.phoneState== STATE_CALLING ||
            s.phoneState== STATE_PROGRESS ||
            s.phoneState== STATE_TALKING ||
            s.phoneState== STATE_BUSY;
        return (
            <div className="cc-outher">
                {s.modal.length>0 && <Modal ref="modal" data={s.modal[s.modal.length-1]} onClose={this.closeModal}/>}
                <div className="c-o-left">
                    {showScript && <Scripts callId={s.callId}/>}
                    
                    <Outcalls state={s.phoneState}
                              ref="outcalls"
                              show={!showScript}
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
                           queue={s.queue}
                           state={s.phoneState}
                           wsState={s.wsOk}
                           options={o}
                           parent={this}
                           register={s.ua && s.ua.isRegistered()}/>
                </div>
            </div>
        )
    }
}

const root = document.getElementById('yii2-callcenter-root')

if(root) {

    const options = JSON.parse(root.dataset.options)
    const user = JSON.parse(root.dataset.user)
    const websockets = JSON.parse(root.dataset.websockets)

    ReactDOM.render(<CallcenterRoot options={options} user={user} websockets={websockets}/>, root)

    $('#callcenter-script-body').on('click', 'td.answer', (e) => {
        console.log(e.target, e.currentTarget);
        let offset;

        if(e.target == e.currentTarget){
            offset = e.target.offsetTop;
        }else{
            offset = e.target.offsetTop + e.currentTarget.offsetTop

        }

        $('div.cc-scripts-outher').animate({scrollTop: offset}, "fast");
        return false;

    });

}