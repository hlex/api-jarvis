// default headers
const headers = {
  // WEB_METHOD_CHANNEL: 'WEBUI',
  // E2E_REFID: '',
  'Content-Type': 'application/json',
};

const prepareRequest = (request) => {
  return {
    // default
    method: 'GET',
    credentials: 'same-origin',
    headers: headers,
    ...request,
  };
};

const B = () => {
  console.log('B');
}

export {
  prepareRequest,
  B,
};
