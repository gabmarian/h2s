sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/viz/ui5/format/ChartFormatter"
], function (Controller, JSONModel, ChartFormatter) {
	"use strict";

	return Controller.extend("app.ui5iotapp.controller.App", {
		_oChartModel: null,
		_oSelectionModel: null,
		_oTimeSeriesModel: null,
		onInit: function () {
			this._oChartModel = new JSONModel();
			this._oTimeSeriesModel = new JSONModel();
			this._oSelectionModel = new JSONModel();
			var oPopOver = this.getView().byId("idPopOver");
			var oVizFrame = this.getView().byId('idVizFrame');
            oPopOver.connect(oVizFrame.getVizUid());
            /*oPopOver.setFormatString({
                "temperature": ChartFormatter.DefaultPattern.STANDARDFLOAT
            });*/
		},

		onSelectionChange: function (oEvent) {
			var selectedThing = oEvent.getParameter("listItem").getBindingContext("things").getObject();
			var thingId = selectedThing._id;
			var thingTypeName = selectedThing._thingType[0];
			this._oSelectionModel.setProperty("/thingId", thingId);
			this._oSelectionModel.setProperty("/thingType", thingTypeName);

			var eventModel = new JSONModel("/IOTAS/Events?$filter=_thingId eq '" + thingId + "'");
			this.getView().setModel(eventModel, "eventModel");

			var thingTypeModel = new JSONModel("/IOTAS/Configuration/ThingTypes?$filter=name eq '" + thingTypeName + "'");
			this.getView().setModel(thingTypeModel, "thingTypeModel");

			this.initChart();

			var result = this.byId("idAppControl");
			result.toDetail(this.byId("thingDetail"));
		},

		onPropSelectionChange: function (oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem").getKey();
			var selectedPropertySet = oEvent.getParameter("selectedItem").getText();
			this._oSelectionModel.setProperty("/propertySet", selectedPropertySet);

			var propertySetTypeModel = new JSONModel("/IOTAS/Configuration/PropertySetTypes?$filter=name eq '" + selectedItem + "'");
			propertySetTypeModel.attachRequestCompleted(function () {
				var propertyTypeArray = propertySetTypeModel.getProperty("/value/0/propertyTypes");
				var propertySets = [];
				propertyTypeArray.forEach(function (propertyType) {
					propertySets.push(propertyType.value.id);
				});
				this.setChart(propertySets);
			}.bind(this));

		},

		initChart: function () {
			var oVizFrame = this.getView().byId('idVizFrame');
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
			oVizFrame.setModel(this._oChartModel);

			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "timestamp",
					value: {
						path: '_time'
					},
					dataType: "date"
				}]
			});
			oDataset.bindAggregation("data", {
				path: "/value"
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setVisible(false);
		},

		setChart: function (selectedItems) {
			var oVizFrame = this.getView().byId('idVizFrame');

			if (selectedItems.length > 0) {
				oVizFrame.setVisible(true);
				var oDataset = oVizFrame.getDataset();
				selectedItems.forEach(function (item) {
					oDataset.addMeasure(new sap.viz.ui5.data.MeasureDefinition({
						name: item,
						value: "{" + item + "}"
					}));
				});

				oVizFrame.removeFeed(1);
				oVizFrame.addFeed(new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "primaryValues",
					"type": "Measure",
					"values": selectedItems
				}));

				this.updateChartData();
			} else {
				oVizFrame.setVisible(false);
				// if no measures are selected, delete the chart data and data bindings
				this._oChartModel.setData(null);
				oVizFrame.removeFeed(1);
				oVizFrame.getDataset().removeAllMeasures();
			}
		},

		updateChartData: function () {
			if(this.updateInterval) {
				console.log("teszt");
				clearInterval(this.updateInterval);
			}
			// if no measures are selected, skip loading data
			var thingId = this._oSelectionModel.getProperty("/thingId");
			var thingType = this._oSelectionModel.getProperty("/thingType");
			var propertySet = this._oSelectionModel.getProperty("/propertySet");

			this.updateInterval = setInterval(function() {
				this._oTimeSeriesModel.loadData("/IOTAS/Things('" + thingId + "')/" + thingType + "/" + propertySet);
				this._oTimeSeriesModel.attachRequestCompleted(function () {
					this._oChartModel.setData(this._oTimeSeriesModel.getProperty("/"));
				}.bind(this));
			}.bind(this), 5000);

		}
	});
});