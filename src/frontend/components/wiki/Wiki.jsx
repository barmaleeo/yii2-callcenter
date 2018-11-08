import React, {Component} from 'react';

import './wikiStyle.scss'

export default class Wiki extends Component {
    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="cc-wiki-outher">Hello from Wiki!</div>
        )
    }
}