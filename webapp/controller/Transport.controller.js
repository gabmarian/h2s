sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("h2s.PolyTransManager.controller.Transport", {
		onInit: function () {
			this.getRouter().getRoute("transport").attachMatched(this.handleRouteMatched, this);
		},
		
		handleRouteMatched: function(oEvent) {
			this.getView().bindElement("/transports/" + oEvent.getParameter("arguments").index);
		}
	});
});