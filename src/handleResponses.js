import { defaultValidateServiceError, defaultResponseToErrorConvertor } from './utils';

const handleResponseCatchError = (response, customApiErrorValidationFunction, convertorFunction) => {
  console.info('fetchWithJarvis@response = ', response);
  if (typeof customApiErrorValidationFunction === 'function' && typeof convertorFunction === 'function') {
    if (customApiErrorValidationFunction(response)) throw convertorFunction(response);
    else return response;
  }
  console.warn('You do not send any validation function');
  console.warn('Jarvis will using his own function');
  // use default
  if (defaultValidateServiceError(response)) throw defaultResponseToErrorConvertor(response);
  return response;
}

export default handleResponseCatchError;
