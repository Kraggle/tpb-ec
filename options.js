var urls = [
	'https://pirateproxy.men',
	'https://pirateproxy.bid',
	'https://tpb.review',
	'https://proxytorrent.xyz',
	'https://tpbproxy.in',
	'https://tpbmirror.org',
	'https://thepiratebayproxy.net',
	'https://piratesbay.me',
	'https://ukpirateproxy.com',
	'https://tpbunblock.net',
	'https://unblocktpb.org',
	'https://piratebaypirate.com',
	'https://proxybay.life',
	'https://piratebays.me',
	'https://thepiratebay.click',
	'https://fastpirate.link',
	'https://gameofbay.eu',
	'https://piratebays.be',
	'https://ukbay.me',
	'https://tpbship.org',
	'https://opentpb.com',
	'https://uktpbmirror.pw',
	'https://fastbay.net',
	'https://unblocktpb.pro',
	'https://uktpbproxy.info',
	'https://pirateproxy.sh',
	'https://thepirateproxy.ws'
];

function saveOptions() {
	var quality = $('#quality input:checked').val(),
		hevc = $('#hevc').is(':checked'),
		check = $('#check').is(':checked');
	
	urls = [];
	$('#proxies .proxy').each(function(i, el) {
		urls.push($(this).val());
	});
	
	chrome.storage.sync.set({
		quality: quality,
		hevc: hevc,
		check: check,
		urls: urls
	}, function() {
		
		$('#save').removeClass('active');
	});
}

function restoreOptions() {
	chrome.storage.sync.get({
		quality: 1,
		hevc: true,
		check: true,
		urls: urls
	}, function(items) {
		$('#r' + items.quality).prop('checked', true);
		$('#hevc').prop('checked', items.hevc);
		$('#check').prop('checked', items.check);
		
		$.each(items.urls, function(i, url) {
			addProxy(url);
		});
	});
}

function addProxy(url='') {
	
	var c = $('<div />', {
		'class': 'proxy-box'
	}).appendTo($('#proxies'));
	
	var p = $('<input />', {
		'type': 'url',
		'class': 'proxy change',
		'placeholder': 'https://somepiratebay.here'
	}).val(url).appendTo(c);
	
	var b = $('<div />', {
		'class': 'delete'
	}).text('REMOVE').prependTo(c);
	
	b.on('click', function(event) {
		$(this).parent().remove();
		$('#save').addClass('active');
	});
}

$(function() {
	
	restoreOptions();
	
	$('#save').on('click', function() {
		if ($(this).hasClass('active'))
			saveOptions();
	});
	
	$('#add-proxy').on('click', function() {
		addProxy(); 
	});
	
	$('body').on('change input', '.change', function() {
		$('#save').addClass('active');
	});
});
