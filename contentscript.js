const stopLogging = true,
    logStyle = 'background-color: #111; color: #ad5137; padding: 7px 20px 7px 10px; border: 1px solid #ad5137; border-width: 2px 0;';

console.oldlog = console.log;
console.log = log = function() {
    if (stopLogging) return;

    for (let i = 0; i < arguments.length; i++) {
        const arg = arguments[i];

        if (typeof arg === 'string') {
            console.oldlog.call(console, `%c ${arg}`, logStyle);
        } else {
            console.oldlog.call(console, arg);
        }
    }
};

// $.getCorsJSON = function(url, data, callback) {
//     console.log(encodeURIComponent(url));
//     return $.get('https://cors.kgl.app', {
//         url: encodeURIComponent(url),
//         data
//     }, callback, "json");
// }

/**
 * Variables used throughout the script
 */
let _s = {},
    _e = {
        ep: {},
        day: {}
    },
    changed = false,
    url = 'https://oneom.one', // TODO: find, check and get proxies
    options,
    msgTimer,
    epList,
    dayList,
    downloading,
    index,
    testTime,
    oldHref = 'old',
    magnetList = [],
    dlList = [],
    gettingMagnet = false,
    dIndex = 0;

/**
 * Document ready
 */
$(() => {

    // $.getCorsJSON('https://oneom.one/search/serial/?title=Superman&Lois', data => {
    //     console.log(data);
    // });

    // chrome.runtime.sendMessage({
    // 	proxies: true
    // }, function(data) {
    // 	url = data;
    // });

    addListener();

    $('<div />', {
        class: 'app-message-box'
    }).appendTo($('body'));

    changeInterval();
});

/**
 * Displays a message on the bottom of the page
 * 
 * @param {string} text The message to display
 * @returns {void}
 */
function message(text) {
    const mb = $('.app-message-box');
    mb.text(text).addClass('active');

    if (msgTimer)
        clearTimeout(msgTimer);

    msgTimer = setTimeout(function() {
        mb.removeClass('active');
    }, 10000);
}

/**
 * Adds listeners to detect page changes and button clicks
 */
function addListener() {

    $('a[href!=""]').off('click').on('click', function(e) {

        if ('https://episodecalendar.com' + $(this).attr('href') != oldHref)
            changeInterval();
        addListener();
    });

    const cls = '.epic-episode-marker-wrapper';
    $('body').off('click', cls).on('click', cls, function() {

        const box = $(this).closest('.calendar-day');
        if ($('input:not(:checked)', box).length)
            $('.calendar_date', box).removeClass('seen');
        else
            $('.calendar_date', box).addClass('seen');

        refreshNotification();
    });
}

/**
 * Sets an interval to recheck the episodes loaded on the page
 */
function changeInterval() {
    let oldBody = $('body')[0];
    const int = setInterval(function() {
        if (window.location.href != oldHref && $('body')[0] == oldBody) {
            check();
            clearInterval(int);
        }
        oldBody = $('body')[0];
    }, 1000);
}

/**
 * Checks and adds magnets creating the episode object
 */
