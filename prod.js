function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const xhrMap = new Map();

(function () {
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () {
    this.xhrId = uuidv4();

    const xhrData = {};
    xhrData.method = arguments[0];
    xhrData.url = arguments[1];
    xhrData.async = arguments[2];
    xhrData.user = arguments[3];
    xhrData.password = arguments[4];

    xhrMap.set(this.xhrId, xhrData);

    this.addEventListener('load', function () {
      const xhrData = xhrMap.get(this.xhrId);

      // Response headers
      const responseHeaders = this.getAllResponseHeaders().split('\r\n').map(header => {
        const split = header.split(/:(.*)/s);
        return { name: split[0], value: split[1] }
      });

      xhrData.responseHeaders = responseHeaders;

      // Response body
      if (this.responseType === 'json') {
        xhrData.response = this.response;
      } else {
        try {
          xhrData.response = JSON.parse(this.responseText);
        } catch (err) {
          xhrData.response = this.responseText;
        }
      }

      xhrMap.set(this.xhrId, xhrData);
      console.log(xhrData);
    });

    origOpen.apply(this, arguments);
  };


  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    const xhrData = xhrMap.get(this.xhrId);

    const body = arguments[0];
    try {
      xhrData.body = JSON.parse(body);
    } catch (err) {
      xhrData = body;
    }
    xhrMap.set(this.xhrId, xhrData);

    origSend.apply(this, arguments);
  };


  const origSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function () {
    const xhrData = xhrMap.get(this.xhrId);

    xhrData.requestHeaders = xhrData.requestHeaders || [];
    xhrData.requestHeaders.push({ name: arguments[0], value: arguments[1] });
    xhrMap.set(this.xhrId, xhrData);

    origSetRequestHeader.apply(this, arguments);
  };


  // const origOnReadyStateChange = XMLHttpRequest.prototype.onreadystatechange;
  // XMLHttpRequest.prototype.onreadystatechange = function () {
  //   if (this.readyState == this.DONE && this.status == 200) {
  //     const xhrData = xhrMap.get(this.xhrId);

  //     if (this.responseType === 'json') {
  //       xhrData.response = this.response;
  //     } else {
  //       try {
  //         xhrData.response = JSON.parse(this.responseText);
  //       } catch (err) {
  //         xhrData.response = this.responseText;
  //       }
  //     }

  //     xhrMap.set(this.xhrId, xhrData);
  //   }

  //   origOnReadyStateChange.apply(this, arguments);
  // };
})();
