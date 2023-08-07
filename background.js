// console.log = function() { };

let item;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    console.log(request);

    if (request.url) {

        console.log('doing url', request.url);

        const options = {
            method: 'GET',
            body: request.data || null
        };

        if (request.url.match(/oneom.one/))
            options.headers = {
                Accept: 'application/json; charset=utf-8',
                "Content-Type": 'application/json; charset=utf-8'
            };

        fetch(request.url, options)
            .then(response => response.json())
            .then(res => sendResponse({ success: res }))
            .catch(err => sendResponse({ error: true, message: err }));

    } else {
        sendResponse({
            error: true
        });
    }

    return true;
})
