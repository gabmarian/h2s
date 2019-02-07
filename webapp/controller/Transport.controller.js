sap.ui.define([
	"./BaseController",
	"jquery.sap.global"
], function (BaseController, jQuery) {
	"use strict";

	return BaseController.extend("h2s.PolyTransManager.controller.Transport", {

		onInit: function () {

			var that = this;
			that.counter = 0;

			this.getRouter().getRoute("transport").attachMatched(this.handleRouteMatched, this);

			// Update sensor data in regulary

			try {
				var timer = setInterval(function () {

					try {
						if (that.getModel()) {
							that.updateTransports();
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

		handleRouteMatched: function (oEvent) {

			var path = "/transports/" + oEvent.getParameter("arguments").index;

			this.getView().bindElement(path);
			this.updateTransport(path);
		},

		updateTransport: function (transportPath) {

			var that = this;
			
			// Process each container related to a transport
			this.getModel().getProperty(transportPath).containers.forEach(function (container, idx) {
				
				// Build model to request thing's data
				var url = "/IOTAS/Things('" + container.ThingId + "')/iot.180731090059.hack2sol:SensorTags/Temperature?$orderby=_time desc";

				var jsonModel = new sap.ui.model.json.JSONModel(url);

				jsonModel.attachRequestCompleted(function () {
					
					// Get actual and previous temperature
					var temperature = jsonModel.getProperty("/value/0/temperature");
					var tempPrev = jsonModel.getProperty("/value/1/temperature");
					
					// Update temperature
					that.getView().getModel().setProperty(transportPath + "/containers/" + idx + "/Temperature", temperature);
					
					// If temperature changed mark the line with appropriate icon
					var tempChanged = false;
					
					if (tempPrev && tempPrev !== temperature) {
						that.getView().getModel().setProperty(transportPath + "/containers/" + idx + "/TempIcon",
							tempPrev > temperature ? "sap-icon://arrow-bottom" : "sap-icon://arrow-top");
						tempChanged = true;		
					}

					that.getView().getModel().setProperty(transportPath + "/containers/" + idx + "/TempChanged", tempChanged);

				});
			});

		},

		updateTransports: function () {

			var that = this;

			this.getModel().getProperty("/transports").forEach(function (transport) {
				that.updateTransport("/transports/" + transport.index);
			});
		}

	});
});