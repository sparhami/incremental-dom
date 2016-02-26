(function(scope) {
  var currentParent;
  var currentNode;

  function corePatch(el, fn, data) {
    // Save the existing state to restore
    var savedCurrentParent = currentParent;
    var savedCurrentNode = currentNode;

    currentParent = el;
    currentNode = null;
    initializeData(el);

    fn(data);
    clearUnvisitedDom();

    // restore the previous state
    currentParent = savedCurrentParent;
    currentNode = savedCurrentNode;
  }

  function initializeData(node, nodeName, key) {
    node['__icData'] = node['__icData'] || {
      nodeName: nodeName,
      key: key,
      keyMap: null,
      parent: null,
      anchor: null,
    };
  }

  function attachIfNeeded(node) {
    const parent = node['__icData'].parent;
    const anchor = node['__icData'].anchor;

    if (!parent) {
      return;
    }

    node['__icData'].parent = null;
    node['__icData'].anchor = null;

    if (anchor && anchor['__icData'].key) {
      parent.replaceChild(node, anchor);
    } else {
      parent.insertBefore(node, anchor);
    }
  }

  function clearUnvisitedDom() {
    var lastChild = currentParent.lastChild;

    while(lastChild !== currentNode) {
      currentParent.removeChild(lastChild);
      lastChild = currentParent.lastChild;
    }
  }

  function enterElement() {
    currentParent = currentNode;
    currentNode = null;
  }

  function exitElement() {
    currentNode = currentParent;
    currentParent = currentParent.parentNode;
  }

  function nextNode() {
    if (currentNode) {
      currentNode = currentNode.nextSibling;
    } else {
      currentNode = currentParent.firstChild;
    }
  }

  function elementNeedsAlignment(tagName, key) {
    return !currentNode ||
        tagName !== currentNode['__icData'].nodeName ||
        key != currentNode['__icData'].key;
  }

  function textNeedsAlignment() {
    return !currentNode || currentNode['__icData'].nodeName !== '#text';
  }

  function coreText(textCreated) {
    nextNode();

    if (textNeedsAlignment()) {
      var matchingNode = document.createTextNode('');

      textCreated(matchingNode);
      initializeData(matchingNode, '#text', null);

      currentParent.insertBefore(matchingNode, currentNode);
      currentNode = matchingNode;
    }

    return currentNode;
  }

  function coreElementOpen(tagName, key, elementCreated, statics) {
    nextNode();

    if (elementNeedsAlignment(tagName, key)) {
      var keyMap = currentParent['__icData'].keyMap;
      var matchingNode;

      if (keyMap && key) {
        matchingNode = keyMap[key];
      }

      if (!matchingNode) {
        matchingNode = document.createElement(tagName);
        elementCreated(matchingNode, statics);
        initializeData(matchingNode, tagName, key);
      }

      matchingNode['__icData'].parent = currentParent;
      matchingNode['__icData'].anchor = currentNode;
      currentNode = matchingNode;
    }

    enterElement();
    return currentParent;
  }

  function coreElementClose() {
    attachIfNeeded(currentParent);

    clearUnvisitedDom();
    exitElement();
  }


















  var attrOps = [];
  var textOps = [];

  function bufferAttr(el, name, value) {
    attrOps.push(el);
    attrOps.push(name);
    attrOps.push(value);
  }

  function bufferText(node, value) {
    textOps.push(node);
    textOps.push(value);
  }

  function flushAttr(el, name, value) {
    if (value !== undefined) {
      el.setAttribute(name, value);
    } else {
      el.removeAttribute(name);
    }
  }

  function flushText(node, value) {
    node.data = value;
  }

  function flush() {
    for (var i = 0; i < attrOps.length; i += 3) {
      flushAttr(attrOps[i+0], attrOps[i+1], attrOps[i+2]);
    }

    for (var i = 0; i < textOps.length; i += 2) {
      flushText(textOps[i+0], textOps[i+1]);
    }

    attrOps.length = 0;
    textOps.length = 0;
  }

  function patch(el, fn, data) {
    corePatch(el, fn, data);
    flush();
  }

  var elementCreated = function(node, statics) {
    var arr = statics || [];
    for (var i = 0; i < arr.length; i += 2) {
      bufferAttr(node, arr[i], arr[i + 1]);
    }

    node['__incrementalDomData'] = {
      attrsArr: [],
      newAttrs: {}
    };
  };

  var textCreated = function(node, statics) {
    node['__incrementalDomData'] = {
      value: ''
    };
  };

  function elementOpen(tagName, key, statics) {
    var node = coreElementOpen(tagName, key, elementCreated, statics);
    var data = node['__incrementalDomData'];

    var attrsArr = data.attrsArr;
    var attrsChanged = false;
    var i = 3;
    var j = 0;

    for (; i < arguments.length; i += 1, j += 1) {
      if (attrsArr[j] !== arguments[i]) {
        attrsChanged = true;
        break;
      }
    }

    for (; i < arguments.length; i += 1, j += 1) {
      attrsArr[j] = arguments[i];
    }

    if (j < attrsArr.length) {
      attrsChanged = true;
      attrsArr.length = j;
    }

    if (attrsChanged) {
      var attr;
      var newAttrs = data.newAttrs;

      for (attr in newAttrs) {
        newAttrs[attr] = undefined;
      }

      for (i = 3; i < arguments.length; i += 2) {
        newAttrs[arguments[i]] = arguments[i + 1];
      }

      for (attr in newAttrs) {
        bufferAttr(node, attr, newAttrs[attr]);
      }
    }
  }

  function elementClose(tagName) {
    coreElementClose();
  }

  function elementVoid(tagName, key, statics) {
    elementOpen.apply(null, arguments);
    elementClose.apply(null, arguments);
  }
 
  function text(value) {
    var node = coreText(textCreated);
    var data = node['__incrementalDomData'];

    if (data.value !== value) {
      data.value = value;

      var formatted = value;
      for (var i = 1; i < arguments.length; i += 1) {
        var formatter = arguments[i];
        formatted = formatter(formatted);
      }

      bufferText(node, formatted);
    }
  }

  scope.Exploration = {
    patch: patch,
    elementOpen: elementOpen,
    elementClose: elementClose,
    elementVoid: elementVoid,
    text: text
  };
})(window);
