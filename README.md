# API Jarvis
A lightweight assistant which helping you get data more easier.
> Stop suffering from getting REST API data

### If you liked, gimme a star, Thanks.

## Prerequisite
This project uses library ES2015 syntax, fetch and isomorphic-fetch.
Let's checked it out.
- ES2015 https://babeljs.io/learn-es2015/
- isomorphic-fetch https://github.com/matthew-andrews/isomorphic-fetch

## Installation

### NPM
`$ npm install api-jarvis --save`

### YARN
`$ yarn add api-jarvis`

## Live Demo
<https://hlex.github.io/api-jarvis/demo>

The live demo is still running api-jarvis v2.2.0

## Basic Usage
```js
import { fetchWithJarvis } from 'api-jarvis'

const data = getData();

export const getData = () => {
  return fetchWithJarvis('http://httpstat.us/200')
  .then((response) => {
    // get yours data
    return response
  })
}
```

## Features
- Http status error handle build-in (such as http error code = 4XX, 5XX)
- Timeout handle build-in (in seconds)
- Default fetch options
  - Content-Type: 'application-json'
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

## Basic Usage with Error Handling
Using `handleResponseCatchError` from api-jarvis at the top of your js file.

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

### handleResponseCatchError(response, isError, convertResponseToAppFormat)
Let's me talk about `handleResponseCatchError` function a little bit [(you can read full docs here)](<https://github.com/hlex/api-jarvis/blob/master/DOC.md>)

| Property        |     Type
| ------------- |:-------------:
| response      | Object
| isError    | Function (optional)
| convertResponseToAppFormat | Function (optional)

You might not want to send isError or convertFormat functions (as you seen, it is optional) so these are defaults

## Default isError function
### isError is a function which using to decide that this response is error or not
### For example, isError default fucntion check if response object contain key 'fault' is will be decided as error
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
### convertResponseToAppFormat is a function that receive response then itself will return another data. Normally, it uses to normalize any data from server format to be an application data format.
### For example, convertResponseToAppFormat default function receive response then return instance of ApplicationError Class (you can see class definition below)

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

### You can find more feature's examples in [DOC.MD](<https://github.com/hlex/redux-form-manager/blob/master/DOC.md>)

## Documentation
### Read more [DOC.MD](<https://github.com/hlex/redux-form-manager/blob/master/DOC.md>)

## Contact Me !
### mondit.thum@gmail.com
[![alt text][logo]](http://line.me/ti/p/~hlexpond)

[logo]: https://www.shareicon.net/data/128x128/2017/05/30/886541_app_512x512.png "GA-MO"

### License

API Jarvis is licensed under the [MIT license](http://opensource.org/licenses/MIT)