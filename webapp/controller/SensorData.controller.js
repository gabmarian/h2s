sap.ui.define([
	"./BaseController",
	"jquery.sap.global",
	"sap/viz/ui5/format/ChartFormatter"
], function (BaseController, jQuery, ChartFormatter) {
	"use strict";

	return BaseController.extend("h2s.PolyTransManager.controller.SensorData", {
		onInit: function () {
			this.getRouter().getRoute("sensorData").attachMatched(this.handleRouteMatched, this);
		},

		handleRouteMatched: function (oEvent) {
			var that = this;
			var sensor = oEvent.getParameter("arguments").sensor;

				var url = "/IOTAS/Things('" + sensor + "')/iot.180731090059.hack2sol:SensorTags/Temperature?$orderby=_time asc";
				var jsonModel = new sap.ui.model.json.JSONModel(url);

				jsonModel.attachRequestCompleted(function () {

					var aTemperatures = jsonModel.getProperty("/value");

					that.initChart(jsonModel);
				});
			
		},

		initChart: function (oModel) {
			var oVizFrame = this.getView().byId("idVizFrame");

			oVizFrame.setVizProperties({
				plotArea: {
					window: {
						start: Date.now(),
						end: Date.now()
					},
					dataLabel: {
						formatString: "__UI5__ShortIntegerMaxFraction2",
						visible: false
					}
				},
				legend: {
					visible: true
				},
				title: {
					visible: false
				},
				timeAxis: {
					title: {
						visible: false
					},
					levels: ["day", "month", "year", "hour"],
					levelConfig: {
						month: {
							formatString: "MM"
						},
						year: {
							formatString: "yyyy"
						},
						hour: {
							formatString: "hh"
						}
					},
					interval: {
						unit: ''
					}
				},
				valueAxis: {
					title: {
						visible: false
					}
				}
			});

			oVizFrame.setModel(oModel);

			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "timestamp",
					value: {
						path: "_time"
					},
					dataType: "date"
				}]
			});

			oDataset.bindAggregation("data", {
				path: "/value"
			});

			oVizFrame.setDataset(oDataset);
			oVizFrame.setVisible(true);
		},
	});
});