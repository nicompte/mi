var gui = require('nw.gui');

var win = gui.Window.get();
var tray;

var menu = new gui.Menu();
var tray;

menu.append(new gui.MenuItem({
  label: 'Ouvrir',
  click: function () {
    'use strict';
    win.show();
  }
}));

menu.append(new gui.MenuItem({
  label: 'Quitter',
  click: function () {
    'use strict';
    win.close(true);
  }
}));

tray = new gui.Tray({ icon: 'css/mi.png', menu: menu});

win.on('close', function () {
  'use strict';

  this.hide();

});
