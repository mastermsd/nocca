!function(){"use strict";angular.module("nocca.core",["ui.router","ngWebsocket","ngMaterial","LocalStorageModule","nocca.navigation","nocca.pages","nocca.data","nocca.widgets","nocca.utils"])}(),function(){"use strict";function e(e,c){c.setPrefix("nocca"),e.theme("default").primaryPalette("blue-grey").accentPalette("blue")}angular.module("nocca.core").config(e),e.$inject=["$mdThemingProvider","localStorageServiceProvider"]}();