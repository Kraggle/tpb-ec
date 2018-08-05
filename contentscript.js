var _e = {
		ep: {},
		day: {}
	},
	changed = false,
	urls = ['https://pirateproxy.men', 'https://pirateproxy.bid', 'https://tpb.review', 'https://proxytorrent.xyz', 'https://tpbproxy.in', 'https://tpbmirror.org', 'https://thepiratebayproxy.net', 'https://piratesbay.me', 'https://ukpirateproxy.com', 'https://tpbunblock.net', 'https://unblocktpb.org', 'https://piratebaypirate.com', 'https://proxybay.life', 'https://piratebays.me', 'https://thepiratebay.click', 'https://fastpirate.link', 'https://gameofbay.eu', 'https://piratebays.be', 'https://ukbay.me', 'https://tpbship.org', 'https://opentpb.com', 'https://uktpbmirror.pw', 'https://fastbay.net', 'https://unblocktpb.pro', 'https://uktpbproxy.info', 'https://pirateproxy.sh', 'https://thepirateproxy.ws'],
	options,
	msgTimer,
	epList,
	dayList,
	downloading,
	index,
	testTime
	oldHref = 'old',
	openTPB = new RegExp('1MtrxZFWz3FG9MobYWzxR2tRq4ybWJahmb', 'i');

$(function() {
	addListener();
	
	$('<div />', {
		'class': 'app-message-box'
	}).appendTo($('body'));
	
	changeInterval();
});

function message(text) {
	var mb = $('.app-message-box');
	mb.text(text).addClass('active');
	
	if (msgTimer)
		clearTimeout(msgTimer);
	
	msgTimer = setTimeout(function() {
		mb.removeClass('active');
	}, 10000);
}

function addListener() {
	
	$('a[href!=""]').off('click').on('click', function(e) {
		
		if ('https://episodecalendar.com' + $(this).attr('href') != oldHref)
			changeInterval();
		addListener();
	});
	
	var cls = '.epic-episode-marker-wrapper';
	$('body').off('click', cls).on('click', cls, function() {
		
		var box = $(this).closest('.calendar-day');
		if ($('input:not(:checked)', box).length)
			$('.calendar_date', box).removeClass('seen');
		else 
			$('.calendar_date', box).addClass('seen');
		
		refreshNotification();
	});
}

function changeInterval() {
	var oldBody = $('body')[0];
	var int = setInterval(function() {
		if (window.location.href != oldHref && $('body')[0] == oldBody) {
			check();
			clearInterval(int);
		}
		oldBody = $('body')[0];
	}, 1000);
}

