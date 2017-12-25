# API Jarvis
A lightweight assistant which helping you get data more easier.
> Stop suffering from getting REST API data

### If you liked, gimme a star, Thanks.

## Release Issues
### Latest version is `v3.4.3`
* `v3.4.3`
  - Fixed `plugins` to be default at undefined.
* `v3.4.2`
  - Fixed bugs not reject properly error and should hide all log. (thanks for [GA-MO](https://github.com/GA-MO))
* `v3.4.0`
  - Update Features add parameter `'plugins'` in fetchWithJarvis. (thanks for [GA-MO](https://github.com/GA-MO))
  - Migrate `'status', 'headers', 'contentType', 'location'` to `'meta'` (thanks for [GA-MO](https://github.com/GA-MO))
* `v3.3.1`
  - Handler status 204 to be resolve with baseResponse.
* `v3.2.1`
  - Fixed bugs did not export getAccessToken, setDebugMode.
* `v3.2.0`
  - Add function `setDebugMode` to set global debugger for fetchWithJarvis.
  - Fixed bugs response is neither json nor text then throw error. (Fixed to be responsed).
* `v3.1.2`
  - Fixed bugs http code 1XX, 3XX, 5XX not resolve.

## Special Thanks to ['Pitipat `Doppy` Srichairat'](https://github.com/Doppy)
### He is founder of this module.

## Prerequisite
This project uses library ES2015 syntax, fetch and isomorphic-fetch.
Let's checked it out.
- ES2015 https://babeljs.io/learn-es2015/
- isomorphic-fetch https://github.com/matthew-andrews/isomorphic-fetch

## Getting Started

### NPM
`$ npm install api-jarvis --save`

### YARN
`$ yarn add api-jarvis`

## Live Demo (running at api-jarvis v3.4.2)
<https://hlex.github.io/api-jarvis/demo>

## Advanced Usage: Reveal Key Features
If you are newbie, [`PLEASE START HERE`](#basicUsage)
### There are many features we have provided
- [Customize conditional to throw error.](#restApiErrorHandling)
- [Customize error format.](#restApiErrorHandling)
- [Auto or manual validate response. (default auto)](#autoOrManualValidate)
- [Http status error handle build-in. (default reject 404, 502) *](#httpStatusErrorHandling)
- [Http request Timeout handle build-in. (default 10 seconds) *](#timeoutHandling)

## <a id="basicUsage"></a>Basic Usage
```js
import { fetchWithJarvis } from 'api-jarvis'

const data = getData().then((response) => {
  console.log('data', response)
});

const getData = () => {
  return fetchWithJarvis('http://httpstat.us/200')
  .then((response, meta) => {
    // get yours response
    console.log(response, meta)
    return response
  })
}
```

## <a id="REST-error-handling"></a>Basic Usage with Error Handling
import `'handleResponseCatchError'` from api-jarvis at the top of your js file.

By default, api-jarvis using it own `'isResponseError'` and `'toErrorFormat'` plugins's function.

[See default plugins function description](#defaultFunctions)

### For api-jarvis version `3.4.0`

No need to import `handleResponseCatchError`, It will be called in function fetchWithJarvis


```js
import { fetchWithJarvis } from 'api-jarvis'

const data = getData().then((response) => {
  console.log('data', response)
}).catch((error) => {
  console.error('error', error)
})

export const getData = () => {
  return fetchWithJarvis('http://httpstat.us/500')
   .then((response, meta) => {
    // get yours response
    console.log(response, meta)
    return response
  })
}

```

Example for version prior `3.4.0`
```js
import { fetchWithJarvis, handleResponseCatchError } from 'api-jarvis'

const data = getData();

export const getData = () => {
  return fetchWithJarvis('http://httpstat.us/500')
  .then((response) => {
    handleResponseCatchError(response) // this line automatically throw error if response has fault key
    return response;
  })
}
```

## API Reference

### `1. fetchWithJarvis (url, options, plugins)`

| Property | Type | Priority | Description
| ------------- |:------------- |:-----|:--------- |
| url      | String | `Required` | url to fetch.
| options    | Object | Optional | Fetch options such as 'method', 'headers', etc.
| plugins | PlugIns Schema | Optional | Plugins function to empower jarvis. ([See Plugins Schema](#schemaPlugins))

### Example Usage
```
  return fetchWithJarvis()
```
2. ```


---

### `2. handleResponseCatchError(response, isResponseError, toErrorFormat, meta)`
Let's me talk about `handleResponseCatchError` function a little bit

This function is used to check response is success or error to manage work flow easily.

Let's see in action.

| Property | Type | Priority | Description
| ------------- |:------------- |:-----|:--------- |
| response      | Object | `Required` | Object to be parameters of isResponseError(response, meta) and toErrorFormat(response, meta)
| isResponseError    | Function | Optional | Function which consider should resove or reject.
| toErrorFormat | Function | Optional | Fucntion which return error format for catch (error) {}.
| meta | Object | Optional | Object to be parameters of isResponseError(response, meta) and toErrorFormat(response, meta)

You might not want to send isError or convertFormat functions (as you seen, it is optional) so these are defaults

## <a id="defaultFunctions"></a>Default isError function
```js
const isError = (response) => {
  return response.fault !== undefined;
}
```
## Example customize your isError
```js
import { fetchWithJarvis, handleResponseCatchError } from 'api-jarvis'

const data = getData();

const myIsError = (response) => {
  return response.indexOf('500') >= 0
}

export const getData = () => {
  return fetchWithJarvis('http://httpstat.us/500')
  .then((response) => {
    handleResponseCatchError(response, myIsError)
    return response
  })
  .catch((error) => {
    console.error(error);
  })
}
```

## Default convertResponseToAppFormat function

```js
default class ApplicationError extends Error {
  constructor({ type, trxId, processInstance, fault, displayMessages }) {
    super(type);
    this.type = type || 'ERROR';
    this.trxId = trxId;
    this.processInstance = processInstance;
    this.code = fault.code;
    this.fault = fault;
    this.displayMessages = displayMessages;
    this.message = {
      th: displayMessages[0]['th-message'],
      en: displayMessages[0]['en-message'],
      technical: displayMessages[0]['technical-message'],
    };
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(type)).stack;
    }
  }
}

const convertResponseToAppFormat = (response) => {
  return new ApplicationError({
    type: getErrorType(response),
    trxId: response['trx-id'],
    processInstance: response['process-instance'],
    status: response.status,
    fault: response.fault,
    displayMessages: response['display-messages'],
  });
};
```

## Example customize your convertor
```js
import { fetchWithJarvis, handleResponseCatchError } from 'api-jarvis'

const data = getData();

const myConvertResponseToAppFormat = (response) => {
  return {
    code: Date.now(),
    message: response,
  }
}

const myIsError = (response) => {
  return response.indexOf('500') >= 0
}

export const getData = () => {
  return fetchWithJarvis('http://httpstat.us/500')
  .then((response) => {
    handleResponseCatchError(response, myIsError, myConvertResponseToAppFormat)
    return response
  })
  .catch((error) => {
    console.error(error);
  })
}
```

## Features
- Http status error handle build-in (such as http error code = 4XX, 5XX)
- Timeout handle build-in (in seconds)
- Default fetch options
  - Content-Type: 'application/json'
  - method: 'GET'
  - credentials: 'same-origin'
- Custom options
- Default throw error conditional
- Custom throw error conditional
- Default error class
- Custom error class
- Set access_token to your fetch's header
- Easy to generate url parameters from object
- Providing many Utility functions

### You can find more feature's examples in [DOC.MD](<https://github.com/hlex/redux-form-manager/blob/master/DOC.md>)

## Documentation
### Read more [DOC.MD](<https://github.com/hlex/redux-form-manager/blob/master/DOC.md>)

## Contact Me !
### mondit.thum@gmail.com
[![alt text][logo]](http://line.me/ti/p/~hlexpond)

[logo]: https://www.shareicon.net/data/128x128/2017/05/30/886541_app_512x512.png

### License

API Jarvis is licensed under the [MIT license](http://opensource.org/licenses/MIT)