import React, {Component} from 'react';

import './scriptsStyle.scss'

export default class Scripts extends Component {
    state = {script:'', loading:true}
    componentDidMount() {
        this.loadScript()
        window.CcGoTo = this.loadScript;
    }
    loadScript = (url) => {
        this.setState({loading:true})
        const self = this;
        $.get('callcenter/get-script', {id:1, url:url}, (r) => {
            self.setState({script:r, loading:false})
        }).fail((e) => {
            console.log('loadScript Error: ',e)
            self.setState({script:e.responseText, loading:false})
        })
    }
    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="cc-scripts-outher">
                <div id="callcenter-script-body"
                     className="cc-script" dangerouslySetInnerHTML={{__html:s.script}}/>
            </div>
        )
    }
}