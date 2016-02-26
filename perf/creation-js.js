'use strict';

(function(scope) {
  var EMPTY_ARRAY = [];

  var attrOps = [];
  var appendOps = [];
  var textOps = [];

  function flush() {
    var i;

    for (i = 0; i < attrOps.length; i += 3) {
      flushAttr(attrOps[i], attrOps[i + 1], attrOps[i + 2]);
    }

    for (i = 0; i < textOps.length; i += 2) {
      flushText(textOps[i], textOps[i + 1]);
    }

    for (i = 0; i < appendOps.length; i += 2) {
      flushAppend(appendOps[i], appendOps[i + 1]);
    }

    appendOps.length = 0;
    attrOps.length = 0;
    textOps.length = 0;
  }

  function bufferAttr(el, name, value) {
    attrOps.push(el);
    attrOps.push(name);
    attrOps.push(value);
  }

  function bufferText(node, text) {
    textOps.push(node);
    textOps.push(text);
  }

  function bufferAppend(parent, el) {
    appendOps.push(parent);
    appendOps.push(el);
  }

  function flushAttr(el, name, value) {
    if (value !== undefined) {
      el.setAttribute(name, value);
    }
  }

  function flushText(node, text) {
    node.data = text;
  }

  function flushAppend(parent, el) {
    parent.appendChild(el);
  }



  var parentStack = [];

  function patch(el, fn, data) {
    el.innerHTML = '';
    parentStack.push(el);
    fn(data);

    flush();
  }

  function elementOpen(tagName, key, statics) {
    var el = document.createElement(tagName);
    var arr;
    var i;
    
    arr = statics || EMPTY_ARRAY;
    for (i = 0; i < arr.length; i += 2) {
      bufferAttr(el, arr[i], arr[i + 1]);
    }

    arr = arguments;
    for (i = 3; i < arr.length; i += 2) {
      bufferAttr(el, arr[i], arr[i + 1]);
    }

    parentStack.push(el);
  }

  function elementClose(tagName) {
    var el = parentStack.pop();
    var parent = parentStack[parentStack.length - 1];

    // Appending on the way out is a large performance increase on FIrefox
    bufferAppend(parent, el);
  }

  function elementVoid(tagName, key, statics) {
    elementOpen.apply(null, arguments);
    elementClose.apply(null, arguments);
  }
 
  function text(value) {
    var node = document.createTextNode('');
    var parent = parentStack[parentStack.length - 1];

    var formatted = value;
    for (var i = 1; i < arguments.length; i += 1) {
      var formatter = arguments[i];
      formatted = formatter(formatted);
    }

    bufferText(node, formatted);
    bufferAppend(parent, node);
  }

  scope.CreationJs = {
    patch: patch,
    elementOpen: elementOpen,
    elementClose: elementClose,
    elementVoid: elementVoid,
    text: text
  };
})(window);
