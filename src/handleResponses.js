// import { isPaeServiceError, isPondServiceError } from '../utils/apiErrorValidations';
// import { convertPaeServiceToError } from '../utils/convertors';

const handleResponseError = (res, customApiErrorValidationFunction, convertorFunction) => {
  if (typeof customApiErrorValidationFunction === 'function' && typeof convertorFunction === 'function') {
    if (customApiErrorValidationFunction(res)) throw convertorFunction(res);
    else return res;
  }
  console.warn('You do not send any validation function');
  return res;
}

// const handlePaeResponseError = (res, customApiErrorValidationFunction) => {
//   if (typeof customApiErrorValidationFunction === 'function') {
//     if (customApiErrorValidationFunction(res)) throw convertPaeServiceToError(res);
//     else return res;
//   }
//   if (isPaeServiceError(res)) throw convertPaeServiceToError(res);
//   return res;
// };

export default {
  handleResponseError,
};
