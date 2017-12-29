export default class ApplicationError extends Error {
  constructor({ type, trxId, processInstance, fault, displayMessages }) {
    super(type)
    this.type = type || 'ERROR'
    this.trxId = trxId
    this.processInstance = processInstance
    // fault object
    this.code = fault.code
    this.fault = fault
    // display messages arrays
    this.displayMessages = displayMessages
    this.message = {
      th: displayMessages[0]['th-message'],
      en: displayMessages[0]['en-message'],
      technical: displayMessages[0]['technical-message']
    }
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error(type).stack
    }
  }
}
