import fetch from 'isomorphic-fetch'
import _ from 'lodash'
import convertToURLParam from './convertToURLParam'
import { ServerError, ClientError } from './models'
import { prepareRequest } from './utils'
import handleResponseCatchError from './handleResponses'

let TOKEN = {}
let DEBUG = false

const isHttpCodeInformational = code => code >= 100 && code <= 199
const isHttpCodeSuccess = code => code >= 200 && code <= 299
const isHttpRedirection = code => code >= 300 && code <= 399
const isHttpClientError = code => code >= 400 && code <= 499
const isHttpServerError = code => code >= 500 && code <= 599

const regexJson = new RegExp('^application/json', 'i')
const regexText = new RegExp('^text/plain', 'i')

const isJson = value => regexJson.test(value)
const isText = value => regexText.test(value)

const getContentType = response => response.headers.get('content-type')

const addUrlParameter = (url, params) => {
  const indexOfQuestionMark = url.indexOf('?') // found ?
  const hasUrlParam = indexOfQuestionMark > 0
  if (hasUrlParam) {
    const pureUrl = url.substring(0, indexOfQuestionMark)
    const urlParams = url.substring(url.indexOf('?'))
    return `${pureUrl}${urlParams}&${_.join(
      _.map(
        params,
        (value, key) => `${key}=${encodeURIComponent(_.toString(value))}`
      ),
      '&'
    )}`
  }
  return `${url}${convertToURLParam(params)}`
}

const getResponse = (response, debug) => {
  const contentType = getContentType(response)
  if (DEBUG || debug) {
    console.debug('=====================')
    console.debug('responseHandler # isJson =', isJson(contentType))
    console.debug('responseHandler # isText =', isText(contentType))
    console.debug('=====================')
  }
  if (response.status === 204) {
    return new Promise((resolve, reject) => resolve({}))
  } else if (isJson(contentType)) {
    return response.json()
  } else if (isText(contentType)) {
    return response.text()
  }
  return response.json()
}

const getMeta = response => {
  return {
    status: response.status,
    headers: response.headers,
    contentType: response.headers.get('content-type')
  }
}

const responseHandler = (response, debug = false) => {
  return getResponse(response, debug).then(responseBody => {
    if (DEBUG || debug) console.log('fetchWithJarvis@response', responseBody)
    return {
      meta: getMeta(response),
      data: responseBody
    }
  })
}

const httpCodeInformationalHandler = (response, debug = false) => {
  if (DEBUG || debug) console.debug('response # status = 1XX', response)
  return responseHandler(response, debug)
}

const httpCodeSuccesslHandler = (response, debug = false) => {
  if (DEBUG || debug) console.debug('response # status = 2XX', response)
  return responseHandler(response, debug)
}

const httpCodeRedirectionHandler = (response, debug = false) => {
  if (DEBUG || debug) console.debug('response # status = 3XX', response)
  return responseHandler(response, debug)
}

const httpCodeClientErrorHandler = (response, debug = false) => {
  if (DEBUG || debug) console.debug('response # status = 4XX', response)
  return responseHandler(response, debug)
}

const httpCodeServerErrorHandler = (response, debug = false) => {
  if (DEBUG || debug) console.debug('response # status = 5XX', response)
  return responseHandler(response, debug)
}

const isEmpty = (data) => {
  return _.isEmpty(data) || _.isUndefined(data) || _.isNull(data)
}

const hasPlugIns = (definePlugins) => {
  if (isEmpty(definePlugins)) return false
  const hasSomeFunction = _.compact(_.values(definePlugins))
  if (isEmpty(hasSomeFunction)) return false
  return true
}

const get404Error = (url) => {
  return new ClientError({
    type: 'ERROR',
    trxId: Date.now(),
    processInstance: 'local',
    fault: {
      code: 'JVS-002',
      'en-message': `404: Http not found url:[${url}]`,
      'th-messsage': `404: Http not found url:[${url}]`
    },
    displayMessages: [
      {
        message: `404:Http not found url:[${url}]`,
        'message-type': 'ERROR',
        'en-message': `404: Http not found url:[${url}]`,
        'th-message': `404: Http not found url:[${url}]`,
        'technical-message': `404: Http not found url:[${url}]`
      }
    ]
  })
}

