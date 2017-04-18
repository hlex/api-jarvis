import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import { ServerError, ClientError, RedirectionError } from './models';
import { prepareRequest } from './utils';

var _accessToken = '';

const setAccessToken = (accessToken) => {
  _accessToken = accessToken;
}

const fetchWithJarvis = (url, params, errorFormatObject) => {
  // console.log('fetchWithJarvis:url = ', url);
  // params && console.log('fetchWithJarvis:params', params);
  // errorFormatObject && console.log('fetchWithJarvis:errorFormatObject', errorFormatObject);
  const options = {
    timeoutMS: _.get(params, 'timeout') * 1000 || 600000,
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
    if (!_.isEmpty(_accessToken)) {
      if ((url.indexOf('&') > 0 || url.indexOf('?') > 0)) {
        _url = `${url}&access_token=${_accessToken}`;
      } else {
        _url = `${url}?access_token=${_accessToken}`;
      }
    }
    fetch(_url, prepareRequest(params)).then((response) => {
      // console.debug('=====================');
      // console.debug('response # 1', response);
      // console.debug('response # 1 status : ', response.status);
      // console.debug('=====================');
      let error;
      // if (!response.ok) {
      //   reject(Error(response.statusText));
      // }
      if (response.status >= 0 && response.status <= 199) {
        // # status 1XX Informational -> do nothing
        // console.error('=====================');
        // console.error('response # 1 status = ', response.status);
        // console.error('response # 1 status = 1XX', response);
        // console.error('=====================');
      }
      if (response.status >= 200 && response.status <= 299) {
        // # status 2XX Success -> resolve
        // console.debug('=====================');
        // console.debug('response # 1 status = ', response.status);
        // console.debug('response # 1 status = 2XX', response);
        // console.debug('=====================');
        return resolve(response.json());
      }
      if (response.status >= 300 && response.status <= 399) {
        // # 3XX Redirection -> reject
        // console.error('=====================');
        // console.error('response # 1 status = ', response.status);
        // console.error('response # 1 status = 3XX', response);
        // console.error('=====================');
        error = errorFormatObject !== undefined ? errorFormatObject : new RedirectionError({
          type: 'ERROR',
          trxId: Date.now(),
          processInstance: 'local',
          fault: {
            code: 'SMUI-001',
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
      }
      if (response.status >= 400 && response.status <= 499) {
        // ### 4XX Redirection -> reject
        // console.error('=====================');
        // console.error('response # 1 status = ', response.status);
        // console.error('response # 1 status = 4XX', response);
        // console.error('=====================');
        if (response.status === 400) {
          try {
            return resolve(response.json());
          } catch (err) {
            // console.error('----------');
            // console.error(err);
            // console.error('----------');
          }
        }
        if (response.status === 404) {
          // console.error('=====================');
          // console.error('response 404 ');
          // console.error('=====================');
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
        }
      }
      if (response.status >= 500 && response.status <= 599) {
        // ### 5XX ServerError -> resolve
        // console.debug('=====================');
        // console.debug('response # 1 status = ', response.status);
        // console.debug('response # 1 status = 5XX', response);
        // console.debug('=====================');
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
          // console.debug(response.text()); console.debug(response.blob());
          // console.debug(response.toString()); console.debug(response.type);
          // console.debug(response.headers); console.debug(typeof response.json());
          // return resolve(response.headers); debugger; return resolve(response.json());
          try {
            return resolve(response.json());
          } catch (err) {
            // console.error('----------');
            // console.error(err);
            // console.error('----------');
          }
        }
      }
      // console.error('=====================');
      // console.error('response # 1 chk error', error);
      // console.error('=====================');
      if (error) {
        // console.error('=====================');
        // console.error('response # 1 error', error);
        // console.error('=====================');
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
};
