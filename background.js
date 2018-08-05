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
	chrome.tabs.query({active: true}, tabs => {
		let index = tabs[0].index
		chrome.tabs.create({
			url: url,
			index: index + 1
		})
	})
}