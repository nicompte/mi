// Server side
var http = require('http'),
express = require('express'),
server = express(),
fs = require('fs'),
MD5 = require('MD5'),
settings = {};

function onPart(part) {
  'use strict';
  if(!part.filename || part.filename.match(/\.(jpg|jpeg|png)$/i)) {
    this.handlePart(part);
  }
}

server.use(express.bodyParser({onPart: onPart}));
server.use(express.limit('8mb'));

// Client side
angular.module('LocalStorageModule').value('prefix', 'mi');
var app = angular.module('mi', ['ngRoute', 'LocalStorageModule', 'ui.router', 'ui.select']);

app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/images');
  $stateProvider
  .state('images', { url: '/images', templateUrl: 'images.html' })
  .state('upload', { url: '/upload', templateUrl: 'upload.html' })
  .state('settings', { url: '/settings', templateUrl: 'index.html' })
  .state('users', { url: '/users', templateUrl: 'users.html'})
  .state('users.receive', { url: '/receive', views: { 'test': { templateUrl: 'users.receive.html' }}})
  .state('users.send', { url: '/send', views: { 'test': { templateUrl: 'users.send.html' }}})
  .state('new-user', {url: '/users-new', templateUrl: 'newUser.html'})
  .state('new-user-send', {url: '/users-send-new', templateUrl: 'newUserSend.html'})
  .state('help', { url: '/help', templateUrl: 'help.html' });
});

  app.controller('MainCtrl', function ($scope, localStorageService, $state) {
      'use strict';

  //Define routes
  server.post('/file-upload', function(req, res) {

    var settings = localStorageService.get('settings');
    var users = localStorageService.get('users');

    var authorizedUser = users.filter(function (user) {
      return user.name === req.body['user.name'] && user.password === MD5(req.body['user.password']);
    });

    if(authorizedUser.length !== 1){
      res.send(401);
    }

    var tmpPath = req.files.file.path;
    var targetPath = settings.targetFolder + '/' + req.files.file.name;
    fs.rename(tmpPath, targetPath, function(err) {
      if (err){
        throw err;
      }
      fs.unlink(tmpPath, function() {
        if (err){
          throw err;
        }
        if($state.is('images')){
          $state.go('.');
        }
        res.send(200);
      });
    });
  });

  server.get('/ping', function(req, res){
    res.send('ok');
  });

});

app.controller('ServerStateCtrl', function ($scope, localStorageService) {
  'use strict';

  var nodeServer = http.createServer(server),
  serverOn = localStorageService.get('serverOn') || false;
  settings = localStorageService.get('settings');

  nodeServer.on('listening', function () {
    $scope.serverOn = true;
    $scope.$apply();
    localStorageService.set('serverOn', true);
  });
  nodeServer.on('close', function () {
    $scope.serverOn = false;
    $scope.$apply();
    localStorageService.set('serverOn', false);
  });
  nodeServer.on('error', function () {
    alert('Impossible de démarrer le serveur. Vérifiez le port utilisé.');
    $scope.serverOn = false;
    $scope.$apply();
  });

  var startServer = function () {
    nodeServer.listen(settings.port);
    $scope.serverOn = null;
  };

  if(serverOn === true || serverOn === 'true'){
    startServer();
  }else{
    $scope.serverOn = false;
  }

  $scope.toggleServerState = function (element) {
    if($scope.serverOn){
      nodeServer.close();
      $scope.serverOn = null;
    }else{
      startServer();
    }
  };

});

app.controller('SettingsCtrl', function ($scope, localStorageService, $sce) {
  'use strict';

  var request = require('request');
  $scope.settings = settings = localStorageService.get('settings');

  if(typeof settings === 'undefined' || settings === null){
    settings = {};
    settings.port = 3000;
    localStorageService.set('settings', settings);
  }

  request('http://ipinfo.io', function (error, response, body) {
    if (!error && response.statusCode === 200){
      $scope.settings.ip = JSON.parse(body).ip;
      $scope.$apply();
    }
  });

  $scope.save = function () {
    delete $scope.settings.serverConfiguration;
    localStorageService.remove('settings');
    localStorageService.add('settings', $scope.settings);
    settings = $scope.settings;
  };

  $scope.testServerConfiguration = function () {
    var url = 'http://' + $scope.settings.ip + ':' + $scope.settings.port + '/ping';
    request({url: url, timeout: 2000}, function (error, response, body) {
      if(!error && response.statusCode === 200){
        $scope.settings.serverConfiguration = true;
      }else{
        $scope.settings.serverConfiguration = false;
      }
      $scope.configurationMessage = $scope.settings.serverConfiguration === true ? 'Configuration valide.<br/>Adresse à transmettre : ' + $scope.settings.ip + ':' + $scope.settings.port
      : $scope.settings.serverConfiguration === false ? 'Echec de la configuration.<br/>Vérifiez que le port est bien ouvert par votre firewall et/ou votre routeur.'
      : '';
      $scope.configurationMessage = $sce.trustAsHtml($scope.configurationMessage);
      $scope.$apply();
    });
  };

});

