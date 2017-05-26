import { fetchWithJarvis, convertToURLParam, handleResponseCatchError } from 'api-jarvis';

// ====== Config ============

const cors = window.location.href.indexOf('localhost') > 1;
// const baseURL = cors ? 'http://localhost:1337/https://ghibliapi.herokuapp.com/films/3' : 'https://ghibliapi.herokuapp.com/films/3';
const baseTrueURL = cors ? 'http://localhost:1337/sff-uat.true.th:8780' : 'http://sff-uat.true.th:8780';
const baseGhibiURL = 'https://ghibliapi.herokuapp.com';
const baseHttpStatURL = cors ? 'http://localhost:1337/httpstat.us' : 'http://httpstat.us';
const baseWingURL = cors ? 'http://localhost:1337/localhost:8888' : 'http://programthong.com';
const baseApacheURL = 'http://localhost:1337/sff-uat.true.th:18087';

const URL = {
  customerProfile: `${baseTrueURL}/profiles/customer/get`,
  film: `${baseGhibiURL}/films`,
  stats: `${baseHttpStatURL}`,
  wing: cors ? `${baseWingURL}/wing/wing/wing/public/api` : `${baseWingURL}/wing/wingdev/wing/public/api`,
};
const apacheURL = {
  customerProfile: `${baseApacheURL}/profiles/customer/get`,
};

const getErrorType = (res) => {
  return res['display-messages'][0]['message-type'];
};

const isServiceError = (response) => {
  if (response.fault) return true;
  return false;
}

const convertServiceResponseToError = (res) => {
  return new ApplicationError({
    type: getErrorType(res),
    trxId: _.get(res, 'trx-id', ''),
    processInstance: _.get(res, 'process-instance', ''),
    status: _.get(res, 'status', ''),
    fault: _.get(res, 'fault', {}),
    displayMessages: _.get(res, 'display-messages', []),
  });
};

export class ApplicationError extends Error {
  constructor({ type, trxId, processInstance, fault, displayMessages }) {
    super(type);
    this.type = type || 'ERROR';
    this.trxId = trxId;
    this.processInstance = processInstance;
    // key of fault object
    this.code = _.get(fault, 'code', '');
    this.fault = fault || {};
    // key of display messages arrays
    this.displayMessages = displayMessages;
    this.message = {
      th: _.get(displayMessages, '0.th-message', ''),
      en: _.get(displayMessages, '0.en-message', ''),
      technical: _.get(displayMessages, '0.technical-message', ''),
    };
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(type)).stack;
    }
  }
}

// ====== SERVICES ============

export const fetchGolds = () => {
  return fetchWithJarvis(`${URL.wing}/gold/all`, {
    method: 'GET',
  })
  .then((response) => {
    return handleResponseCatchError(response, isServiceError, convertServiceResponseToError);
  });
}

export const fetchStats = (errorCode) => {
  return fetchWithJarvis(`${URL.stats}/${errorCode}`, {
    method: 'GET',
  })
  .then((response) => {
    return handleResponseCatchError(response, isServiceError, convertServiceResponseToError);
  });
}

export const fetchFilm = (filmId) => {
  return fetchWithJarvis(`${URL.film}/${filmId}`, {
    method: 'GET',
  })
  .then((response) => {
    console.log('fetchFilm:response = ', response);
    return handleResponseCatchError(response, isServiceError, convertServiceResponseToError);
  });
}

export const fetchCustomerProfile = (certificateNumber) => {
  const data = {
    certificateid: certificateNumber,
  };
  const urlParams = convertToURLParam(data);
  return fetchWithJarvis(`${URL.customerProfile}${urlParams}`, {
    method: 'GET',
  })
  .then((response) => {
    console.log('fetchCustomerProfile:response = ', response);
    return handleResponseCatchError(response, isServiceError, convertServiceResponseToError);
  });
};

export const fetchCustomerProfileWithErrorRequireField = (certificateNumber) => {
  const data = {
    certificateId: certificateNumber,
  };
  const urlParams = convertToURLParam(data);
  return fetchWithJarvis(`${URL.customerProfile}${urlParams}`, {
    method: 'GET',
  })
  .then((response) => {
    console.log('fetchCustomerProfileWithErrorRequireField:response = ', response);
    return handleResponseCatchError(response, isServiceError, convertServiceResponseToError);
  });
};

export const fetchCustomerProfileWithNotFound = (certificateNumber) => {
  const data = {
    certificateId: certificateNumber,
  };
  const urlParams = convertToURLParam(data);
  return fetchWithJarvis(`${URL.customerProfile}/api/${urlParams}`, {
    method: 'GET',
  })
  .then((response) => {
    console.log('fetchCustomerProfileWithNotFound:response = ', response);
    return handleResponseCatchError(response, isServiceError, convertServiceResponseToError);
  });
};

export const fetchCustomerProfileWithUnAuthorize = (certificateNumber) => {
  const data = {
    certificateId: certificateNumber,
  };
  const urlParams = convertToURLParam(data);
  return fetchWithJarvis(`${apacheURL.customerProfile}/${urlParams}`, {
    method: 'GET',
  })
  .then((response) => {
    console.log('fetchCustomerProfileWithNotFound:response = ', response);
    return handleResponseCatchError(response, isServiceError, convertServiceResponseToError);
  });
};

export const fetchCustomerProfileWithTimeout = (certificateNumber) => {
  const data = {
    certificateid: certificateNumber,
  };
  const urlParams = convertToURLParam(data);
  return fetchWithJarvis(`${URL.customerProfile}/${urlParams}`, {
    method: 'GET',
    timeout: 1,
  })
  .then((response) => {
    console.log('fetchCustomerProfileWithNotFound:response = ', response);
    return handleResponseCatchError(response, isServiceError, convertServiceResponseToError);
  });
};