function check() {
	
	oldHref = window.location.href;
	
	var now = new Date();
		now.setHours(23, 59, 59);
		dayList = [],
		cls = '.epic-episode-marker-wrapper input:not(:checked)';
	
	if ($('body').hasClass('calendar')) {
		
		var id = $('td.month h2').first().text() + "_" + $('p.year').first().text();
		
		if (!_e.ep[id])
			_e.ep[id] = [];
		epList = _e.ep[id];
		
		if (!_e.day[id])
			_e.day[id] = [];
		dayList = _e.day[id];
		
		if (!$('#page_container .magnetized').length) {
			
			epList.length = 0;
			
			$('.episode-item').each(function(i, el) {
				
				ep = new episode();
				
				ep.id = $(this).attr('id');
				ep.title = $(this).find('.show').text();
				ep.episode = $(this).find('.episode').text().match(/\((S\d+E\d+)\)/)[1];
				ep.checked = $(this).hasClass('seen');
				ep.released = $(this).find('input').length > 0;
				
				epList.push(ep);
			});
			
			$('.calendar_cell_content').each(function(i, el) {
				
				var d = new day();
				
				d.id = $(this).attr('id');
				d.released = $('input', this).length > 0;
				
				if ($('input:not(:checked)', this).length == 0)
					d.head().addClass('seen');
				
				dayList.push(d);
			});
		}
		
	} else if ($('body').hasClass('unwatched')) {
		
		var id = $('.cached-view:visible').attr('id');
		if (!_e.ep[id])
			_e.ep[id] = [];
		epList = _e.ep[id];
		
		if (!$('.cached-view:visible .magnetized').length) {
			
			epList.length = 0;
			
			$('.cached-view:visible .season').each(function(i, el) {
				var season = $(this),
					title = season.find('h2').find('a').text().match(/(.*) - Season \d/)[1];
					
				$('<div />', {
					'class': 'separator'
				}).appendTo($('.epic-list-episode', this));
				
				var box = $('<div />', {
					'class': 'magnet-container center'
				}).appendTo($('.epic-list-episode', this));
				
				$('<div />', {
					'class': 'grey margin_bottom_mini'
				}).text('Magnet').appendTo(box);
					
				$('.epic-list-episode', this).each(function(j, eli) {
					var ep = new episode();
						
					ep.id = $(this).attr('id');
					ep.title = title;
					ep.episode = $(this).find('.mid_grey').find('strong').text();
					ep.checked = false;
					
					var date = $(this).find('.date').find('strong').text();
					ep.released = new Date(date).getTime() < now.getTime();
					
					epList.push(ep);
				});
			});
		}
	} else if ($('body').hasClass('show')) { 
		
		var id = $('.cached-view:visible').attr('id');
		if (!_e.ep[id])
			_e.ep[id] = [];
		epList = _e.ep[id];
		
		if (!$('.cached-view:visible .magnetized').length) {
			
			epList.length = 0;
			
			$('<div />', {
				'class': 'separator'
			}).appendTo($('.cached-view:visible .epic-list-episode'));
			
			var box = $('<div />', {
				'class': 'magnet-container center'
			}).appendTo($('.cached-view:visible .epic-list-episode'));
			
			$('<div />', {
				'class': 'grey margin_bottom_mini'
			}).text('Magnet').appendTo(box);
				
			title = $('.show_banner').find('h1').text();
			
			$('.cached-view:visible .epic-list-episode').each(function(i, el) {
				var ep = new episode();
				
				ep.id = $(this).attr('id');
				ep.title = title;
				ep.episode = $(this).find('.mid_grey').find('strong').text();
				
				var check = $(this).find('.epic-episode-marker');
				ep.checked = check.length && check.checked;
				
				var date = $(this).find('.date').find('strong').text();
				ep.released = new Date(date).getTime() < now.getTime();
				
				epList.push(ep);
			});
		}
	}
	
	$.each(epList, function(i, item) {
		
		if (!item.get().hasClass('magnetized') && item.released) {
			
			var box = item.get().find('.magnet-container');
				magnet = $('<div />', {
				'class': box.length ? 'big magnet' : 'magnet',
				'title': 'Download!'
			}).attr('index', i).appendTo(box.length ? box : item.get());
			
			magnet.on('click', getMagnet);
			$('<div />', {
				'class': 'loader'
			}).hide().appendTo(magnet);
			
			item.get().addClass('magnetized');
			
		} else if (!item.released)
			item.get().find('.magnet-container .grey').css('opacity', 0);
	});
	
	$.each(dayList, function(i, item) {
		
		if (!item.get().hasClass('magnetized') && item.released) {
			
			var magnet = $('<div />', {
				'class': 'magnet',
				'title': 'Download all unwatched from day!'
			}).attr('index', i).appendTo(item.head());
			magnet.on('click', getDayMagnets);
			
			item.get().addClass('magnetized');	
		}
	});
	
	if (!$('#menu').hasClass('magnetized')) {
		
		var magnet = $('<li />', {
				'class': 'download-all'
			}).appendTo($('#menu'));
		var a = $('<a />', {
				'id': 'download-btn',
				'href': ''
			}).text('Download all').appendTo(magnet);
		a.on('click', getAllMagnets);
		$('<span />', {
			'class': 'menu-notification',
			'id': 'dl-count'
		}).text('0').appendTo(magnet);
		
		$('#menu').addClass('magnetized');
	}
	
	refreshNotification();
	addListener();
}

function getAllMagnets(e) {
	e.preventDefault();
	$.each(epList, function(i, item) {
		if ($('input:not(:checked)', item.get()).length)
			getMagnet.call($('.magnet', item.get()).get(0));
	});
}

