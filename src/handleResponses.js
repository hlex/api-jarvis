import { isPaeServiceError, isPondServiceError } from '../utils/apiErrorValidations';
import { convertPaeServiceToError, convertPondServiceToError } from '../utils/convertors';

const handlePaeResponseError = (res, customApiErrorValidationFunction) => {
  if (typeof customApiErrorValidationFunction === 'function') {
    if (customApiErrorValidationFunction(res)) throw convertPaeServiceToError(res);
    else return res;
  }
  if (isPaeServiceError(res)) throw convertPaeServiceToError(res);
  return res;
};

const handlePondResponseError = (res, customApiErrorValidationFunction) => {
  if (typeof customApiErrorValidationFunction === 'function') {
    if (customApiErrorValidationFunction(res)) throw convertPondServiceToError(res);
    else return res;
  }
  if (isPondServiceError(res)) throw convertPondServiceToError(res);
  return res;
};

export {
  handlePaeResponseError,
  handlePondResponseError,
};
