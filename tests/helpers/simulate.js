function window(target) {
  if (target.ownerDocument) {
    return target.ownerDocument.defaultView;
  }

  if (target.defaultView) {
    return target.defaultView;
  }

  return target;
}

export const click = function (target, options) {
  options = Object.assign({ bubbles: true }, options);
  const { MouseEvent } = window(target);
  target.dispatchEvent(new MouseEvent('mousedown', options));
  target.dispatchEvent(new MouseEvent('mouseup', options));
  target.dispatchEvent(new MouseEvent('click', options));
};

export const drag = function (target, mousedownOptions, mouseUpOptions) {
  mousedownOptions = Object.assign({ bubbles: true }, mousedownOptions);
  mouseUpOptions = Object.assign({ bubbles: true }, mouseUpOptions);
  const { MouseEvent } = window(target);
  target.dispatchEvent(new MouseEvent('mousedown', mousedownOptions));
  target.dispatchEvent(new MouseEvent('mouseup', mouseUpOptions));
  target.dispatchEvent(new MouseEvent('click', mouseUpOptions));
};

export const dblclick = function (target, options) {
  options = Object.assign({ bubbles: true }, options);
  const { MouseEvent } = window(target);
  target.dispatchEvent(new MouseEvent('mousedown', options));
  target.dispatchEvent(new MouseEvent('mouseup', options));
  target.dispatchEvent(new MouseEvent('click', options));
  target.dispatchEvent(new MouseEvent('mousedown', options));
  target.dispatchEvent(new MouseEvent('mouseup', options));
  target.dispatchEvent(new MouseEvent('click', options));
  target.dispatchEvent(new MouseEvent('dblclick', options));
};

const generalEvents = {};

['mouseup', 'mousedown', 'mouseover', 'mousemove', 'mouseout'].forEach((event) => {
  generalEvents[event] = function (target, options) {
    options = Object.assign({ bubbles: true }, options);
    const { MouseEvent } = window(target);
    target.dispatchEvent(new MouseEvent(event, options));
  };
});

['wheel', 'mousewheel'].forEach((event) => {
  generalEvents[event] = function (target, options) {
    options = Object.assign({ bubbles: true }, options);
    const { WheelEvent } = window(target);
    target.dispatchEvent(new WheelEvent(event, options));
  };
});

// magic deltaY value that indicates the event is from a mouse wheel
// (rather than a trackpad)
generalEvents.magicWheelZoomDelta = 4.000244140625;

['touchstart', 'touchend', 'touchmove', 'touchcancel'].forEach((event) => {
  generalEvents[event] = function (target, options) {
    // Should be using Touch constructor here, but https://github.com/jsdom/jsdom/issues/2152.
    options = Object.assign({ bubbles: true, touches: [{ clientX: 0, clientY: 0 }] }, options);
    const { TouchEvent } = window(target);
    target.dispatchEvent(new TouchEvent(event, options));
  };
});

['focus', 'blur'].forEach((event) => {
  generalEvents[event] = function (target, options) {
    options = Object.assign({ bubbles: true }, options);
    const { FocusEvent } = window(target);
    target.dispatchEvent(new FocusEvent(event, options));
  };
});

export default generalEvents;
