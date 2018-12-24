import config from '../../config/environment';

const { interceptCarto } = config;

export default () => {
  // Note: the below XMLHttpRequest has already been converted to a FakeXMLHttpRequest by pretender

  const origSend = window.XMLHttpRequest.prototype.send;
  window.XMLHttpRequest.prototype.send = function send() {
    origSend.apply(this, arguments); // eslint-disable-line

    const fakeXhr = this; // eslint-disable-line consistent-this
    const realXhr = this._passthroughRequest;
    if (realXhr) {
      realXhr.onload = function(event) {
        if (fakeXhr.responseType !== 'arraybuffer') {
          fakeXhr.response = realXhr.response;
        }

        // dispatch event instead of calling the original to prevent a double call bug
        fakeXhr.dispatchEvent(event);
      };
    }
  };

  // BAD
  // We need this for testing purposes. We need to send back fake array buffers
  // for mapbox-gl to be happy.
  // see https://github.com/pretenderjs/pretender/pull/157
  if (interceptCarto) {
    const origSetResponse = window.FakeXMLHttpRequest.prototype._setResponseBody;
    window.FakeXMLHttpRequest.prototype._setResponseBody = function _setResponseBody(body) {
      this.response = body;

      if (this.responseType === 'arraybuffer') {
        this.response = new ArrayBuffer(1);
      }

      origSetResponse.apply(this, arguments); // eslint-disable-line
    };
  }
};