function check() {
    oldHref = window.location.href;

    console.log('checking');

    const now = new Date();
    now.setHours(23, 59, 59);
    dayList = [];

    if ($('body').hasClass('calendar')) {

        const id = $('td.month h2').first().text() + "_" + $('p.year').first().text();

        if (!_e.ep[id])
            _e.ep[id] = [];
        epList = _e.ep[id];

        if (!_e.day[id])
            _e.day[id] = [];
        dayList = _e.day[id];

        if (!$('#page_container .magnetized').length) {

            epList.length = 0;

            $('.episode-item').each(function(i, el) {

                epList.push(new Episode({
                    id: $(this).attr('id'),
                    title: $(this).find('.show').text(),
                    episode: $(this).find('.episode').text().match(/\((S\d+E\d+)\)/)[1],
                    checked: $(this).hasClass('seen'),
                    released: $(this).find('input').length > 0
                }));
            });

            $('.calendar_cell_content').each(function(i, el) {

                const day = new Day({
                    id: $(this).attr('id'),
                    released: $('input', this).length > 0
                });

                if ($('input:not(:checked)', this).length == 0)
                    day.head().addClass('seen');

                dayList.push(day);
            });
        }

    } else if ($('body').hasClass('unwatched')) {

        const id = $('.cached-view:visible').attr('id');
        if (!_e.ep[id])
            _e.ep[id] = [];
        epList = _e.ep[id];

        if (!$('.cached-view:visible .magnetized').length) {

            epList.length = 0;

            $('.cached-view:visible .season').each(function(i, el) {
                const season = $(this),
                    title = season.find('h2').find('a').text().match(/(.*) - Season \d/)[1].replace(/[,.-]/, '');

                $('<div />', {
                    'class': 'separator'
                }).appendTo($('.epic-list-episode', this));

                const box = $('<div />', {
                    'class': 'magnet-container center'
                }).appendTo($('.epic-list-episode', this));

                $('<div />', {
                    'class': 'grey margin_bottom_mini'
                }).text('Magnet').appendTo(box);

                $('.epic-list-episode', this).each(function() {

                    const date = $(this).find('.date').find('strong').text();

                    epList.push(new Episode({
                        id: $(this).attr('id'),
                        title: title,
                        episode: $(this).find('.mid_grey').find('strong').text(),
                        checked: false,
                        released: new Date(date).getTime() < now.getTime()
                    }));
                });
            });
        }
    } else if ($('body').hasClass('show')) {

        if ($('.description').length == 0) {

            // Add a description to the top of the page
            const lang = {
                en: 'eng',
                br: 'por',
                de: 'deu',
                dk: 'dan',
                es: 'spa',
                fr: 'fra',
                gr: 'eng',
                it: 'ita',
                nl: 'nld',
                pl: 'pol',
                pt: 'por',
                ro: 'eng',
                rs: 'eng',
                ru: 'rus',
                se: 'swe',
                tu: 'tur'
            },
                lRef = lang[$('#logo').attr('href').replace('/', '')];

            const tvLink = $('.links a:nth-of-type(2)').attr('href').replace(/https{0,1}/, 'https');
            chrome.runtime.sendMessage({
                url: tvLink
            }, function(data) {

                $('.page-container.pad_top .col-24').before($('<p />', {
                    class: 'description',
                    text: $(`#translations div[data-language=${lRef}] p:nth-of-type(1)`, data.success).text()
                }));
            });
        }

        const id = $('.cached-view:visible').attr('id');
        if (!_e.ep[id])
            _e.ep[id] = [];
        epList = _e.ep[id];

        if (!$('.cached-view:visible .magnetized').length) {

            epList.length = 0;

            $('<div />', {
                'class': 'separator'
            }).appendTo($('.cached-view:visible .epic-list-episode'));

            const box = $('<div />', {
                'class': 'magnet-container center'
            }).appendTo($('.cached-view:visible .epic-list-episode'));

            $('<div />', {
                'class': 'grey margin_bottom_mini'
            }).text('Magnet').appendTo(box);

            const title = $('.show_banner').find('h1').text().replace(/[,.-]/, '');

            $('.cached-view:visible .epic-list-episode').each(function() {

                const $check = $(this).find('.epic-episode-marker'),
                    date = $(this).find('.date').find('strong').text();

                epList.push(new Episode({
                    id: $(this).attr('id'),
                    title: title,
                    episode: $(this).find('.mid_grey').find('strong').text(),
                    checked: $check.length && $check.checked,
                    released: new Date(date).getTime() < now.getTime()
                }));
            });
        }
    }

    $.each(epList, function(i, item) {

        // console.log(item);

        if (!item.get().hasClass('magnetized') && item.released) {

            const box = item.get().find('.magnet-container'),
                magnet = $('<div />', {
                    class: box.length ? 'big magnet' : 'magnet',
                    title: 'Download!'
                }).attr('index', i).appendTo(box.length ? box : item.get());

            magnet.on('click', addToQueue);

            $('<div />', {
                'class': 'loader'
            }).hide().appendTo(magnet);

            item.get().addClass('magnetized');

        } else if (!item.released) {
            item.get().find('.magnet-container .grey').css('opacity', 0);
        }
    });

    $.each(dayList, function(i, item) {

        if (!item.get().hasClass('magnetized') && item.released) {

            const magnet = $('<div />', {
                class: 'magnet',
                title: 'Download all unwatched from day!'
            }).attr('index', i).appendTo(item.head());
            magnet.on('click', getDayMagnets);

            item.get().addClass('magnetized');
        }
    });

    if (!$('#menu').hasClass('magnetized')) {

        const magnet = $('<li />', {
            'class': 'download-all'
        }).appendTo($('#menu'));
        const a = $('<a />', {
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

/**
 * Function for when the download all button is clicked
 * 
 * @param {object} e Handler event
 */
function getAllMagnets(e) {
    e.preventDefault();
    $.each(epList, function(i, item) {
        if ($('input:not(:checked)', item.get()).length)
            addToQueue.call($('.magnet', item.get()).get(0));
    });
}

/** 
 * Function for when the magnet on the day is clicked
 * 
 * @param {object} e Handler event
 */
function getDayMagnets(e) {

    let item = dayList[$(this).attr('index')];

    $('.magnet', item.get()).each(function(i, el) {

        item = epList[$(this).attr('index')];

        if (!$('input', item.get()).is(':checked'))
            addToQueue.call($('.magnet', item.get()).get(0));
    });
}

/**
 * Sets the number next to the download all button
 */
function refreshNotification() {
    const cls = '.epic-episode-marker-wrapper input:not(:checked)';
    setTimeout(function() {
        if ($('body').hasClass('calendar'))
            $('#dl-count').text($(cls).length);
        else
            $('#dl-count').text($('.cached-view:visible ' + cls).length);
    }, 1000);
}

/** 
 * Creates and moves through the queue getting magnets
 *
 * the way chrome has changed requires us to queue 
 * downloads rather than doing all at once
 */
function addToQueue() {
    $(this).off('click');
    epList[$(this).attr('index')].get().find('.loader').fadeIn('250');

    magnetList.push($(this).attr('index'));

    getMagnet.call(epList[magnetList[0]].get().find('.magnet'));
}

/**
 * Add an item to the download queue and try and download it
 * 
 * @param {Object} item The item to add
 */
function toDLQueue(item) {
    dlList.push(item);
    download();
}

/**
 * Gets the magnet from the given episode.
 * 
 * @param {object} e Handler event
 */
function getMagnet(e) {

    if (gettingMagnet) return;
    gettingMagnet = true;

    const $this = $(this),
        item = epList[$(this).attr('index')],
        loader = item.get().find('.loader');

    const getTorrents = () => {
        const show = item.getShow();

        if (!show) {
            console.error(`Show not found: ${item.title}`);

            hideLoader($this, loader);
            getNextMagnet();
            return;
        }

        chrome.storage.sync.get({
            quality: 1,
            hevc: true,
            check: true,
            clicked: false
        }, function(items) {
            options = items;

            if (item.download()) {

                console.log('directly downloading the magnet');

                toDLQueue(item);

                if (options.check)
                    $('input:not(:checked)', item.get()).trigger('click');

                // downloading get next magnet 
                hideLoader($this, loader);
                getNextMagnet();

            } else {

                console.log('finding the episode');

                let ep;
                const sNum = item.getSeason(),
                    eNum = item.getEpisode();

                show.ep.forEach(episode => {
                    if (episode.ep == eNum && episode.season == sNum)
                        ep = episode;
                });

                if (!ep) {

                    // downloading get next magnet 

                    hideLoader($this, loader);
                    getNextMagnet();
                    return;
                }

                console.log(ep);

                const dls = {};

                ep.torrent.forEach(v => {

                    const dl = {
                        magnet: v.value,
                        size: v.size,
                        seed: v.seed,
                        quality: v.title.bMatch(/1080p/i) ? '1080' : v.title.bMatch(/720p/i) ? '720' : 'Standard',
                        hevc: v.title.bMatch(/HEVC|x265/i)
                    };

                    const match = `m${dl.quality}${dl.hevc ? 'HEVC' : ''}`;

                    if (!dls[match] || (dls[match].seed < dl.seed)) {
                        dls[match] = dl;
                        item[match] = dl.magnet;
                    }
                });

                console.log(item, item.download());

                if (item.download()) {
                    toDLQueue(item);
                }

                hideLoader($this, loader);

                // get next magnet whether we have found one or not 
                getNextMagnet();
            }
        });
    };

    if (!item.getShow()) {

        let title = item.title,
            year,
            yMatch = title.match(/\((\d{4})\)/);

        if (yMatch) {
            title = item.getTitle();
            year = `&start=${yMatch[1]}-01-01`;
        }

        // WARN: This may not work with older shows of the same title

        chrome.runtime.sendMessage({
            url: `${url}/search/serial/?title=${title.replace("'", '')}${(year ?? '')}`
        }, data => {
            if (data.success) {
                // check for the correct match title
                let winner = {
                    score: 0
                };

                // console.log(data);

                $.each(data.success.data.serials, (i, show) => {
                    if (show.weight == '0.00')
                        return;

                    show.score = similarity(item.title, show.title);

                    if (show.score > winner.score)
                        winner = show;
                });

                chrome.runtime.sendMessage({
                    url: `${url}/serial/${winner.id}`
                }, show => {
                    // console.log(show);
                    if (show?.success?.data?.serial)
                        _s[item.title] = show.success.data.serial;

                    getTorrents();
                });
            }
        });
    } else
        getTorrents();

}

function getNextMagnet() {
    magnetList.shift();
    gettingMagnet = false;

    if (magnetList.length > 0)
        getMagnet.call(epList[magnetList[0]].get().find('.magnet'));
}

function download() {

    if (downloading) return;
    downloading = true;

    console.log('downloading', dlList[0].download());

    window.location = dlList[0].download();

    if (options.clicked)
        setTimeout(() => {
            downloadNext();
        }, 1000);
    else
        dialogue().fadeIn(800).on('click', function(e) {

            $(this).fadeOut(400);
            setTimeout(() => {
                $(this).remove();
                downloadNext();
            }, 400);
        });

    if (options.check)
        $('input:not(:checked)', dlList[0].get()).click();

    refreshNotification();
}

function downloadNext() {
    dlList.shift();
    downloading = false;

    dlList.length > 0 && download();
}

function cleanURL(url) {
    return (url || '').replace(/https{0,1}:\/\//, '');
}

function stripShit(data) {
    return data.replace(/(<head.*?>[\s\S]*?<\/head>|<script.*?>[\s\S]*?<\/script>|<style.*?>[\s\S]*?<\/style>)/gi, '')
        .replace(/<(link|img|meta).+?>/gi, '');
}

function isValid(link) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(link);
}

function hideLoader(el, loader) {
    el.on('click', addToQueue);
    loader.fadeOut('250');
}

class Episode {
    id;
    title;
    episode;
    checked;
    released;

    m1080;
    m1080HEVC;
    m720;
    m720HEVC;
    mStandard;

    replaces = [{
        from: /(!|\'|\(\d+\)|\& )/g,
        to: ''
    }, {
        from: /the inhumans/i,
        to: 'inhumans'
    }];

    constructor(data) {
        for (const key in data)
            this[key] = data[key];
    }

    get() {
        return $('#' + this.id);
    }

    getTitle() {
        let title = this.title;
        for (const replace of this.replaces) {
            title = title.replace(replace.from, replace.to);
        }
        return $.trim(title);
    }

    getOm() {
        return url + `/serial/${this.getShow()}`;
    }

    getZooqle() {
        const s = this.getTitle().replace(/\s|\./g, '+') + "+" + this.episode;
        return url + '/search?q=' + s;
    }

    getETTV() {
        const s = this.getTitle().replace(/\s|\./g, '+') + "+" + this.episode;
        return url + '/torrents-search.php?search=' + s;
    }

    getRegex() {
        return new RegExp(this.getTitle().replace(/\s/g, '.+').replace(/S.H.I.E.L.D./, '(S.H.I.E.L.D|SHIELD)') + ".+" + this.episode, 'i');
    }

    download() {
        const q = options.quality;

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
    }

    getType() {
        let q = options.quality;

        if (options.hevc) {
            if ((q == 2 || (q == 1 && !this.m720HEVC)) && this.m1080HEVC)
                return 'm1080HEVC';
            else if ((q == 1 || q == 2) && this.m720HEVC)
                return 'm720HEVC';
        }

        if ((q == 2 || (q == 1 && !this.m720)) && this.m1080)
            return 'm1080';
        else if ((q == 1 || q == 2) && this.m720)
            return 'm720';

        if (this.mStandard)
            return 'mStandard';

        else if (q == 0) {
            if (options.hevc) {
                if (this.m720HEVC)
                    return 'm720HEVC';
                else if (this.m1080HEVC)
                    return 'm1080HEVC';
            }
            if (this.m720)
                return 'm720';
            else if (this.m1080)
                return 'm1080';
        }

        return undefined;
    }

    getShow() {
        return _s[this.title];
    }

    getEpisode() {
        return this.episode.replace(/S\d+E/, '');
    }

    getSeason() {
        return this.episode.replace(/S(\d+).*/, '$1');
    }
}

class Day {
    id;
    released;

    constructor(data) {
        for (const key in data)
            this[key] = data[key];
    }

    get() {
        return $('#' + this.id);
    }

    head() {
        return this.get().parent().find('.calendar_date');
    }
}

const dialogue = () => {

    const d = $('<div />', {
        class: 'app-dialogue',
        i: dIndex
    }).appendTo($('body'));

    let dBorder = $('<div />', {
        class: 'app-dialogue-border'
    }).appendTo(d);

    $('<span />', {
        class: 'app-dialogue-click',
        text: 'Click anywhere to continue the queue!'
    }).appendTo(dBorder);

    $('<span />', {
        class: 'app-dialogue-sorry',
        text: 'This is necessary since chrome updated the way external applications are selected. Without this you can not download in bulk as the rest of the queue would be ignored.'
    }).appendTo(dBorder);

    $('<span />', {
        class: 'app-dialogue-click',
        text: 'or...'
    }).appendTo(dBorder);

    $('<span />', {
        class: 'app-dialogue-sorry',
        text: `If you have the latest version of chrome, you can check the 'Always allow episodecalendar.com...' in the popup dialogue, then check this next box to download in bulk again. Thank you chrome developers.`
    }).appendTo(dBorder);

    let dLabel = $('<label />', {
        class: 'app-dialogue-check',
        for: 'clicked-it'
    }).appendTo(dBorder);

    let dInput = $('<input />', {
        class: 'app-dialogue-checkbox',
        type: 'checkbox',
        id: 'clicked-it'
    }).prop('checked', options.clicked).appendTo(dLabel);

    $('<span />', {
        class: 'app-dialogue-text',
        text: `I've selected 'Always allow episodecalendar.com to open links...'`
    }).appendTo(dLabel);

    $('<div />', {
        class: 'app-dialogue-back mark'
    }).appendTo(dLabel);

    $('<div />', {
        class: 'app-dialogue-tick mark'
    }).appendTo(dLabel);

    dLabel.on('click', function(e) {
        e.stopPropagation();

        options.clicked = dInput.is(':checked');

        chrome.storage.sync.set({
            quality: options.quality,
            hevc: options.hevc,
            check: options.check,
            clicked: options.clicked
        });
    });

    dIndex++;

    return d;
};

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
        let p = document.createElement('p');
        let flag = false;

        if (p.addEventListener) {
            p.addEventListener('DOMAttrModified', function() {
                flag = true
            }, false);
        } else if (p.attachEvent) {
            p.attachEvent('onDOMAttrModified', function() {
                flag = true
            });
        } else {
            return false;
        }
        p.setAttribute('id', 'target');
        return flag;
    }

    function checkAttributes(chkAttr, e) {
        if (chkAttr) {
            let attributes = this.data('attr-old-value');

            if (e.attributeName.indexOf('style') >= 0) {
                if (!attributes['style'])
                    attributes['style'] = {}; //initialize
                let keys = e.attributeName.split('.');
                e.attributeName = keys[0];
                e.oldValue = attributes['style'][keys[1]]; //old value
                e.newValue = keys[1] + ':' +
                    this.prop("style")[$.camelCase(keys[1])]; //new value
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
    let MutationObserver = window.MutationObserver ||
        window.WebKitMutationObserver;

    $.fn.attrchange = function(a, b) {
        if (typeof a == 'object') { //core
            let cfg = {
                trackValues: false,
                callback: $.noop
            };
            //backward compatibility
            if (typeof a === "function") {
                cfg.callback = a;
            } else {
                $.extend(cfg, a);
            }

            if (cfg.trackValues) { //get attributes old value
                this.each(function(i, el) {
                    let attributes = {};
                    for (let attr, i = 0, attrs = el.attributes, l = attrs.length; i < l; i++) {
                        attr = attrs.item(i);
                        attributes[attr.nodeName] = attr.value;
                    }
                    $(this).data('attr-old-value', attributes);
                });
            }

            if (MutationObserver) { //Modern Browsers supporting MutationObserver
                let mOptions = {
                    subtree: false,
                    attributes: true,
                    attributeOldValue: cfg.trackValues
                };
                let observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(e) {
                        let _this = e.target;
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
                    if (event.originalEvent) {
                        event = event.originalEvent;
                    } //jQuery normalization is not required 
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
        let s = this.toString();

        if (s.match(regExp) === null)
            return false;

        return true;
    }
}

function toMB(str) {
    if (str.includes(' MB'))
        return Math.round(+str.replace(' MB', ''));
    else {
        let n = +str.replace(' GB', '');
        return Math.round(n * 1024);
    }
}

function similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    let longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    let costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}