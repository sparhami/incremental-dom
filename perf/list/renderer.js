(function(scope) {

var listStatics = [
  'id', 'list',
  'role', 'list',
];
var itemStatics = [
  'class', 'message',
  'role', 'listitem',
  'tabindex', '-1',
];
var checkboxStatics = [
 'class', 'checkbox',
 'role', 'checkbox',
 'tabindex', '-1'
];
var starStatics = [
  'class', 'star'
];
var senderStatics = [
  'class', 'sender'
];
var subjectStatics = [
  'class', 'subject'
];

function ListRenderer(container, lib) {
  var patch = lib.patch,
      elementVoid = lib.elementVoid,
      elementOpen = lib.elementOpen,
      elementClose = lib.elementClose,
      text = lib.text,
      ua = lib.updateAttributes;

  function render(props) {
    var items = props.items;
    var selectedKeys = props.selectedKeys;

    elementOpen('div', null, listStatics);

    for(var i = 0; i < items.length; i += 1) {
      var item = items[i];
      var isSelected = selectedKeys[item.key];

      elementOpen('div', item.key, itemStatics);
            ua('aria-selected', isSelected);
      
        elementOpen('div', null, checkboxStatics);
            ua('aria-checked', 'false');
        elementClose('div');

        elementOpen('div', null, starStatics);
            ua('data-starred', item.starred,
               'aria-label', item.starred ? 'Starred' : 'Not Starred');
        elementClose('div');
        
        elementOpen('span', null, senderStatics);
            ua('title', item.sender);
          text(item.sender);
        elementClose('span');

        elementOpen('span', null, subjectStatics);
            ua('title', item.subject);
          text(item.subject);
        elementClose('span');

        elementOpen('span');
            ua();
          text(item.date);
        elementClose('span');

      elementClose('div');
    }
    
    elementClose('div'); 
  }

  this.render = function(props) {
    lib.patch(container, render, props)
  };

  this.clear = function() {
    container.innerHTML = '';
  };
}

scope.ListRenderer = ListRenderer;

}(window));
