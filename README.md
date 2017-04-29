# Api Jarvis
**Api jarvis is a library to help you 'fetch' more easier**

## Installation
`$ npm install api-jarvis --save`

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
- Set access_token to your fetch
- Easy to generate url parameter from object

## Default throw error conditional
if response object contain key 'fault' is will be decided as error
~~~~
const defaultValidateServiceError = (response) => {
  return response.fault !== undefined;
}
~~~~

## Default error class
consist of type, trxId, processInstance, code, fault, displayMessages and message
~~~~
default class ApplicationError extends Error {
  constructor({ type, trxId, processInstance, fault, displayMessages }) {
    super(type);
    this.type = type || 'ERROR';
    this.trxId = trxId;
    this.processInstance = processInstance;
    // fault object
    this.code = fault.code;
    this.fault = fault;
    // display messages arrays
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
~~~~

## Basic usage with error handling
let's import api-jarvis at the top of your js file.
`import { fetchWithJarvis, handleResponseCatchError } from 'api-jarvis`

look at your old code

~~~~
return fetch(https://jsonplaceholder.typicode.com/users).then((response) => {
  if (... some conditional to decide this response is error ...)
  return response;
})
~~~~

then using 'fetchWithJarvis'. it could change to

~~~~
return fetchWithJarvis(https://jsonplaceholder.typicode.com/users).then((response) => {
  handleResponseCatchError(response) // this line automatically throw error if response has fault key
  return response;
})
~~~~


## Thank you for your suggestions!
Feel free to comment !

### License

Api Jarvis is licensed under the [MIT license](http://opensource.org/licenses/MIT)

