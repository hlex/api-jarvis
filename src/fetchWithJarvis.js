import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import convertToURLParam from './convertToURLParam';
import { ServerError, ClientError } from './models';
import { prepareRequest } from './utils';

const REJECT_CODES = [404, 502]

const isHttpCodeInformational = code => code >= 100 && code <= 199
const isHttpCodeSuccess = code => code >= 200 && code <= 299
const isHttpRedirection = code => code >= 300 && code <= 399
const isHttpClientError = code => code >= 400 && code <= 499
const isHttpServerError = code => code >= 500 && code <= 599

// const debug = window.location.href.indexOf('localhost') > 1;
const regexJson = new RegExp('^application/json', 'i');
const regexText = new RegExp('^text/plain', 'i');

const isJson = value => regexJson.test(value);
const isText = value => regexText.test(value);

const getContentType = response => response.headers.get('content-type');

let token = {}

const setAccessToken = (accessToken, key = 'Authorization') => {
  token = {
    [key]: accessToken,
  }
}

const getAccessToken = () => token;

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
  if (debug) {
    console.debug('=====================');
    console.debug('responseHandler # isJson =', isJson(contentType));
    console.debug('responseHandler # isText =', isText(contentType));
    console.debug('=====================');
  }
  if (isJson(contentType)) {
    return response.json()
  } else if (isText(contentType)) {
    return response.text()
  }
  return new Promise((resolve, reject) => {
    reject(new ServerError({
      type: 'ERROR',
      trxId: Date.now(),
      processInstance: 'local',
      fault: {
        code: 'JVS-XXX',
        'en-message': `content-type ${contentType} was not handled`,
        'th-messsage': `content-type ${contentType} was not handled`,
      },
      displayMessages: [
        {
          message: `content-type ${contentType} was not handled`,
          'message-type': 'ERROR',
          'en-message': `content-type ${contentType} was not handled`,
          'th-message': `content-type ${contentType} was not handled`,
          'technical-message': `content-type ${contentType} was not handled`,
        },
      ],
    }))
  })
}

const responseHandler = (response, debug = false) => {
  const contentType = getContentType(response)
  const baseResponse = {
    _status: response.status,
    _headers: response.headers,
    _contentType: response.headers.get('content-type'),
  }
  return getResponse(response, debug)
  .then((responseBody) => {
    console.log('responseBody', responseBody)
    if (isJson(contentType)) {
      return {
        ...baseResponse,
        ...responseBody,
      }
    } else if (isText(contentType)) {
      return {
        ...baseResponse,
        textResponse: responseBody,
      }
    }
  })
}

const httpCodeInformationalHandler = (response, debug = false) => {
  if (debug) console.debug('response # status = 1XX', response);
  return responseHandler(response, debug);
}

const httpCodeSuccesslHandler = (response, debug = false) => {
  if (debug) console.debug('response # status = 2XX', response);
  return responseHandler(response, debug);
}

const httpCodeRedirectionHandler = (response, debug = false) => {
  if (debug) console.debug('response # status = 3XX', response);
  return responseHandler(response, debug);
}

const httpCodeClientErrorHandler = (response, debug = false) => {
  if (debug) console.debug('response # status = 4XX', response);
  return responseHandler(response, debug);
}

const httpCodeServerErrorHandler = (response, debug = false) => {
  if (debug) console.debug('response # status = 5XX', response);
  return responseHandler(response, debug);
}

