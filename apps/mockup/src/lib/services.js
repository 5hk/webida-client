var Services = Services || {};

(function() {
	'use strict';

	var DOMAIN = 'http://' + location.host + '/';

	Services.MsgFmt = {};
	Services.Service = {};
	
	var MsgFmt = Services.MsgFmt;
	MsgFmt.lists = function (options, callback) {
		var url = DOMAIN + 'messagefmt';

		$.ajax({
			method: 'GET',
			url: url,
			data: { page: options.page, limit: options.limit },
			success: function (data) {
				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};

	MsgFmt.deleteThing = function (messageCode, callback) {
		var url = DOMAIN + 'messagefmt/'+ messageCode;

		$.ajax({
			method: 'DELETE',
			url: url,
			success: function (data) {
				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};

	MsgFmt.details = function (messageCode, callback) {
		var url = DOMAIN + 'messagefmt/' + messageCode;

		$.ajax({
			method: 'GET',
			url: url,
			success: function (data) {
				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};

	MsgFmt.registerThing = function (data, callback)  {
		var url = DOMAIN + 'messagefmt/';

		$.ajax({
			method: 'POST',
			url: url,
			data: {
				messageName: data.messageName || '',
				formatVersion: data.formatVersion || '',
				// thingModel: data.thingModel || '',
				description: data.description || '',
				formatType: data.formatType || 'json',
				format: data.format || ''
			},
			success: function (data) {
				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};

	MsgFmt.updateThing = function (messageCode, options, callback)  {
		var url = DOMAIN + 'messagefmt/' + messageCode;

		$.ajax({
			method: 'PUT',
			url: url,
			data: {				
				messageName: options.messageName || '',
				formatVersion: options.formatVersion || '',
				// thingModel: options.thingModel || '',
				description: options.description || '',
				formatType: options.formatType || '',
				format: options.format || ''
			},
			success: function (data) {
				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};


	var svc = Services.Service;
	svc.lists = function (options, callback) {
		var url = DOMAIN + 'services';

		$.ajax({
			method: 'GET',
			url: url,
			data: { page: options.page, limit: options.limit },
			success: function (data) {
				// for mockup
				$.each(data.list, function (i, item) {
					item['idx'] = i;
					item['serviceType'] = 'Script';
				});
				// console.log(data);


				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};

	svc.deleteThing = function (scriptServiceId, callback) {
		var url = DOMAIN + 'services/'+ scriptServiceId;

		$.ajax({
			method: 'DELETE',
			url: url,
			success: function (data) {
				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};

	svc.details = function (scriptServiceId, callback) {
		var url = DOMAIN + 'services/' + scriptServiceId;

		$.ajax({
			method: 'GET',
			url: url,
			success: function (data) {
				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};

	svc.registerThing = function (data, callback)  {
		var url = DOMAIN + 'services/';

		$.ajax({
			method: 'POST',
			url: url,
			contentType: 'application/json; charset=UTF-8',
			data: JSON.stringify ({
				scriptServiceName: data.scriptServiceName || '',
				scriptServiceSrc: data.scriptServiceSrc || '',
				scriptServiceDesc: data.scriptServiceDesc || '',
				scriptServiceCategory: data.scriptServiceCategory || '',			
				maxTimeunit: data.maxTimeunit || 'h',
				maxTime: data.maxTime || 2,
				messageCode: data.messageCode
			}),
			success: function (data) {
				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};

	svc.updateThing = function (scriptServiceId, data, callback)  {
		var url = DOMAIN + 'services/' + scriptServiceId;

		$.ajax({
			method: 'PUT',
			url: url,
			contentType: 'application/json; charset=UTF-8',
			data: JSON.stringify({
				scriptServiceName: data.scriptServiceName || '',
				scriptServiceSrc: data.scriptServiceSrc || '',
				scriptServiceDesc: data.scriptServiceDesc || '',
				maxTimeunit: data.maxTimeunit || 'h',
				maxTime: data.maxTime || 2,
				messageCode: data.messageCode
			}),
			success: function (data) {
				callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});
	};

	svc.messageCodeList = function (callback)  {

		var url = DOMAIN + 'messagefmt';

		$.ajax({
			method: 'GET',
			url: url,
			success: function (data) {
				var msglist = [];
				$.each(data.list, function (i, item) {
					msglist.push(item['messageCode']);
				});
				// console.log(msglist);


				callback(null, msglist);

				// callback(null, data);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callback(status, {
					jqXHR: jqXHR,
					textStatus: textStatus,
					errorThrown: errorThrown
				});
			}
		});

	};
})();
