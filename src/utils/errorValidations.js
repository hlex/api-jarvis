const defaultValidateServiceError = (response) => {
  return response.fault !== undefined;
}
export default defaultValidateServiceError;
