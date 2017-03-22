import { fetchCustomerProfile,
  fetchCustomerProfileWithErrorRequireField,
  fetchCustomerProfileWithNotFound,
  fetchCustomerProfileWithUnAuthorize,
  fetchCustomerProfileWithTimeout,
  ApplicationError,
} from '../apis';

// ======= ALERT ======
export const closeAlertMessage = () => {
  return {
    type: 'CLOSE_REACT_ALERT_MESSAGE',
  };
};

// handleError call || user call
// connect directly to reducer
export const openAlertMessage = (typeMessage, { message, processInstance = 'Frontend', trxId = `${Date.now()}` }, time = 0) => {
  return (dispatch) => {
    dispatch({
      type: 'OPEN_REACT_ALERT_MESSAGE',
      typeMessage: typeMessage,
      message: message,
      processInstance: processInstance,
      trxId: trxId,
    });
    if (time > 0) {
      setTimeout(() => dispatch(closeAlertMessage()), time * 1000);
    }
  };
};

// catch api error call this function
export const handleError = (error) => {
  return (dispatch, getState) => {
    const loginInfo = getState().loginInfo;
    dispatch({
      type: 'MASTERAPP/LOADING/HIDE',
    });
    if (_.has(error, 'fault')) {
      // ordinary error
      _.set(error, 'loginInfo', loginInfo);
      dispatch(openAlertMessage(_.get(error, 'type', 'ERROR'), error));
    } else {
      // unexpected error
      const err = new ApplicationError({
        type: 'ERROR',
        code: '500',
        name: 'Application Error',
        appMessage: error.message,
        debugMessage: error.message,
        serviceMessage: '-',
        trxId: '-',
        context: error,
      });
      _.set(err, 'loginInfo', loginInfo);
      dispatch(openAlertMessage('ERROR', err));
    }
  };
};

// ===== ACTIONS =====

export const getCustomerProfile = (certificateNumber) => {
  return (dispatch) => {
    fetchCustomerProfile(certificateNumber)
    .then((response) => {
      const message = {
        th: 'ดึงข้อมูลลูกค้าสำเร็จแล้ว',
        en: 'get customer information successfully',
        technical: '',
      };
      dispatch(openAlertMessage('SUCCESS', { message: message }, 3));
    })
    .catch((error) => {
      dispatch(handleError(error));
    });
  };
};

export const getCustomerProfileWithErrorRequireField = (certificateNumber) => {
  return (dispatch) => {
    fetchCustomerProfileWithErrorRequireField(certificateNumber)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      dispatch(handleError(error));
    });
  };
};

export const getCustomerProfileWithNotFound = (certificateNumber) => {
  return (dispatch) => {
    fetchCustomerProfileWithNotFound(certificateNumber)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      dispatch(handleError(error));
    });
  };
};

export const getCustomerProfileWithUnAuthorize = (certificateNumber) => {
  return (dispatch) => {
    fetchCustomerProfileWithUnAuthorize(certificateNumber)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      dispatch(handleError(error));
    });
  };
};

export const getCustomerProfileWithTimeout = (certificateNumber) => {
  return (dispatch) => {
    fetchCustomerProfileWithTimeout(certificateNumber)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      dispatch(handleError(error));
    });
  };
};

export const getCustomerProfileWithLoading = (certificateNumber) => {
  return (dispatch) => {
    dispatch(openAlertMessage('LOADING', { message: { th: '', en: '', technical: '' } }));
    fetchCustomerProfile(certificateNumber)
    .then((response) => {
      dispatch(closeAlertMessage());
    })
    .catch((error) => {
      dispatch(handleError(error));
    });
  };
};
