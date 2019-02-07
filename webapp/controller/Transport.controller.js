sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("h2s.PolyTransManager.controller.Transport", {
		onInit: function () {
			this.getRouter().getRoute("transport").attachMatched(this.handleRouteMatched, this);
		},

		handleRouteMatched: function (oEvent) {
			this.getView().bindElement("/transports/" + oEvent.getParameter("arguments").index);
		},

		onItemPress: function (oEvent) {
			var oPath = oEvent.getSource().getBindingContext().getPath();
			var ID = oEvent.getSource().getBindingContext().getProperty("Id");

			var item = oEvent.getParameter('listItem'); // get the selected item
			var cxt = item.getBindingContext();
			var obj = cxt.getObject();
			var mes = JSON.stringify(obj);
		}
	});
});