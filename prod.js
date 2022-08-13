function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function sendData(type, data) {
  data.type = type;
  data.sessionId = sessionId;
  console.log(data);
  console.log(JSON.stringify(data).length + ' bytes')
}

const sessionId = uuidV4();
const xhrMap = new Map();

const origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function () {
  this.xhrId = uuidv4();

  const xhrData = {};

  xhrData.request = {};
  xhrData.request.method = arguments[0];
  xhrData.request.url = arguments[1];
  xhrData.request.async = arguments[2];
  xhrData.request.user = arguments[3];
  xhrData.request.password = arguments[4];

  xhrMap.set(this.xhrId, xhrData);

  this.addEventListener('load', function () {
    const xhrData = xhrMap.get(this.xhrId);

    // Set Response Headers
    const responseHeaders = this.getAllResponseHeaders().split('\r\n').map(header => {
      const split = header.split(/:(.*)/s);
      return { name: split[0], value: split[1] }
    });

    xhrData.responseHeaders = responseHeaders;

    // Set Response Body
    if (this.responseType === 'json') {
      xhrData.responseBody = this.response;
    } else {
      try {
        xhrData.responseBody = JSON.parse(this.responseText);
      } catch (err) {
        xhrData.responseBody = this.responseText;
      }
    }

    xhrMap.set(this.xhrId, xhrData);

    // Send data
    sendData('xhr', xhrData);
  });

  origOpen.apply(this, arguments);
};

// Set Request Body
const origSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function () {
  const xhrData = xhrMap.get(this.xhrId);

  const requestBody = arguments[0];
  try {
    xhrData.requestBody = JSON.parse(requestBody);
  } catch (err) {
    xhrData = requestBody;
  }
  xhrMap.set(this.xhrId, xhrData);

  origSend.apply(this, arguments);
};

// Set Request Headers
const origSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
XMLHttpRequest.prototype.setRequestHeader = function () {
  const xhrData = xhrMap.get(this.xhrId);

  xhrData.requestHeaders = xhrData.requestHeaders || [];
  xhrData.requestHeaders.push({ name: arguments[0], value: arguments[1] });
  xhrMap.set(this.xhrId, xhrData);

  origSetRequestHeader.apply(this, arguments);
};
