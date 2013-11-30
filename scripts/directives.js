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