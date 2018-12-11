
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import Outcalls from './components/outcalls/Outcalls.jsx'
import Client   from './components/client/Client.jsx'
import Wiki     from './components/wiki/Wiki.jsx'
import Phone    from './components/phone/Phone.jsx'
import SIP      from 'sip.js'

import './index.scss'

export const STATE_OFF         = "STATE_OFF";
export const STATE_GO_ON       = "STATE_GO_ON";
export const STATE_READY       = "STATE_READY";
export const STATE_CALLING     = "STATE_CALLING";
export const STATE_PROGRESS    = "STATE_PROGRESS";
export const STATE_RINGING     = "STATE_RINGING";
export const STATE_GO_TALK     = "STATE_GO_TALK";
export const STATE_TALKING     = "STATE_TALKING";
export const STATE_ENDING      = "STATE_ENDING";
export const STATE_BUSY        = "STATE_BUSY";
export const STATE_GO_OFF      = "STATE_GO_OFF";

class CallcenterRoot extends Component {
    state = {
        soundPhone:document.getElementById('sound-phone'),
        session:false,
        phoneState:STATE_OFF,
    }
    componentDidMount(){
        const self = this;
        const p = this.props;
        const s = this.state;
        const c = p.options.sip;

        const options = {
            sessionDescriptionHandlerOptions: {
                constraints: {audio: true, video: false},
            }//,
            // extraHeaders:[
            //     'X-user-domain: ' + 'hhhjjj'//p.sip.sip_host
            // ]
        };

        s.ua = new SIP.UA({
            uri: c.uri,
            transportOptions: {
                wsServers: [c.ws],
                traceSip: true,
                maxReconnectionAttempts:1000000000
            },
            log:{
                level:'debug',
            },
            authorizationUser: c.name,
            password: c.password,
            hackIpInContact: false,
            hackWssInTransport: false,
            hackViaTcp: false

        })
        s.ua.on('invite', (session) => {
            const s = this.state;
            if(s.phoneState == STATE_READY){
                self.refs.soundPhoneRing.play();
                s.phoneState = STATE_RINGING;
                self.SetState(s);
            }
            //session.accept();

            session.on('accepted', function (e) {

                //self.props.phoneActions.setTalking();
                self.refs.soundPhoneRing.pause();
                self.refs.soundPhoneRing.currentTime = 0;

                const pc = session.sessionDescriptionHandler.peerConnection;
                const remoteStream = new MediaStream();
                pc.getReceivers().forEach(function(receiver) {
                    const track = receiver.track;
                    if (track) {
                        remoteStream.addTrack(track);
                    }
                });
                s.soundPhone.srcObject = remoteStream;

                console.log('Incoming call accepted', session);
            });
            session.on('failed', function (e) {
            })
            session.on('bye', function (e) {
            })
            session.on('terminated', (cause) => {
                console.log('incoming call terminated' + cause);
                if(self.state.phoneState == STATE_GO_OFF){
                    self.state.phoneState = STATE_OFF;
                }else{
                    self.state.phoneState = STATE_READY;
                }
                self.state.session = false;
                self.setState(self.state);
            });
        });
        s.ua.on('registered', () => {
            const s = this.state;
            if(s.phoneState == STATE_GO_ON || s.phoneState == STATE_OFF){
                s.phoneState = STATE_BUSY;
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
        if(this.state.phoneState == STATE_BUSY){
            this.state.phoneState = STATE_READY;
            this.setState(this.state)
        }else if( this.state.session){
            this.state.session.terminate()
            this.state.session = false;
            this.setState(this.state)
        }
    };
    onClickAccept = () => {
        if(this.state.session && this.state.phoneState == STATE_RINGING
        ){
            this.state.phoneState = STATE_GO_TALK;
            this.state.session.accept()
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
    makeCall(phoneNumber){
        const options = {
            sessionDescriptionHandlerOptions: {
                constraints: {audio: true, video: false},
            }//,
            // extraHeaders: [
            //     'X-user-domain: ' + 'hpg-domain'//p.sip.sip_host
            // ]
        };
        const self = this;
        self.state.phoneState = STATE_CALLING;
        self.setState(self.state)
        const session = this.state.ua.invite(phoneNumber + '@sip.hpg.com.ua', options);
        session.on('progress', (response) => {
            if(self.state.phoneState == STATE_CALLING){
                self.state.phoneState = STATE_PROGRESS;
                self.setState(self.state)
            }
        })
        session.on('accepted', (e, a) => {  // поднятие трубки на том конце
            console.log('Outgoing  call accepted', e, a, this);
            const pc = session.sessionDescriptionHandler.peerConnection;
            const remoteStream = new MediaStream();
            pc.getReceivers().forEach(function (receiver) {
                const track = receiver.track;
                if (track) {
                    remoteStream.addTrack(track);
                }
            });
            self.state.soundPhone.srcObject = remoteStream;
            self.state.soundPhone.play();
            self.state.phoneState = STATE_TALKING;
            self.setState(self.state)

        })
        session.on('terminated',(cause) => {
            console.log('outgoing call terminated' + cause);
            if(self.state.phoneState == STATE_GO_OFF){
                self.state.phoneState = STATE_OFF;
            }else{
                self.state.phoneState = STATE_BUSY;
            }
            self.state.session = false;
            self.setState(self.state);

        })
    }
    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="cc-outher">
                <audio ref="soundPhoneWait" src="/sound/phone_wait.mp3" loop />
                <audio ref="soundPhoneRing" src="/sound/phone_ring.mp3" loop />
                <audio ref="soundPhoneBusy" src="/sound/phone_busy.mp3"/>
                <div className="c-o-left">
                    <Outcalls/>
                    <Client/>
                    <Wiki/>
                </div>
                <div className="c-o-right">
                    <Phone onClickPower={this.onClickPower}
                           onClickCancel={this.onClickCancel}
                           onClickTransfer={this.onClickTransfer}
                           onClickHold={this.onClickHold}
                           onClickCustom={this.onClickCustom}
                           state={s.phoneState}
                           register={s.ua && s.ua.isRegistered()}/>
                </div>
            </div>
        )
    }
}

const root = document.getElementById('yii2-callcenter-root')

const options = JSON.parse(root.dataset.options)

ReactDOM.render(<CallcenterRoot options={options}/>, root)