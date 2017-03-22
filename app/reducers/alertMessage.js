const stateAlertMessage = {
  open: false,
  typeMessage: 'DEFAULT', // DEFAULT, ERROR, WARNING, SUCCESS, SYSTEM_ERROR, LOADING
  message: {
    th: '',
    en: '',
    technical: '',  
  }, // class ApplicationError
  processInstance: '',
  trxId: '',
};

const alertMessage = (state = stateAlertMessage, action) => {
  switch (action.type) {
    case 'OPEN_REACT_ALERT_MESSAGE': {
      return { ...state,
        open: true,
        typeMessage: action.typeMessage,
        message: action.message,
        processInstance: action.processInstance,
        trxId: action.trxId,
      };
    }
    case 'CLOSE_REACT_ALERT_MESSAGE': {
      return { ...state,
        open: false,
      }
    }
    default: {
      return state;
    }
  }
}

export default alertMessage;
