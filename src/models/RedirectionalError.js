import ApplicationError from './ApplicationError';

export default class RedirectionalError extends ApplicationError {
  constructor({ type, trxId, processInstance, fault, displayMessages }) {
    super({ type, trxId, processInstance, fault, displayMessages });
  }
}
