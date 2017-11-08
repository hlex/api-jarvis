import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Actions from '../actions';

import AlertMessage from './AlertMessage';

// State
function mapStateToProps(state) {
  return {
    ...state,
  };
}

// Action
const actions = {
  ...Actions,
};

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(actions, dispatch) };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class App extends React.Component {
  static propTypes = {
    actions: React.PropTypes.shape({}),
  };
  render() {
    const { actions } = this.props;
    return (
      <div id="api-jarvis-demo">
        <div className="container">
          <section id="welcome">
            API <span>JARVIS</span>
            <i className="fa fa-rocket" aria-hidden="true" />
          </section>
          <section id="intro" />
          <section id="example">
            <div className="title">DEMO</div>
            <div className="row">
              <div className="D-4">
                <button
                  className="button jarvis full"
                  onClick={() => actions.getStats(200)}
                >
                  Fetch Text Success 200
                </button>
              </div>
              <div className="D-4">
                <button
                  className="button jarvis full"
                  onClick={() => actions.getGolds()}
                >
                  Fetch Json Success 200
                </button>
              </div>
              <div className="D-4">
                <button
                  className="button jarvis full"
                  onClick={() => actions.getStatsWithLoading(200)}
                >
                  Fetch Text With Loading
                </button>
              </div>
            </div>
            <br />
            <br />
            <div className="row">
              <div className="D-4">
                <button
                  className="button jarvis full"
                  onClick={() => actions.getStats(400)}
                >
                  Fetch Text Error 400
                </button>
              </div>
              <div className="D-4">
                <button
                  className="button jarvis full"
                  onClick={() =>
                    actions.getStats(404)}
                >
                  Fetch Error 404
                </button>
              </div>
              <div className="D-4">
                <button
                  className="button jarvis full"
                  onClick={() =>
                    actions.getCustomerProfileWithUnAuthorize('1100800901522')}
                >
                  Fetch Error 304
                </button>
              </div>
            </div>
            <br />
            <br />
            <div className="row">
              <div className="D-12">
                <button
                  className="button jarvis full"
                  onClick={() =>
                    actions.getCustomerProfileWithTimeout('1100800901522')}
                >
                  Fetch Error Timeout
                </button>
              </div>
            </div>
          </section>
          <section id="guide" />
          <section id="partner">
            <a target="_blank" href="https://github.com/hlex/api-jarvis">
              <i className="fa fa-github" />github
            </a>
          </section>
        </div>
        <AlertMessage />
      </div>
    );
  }
}