const fetchWithJarvis = (url, params) => {
  const debug = params.debug || true
  debug && console.info('fetchWithJarvis@url : ', url);
  debug && console.info('fetchWithJarvis@params', params);
  // errorFormatObject && debug && console.log('fetchWithJarvis:errorFormatObject', errorFormatObject);
  const options = {
    timeoutMS: params.timeout * 1000 || 5000,
  };
  const timeout = new Promise((resolve, reject) => {
    const timeoutError = new ClientError({
      type: 'ERROR',
      trxId: Date.now(),
      processInstance: 'local',
      fault: {
        code: 'JVS-001',
        'en-message': `It took longer than we expect (${options.timeoutMS}ms), please retry`,
        'th-messsage': `ใช้เวลาต่อ service นานผิดปกติ (${options.timeoutMS}ms), กรุณาลองใหม่อีกครั้ง`,
      },
      displayMessages: [
        {
          message: `Service Timeout ${options.timeoutMS}ms`,
          'message-type': 'ERROR',
          'en-message': `Service Timeout ${options.timeoutMS}ms`,
          'th-message': `Service Timeout ${options.timeoutMS}ms`,
          'technical-message': `Service timeout [${options.timeoutMS} ms.], url [${url}]`,
        },
      ],
    });
    setTimeout(reject, options.timeoutMS, timeoutError);
  });
  const _fetch = new Promise((resolve, reject) => {
    const _params = token !== {}
    ? {
      ...params,
      headers: {
        ...params.headers || {},
        ...token,
      },
    }
    : {
      ...params,
      headers: {
        ...params.headers || {},
      },
    }
    const _url = params.cache ? url : addUrlParameter(url, { t: Date.now() })
    fetch(_url, prepareRequest(_params))
    .then((response) => {
      const statusCode = response.status || 500
      if (debug) {
        console.debug('=====================');
        console.debug('response #', response);
        console.debug('response # status :', statusCode);
        console.debug('=====================');
      }
      if (statusCode === 404) {
        reject(new ClientError({
          type: 'ERROR',
          trxId: Date.now(),
          processInstance: 'local',
          fault: {
            code: 'JVS-002',
            'en-message': `404: Http not found url:[${url}]`,
            'th-messsage': `404: Http not found url:[${url}]`,
          },
          displayMessages: [
            {
              message: `404:Http not found url:[${url}]`,
              'message-type': 'ERROR',
              'en-message': `404: Http not found url:[${url}]`,
              'th-message': `404: Http not found url:[${url}]`,
              'technical-message': `404: Http not found url:[${url}]`,
            },
          ],
        }))
      } else if (statusCode === 502) {
        reject(new ServerError({
          type: 'ERROR',
          trxId: Date.now(),
          processInstance: 'local',
          fault: {
            code: 'JVS-003',
            'en-message': `502: Bad Gateway url:[${url}]`,
            'th-messsage': `502: Bad Gateway url:[${url}]`,
          },
          displayMessages: [
            {
              message: `502: Bad Gateway url:[${url}]`,
              'message-type': 'ERROR',
              'en-message': `502: Bad Gateway url:[${url}]`,
              'th-message': `502: Bad Gateway url:[${url}]`,
              'technical-message': `502: Bad Gateway url:[${url}]`,
            },
          ],
        }));
      } else if (isHttpCodeInformational(statusCode)) {
        return httpCodeInformationalHandler(response, debug)
      } else if (isHttpCodeSuccess(statusCode)) {
        return resolve(httpCodeSuccesslHandler(response, debug))
      } else if (isHttpRedirection(statusCode)) {
        return httpCodeRedirectionHandler(response, debug)
      } else if (isHttpClientError(statusCode)) {
        return httpCodeClientErrorHandler(response, debug)
      } else if (isHttpServerError(statusCode)) {
        return httpCodeServerErrorHandler(response, debug)
      } else {
        reject(httpCodeServerErrorHandler(response, debug))
      }
    })
    .catch((error) => {
      console.error('_fetch catch', error);
      reject(new ClientError({
        type: 'ERROR',
        trxId: Date.now(),
        processInstance: 'local',
        fault: {
          code: 'Exception',
          'en-message': `${error}`,
          'th-messsage': `${error}`,
        },
        displayMessages: [
          {
            message: `${error}`,
            'message-type': 'ERROR',
            'en-message': `${error}`,
            'th-message': `${error}`,
            'technical-message': `${error}`,
          },
        ],
      }))
    })
  });
  return Promise.race([timeout, _fetch]);
};

export {
  fetchWithJarvis,
  setAccessToken,
  getAccessToken,
};
