const isPaeServiceError = (res) => {
  return res.fault !== undefined;
};
const isPondServiceError = (res) => {
  return res.fault !== undefined;
};
export {
  isPaeServiceError,
  isPondServiceError,
};
