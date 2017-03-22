import { ApplicationError } from '../models';

const getErrorType = (res) => {
  return res['display-messages'][0]['message-type'];
};

const defaultResponseToErrorConvertor = (res) => {
  return new ApplicationError({
    type: getErrorType(res),
    trxId: res['trx-id'],
    processInstance: res['process-instance'],
    status: res.status,
    fault: res.fault,
    displayMessages: res['display-messages'],
  });
};

export default defaultResponseToErrorConvertor;
