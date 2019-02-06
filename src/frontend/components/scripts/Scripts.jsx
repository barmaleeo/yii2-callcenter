import React, {Component} from 'react';

import './scriptsStyle.scss'

export default class Scripts extends Component {
    state = {script:'', loading:true}
    history = []
    componentDidMount() {
        this.loadScript()
        window.CcGoTo = this.loadScript;
    }
    handleClickBack = () => {
        if(this.history.length > 0){
            this.loadScript(this.history.pop().url)
        }else{
            this.loadScript()
        }
    }
    loadScript = (url) => {
        this.history.push({url: url})
        this.setState({loading:true})
        const self = this;
        $.get('callcenter/get-script', {id:this.props.callId, url:url}, (r) => {
            self.setState({script:r, loading:false})
        }).fail((e) => {
            console.log('loadScript Error: ',e)
            self.setState({script:e.responseText, loading:false})
        })
    }
    render() {
        const p = this.props;
        const s = this.state;
        console.log(this.history)
        return (
            <div className="cc-scripts-outher">
                {this.history.length > 0 &&
                    <div className="c-s-back">
                        <button onClick={this.handleClickBack}>back</button>
                    </div>
                }
                <div id="callcenter-script-body"
                     className="cc-script" dangerouslySetInnerHTML={{__html:s.script}}/>
            </div>
        )
    }
}