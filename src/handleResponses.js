import {
  defaultValidateServiceError,
  defaultResponseToErrorConvertor
} from './utils'

const handleResponseCatchError = (
  data,
  isResponseError,
  toErrorFormat,
  meta
) => {
  if (isResponseError && typeof isResponseError === 'function') {
    if (toErrorFormat && typeof toErrorFormat === 'function') {
      if (isResponseError(data, meta)) throw toErrorFormat(data, meta)
    } else {
      console.warn(`You didn't send 'toErrorFormat' function, Jarvis will using his own function`)
      if (isResponseError(data, meta)) { throw defaultResponseToErrorConvertor(data, meta) }
    }
    return data
  }
  console.warn(`You didn't send 'isResponseError' function, Jarvis will use his own function`)
  if (toErrorFormat && typeof toErrorFormat === 'function') {
    if (defaultValidateServiceError(data, meta)) throw toErrorFormat(data, meta)
  } else {
    console.warn(`You didn't send 'toErrorFormat' function, Jarvis will using his own function`)
    if (defaultValidateServiceError(data, meta)) { throw defaultResponseToErrorConvertor(data, meta) }
  }
  return data
}

export default handleResponseCatchError
