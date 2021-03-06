import _ from 'lodash';

const convertToURLParam = (data) => {
  return `?${_.join(_.map(data, (value, key) => `${key}=${encodeURIComponent(_.toString(value))}`), '&')}`;
};
export default convertToURLParam;
