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


var initializeTray = function () {

  tray = new gui.Tray({ icon: 'css/mi.png', menu: menu});

  tray.on('click', function() {
    win.show();
    this.remove();
    tray = null;
  });

};

win.on('close', function () {
  'use strict';

  this.hide();

  initializeTray();

});

initializeTray();