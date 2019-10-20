// chrome.runtime.onInstalled.addListener(function() {
// 	chrome.storage.sync.set({color: '#3aa757'}, function() {
// 		console.log("The color is green.");
// 	});
// 	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
// 		chrome.declarativeContent.onPageChanged.addRules([{
// 			conditions: [new chrome.declarativeContent.PageStateMatcher({
// 				pageUrl: {hostEquals: 'episodecalendar.com'},
// 			})
// 			],
// 			actions: [new chrome.declarativeContent.ShowPageAction()]
// 		}]);
// 	});
// });

chrome.browserAction.onClicked.addListener(() => {
	newTab('https://episodecalendar.com')
})

const newTab = (url) => {
	chrome.tabs.query({
		active: true
	}, tabs => {
		let index = tabs[0].index
		chrome.tabs.create({
			url: url,
			index: index + 1
		})
	})
}

var item, CORS = 'https://cors-anywhere.herokuapp.com/';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (request.getLinks && request.item) {

		item = request.item;

		$.when(getLink(item, 'mStandard'), getLink(item, 'm1080'), getLink(item, 'm1080HEVC'),
				getLink(item, 'm720'), getLink(item, 'm720HEVC'))
			.done(function (a1, a2, a3, a4, a5) {

				console.log(item);

				sendResponse({
					item: item
				})
			});

	} else if (request.url) {

		$.ajax({
			url: CORS + request.url
		}).done(function (a) {

			sendResponse({
				success: a
			});

		}).fail(function () {
			sendResponse({
				error: true
			});
		});

	} else if (request.proxies) {

		$.ajax({
			url: `${CORS}https://proxybaylist.org/`,
		}).done(function (a) {

			var html = $.parseHTML(a);
			var proxies = [];

			$("#torrents div p a", html).each(function (i, el) {
				proxies.push($(this).attr("href").replace(/\/$/, ''));
			});

			sendResponse(proxies);
		});

	}

	return true;
})

function getLink(item, part) {
	// console.log(item[part], isValid(item[part]));

	return isValid(item[part]) ? $.ajax({
		url: CORS + item[part]
	}).done(function (data) {

		console.log(stripShit(data));

		item[part] = $.type(data) === 'string' ? $('.download a', stripShit(data)).first().attr('href') : '';

	}) : false;

}

function isValid(url) {
	return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

function stripShit(data) {
	return data.replace(/<(style|head|script).{0,}?>[\s\S]+?<\/(style|head|script)>/gi, '')
		.replace(/<(link|img|meta).+?>/gi, '');
}