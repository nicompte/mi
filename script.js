// Server side
var http = require('http'),
  express = require('express'),
  server = express(),
  fs = require('fs'),
  MD5 = require('MD5'),
  settings = {};

function onPart(part) {
  if(!part.filename || part.filename.match(/\.(jpg|jpeg|png)$/i)) { this.handlePart(part); }
}

server.use(express.bodyParser({onPart: onPart}));
server.use(express.limit('8mb'));

// Client side
angular.module('LocalStorageModule').value('prefix', 'mi');
var app = angular.module('mi', ['ngRoute', 'LocalStorageModule', 'ui-routeur']);

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
  'use strict';
  $locationProvider.html5Mode(false);
  $routeProvider
  .when('/settings', {templateUrl: 'index.html'})
  .when('/images', {templateUrl: 'images.html'})
  .when('/users', {templateUrl: 'users.html'})
  .when('/newUser', {templateUrl: 'newUser.html'})
  .when('/help',  {templateUrl: 'help.html'})
  .otherwise({redirectTo: '/images'});
}]);

app.controller('MainCtrl', function ($scope, localStorageService, $location, $route) {
  'use strict';
  $scope.$on('$viewContentLoaded', function () {
    //console.log('View Changed');
  });
  
  //Define routes
  server.post('/file-upload', function(req, res) {

    var settings = localStorageService.get('settings');
    var users = localStorageService.get('users');

    var authorizedUser = users.filter(function (user) {
      return user.name === req.body['user.name'] && user.password === MD5(req.body['user.password']);
    });

    if(authorizedUser.length != 1){
      res.send(401);
    }

    var tmp_path = req.files.file.path;
    var target_path = settings.targetFolder + '/' + req.files.file.name;
    fs.rename(tmp_path, target_path, function(err) {
      if (err) throw err;
      fs.unlink(tmp_path, function() {
        if (err) throw err;
        if($location.path() === '/images') $route.reload();
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
    $scope.serverOn = true; $scope.$apply();
    localStorageService.set('serverOn', true);
  });
  nodeServer.on('close', function () {
    $scope.serverOn = false; $scope.$apply();
    localStorageService.set('serverOn', false);
  });
  nodeServer.on('error', function () { 
    alert('Impossible de démarrer le serveur. Vérifiez le port utilisé.'); 
    $scope.serverOn = false; $scope.$apply(); 
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
  }
  
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
    if (!error && response.statusCode == 200){
      $scope.settings.ip = JSON.parse(body).ip;
      $scope.$apply();
    }
  });

  $scope.save = function () {
    delete $scope.settings.serverConfiguration;
    localStorageService.remove('settings');
    localStorageService.add('settings', $scope.settings);
    settings = $scope.settings;
  }
  $scope.openFolderSelector = function () {
    $('#folderSelector').click();
  }
  $scope.testServerConfiguration = function () {
    var url = 'http://' + $scope.settings.ip + ':' + $scope.settings.port + '/ping';
    request({url: url, timeout: 2000}, function (error, response, body) {
      if(!error && response.statusCode == 200){
        $scope.settings.serverConfiguration = true;
      }else{
        $scope.settings.serverConfiguration = false;
      }
      $scope.configurationMessage = $scope.settings.serverConfiguration == true ? 'Configuration valide.<br/>Adresse à transmettre : ' + $scope.settings.ip + ':' + $scope.settings.port
        : $scope.settings.serverConfiguration == false ? 'Echec de la configuration.<br/>Vérifiez que le port est bien ouvert par votre firewall et/ou votre routeur.' 
        : '';
      $scope.configurationMessage = $sce.trustAsHtml($scope.configurationMessage);
      $scope.$apply();
    });
  }
  $scope.getConfigurationMessage = function () {
    
  }
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
        return $scope.targetFolder + '/' + image != imageToDelete;
      });
      $scope.$apply();
    });
  };
  $scope.open = function (imageToOpen) {
    var gui = require('nw.gui'),
      sizeOf = require('image-size'),
      dimensions = sizeOf(imageToOpen);
    if(dimensions.width > 1024){
      var ratio = dimensions.width / dimensions.height;
      dimensions.width = 1024;
      dimensions.height = 1024 / ratio;      
    }
    if(dimensions.height > 768){
      var ratio = dimensions.height / dimensions.width;
      dimensions.height = 768;
      dimensions.width = 768 / ratio;
    }
    gui.Window.open("file://" + imageToOpen, {
      position: 'center',
      width: dimensions.width,
      height: dimensions.height
    });
  };
});

app.controller('ShowUsersCtrl', function ($scope, localStorageService) {
  'use strict';

  $scope.users = localStorageService.get('users') || [];
  $scope.delete = function (name) {
    console.log(name);
    $scope.users = $scope.users.filter(function (user) {
      return user.name !== name;
    });
    localStorageService.set('users', $scope.users);
  };
});

app.controller('NewUserCtrl', function ($scope, localStorageService, $location) {
  'use strict';

  $scope.save = function () {
    var users = localStorageService.get('users') || [];
    if(userDoesNotExist($scope.user)){
      $scope.user.password = MD5($scope.user.password);
      users.push($scope.user);
      localStorageService.remove('users');
      localStorageService.add('users', users);
    }
    $location.path('/users');
  };
  var userDoesNotExist = function (user) {
    var users = localStorageService.get('users') || [];
    return users.every(function (value, index, ar) {
      return value.name !== user.name;
    });
  };
});

app.directive('file', function () {
  'use strict';

  return {
    scope: {
      file: '='
    },
    link: function(scope, el, attrs){
      el.bind('change', function (event) {
        var files = event.target.files;
        var file = files[0];
        scope.file = file ? file.path : undefined;
        scope.$apply();
      });
    }
  };
});

app.directive('fileButton',function ($compile,$filter) {
  'use strict';

  return {
    link:function(scope,element,attrs) {
      element.bind("click",function() {
        element.parent().find("input")[1].click();
      });
    }
  };
});

app.directive('bsNavbar', function($location) {
  'use strict';

  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs, controller) {

      scope.$watch(function() {
        return $location.path();
      }, function(newValue, oldValue) {

        angular.forEach(element.find('li'), function(li) {
          var $li = angular.element(li),

            pattern = $li.attr('data-match-route'),
            regexp = new RegExp('^' + pattern + '$', ['i']);

          if(regexp.test(newValue)) {
            $li.addClass('active');
            var $collapse = $li.find('.collapse.in');
            if($collapse.length) $collapse.collapse('hide');
          } else {
            $li.removeClass('active');
          }

        });
      });
    }
  };
});
