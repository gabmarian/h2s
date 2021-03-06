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

				// Get temperature limit
				var tempTreshold = that.getModel().getProperty("/tempTreshold");

				// Build model to request thing's data
				var url = "/IOTAS/Things('" + container.ThingId + "')/iot.180731090059.hack2sol:SensorTags/Temperature?$orderby=_time desc";

				var jsonModel = new sap.ui.model.json.JSONModel(url);

				jsonModel.attachRequestCompleted(function () {

					// Get actual and previous temperature
					var temperature = jsonModel.getProperty("/value/0/temperature");
					var lastUpdate  = jsonModel.getProperty("/value/0/_time");
					var tempPrev = that.getModel().getProperty(transportPath + "/containers/" + idx + "/Temperature");

					// Update temperature and last update
					that.getModel().setProperty(transportPath + "/containers/" + idx + "/Temperature", temperature);
					
					if (lastUpdate) {
						that.getModel().setProperty(transportPath + "/containers/" + idx + "/LastUpdate", new Date(lastUpdate) );
					}

					// If temperature changed mark the line with appropriate icon
					var tempChanged = false;

					if (tempPrev && tempPrev !== temperature) {
						that.getView().getModel().setProperty(transportPath + "/containers/" + idx + "/TempIcon",
							tempPrev > temperature ? "sap-icon://arrow-bottom" : "sap-icon://arrow-top");
						tempChanged = true;

						// Set state
						var tempState = "None";

						if (temperature > tempTreshold) {
							tempState = "Error";
						}

						that.getView().getModel().setProperty(transportPath + "/containers/" + idx + "/TempChanged", tempChanged);

						that.getView().getModel().setProperty(transportPath + "/containers/" + idx + "/TempState", tempState);

						// If temperature changed mark the line with appropriate icon
						var icon = "";

						if (temperature > tempTreshold) {
							icon = "sap-icon://alert";
						} else if (tempPrev && tempPrev !== temperature) {
							icon = tempPrev > temperature ? "sap-icon://arrow-bottom" : "sap-icon://arrow-top";
						}
					}

					that.getView().getModel().setProperty(transportPath + "/containers/" + idx + "/TempIcon", icon);
				});
			});
		},

		updateTransports: function () {
			var that = this;

			this.getModel().getProperty("/transports").forEach(function (transport) {
				that.updateTransport("/transports/" + transport.index);
			});
		},

		onItemPress: function (args) {
			var sPath = args.getParameters().listItem.getBindingContext().getPath();
			var thingId = this.getModel().getProperty(sPath).ThingId;

			this.getRouter().navTo("sensorData", {
				sensor: thingId
			});
		}
	});
});