app.controller('SendCtrl', function ($scope, localStorageService) {

  var request = require('request');

  $scope.users = {};
  $scope.users.items = localStorageService.get('usersSend');

  $scope.updateUser = function () {
    $scope.send.address = $scope.users.selected.address;
    $scope.send.user = {};
    $scope.send.user.name = $scope.users.selected.username;
  };

  $scope.send = function () {
    var r = request.post('http://' + $scope.send.address + '/file-upload');
    var form = r.form();
    form.append('name', $scope.send.user.name);
    form.append('password', $scope.send.user.password);
    form.append('file', fs.createReadStream($scope.send.image));
  };

});

app.controller('ShowImagesCtrl', function ($scope, localStorageService) {
  'use strict';

  $scope.targetFolder = localStorageService.get('settings').targetFolder;
  $scope.files = fs.readdirSync($scope.targetFolder);
  $scope.images = $scope.files.filter(function (image) {
    return /\.(jpg|png)$/i.test(image);
  });
  $scope.delete = function (imageToDelete) {
    fs.unlink(imageToDelete, function () {
      $scope.images = $scope.images.filter(function (image) {
        return $scope.targetFolder + '/' + image !== imageToDelete;
      });
      $scope.$apply();
    });
  };
  $scope.open = function (imageToOpen) {
    var gui = require('nw.gui'),
    sizeOf = require('image-size'),
    dimensions = sizeOf(imageToOpen),
    ratio;
    if(dimensions.width > 1024){
      ratio = dimensions.width / dimensions.height;
      dimensions.width = 1024;
      dimensions.height = 1024 / ratio;
    }
    if(dimensions.height > 768){
      ratio = dimensions.height / dimensions.width;
      dimensions.height = 768;
      dimensions.width = 768 / ratio;
    }
    gui.Window.open('file://' + imageToOpen, {
      position: 'center',
      width: Math.round(dimensions.width),
      height: Math.round(dimensions.height),
      toolbar: false
    });
  };
});

app.controller('ShowUsersCtrl', function ($scope, localStorageService) {
  'use strict';

  $scope.users = localStorageService.get('users') || [];
  $scope.delete = function (name) {
    $scope.users = $scope.users.filter(function (user) {
      return user.name !== name;
    });
    localStorageService.set('users', $scope.users);
  };
});

app.controller('NewUserCtrl', function ($scope, localStorageService, $state) {
  'use strict';

  $scope.save = function () {
    var users = localStorageService.get('users') || [];
    if(userDoesNotExist($scope.user)){
      $scope.user.password = MD5($scope.user.password);
      users.push($scope.user);
      localStorageService.remove('users');
      localStorageService.add('users', users);
    }
    $state.go('users.receive')
  };
  var userDoesNotExist = function (user) {
    var users = localStorageService.get('users') || [];
    return users.every(function (value, index, ar) {
      return value.name !== user.name;
    });
  };
});

app.controller('ShowUsersSendCtrl', function ($scope, localStorageService) {
  'use strict';

  $scope.users = localStorageService.get('usersSend') || [];
  $scope.delete = function (name) {
    $scope.users = $scope.users.filter(function (user) {
      return user.name !== name;
    });
    localStorageService.set('usersSend', $scope.users);
  };
});

app.controller('NewUserSendCtrl', function ($scope, localStorageService, $state) {
  'use strict';

  $scope.save = function () {
    var users = localStorageService.get('usersSend') || [];
    if(userDoesNotExist($scope.user)){
      users.push($scope.user);
      localStorageService.remove('usersSend');
      localStorageService.add('usersSend', users);
    }
    $state.go('users.send');
  };
  var userDoesNotExist = function (user) {
    var users = localStorageService.get('usersSend') || [];
    return users.every(function (value, index, ar) {
      return value.name !== user.name;
    });
  };
});

