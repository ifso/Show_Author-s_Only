// www.w3schools.com/js/js_htmldom_document.asp (DOM document)
var url = document.URL;

// check if this page is 1st of the thread
function isFirst() {
  return url.indexOf('-') == -1;
}

// check if this page is under sao mode
function isSao() {
  return url.indexOf('_') != -1;
}

// only 1st page has 'canonical' (url of thread) and 'tpc' (uid of author)
// stackoverflow.com/questions/4859689 (redirect to a url)
function goFirst() {
  var n = url.indexOf('-');
  var first = url.slice(0, n - url.length) + '.html';
  chrome.runtime.sendMessage({todo: 'fst', redirect: first});
}

// not sao and already 1st: construct new url, send to background js
// www.w3schools.com/cssref/css_selectors.asp (great doc!)
// stackoverflow.com/questions/25487402 (nested class element)
function goSao() {
  var uid = document.getElementById('tpc')
                    .getElementsByClassName('j_u')[0].getAttribute('uid');
  var sao = url.slice(0, -5) + '_' + uid + '.html';
  chrome.runtime.sendMessage({todo: 'sao', redirect: sao});
}

// https://developer.chrome.com/extensions/messaging
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
    if (request.greeting == '1') {
      if (!isSao()) {
        if (!isFirst()) {
          sendResponse({farewell: 'GO: fst'});
          goFirst();
        } else {
          sendResponse({farewell: 'GO: sao'});
          goSao();
        }
      } else {
          sendResponse({farewell: 'IS: sao'});
      }
    }
    if (request.greeting == '2') {
      sendResponse({farewell: 'GO: fst sao'});
      goSao();
    }
});