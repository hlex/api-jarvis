import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import { fetchWithJarvis } from '../src/index.js';

chai.use(chaiAsPromised);

const successful = {
  status: 'SUCCESSFUL',
  'trx-id': '12345678',
  'process-instance': 'SFF_node1',
  'response-data': {},
};

const successWithMessages = {
  status: 'SUCCESSFUL',
  'trx-id': '12345678',
  'process-instance': 'SFF_node1',
  'response-data': {},
  'display-messages': [],
};

const error500 = {
  "trx-id" : "4WCDPKAO9BVXP",
  "status" : "UNSUCCESSFUL",
  "process-instance" : "tmsapnpr1 (instance: SFF_node1)",
  "fault" : {
    "name" : "th.co.truecorp.ads.ws.ServiceClientException",
    "code" : "SVC-500",
    "message" : "; nested exception is: \n\tjava.net.SocketTimeoutException: Read timed out on External service( system [CCB_INT], operation [CUSTOMER_INTEGRATION], timeout [30000 ms.], url [http://172.19.194.63:8480/CustomerIntegration/CustomerIntegrationSI] )",
    "detailed-message" : "External service( system [CCB_INT], operation [CUSTOMER_INTEGRATION], timeout [30000 ms.], url [http://172.19.194.63:8480/CustomerIntegration/CustomerIntegrationSI] ) ServiceClientException ; nested exception is: \n\tjava.net.SocketTimeoutException: Read timed out. "
  },
  "display-messages" : [ {
    "message" : "; nested exception is: \n\tjava.net.SocketTimeoutException: Read timed out on External service( system [CCB_INT], operation [CUSTOMER_INTEGRATION], timeout [30000 ms.], url [http://172.19.194.63:8480/CustomerIntegration/CustomerIntegrationSI] )",
    "message-type" : "ERROR",
    "en-message" : "; nested exception is: \n\tjava.net.SocketTimeoutException: Read timed out on External service( system [CCB_INT], operation [CUSTOMER_INTEGRATION], timeout [30000 ms.], url [http://172.19.194.63:8480/CustomerIntegration/CustomerIntegrationSI] )",
    "th-message" : "; nested exception is: \n\tjava.net.SocketTimeoutException: Read timed out on External service( system [CCB_INT], operation [CUSTOMER_INTEGRATION], timeout [30000 ms.], url [http://172.19.194.63:8480/CustomerIntegration/CustomerIntegrationSI] )",
    "technical-message" : "tmsapnpr1 (instance: SFF_node1) External service( system [CCB_INT], operation [CUSTOMER_INTEGRATION], timeout [30000 ms.], url [http://172.19.194.63:8480/CustomerIntegration/CustomerIntegrationSI] ) External service( system [CCB_INT], operation [CUSTOMER_INTEGRATION], timeout [30000 ms.], url [http://172.19.194.63:8480/CustomerIntegration/CustomerIntegrationSI] ) ServiceClientException ; nested exception is: \n\tjava.net.SocketTimeoutException: Read timed out. "
  } ]
}

const error400 = {
  "trx-id" : "4UCDPJL3Z03GV",
  "status" : "UNSUCCESSFUL",
  "process-instance" : "tmsapnpr1 (instance: SFF_node1)",
  "fault" : {
    "name" : "th.co.truecorp.ads.ws.validation.DataValidationException",
    "code" : "PROFILE-401",
    "message" : "Bad request. Query parameter name \"certificateid\" or \"product-id-number\" must be specific",
    "detailed-message" : "DataValidationException Bad request. Query parameter name \"certificateid\" or \"product-id-number\" must be specific. "
  },
  "display-messages" : [ {
    "message" : "Bad request. Query parameter name \"certificateid\" or \"product-id-number\" must be specific",
    "message-type" : "WARNING",
    "en-message" : "Bad request. Query parameter name \"certificateid\" or \"product-id-number\" must be specific",
    "th-message" : "Bad request. Query parameter name \"certificateid\" or \"product-id-number\" must be specific",
    "technical-message" : "tmsapnpr1 (instance: SFF_node1) DataValidationException Bad request. Query parameter name \"certificateid\" or \"product-id-number\" must be specific. "
  } ]
};

