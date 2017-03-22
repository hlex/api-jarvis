import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactAlertMessage from 'react-alert-message';
import 'react-alert-message/dist/style.css';
import _ from 'lodash';
import * as Actions from '../actions';

class AlertMessage extends React.Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    typeMessage: PropTypes.string.isRequired,
    message: PropTypes.shape({}),
    processInstance: PropTypes.string,
    trxId: PropTypes.string,
    actions: PropTypes.shape({}),
  };
  render() {
    const { open, typeMessage, processInstance, trxId, message, actions } = this.props;
    console.log('AlertMessage:props', this.props);
    return (
      <ReactAlertMessage
        open={open}
        type={typeMessage}
        message={message}
        trxId={trxId}
        processInstance={processInstance}
        textOnButtonShow={'Technical Message'}
        textOnButtonHide={'Technical Message'}
        closeAlertMessage={() => actions.closeAlertMessage()}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.alertMessage,
  };
}

const actions = {
  ...Actions,
};

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(AlertMessage);