function getDayMagnets(e) {
	
	var item = dayList[$(this).attr('index')];
	
	$('.magnet', item.get()).each(function(i, el) {
		
		var item = epList[$(this).attr('index')];
		
		if (!$('input', item.get()).is(':checked'))
			getMagnet.call($('.magnet', item.get()).get(0));
	});
}

function refreshNotification() {
	setTimeout(function() {
		if ($('body').hasClass('calendar'))
			$('#dl-count').text($(cls).length);
		else 
			$('#dl-count').text($('.cached-view:visible ' + cls).length);
	}, 1000);
}

function getMagnet(e) {
	
	var $this = $(this),
		item = epList[$(this).attr('index')],
		loader = item.get().find('.loader');
	
	$(this).off('click');
	loader.fadeIn('250');
		
	chrome.storage.sync.get({
		quality: 1,
		hevc: true,
		check: true,
		urls: urls,
		index: 0
	}, function(items) {
		options = items;
		
		urls = options.urls;
		index = options.index;
		var first = true,
			html;
			
		var testUrls = function() {
			
			$.ajax({
				url: urls[index],
				async: true
			}).done(function(a) {
				
				if ($.type(a) === "string") {
					var b = a.bMatch(openTPB);
					
					$.ajax({
						url: item.getQuery(b),
						async: true
					}).done(function(data) {
						html = data;
						// console.log("search: " + data.bMatch(/value="Pirate Search"/i));
						if ($.type(data) === "string" && data.bMatch(/value="Pirate Search"/i) && $('.detLink', $(stripShit(data))).length > 3) {
							chrome.storage.sync.set({index: index});
							console.log("Found links @: " + item.getQuery(b));
							resumeWork();
						} else 
							brokenLink("No links found @: " + item.getQuery(b));
					}).fail(function() {
						brokenLink("Broken: " + item.getQuery(b));
					});
				} else
					brokenLink("Broken: " + urls[index]);
				
			}).fail(function() {
				brokenLink("Broken: " + urls[index]);
			});
		}
		
		var brokenLink = function(link = "") {
			console.log(link);
			
			message(item.title + " " + item.episode + " not links found @ " + options.urls[index]);
			
			index = first && first != 0 ? 0 : index + 1;
			first = false;
			if (index < urls.length)
				testUrls();
			else {
				message("None of the links seem to be working, please try again later or replace them manually in options.");
				hideLoader($this, loader);
			}
				
		}
		
		var resumeWork = function() {
			if (item.download()) {
				
	    		download(item.download());
	    		
	    		if (options.check)
	    			$('input:not(:checked)', item.get()).click();
	    		
	    		hideLoader($this, loader);
				    	
			} else {
				var data = stripShit(html);
				
				$('.detLink', data).each(function(i, el) {
					var href = urls[index] + $(this).attr('href').replace(/https{0,1}:\/\/\w+\.\w+/, '');
					
					if (href.bMatch(item.getRegex())) {
						
						if (href.bMatch(/HEVC/i)) {
							if (href.bMatch(/1080p/i) && !item.m1080HEVC)
								item.m1080HEVC = href.replace(/(\d+)\/.+$/, '$1');
							
							else if (href.bMatch(/720p/i) && !item.m720HEVC)
								item.m720HEVC = href.replace(/(\d+)\/.+$/, '$1');
							
						} else if (href.bMatch(/1080p/i) && !item.m1080)
							item.m1080 = href.replace(/(\d+)\/.+$/, '$1');
							
						else if (href.bMatch(/720p/i) && !item.m720)
							item.m720 = href.replace(/(\d+)\/.+$/, '$1');
						
						else if (!item.mStandard)
							item.mStandard = href.replace(/(\d+)\/.+$/, '$1');
					}
				});
				
				$.when(getLink(item, 'mStandard'), getLink(item, 'm1080'), getLink(item, 'm1080HEVC'),
				    	getLink(item, 'm720'), getLink(item, 'm720HEVC'))
				.done(function(a1, a2, a3, a4, a5) {
					
					if (item.download()) {
						
						download(item.download());
						// console.log("Downloading: " + item.download());
			    		
			    		if (options.check)
			    			$('input:not(:checked)', item.get()).click();
			    		
			    		refreshNotification();
			    	} else
			    		message(item.title + " " + item.episode + " not found, please try again later!");
			    	
					hideLoader($this, loader);
			    });
			}
		}
		
		testUrls();
	});
}

