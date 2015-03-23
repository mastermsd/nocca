(function() {
    'use strict';

    /* app/pages/canvas.directive.js */

    /**
     * @desc
     * @example <div nocca-pages-canvas></div>
     */
    angular
        .module('nocca.pages')
        .directive(
            'noccaPagesCanvas', CanvasDirective);

    function CanvasDirective () {

        var directive = {
            restrict: 'EA',
			replace: true,
            templateUrl: 'canvas.directive.html',
            controller: CanvasDirectiveController
        };

        return directive;

        /* @ngInject */
        function CanvasDirectiveController (
			$scope,
			$mdSidenav,
            noccaDataConnection
		) {

            $scope.hasWebsocketConnection = noccaDataConnection.hasConnection;

            $scope.$watch(function () {
                $scope.hasWebsocketConnection = noccaDataConnection.hasConnection;
            });

			$scope.toggleNav = function () {
				$mdSidenav('nav').toggle();
			};

        }
    }
}());
