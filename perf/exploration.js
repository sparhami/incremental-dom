(function(scope) {
  var currentParent;
  var currentNode;
  var previousNode;

  var NO_DATA = {
    key: null,
    keyMap: null,
    nodeName: '#invalid'
  };

  function patch(el, fn, data) {
    currentParent = el;
    currentNode = el.firstChild;
    previousNode = null;
    initializeData(el);

    fn(data);
    clearUnvisitedDom();
  }

  var hooks = {
    elementCreated: function(el, initializationData) {}
  };

  function initializeData(node, nodeName, key) {
    if (nodeName === '#text') {
      node['__icData'] = node['__icData'] || {
        nodeName: '#text',
        nextSibling: null,
        value: ''
      };
    } else {
      node['__icData'] = node['__icData'] || {
        nodeName: nodeName,
        nextSibling: null,
        parentNode: currentParent,
        firstChild: null,
        lastChild: null,
        key: key,
        keyMap: null,
        attrsArr: [],
        newAttrs: {}
      };
    }
  }

  function alignWithDom(nodeName, key, initializationData) {
    var data = (currentNode && currentNode['__icData']) || NO_DATA;
    var matchingNode;

    if (nodeName === data.nodeName && key == data.key) {
      matchingNode = currentNode;
    } else {

      var parentData = currentParent['__icData'];
      var keyMap = parentData.keyMap;

      if (keyMap) {
        matchingNode = keyMap[key];
      }

      if (!matchingNode) {
        if (nodeName === '#text') {
          matchingNode = document.createTextNode('');
        } else {
          matchingNode = document.createElement(nodeName);
          hooks.elementCreated(matchingNode, initializationData);
        }

        initializeData(matchingNode, nodeName, key);
      }

      if (data.key) {
        currentParent.replaceChild(matchingNode, currentNode);
      } else {
        currentParent.insertBefore(matchingNode, currentNode);  
      }

      if (previousNode) {
        previousNode['__icData'].nextSibling = matchingNode;
      } else {
        currentParent['__icData'].firstChild = matchingNode;
      }

      if (!currentNode) {
        currentParent['__icData'].lastChild = matchingNode;
      }
    }

    return currentNode = matchingNode;
  }

  function clearUnvisitedDom() {
    var lastChild = currentParent['__icData'].lastChild || previousNode;

    while(lastChild !== previousNode) {
      currentParent.removeChild(lastChild);
      lastChild = currentParent.lastChild;
    }
  }

  function enterElement() {
    previousNode = null;
    currentParent = currentNode;
    currentNode = currentNode['__icData'].firstChild;
  }

  function exitElement() {
    previousNode = currentParent;
    currentNode = currentParent['__icData'].nextSibling;
    currentParent = currentParent['__icData'].parentNode;
  }

  function skipNode() {
    previousNode = currentNode;
    currentNode = currentNode['__icData'].nextSibling;
  }























  hooks.elementCreated = function(el, statics) {
    var arr = statics || [];
    for (var i = 0; i < arr.length; i += 2) {
      applyAttr(el, arr[i], arr[i + 1]);
    }
  };

  function applyAttr(el, name, value) {
    if (value !== undefined) {
      el.setAttribute(name, value);
    } else {
      el.removeAttribute(name);
    }
  }

  function elementOpen(tagName, key, statics) {
    var node = alignWithDom(tagName, key, statics);
    var data = node['__icData'];
    enterElement();

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
    clearUnvisitedDom();
    exitElement();
  }

  function elementVoid(tagName, key, statics) {
    elementOpen.apply(null, arguments);
    elementClose.apply(null, arguments);
  }
 
  function text(value) {
    var node = alignWithDom('#text', null, null);
    var data = node['__icData'];
    skipNode();

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
