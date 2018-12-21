import React, {Component} from 'react';

export default class Scripts extends Component {
    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="call-script-container">
                <div className="cs-body" dangerouslySetInnerHTML={{__html:p.script}}/>
            </div>
        )
    }
}