function download(url) {
	if (!downloading) {
		downloading = true;
		var dl = window.open(url, '_blank');
		$(dl).on('onbeforeunload', function() {
			dl.opener.focus();
		});
		setTimeout(function() {
			dl.close();
			downloading = false;
		}, 200);
	} else 
		setTimeout(download, 250, url);
}

function stripShit(data) {
	return data.replace(/<(style|head|script).{0,}?>[\s\S]+?<\/(style|head|script)>/gi, '')
		.replace(/<(link|img|meta).+?>/gi, '');
}

function getLink(item, part) {
	// console.log(item[part], isValid(item[part]));
	return isValid(item[part]) ? $.ajax({
		url: item[part],
		async: true
	}).done(function(data) {
		// console.log(item[part], 'done')
		item[part] = $.type(data) === 'string' ? $('.download a', stripShit(data)).first().attr('href') : '';
	}) : false;
}

function isValid(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

function hideLoader(el, loader) {
	el.on('click', getMagnet);
	loader.fadeOut('250');
}

function episode(data) {
	this.id;
	this.title;
	this.episode;
	this.checked;
	this.released;
	
	this.m1080;
	this.m1080HEVC;
	this.m720;
	this.m720HEVC;
	this.mStandard;
	
	this.get = function() {
		return $('#' + this.id);
	};
	
	this.getTitle = function() {
		return $.trim(this.title.replace(/the inhumans/i, 'Inhumans').replace(/('s|'|\(\d+\)|\& )/g, ''));
	};
	
	this.getQuery = function(open = false) {
		var s = this.getTitle().replace(/ |\./g, '+') + "+" + this.episode;
		if (open) return urls[index] + '/search/' + s;
		return urls[index] + '/s/?q=' + s;
	};
	
	this.getQueryExtra = function(open = false) {
		var s = this.getTitle().replace(/ |\./g, '+') + "+" + this.episode;
		if (open) return urls[index] + '/search/' + s;
		return urls[index] + '/s/?q=' + s + '&category=0&page=0&orderby=99';
	};
	
	this.getRegex = function() {
		return new RegExp(this.getTitle().replace(/ /g, '.+').replace(/S.H.I.E.L.D./, '(S.H.I.E.L.D|SHIELD)') + ".+" + this.episode, 'i');
	};
	
	this.download = function() {
		var q = options.quality;
		
		if (options.hevc) {
			if ((q == 2 || (q == 1 && !this.m720HEVC)) && this.m1080HEVC) 
				return this.m1080HEVC;
			else if ((q == 1 || q == 2) && this.m720HEVC)
				return this.m720HEVC;
		} 
		
		if ((q == 2 || (q == 1 && !this.m720)) && this.m1080) 
			return this.m1080;
		else if ((q == 1 || q == 2) && this.m720)
			return this.m720;
			
		if (this.mStandard)
			return this.mStandard;
		
		else if (q == 0) {
			if (options.hevc) {
				if (this.m720HEVC)
					return this.m720HEVC;
				else if (this.m1080HEVC)
					return this.m1080HEVC;
			}
			if (this.m720)
				return this.m720;
			else if (this.m1080)
				return this.m1080;
		}
		
		return undefined;
	};
	
	for (key in data)
		this[key] = data[key];
}

function day() {
	this.id;
	this.released;
	
	this.get = function() {
		return $('#' + this.id);
	};
	
	this.head = function() {
		return this.get().parent().find('.calendar_date');
	};
}

/*
A simple jQuery function that can add listeners on attribute change.
http://meetselva.github.io/attrchange/

About License:
Copyright (C) 2013-2014 Selvakumar Arumugam
You may use attrchange plugin under the terms of the MIT Licese.
https://github.com/meetselva/attrchange/blob/master/MIT-License.txt
 */
(function($) {
	function isDOMAttrModifiedSupported() {
		var p = document.createElement('p');
		var flag = false;

		if (p.addEventListener) {
			p.addEventListener('DOMAttrModified', function() {
				flag = true
			}, false);
		} else if (p.attachEvent) {
			p.attachEvent('onDOMAttrModified', function() {
				flag = true
			});
		} else { return false; }
		p.setAttribute('id', 'target');
		return flag;
	}

	function checkAttributes(chkAttr, e) {
		if (chkAttr) {
			var attributes = this.data('attr-old-value');

			if (e.attributeName.indexOf('style') >= 0) {
				if (!attributes['style'])
					attributes['style'] = {}; //initialize
				var keys = e.attributeName.split('.');
				e.attributeName = keys[0];
				e.oldValue = attributes['style'][keys[1]]; //old value
				e.newValue = keys[1] + ':'
						+ this.prop("style")[$.camelCase(keys[1])]; //new value
				attributes['style'][keys[1]] = e.newValue;
			} else {
				e.oldValue = attributes[e.attributeName];
				e.newValue = this.attr(e.attributeName);
				attributes[e.attributeName] = e.newValue;
			}

			this.data('attr-old-value', attributes); //update the old value object
		}
	}

	//initialize Mutation Observer
	var MutationObserver = window.MutationObserver
			|| window.WebKitMutationObserver;

	$.fn.attrchange = function(a, b) {
		if (typeof a == 'object') {//core
			var cfg = {
				trackValues : false,
				callback : $.noop
			};
			//backward compatibility
			if (typeof a === "function") { cfg.callback = a; } else { $.extend(cfg, a); }

			if (cfg.trackValues) { //get attributes old value
				this.each(function(i, el) {
					var attributes = {};
					for ( var attr, i = 0, attrs = el.attributes, l = attrs.length; i < l; i++) {
						attr = attrs.item(i);
						attributes[attr.nodeName] = attr.value;
					}
					$(this).data('attr-old-value', attributes);
				});
			}

			if (MutationObserver) { //Modern Browsers supporting MutationObserver
				var mOptions = {
					subtree : false,
					attributes : true,
					attributeOldValue : cfg.trackValues
				};
				var observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(e) {
						var _this = e.target;
						//get new value if trackValues is true
						if (cfg.trackValues) {							
							e.newValue = $(_this).attr(e.attributeName);
						}						
						if (typeof $(this).data('attrchange-tdisconnect') === 'undefined') { //disconnected logically
							cfg.callback.call(_this, e);
						}
					});
				});

				return this.data('attrchange-method', 'Mutation Observer')
						.data('attrchange-obs', observer).each(function() {
							observer.observe(this, mOptions);
						});
			} else if (isDOMAttrModifiedSupported()) { //Opera
				//Good old Mutation Events
				return this.data('attrchange-method', 'DOMAttrModified').on('DOMAttrModified', function(event) {
					if (event.originalEvent) { event = event.originalEvent; }//jQuery normalization is not required 
					event.attributeName = event.attrName; //property names to be consistent with MutationObserver
					event.oldValue = event.prevValue; //property names to be consistent with MutationObserver
					if (typeof $(this).data('attrchange-tdisconnect') === 'undefined') { //disconnected logically
						cfg.callback.call(this, event);
					}
				});
			} else if ('onpropertychange' in document.body) { //works only in IE		
				return this.data('attrchange-method', 'propertychange').on('propertychange', function(e) {
					e.attributeName = window.event.propertyName;
					//to set the attr old value
					checkAttributes.call($(this), cfg.trackValues, e);
					if (typeof $(this).data('attrchange-tdisconnect') === 'undefined') { //disconnected logically
						cfg.callback.call(this, e);
					}
				});
			}
			return this;
		} else if (typeof a == 'string' && $.fn.attrchange.hasOwnProperty('extensions') &&
				$.fn.attrchange['extensions'].hasOwnProperty(a)) { //extensions/options
			return $.fn.attrchange['extensions'][a].call(this, b);
		}
	}
})(jQuery);

if (!String.prototype.bMatch) {
	String.prototype.bMatch = function(regExp) {
		var s = this.toString();

		if (s.match(regExp) === null)
			return false;

		return true;
	}
}
