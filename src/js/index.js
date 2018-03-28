import '../css/style.less'
  
;(function(win) {
var doc = win.document;
var docEl = doc.documentElement;
var dpr = win.devicePixelRatio;
var scale = 1 / dpr;
var tid;

docEl.setAttribute('data-dpr', dpr);

function refreshRem(){
    var width = docEl.getBoundingClientRect().width;
    if (width / dpr > 540) {
    width = 540 * dpr;
    }
    var rem = width / 10;
    docEl.style.fontSize = rem + 'px';
}

win.addEventListener('resize', function() {
    clearTimeout(tid);
    tid = setTimeout(refreshRem, 300);
}, false);
win.addEventListener('pageshow', function(e) {
    if (e.persisted) {
    clearTimeout(tid);
    tid = setTimeout(refreshRem, 300);
    }
}, false);

if (doc.readyState === 'complete') {
    doc.body.style.fontSize = 6 * dpr + 'px';
} else {
    doc.addEventListener('DOMContentLoaded', function(e) {
    doc.body.style.fontSize = 6 * dpr + 'px';
    }, false);
}

refreshRem();

})(window);