(function(scope) {
  var currentParent;
  var currentNode;

  function patch(el, fn, data) {
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

  var hooks = {
    elementCreated: function(node, initializationData) {},

    textCreated: function(node, initializationData) {}
  };

  function initializeData(node, nodeName, key) {
    node['__icData'] = node['__icData'] || {
      nodeName: nodeName,
      key: key,
      keyMap: null
    };
  }

  function alignWithDom(nodeName, key, initializationData) {
    var keyMap = currentParent['__icData'].keyMap;
    var matchingNode;

    if (keyMap) {
      matchingNode = keyMap[key];
    }

    if (!matchingNode) {
      if (nodeName === '#text') {
        matchingNode = document.createTextNode('');
        hooks.textCreated(matchingNode, initializationData);
      } else {
        matchingNode = document.createElement(nodeName);
        hooks.elementCreated(matchingNode, initializationData);
      }

      initializeData(matchingNode, nodeName, key);
    }

    if (currentNode && currentNode['__icData'].key) {
      currentParent.replaceChild(matchingNode, currentNode);
    } else {
      currentParent.insertBefore(matchingNode, currentNode);  
    }

    currentNode = matchingNode;
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

  function coreText() {
    nextNode();
    if (textNeedsAlignment()) {
      alignWithDom('#text', null, null);
    }

    return currentNode;
  }

  function coreElementOpen(tagName, key, statics) {
    nextNode();
    if (elementNeedsAlignment(tagName, key)) {
      alignWithDom(tagName, key, statics);
    }

    enterElement();
    return currentParent;
  }

  function coreElementClose() {
    clearUnvisitedDom();
    exitElement();
  }


















  hooks.elementCreated = function(node, statics) {
    var arr = statics || [];
    for (var i = 0; i < arr.length; i += 2) {
      applyAttr(node, arr[i], arr[i + 1]);
    }

    node['__incrementalDomData'] = {
      attrsArr: [],
      newAttrs: {}
    };
  };

  hooks.textCreated = function(node, statics) {
    node['__incrementalDomData'] = {
      value: ''
    };
  };

  function applyAttr(el, name, value) {
    if (value !== undefined) {
      el.setAttribute(name, value);
    } else {
      el.removeAttribute(name);
    }
  }

  function elementOpen(tagName, key, statics) {
    var node = coreElementOpen(tagName, key, statics);
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
        applyAttr(node, attr, newAttrs[attr]);
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
    var node = coreText();
    var data = node['__incrementalDomData'];

    if (data.value !== value) {
      node.data = value;
      data.value = value;
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