const get502Error = (url) => {
  return new ServerError({
    type: 'ERROR',
    trxId: Date.now(),
    processInstance: 'local',
    fault: {
      code: 'JVS-003',
      'en-message': `502: Bad Gateway url:[${url}]`,
      'th-messsage': `502: Bad Gateway url:[${url}]`
    },
    displayMessages: [
      {
        message: `502: Bad Gateway url:[${url}]`,
        'message-type': 'ERROR',
        'en-message': `502: Bad Gateway url:[${url}]`,
        'th-message': `502: Bad Gateway url:[${url}]`,
        'technical-message': `502: Bad Gateway url:[${url}]`
      }
    ]
  })
}

const fetchWithJarvis = (url, params = {}, definePlugins) => {
  const plugins = hasPlugIns(definePlugins) ? definePlugins : undefined
  const debug = params.debug || false
  if (DEBUG || debug) console.info('fetchWithJarvis@url : ', url)
  if (DEBUG || debug) console.info('fetchWithJarvis@params', params)
  if (DEBUG || debug) console.info('fetchWithJarvis@plugins', plugins)
  const options = {
    timeoutMS: params.timeout * 1000 || 60000
  }
  const timeout = new Promise((resolve, reject) => {
    const timeoutError = new ClientError({
      type: 'ERROR',
      trxId: Date.now(),
      processInstance: 'local',
      fault: {
        code: 'JVS-001',
        'en-message': `It took longer than we expect (${
          options.timeoutMS
        }ms), please retry`,
        'th-messsage': `ใช้เวลาต่อ service นานผิดปกติ (${
          options.timeoutMS
        }ms), กรุณาลองใหม่อีกครั้ง`
      },
      displayMessages: [
        {
          message: `Service Timeout ${options.timeoutMS}ms`,
          'message-type': 'ERROR',
          'en-message': `Service Timeout ${options.timeoutMS}ms`,
          'th-message': `Service Timeout ${options.timeoutMS}ms`,
          'technical-message': `Service timeout [${
            options.timeoutMS
          } ms.], url [${url}]`
        }
      ]
    })
    setTimeout(reject, options.timeoutMS, timeoutError)
  })
  const _fetch = new Promise((resolve, reject) => {
    const _params =
      TOKEN !== {}
        ? {
          ...params,
          headers: {
            ...(params.headers || {}),
            ...TOKEN
          }
        }
        : {
          ...params,
          headers: {
            ...(params.headers || {})
          }
        }
    const _url = params.cache ? url : addUrlParameter(url, { t: Date.now() })
    fetch(_url, prepareRequest(_params))
      .then(response => {
        const statusCode = response.status || 500
        if (DEBUG || debug) {
          console.info('=====================')
          console.info('response #', response)
          console.info('response # status :', statusCode)
          console.info('=====================')
        }
        if (statusCode === 404) {
          throw get404Error(url)
        } else if (statusCode === 502) {
          throw get502Error(url)
        } else if (isHttpCodeInformational(statusCode)) {
          return httpCodeInformationalHandler(response, debug)
        } else if (isHttpCodeSuccess(statusCode)) {
          return httpCodeSuccesslHandler(response, debug)
        } else if (isHttpRedirection(statusCode)) {
          return httpCodeRedirectionHandler(response, debug)
        } else if (isHttpClientError(statusCode)) {
          return httpCodeClientErrorHandler(response, debug)
        } else if (isHttpServerError(statusCode)) {
          return httpCodeServerErrorHandler(response, debug)
        }
        reject(httpCodeServerErrorHandler(response, debug))
        return ''
      })
      .then(wrappedResponse => {
        wrappedResponse.meta = {
          ...wrappedResponse.meta,
          location: url
        }
        if (plugins) {
          handleResponseCatchError(
            wrappedResponse.data,
            plugins.isResponseError,
            plugins.toErrorFormat,
            wrappedResponse.meta
          )
        }
        resolve(wrappedResponse.data, wrappedResponse.meta)
      })
      .catch(error => {
        if (DEBUG || debug) {
          console.error('fetchWithJarvis@catch')
          if (typeof error === 'string') {
            console.error(error)
          }
          if (typeof error === 'object') {
            for (const k in error) {
              console.error(k, error[k])
            }
          }
        }
        reject(error)
      })
  })
  return Promise.race([timeout, _fetch])
}

const setDebugMode = debug => {
  DEBUG = debug
}

const setAccessToken = (accessToken, key = 'Authorization') => {
  TOKEN = {
    [key]: accessToken
  }
}

const getAccessToken = () => TOKEN

export { fetchWithJarvis, setAccessToken, getAccessToken, setDebugMode }
