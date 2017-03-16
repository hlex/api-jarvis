import ApplicationError from './ApplicationError';

export default class ServerError extends ApplicationError {
  constructor({ type, code, name, appMessage, debugMessage, serviceMessage, trxId, context }) {
    super({ type, code, name, appMessage, debugMessage, serviceMessage, trxId, context });
  }
}
