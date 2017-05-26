import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import { ServerError, ClientError, RedirectionError } from './models';
import { prepareRequest } from './utils';

const debug = window.location.href.indexOf('localhost') > 1;
const regexJson = new RegExp('^application/json', 'i');
const regexText = new RegExp('^text/plain', 'i');

var _accessToken = '';

const setAccessToken = (accessToken) => {
  _accessToken = accessToken;
}

const getAccessToken = () => _accessToken;

const responseHandler = (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = regexJson.test(contentType); // contentType.indexOf('json') > 1;
  const isText = regexText.test(contentType); // contentType.indexOf('text/plain') > 1;
  if (debug) {
    console.debug('=====================');
    console.debug('responseHandler # 1 isJson = ', isJson);
    console.debug('responseHandler # 1 isText = ', isText);
    console.debug('=====================');
  }
  if (isJson) return response.json();
  if (isText) return response.text();
  return new Error(`content-type ${contentType} was not handled`);
}

const fetchWithJarvis = (url, params, errorFormatObject) => {
  console.info('FetchWithJarvis@url : ', url);
  params && console.info('FetchWithJarvis@params', params);
  errorFormatObject && params && params.debug && console.log('fetchWithJarvis:errorFormatObject', errorFormatObject);
  const options = {
    timeoutMS: _.get(params, 'timeout') * 1000 || 60000,
  };
  const timeout = new Promise((resolve, reject) => {
    const timeoutError = errorFormatObject !== undefined ? errorFormatObject : new ClientError({
      type: 'ERROR',
      trxId: Date.now(),
      processInstance: 'local',
      fault: {
        code: 'SMUI-000',
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
    let _url = url;
    params && params.debug && console.info('Using access token = ', _accessToken);
    if (!_.isEmpty(_accessToken)) {
      if ((url.indexOf('&') > 0 || url.indexOf('?') > 0)) {
        _url = `${url}&access_token=${_accessToken}`;
      } else {
        _url = `${url}?access_token=${_accessToken}`;
      }
    }
    fetch(_url, prepareRequest(params)).then((response) => {
      if (debug) {
        console.debug('=====================');
        console.debug('response # 1', response);
        console.debug('response # 1 status :', response.status);
        console.debug('response # 1 headers :', response.headers.get('content-type'));
        console.debug('=====================');
      }
      const contentType = response.headers.get('content-type');
      const isJson = contentType.indexOf('json') > 1;
      const isString = contentType.indexOf('text') > 1;
      let error;
      if (response.status >= 0 && response.status <= 199) {
        // # status 1XX Informational -> do nothing
        // console.error('=====================');
        // console.error('response # 1 status = ', response.status);
        // console.error('response # 1 status = 1XX', response);
        // console.error('=====================');
      }
      if (response.status >= 200 && response.status <= 299) {
        // # status 2XX Success -> resolve
        if (debug) {
          console.debug('=====================');
          console.debug('response # 1 status = ', response.status);
          console.debug('response # 1 status = 2XX', response);
          console.debug('=====================');
        }
        return resolve(responseHandler(response));
      }
      if (response.status >= 300 && response.status <= 399) {
        // # 3XX Redirection -> reject
        if (debug) {
          console.debug('=====================');
          console.debug('response # 1 status = ', response.status);
          console.debug('response # 1 status = 3XX', response);
          console.debug('=====================');
        }
        return resolve(responseHandler(response));
      }
      if (response.status >= 400 && response.status <= 499) {
        // ### 4XX Redirection -> reject
        if (debug) {
          console.debug('=====================');
          console.debug('response # 1 status = ', response.status);
          console.debug('response # 1 status = 4XX', response);
          console.debug('=====================');
        }
        if (response.status === 404) {
          error = errorFormatObject !== undefined ? errorFormatObject : new ClientError({
            type: 'ERROR',
            trxId: Date.now(),
            processInstance: 'local',
            fault: {
              code: 'SMUI-002',
              'en-message': `404:Http not found url:[${url}]`,
              'th-messsage': `404:Http not found url:[${url}]`,
            },
            displayMessages: [
              {
                message: `404:Http not found url:[${url}]`,
                'message-type': 'ERROR',
                'en-message': `404:Http not found url:[${url}]`,
                'th-message': `404:Http not found url:[${url}]`,
                'technical-message': `404:Http not found url:[${url}]`,
              },
            ],
          });
        } else {
          return resolve(responseHandler(response));
        }
      }
      if (response.status >= 500 && response.status <= 599) {
        // ### 5XX ServerError -> resolve
        if (debug) {
          console.debug('=====================');
          console.debug('response # 1 status = ', response.status);
          console.debug('response # 1 status = 5XX', response);
          console.debug('=====================');
        }
        if (response.status === 502) {
          error = errorFormatObject !== undefined ? errorFormatObject : new ServerError({
            type: 'ERROR',
            trxId: Date.now(),
            processInstance: 'local',
            fault: {
              code: 'SMUI-003',
              'en-message': `502:Bad Gateway url:[${url}]`,
              'th-messsage': `502:Bad Gateway url:[${url}]`,
            },
            displayMessages: [
              {
                message: `502:Bad Gateway url:[${url}]`,
                'message-type': 'ERROR',
                'en-message': `502:Bad Gateway url:[${url}]`,
                'th-message': `502:Bad Gateway url:[${url}]`,
                'technical-message': `502:Bad Gateway url:[${url}]`,
              },
            ],
          });
        } else {
          return resolve(responseHandler(response));
        }
      }
      if (error) {
        reject(error);
      }
      return resolve(response.json());
    });
  });
  return Promise.race([timeout, _fetch]);
};

export {
  fetchWithJarvis,
  setAccessToken,
  getAccessToken,
};
