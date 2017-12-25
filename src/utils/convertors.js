import { ApplicationError } from '../models'

const defaultResponseToErrorConvertor = res => {
  return new ApplicationError({
    type: 'ERROR',
    trxId: res['trx-id'],
    processInstance: res['process-instance'],
    status: res.status,
    fault: res.fault,
    displayMessages: res['display-messages']
  })
}

export default defaultResponseToErrorConvertor
