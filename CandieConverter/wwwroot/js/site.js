const app = new Vue({
	el: "#app",
	components: {
		"main-component": MainComponent,
	},
});

$(function () {
	"use strict";
	var languageSelector = $("#languageSelector");
	var body = $("body");

	$("#languageSelector").on("change", function () {
		const lang = languageSelector.find(":selected").val();
		$.i18n().locale = lang;
		body.i18n();
	});

	$(".open-progress").on("click", function () {
		$("body").toggleClass("file-process-open");
	});

	$(".close-button").on("click", function () {
		$("body").toggleClass("file-process-open");
	});
});
