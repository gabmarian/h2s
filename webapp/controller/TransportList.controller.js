sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("h2s.PolyTransManager.controller.TransportList", {

		onInit: function () {
			this.getRouter().getRoute("default").attachMatched(this.handleRouteMatched, this);
		},

		handleRouteMatched: function () {
			this.getRouter().navTo("transport", {
				index: 0
			});
		},

		onSelectionChange: function (args) {
			var path = args.getParameters().listItem.getBindingContext().getPath();
			var index = this.getView().getModel().getProperty(path).index;
			this.getRouter().navTo("transport", {
				index: index
			});
		}

	});
});