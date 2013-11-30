var gui = require('nw.gui');

var win = gui.Window.get();
var tray;

win.on('minimize', function() {
  'use strict';

});

var menu = new gui.Menu();
var tray;

menu.append(new gui.MenuItem({
  label: 'Ouvrir',
  click: function () {
    'use strict';
    win.show();
    tray.remove();
  }
}));

menu.append(new gui.MenuItem({
  label: 'Quitter',
  click: function () {
    'use strict';
    win.close(true);
  }
}));

win.on('close', function () {
  'use strict';

  this.hide();

  tray = new gui.Tray({ title: 'Mi', menu: menu});

  tray.on('click', function() {
    win.show();
    this.remove();
    tray = null;
  });
});