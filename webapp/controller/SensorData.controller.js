sap.ui.define([
	"./BaseController",
	"jquery.sap.global",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/ui/model/json/JSONModel"
], function (BaseController, jQuery, ChartFormatter, JSONModel) {
	"use strict";

	return BaseController.extend("h2s.PolyTransManager.controller.SensorData", {
		_chartModel: new JSONModel(),
		_timeSeriesModel: new JSONModel(),
		onInit: function () {
			this.getRouter().getRoute("sensorData").attachMatched(this.handleRouteMatched, this);
			var oPopOver = this.getView().byId("idPopOver");
			var oVizFrame = this.getView().byId("idVizFrame");
			oPopOver.connect(oVizFrame.getVizUid());
		},

		handleRouteMatched: function (oEvent) {
			var that = this;
			var sensor = oEvent.getParameter("arguments").sensor;

			var url = "/IOTAS/Things('" + sensor + "')/iot.180731090059.hack2sol:SensorTags/Temperature?$orderby=_time asc";
			var jsonModel = new JSONModel(url);

			jsonModel.attachRequestCompleted(function () {
				var cleared = that.clearData(jsonModel.getProperty("/value"));
				jsonModel.setProperty("/value", cleared);
				that.initChart(jsonModel);
			});
		},

		clearData: function (array) {
			var newArray = [];
			if (array[0]) {
				newArray.push(array[0]);
			}
			for (var i = 0; i < array.length - 1; i++) {
				if ((array[i].temperature).toFixed(2) !== (array[i + 1].temperature).toFixed(2)) {
					newArray.push(array[i + 1]);
				}
			}
			return newArray;
			//console.log(newArray);
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
					},
					referenceLine: {
						line: {
							primaryValues: [{
								value: -10,
								color: "#FF0000",
								type: "line",
								label: {
									text: "Critical C°"
								}
							}, {
								value: 30,
								color: "#FF0000",
								type: "line",
								label: {
									text: "Critical C°"
								}
							}]
						}
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
					name: "Time",
					value: {
						path: "_time"
					},
					dataType: "date"
				}]
			});

			oDataset.addMeasure(new sap.viz.ui5.data.MeasureDefinition({
				name: "Temperature",
				value: "{temperature}"
			}));

			oVizFrame.removeFeed(1);
			oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "primaryValues",
				"type": "Measure",
				"values": ["Temperature"]
			}));

			oDataset.bindAggregation("data", {
				path: "/value"
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setVisible(true);
		},
	});
});