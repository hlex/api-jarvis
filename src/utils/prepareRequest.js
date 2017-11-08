// default headers
const defaultHeaders = {
  // 'Content-Type': 'application/json',
  'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
};

const prepareRequest = (params) => {
  return {
    method: 'GET',
    credentials: 'same-origin',
    ...params,
    headers: {
      ...defaultHeaders,
      ...params.headers || {},
    },
  };
};

export {
  prepareRequest,
};
