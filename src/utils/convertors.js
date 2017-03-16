import { ApplicationError } from '../models';

const getErrorType = (res) => {
  return res['display-messages'][0]['message-type'];
};

const convertPaeServiceToError = (res) => {
  return new ApplicationError({
    type: getErrorType(res),
    trxId: res['trx-id'],
    processInstance: res['process-instance'],
    status: res.status,
    fault: res.fault,
    displayMessages: res['display-messages'],
  });
};
const convertPondServiceToError = (res) => {
  return new ApplicationError({
    type: getErrorType(res),
    trxId: res['trx-id'],
    processInstance: res['process-instance'],
    status: res.status,
    fault: res.fault,
    displayMessages: res['display-messages'],
  });
};
export {
  convertPaeServiceToError,
  convertPondServiceToError,
};
