// default headers
const defaultHeaders = {}

const prepareRequest = params => {
  return {
    method: 'GET',
    credentials: 'same-origin',
    ...params,
    headers: {
      ...defaultHeaders,
      ...(params.headers || {})
    }
  }
}

export { prepareRequest }
