import React, {Component} from 'react';

//import './ModalStyle';


export default class Modal extends Component {
    state = {show:'',}
    componentDidMount(){
        setTimeout(() => {
            this.state.show = ' in';
            this.setState(this.state);
        },0)
        window.callcenterModalClose = this.handleCloseModal.bind(this);
    }
    componentWillUpdate(nextProps, nextState, nextContext) {
        console.log(nextProps)
    }

    handleCloseModal = () => {
        this.state.show = ' out';
        this.setState(this.state);
        setTimeout(() => {
            this.props.onClose()
        }, 250)

    }
    handleClickContent = (e) => {
        e.stopPropagation()
    }
    componentWillUnmount() {
        this.state.show = ''
    }

    render() {
        const p = this.props;
        const s = this.state;
        let o;
        if(typeof p.data == 'string'){
            o = {content:p.data}
        } else if(typeof p.data == 'object') {
            o = p.data;
         }

        return (
            <div className={'callcenter-modal-outher modal fade show'+s.show}
                 onClick={this.handleCloseModal.bind(this)}
                 style={{backgroundColor:'rgba(1,1,1,0.4)'}}>
                <div className={'modal-dialog' + (o.small?'':' modal-lg')}>
                    <div className="modal-content"
                         onClick={this.handleClickContent}>
                        <div className="modal-header">
                            <h4>{o.header}</h4>
                        </div>
                        {o.body === false ? <div>{o.content}</div>:
                            <div className="modal-body">{o.content}</div>
                        }
                        {o.footer === false ? null :
                            <div className="modal-footer">
                                <button className="btn btn-default"
                                        onClick={this.handleCloseModal.bind(this)}>Закрыть
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}
