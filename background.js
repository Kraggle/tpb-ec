console.log = function() { };

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

const proxies = 'http://ettvproxies.com/';
let item;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	console.log(request);

	if (request.getLinks && request.item) {

		item = request.item;

		$.when(getLink(item, 'mStandard'), getLink(item, 'm1080'), getLink(item, 'm1080HEVC'),
			getLink(item, 'm720'), getLink(item, 'm720HEVC'))
			.done(function(a1, a2, a3, a4, a5) {

				// console.log(item);

				sendResponse({
					item: item
				})
			});

	} else if (request.getLink && request.item && request.type) {

		item = request.item;

		// console.log(item);

		$.when(getLink(item, request.type))
			.done(function() {

				// console.log(item);

				sendResponse({
					item: item
				})
			});

	} else if (request.url) {

		console.log('doing url', request.url);

		$.ajax({
			type: 'GET',
			url: request.url
		}).done(function(a) {

			// console.log('url success', a);

			sendResponse({
				success: a
			});

		}).fail(function() {

			console.log('url error');

			sendResponse({
				error: true
			});
		});

	} else if (request.proxies) {

		$.ajax({
			url: proxies,
		}).done(function(a) {

			let html = $.parseHTML(a);
			let proxy = [];

			$("table.proxies td a", html).each(function() {
				proxy.push($(this).attr("href").replace(/\/$/, ''));
				console.log($(this));
			});

			sendResponse(proxy[0]);
		});

	} else {
		sendResponse({
			error: true
		});
	}

	return true;
})

function getLink(item, part) {
	// console.log(item[part]);

	return isValid(item[part]) ? $.ajax({
		url: item[part]
	}).done(function(data) {

		item[part] = typeof data === 'string' ? $('[href^=magnet]', data).attr('href') : '';

	}) : false;

}

function isValid(url) {
	let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
	return !!pattern.test(url);;
}

function stripShit(data) {
	return data.replace(/<(style|head|script).{0,}?>[\s\S]+?<\/(style|head|script)>/gi, '')
		.replace(/<(link|img|meta).+?>/gi, '');
}