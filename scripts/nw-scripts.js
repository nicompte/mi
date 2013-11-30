var gui = require('nw.gui');

var win = gui.Window.get();
var tray;

win.on('minimize', function() {
  
});

var menu = new gui.Menu();
var tray;

menu.append(new gui.MenuItem({
  label: 'Ouvrir',
  click: function () {
    win.show();
    tray.remove();
  }
}));

menu.append(new gui.MenuItem({
  label: 'Quitter',
  click: function () {
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