import React, {Component} from 'react';

import './scriptsStyle.scss'

export default class Scripts extends Component {
    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="cc-scripts-outher">
                <div className="cs-body" dangerouslySetInnerHTML={{__html:p.script}}/>
            </div>
        )
    }
}