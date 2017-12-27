import {
  fetchWithJarvis,
  convertToURLParam,
  handleResponseCatchError,
  setAccessToken
} from 'api-jarvis'

// ====== Config ============

setAccessToken(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
)

const baseTrueURL = 'http://sff-uat.true.th:8780'
const baseGhibiURL = 'https://ghibliapi.herokuapp.com'
const baseHttpStatURL = 'http://httpstat.us'
const baseWingURL = 'http://programthong.com'
const baseApacheURL = 'http://sff-uat.true.th:18087'

const URL = {
  customerProfile: `${baseTrueURL}/profiles/customer/get`,
  film: `${baseGhibiURL}/films`,
  stats: `${baseHttpStatURL}`,
  wing: `${baseWingURL}/wing/wingdev/wing/public/api`
}
const apacheURL = {
  customerProfile: `${baseApacheURL}/profiles/customer/get`
}

const getErrorType = res => res['display-messages'][0]['message-type']

const isServiceError = (response, meta) => {
  console.log('isServiceError', response, meta)
  if (response.fault) return true
  if (typeof response === 'string' && response.indexOf('500') >= 0) return true
  return false
}

const convertServiceResponseToError = response => {
  let type
  let trxId
  let processInstance
  let status
  let fault
  let displayMessages
  if (typeof response === 'string') {
    type = 'ERROR'
    trxId = ''
    processInstance = ''
    status = 'ERROR'
    fault = {
      code: 'SMUI-005',
      'en-message': `${response}`,
      'th-messsage': `${response}`
    }
    displayMessages = [
      {
        message: `${response}`,
        'message-type': 'ERROR',
        'en-message': `${response}`,
        'th-message': `${response}`,
        'technical-message': `${response}`
      }
    ]
  } else {
    type = getErrorType(response)
    trxId = _.get(response, 'trx-id', '')
    processInstance = _.get(response, 'process-instance', '')
    status = _.get(response, 'status', '')
    fault = _.get(response, 'fault', {})
    displayMessages = _.get(response, 'display-messages', [])
  }
  return new ApplicationError({
    type,
    trxId,
    processInstance,
    status,
    fault,
    displayMessages
  })
}

export class ApplicationError extends Error {
  constructor({ type, trxId, processInstance, fault, displayMessages }) {
    super(type)
    this.type = type || 'ERROR'
    this.trxId = trxId
    this.processInstance = processInstance
    // key of fault object
    this.code = _.get(fault, 'code', '')
    this.fault = fault || {}
    // key of display messages arrays
    this.displayMessages = displayMessages
    this.message = {
      th: _.get(displayMessages, '0.th-message', ''),
      en: _.get(displayMessages, '0.en-message', ''),
      technical: _.get(displayMessages, '0.technical-message', '')
    }
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error(type).stack
    }
  }
}

// ====== SERVICES ============

// export const fetchGolds = () => fetchWithJarvis(`${URL.wing}/gold/all`, {
export const fetchGolds = () =>
  fetchWithJarvis(
    'https://jsonplaceholder.typicode.com/posts/1',
    {
      method: 'GET'
    },
    {
      isResponseError: isServiceError,
      toErrorFormat: convertServiceResponseToError
    }
  ).then(response =>
    handleResponseCatchError(
      response,
      isServiceError,
      convertServiceResponseToError
    )
  )

export const fetchStats = errorCode =>
  fetchWithJarvis(
    `${URL.stats}/${errorCode}`,
    {
      method: 'GET'
    }
  ).then((response, meta) => {
    console.log('fetchStats', response, meta)
    handleResponseCatchError(
      response,
      isServiceError,
      convertServiceResponseToError
    )
    return response
  })

export const fetchFilm = filmId =>
  fetchWithJarvis(`${URL.film}/${filmId}`, {
    method: 'GET'
  }).then(response => {
    console.log('fetchFilm:response = ', response)
    return handleResponseCatchError(
      response,
      isServiceError,
      convertServiceResponseToError
    )
  })

export const fetchCustomerProfile = certificateNumber => {
  const data = {
    certificateid: certificateNumber
  }
  const urlParams = convertToURLParam(data)
  return fetchWithJarvis(`${URL.customerProfile}${urlParams}`, {
    method: 'GET'
  }).then(response => {
    console.log('fetchCustomerProfile:response = ', response)
    return handleResponseCatchError(
      response,
      isServiceError,
      convertServiceResponseToError
    )
  })
}

export const fetchCustomerProfileWithErrorRequireField = certificateNumber => {
  const data = {
    certificateId: certificateNumber
  }
  const urlParams = convertToURLParam(data)
  return fetchWithJarvis(`${URL.customerProfile}${urlParams}`, {
    method: 'GET'
  }).then(response => {
    console.log(
      'fetchCustomerProfileWithErrorRequireField:response = ',
      response
    )
    return handleResponseCatchError(
      response,
      isServiceError,
      convertServiceResponseToError
    )
  })
}

export const fetchCustomerProfileWithNotFound = certificateNumber => {
  const data = {
    certificateId: certificateNumber
  }
  const urlParams = convertToURLParam(data)
  return fetchWithJarvis(`${URL.customerProfile}/api/${urlParams}`, {
    method: 'GET'
  }).then(response => {
    console.log('fetchCustomerProfileWithNotFound:response = ', response)
    return handleResponseCatchError(
      response,
      isServiceError,
      convertServiceResponseToError
    )
  })
}

export const fetchCustomerProfileWithUnAuthorize = certificateNumber => {
  const data = {
    certificateId: certificateNumber
  }
  const urlParams = convertToURLParam(data)
  return fetchWithJarvis(`${apacheURL.customerProfile}/${urlParams}`, {
    method: 'GET'
  }).then(response => {
    console.log('fetchCustomerProfileWithNotFound:response = ', response)
    return handleResponseCatchError(
      response,
      isServiceError,
      convertServiceResponseToError
    )
  })
}

export const fetchCustomerProfileWithTimeout = certificateNumber => {
  const data = {
    certificateid: certificateNumber
  }
  const urlParams = convertToURLParam(data)
  return fetchWithJarvis(`${URL.customerProfile}/${urlParams}`, {
    method: 'GET',
    timeout: 1
  }).then(response => {
    console.log('fetchCustomerProfileWithNotFound:response = ', response)
    return handleResponseCatchError(
      response,
      isServiceError,
      convertServiceResponseToError
    )
  })
}

export const fetchUploadImage = (url, datas) => {
  const formData = new FormData() // eslint-disable-line

  for (const key in datas) {
    formData.append(key, datas[key])
  }

  return fetchWithJarvis(url, {
    method: 'POST',
    body: formData
  })
}

export const fetch404 = () => {
  return fetchWithJarvis('http://prevaa.com/api/x', {
    method: 'GET'
  })
  .then((response) => {
    return response
  })
}
