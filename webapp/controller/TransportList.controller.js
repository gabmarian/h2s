sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("h2s.PolyTransManager.controller.TransportList", {

		onInit: function () {

			this.getRouter().getRoute("default").attachMatched(this.handleRouteMatched, this);

			// monitor container status and adjust overall transport status accordingly
			var that = this;

			try {
				var timer = setInterval(function () {

					try {
						if (that.getModel()) {
							that.monitorContainerStatus();
						}
					} catch (setIntervalError) {
						jQuery.sap.log.error(setIntervalError);
						clearInterval(timer);
					}

				}, 3000);
			} catch (error) {
				jQuery.sap.log.error(error.message);
			}

		},

		handleRouteMatched: function () {
			// load first item on startup
			this.getRouter().navTo("transport", {
				index: 0
			});
		},

		onSelectionChange: function (args) {
			var path = args.getParameters().listItem.getBindingContext().getPath();
			var index = this.getModel().getProperty(path).index;
			this.getRouter().navTo("transport", {
				index: index
			});
		},

		monitorContainerStatus: function () {

			var that = this;

			this.getModel().getProperty("/transports").forEach(function (transport) {

				var tempState = "None";
				var tempIcon = "";

				transport.containers.forEach(function (container) {

					if (container.TempState === "Error") {
						tempState = "Error";
						tempIcon = "sap-icon://alert";
					}
				});

				that.getModel().setProperty("/transports/" + transport.index + "/TempState", tempState);
				that.getModel().setProperty("/transports/" + transport.index + "/TempIcon", tempIcon);

			});
		}

	});
});