const jboss404 = '<html><head><title>JBoss Web/7.4.8.Final-redhat-4 - JBWEB000064: Error report</title><style><!--H1 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:22px;} H2 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:16px;} H3 {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;font-size:14px;} BODY {font-family:Tahoma,Arial,sans-serif;color:black;background-color:white;} B {font-family:Tahoma,Arial,sans-serif;color:white;background-color:#525D76;} P {font-family:Tahoma,Arial,sans-serif;background:white;color:black;font-size:12px;}A {color : black;}A.name {color : black;}HR {color : #525D76;}--></style> </head><body><h1>JBWEB000065: HTTP Status 404 - /smartui-sale-nonshopp</h1><HR size="1" noshade="noshade"><p><b>JBWEB000309: type</b> JBWEB000067: Status report</p><p><b>JBWEB000068: message</b> <u>/smartui-sale-nonshopp</u></p><p><b>JBWEB000069: description</b> <u>JBWEB000124: The requested resource is not available.</u></p><HR size="1" noshade="noshade"><h3>JBoss Web/7.4.8.Final-redhat-4</h3></body></html>';

/*
 * == GET
 */
nock('http://localhost')
.get('/test200')
.reply(200, successful)
.get('/test200')
.query({ type: 'warning' })
.reply(200, successWithMessages)
.get('/test302')
.reply(302, { status: 'SUCCESSFUL' })
.get('/test304')
.reply(304, { status: 'SUCCESSFUL' })
.get('/test400')
.reply(400, error400)
.get('/test404')
.reply(404, jboss404)
.get('/test500')
.reply(500, error500)
.get('/test502')
.reply(502, '502 Bad Gateway')

/*
 * == POST
 */

describe('fetch with jarvis functional', () => {
  // 200
  it('should resolve 200', () => {
    return expect(fetchWithJarvis('http://localhost/test200')).to.eventually.be.fulfilled
    .then((response) => {
      expect(response).to.have.property('status', 'SUCCESSFUL');
    })
  });
  // 302
  // 304
  // 400
  it('should resolve 400', () => {
    return expect(fetchWithJarvis('http://localhost/test400')).to.eventually.be.fulfilled
    .then((response) => {
      expect(response).to.have.property('trx-id');
    })
  });
  // 404
  it('should reject 404', () => {
    return expect(fetchWithJarvis('http://localhost/test404')).to.rejectedWith(Error);
  });
  // 500
  it('should resolve 500', () => {
    return expect(fetchWithJarvis('http://localhost/test500')).to.eventually.be.fulfilled
    .then((response) => {
      expect(response).to.have.property('trx-id');
    })
  });
  // 502
  it('should reject 502', () => {
    return expect(fetchWithJarvis('http://localhost/test502')).to.rejectedWith(Error);
  });
});

describe('fetch with jarvis | - params | - errorFormat', () => {

});

describe('fetch with jarvis | + params | - errorFormat', () => {

});

describe('fetch with jarvis | + params | + errorFormat', () => {

});

// describe('fetch with jarvis', () => {
//   it('should resolve', () => {
//     return expect(fetchWithJarvis('http://localhost/test')).to.eventually.be.fulfilled
//     .then((response) => {
//       expect(response).to.have.property('status', 'SUCCESSFUL');
//     })
//   });
//   it('should resolve if response.status === 200', () => {
//     const data = {
//       name: 'Dop',
//     };
//     const params = convertToURLParam(data);
//     return expect(fetchWithJarvis(`http://localhost/test${params}`)).to.eventually.be.fulfilled
//     .then((response) => {
//       expect(response).to.have.property('status', 'SUCCESSFUL');
//     })
//   });
//   it('should ...');
// });

// describe('fetch with jarvis', () => {
//   it('should resolve', () => {
//     return expect(fetchWithJarvis('http://localhost/test')).to.eventually.be.fulfilled
//     .then((response) => {
//       expect(response).to.have.property('status', 'SUCCESSFUL');
//     })
//   });
//   it('should resolve', () => {
//     return expect(fetchWithJarvis('http://localhost/test')).to.eventually.be.fulfilled
//     .then((response) => {
//       expect(response).to.have.property('status', 'SUCCESSFUL');
//     })
//   });
//   it('should resolve if response.status === 200', () => {
//     const data = {
//       name: 'Dop',
//     };
//     const params = convertToURLParam(data);
//     return expect(fetchWithJarvis(`http://localhost/test${params}`)).to.eventually.be.fulfilled
//     .then((response) => {
//       expect(response).to.have.property('status', 'SUCCESSFUL');
//     })
//   });
//   it('should ...');
// });
