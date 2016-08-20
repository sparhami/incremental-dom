(function(scope) {

function VanillaListRenderer(container) {
  function render(container, props) {
    var items = props.items;
    var selectedKeys = props.selectedKeys;

    var list = document.createElement('div');
    list.setAttribute('id', 'message');
    list.setAttribute('role', 'list');

    var listFragment = document.createDocumentFragment();

    for(var i = 0; i < items.length; i += 1) {
      var item = items[i];
      var isSelected = selectedKeys[item.key];

      var itemEl = document.createElement('div');
      itemEl.setAttribute('class', 'message');
      itemEl.setAttribute('role', 'listiem');
      itemEl.setAttribute('tabindex', '-1');
      if (isSelected !== undefined) {
        itemEl.setAttribute('aria-selected', isSelected);
      }

      var checkbox = document.createElement('div');
      checkbox.setAttribute('class', 'checkbox');
      checkbox.setAttribute('role', 'checkbox');
      checkbox.setAttribute('tabindex', '-1');
      checkbox.setAttribute('aria-checked', 'false');

      itemEl.appendChild(checkbox);

      var star = document.createElement('div');
      star.setAttribute('class', 'star');
      if (item.starred !== undefined) {
        star.setAttribute('data-starred', item.starred);
      }
      star.setAttribute('aria-label', item.starred ? 'Starred' : 'Not Starred');

      itemEl.appendChild(star);

      var sender = document.createElement('span');
      sender.setAttribute('class', 'sender');
      sender.setAttribute('title', item.sender);
      sender.textContent = item.sender;

      itemEl.appendChild(sender);

      var subject = document.createElement('span');
      subject.setAttribute('class', 'subject');
      subject.setAttribute('title', item.subject);
      subject.textContent = item.subject;

      itemEl.appendChild(subject);

      var date = document.createElement('span');
      date.textContent = item.date;

      itemEl.appendChild(date);

      listFragment.appendChild(itemEl);
    }
    
    list.appendChild(listFragment);
    container.appendChild(list);
  }

  this.render = function(props) {
    render(container, props);
  };

  this.clear = function() {
    container.innerHTML = '';
  };
}

scope.VanillaListRenderer = VanillaListRenderer;

}(window));
