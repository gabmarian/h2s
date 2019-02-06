/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"h2s/PolyTransManager/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});