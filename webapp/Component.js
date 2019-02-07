sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"h2s/PolyTransManager/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("h2s.PolyTransManager.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {

			//debugger;
			sap.ui.getCore().loadLibrary("openui5.googlemaps", "./openui5/googlemaps/");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});