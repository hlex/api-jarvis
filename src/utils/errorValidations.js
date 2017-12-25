const defaultValidateServiceError = (response, meta) => {
  return meta.status !== 200
}
export default defaultValidateServiceError
