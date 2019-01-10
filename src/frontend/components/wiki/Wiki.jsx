import React, {Component} from 'react';

import './wikiStyle.scss'

export default class Wiki extends Component {
    state = {}
    componentDidMount() {
        this.state.content = window.CallcenterWiki;
        this.setState(this.state);
    }

    render() {
        const p = this.props;
        const s = this.state;
        return (
            <div className="cc-wiki-outher">{s.content}</div>
        )
    }
}