
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import Outcalls from './components/outcalls/Outcalls.jsx'
import Client   from './components/client/Client.jsx'
import Wiki     from './components/wiki/Wiki.jsx'
import Phone    from './components/phone/Phone.jsx'
import SIP      from 'sip.js'

import './index.scss'

const STATE_OFF         = "STATE_OFF";
const STATE_GO_ON       = "STATE_GO_ON";
const STATE_READY       = "STATE_READY";
const STATE_RINGING     = "STATE_RINGING";
const STATE_PROGRESS    = "STATE_PROGRESS";
const STATE_CALLING     = "STATE_CALLING";
const STATE_TALKING     = "STATE_TALKING";
const STATE_ENDING      = "STATE_ENDING";
const STATE_BUSY        = "STATE_BUSY";
const STATE_GO_OFF      = "STATE_GO_OFF";

class CallcenterRoot extends Component {
    state = {soundPhone:document.getElementById('sound-phone'), phoneState:STATE_OFF}
    componentDidMount(){
        const self = this;
        const p = this.props;
        const s = this.state;
        const c = p.options.sip;
        s.ua = new SIP.UA({
            uri: c.uri,
            transportOptions: {
                wsServers: [c.ws]
            },
            authorizationUser: c.name,
            password: c.password
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
            });
        });
        s.ua.on('registered', () => {
            const s = this.state;
            if(s.phoneState == STATE_GO_ON || s.phoneState == STATE_OFF){
                s.phoneState = STATE_READY;
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
                           register={s.ua && s.ua.isRegistered()}/>
                </div>
            </div>
        )
    }
}

const root = document.getElementById('yii2-callcenter-root')

const options = JSON.parse(root.dataset.options)

ReactDOM.render(<CallcenterRoot options={options}/>, root)