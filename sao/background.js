// construct a rule for display of icon for matching urls
// https://developer.chrome.com/extensions/declarativeContent
var rule = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {hostEquals: 'bbs.hupu.com', pathSuffix: 'html'}
    })
  ],
  actions: [new chrome.declarativeContent.ShowPageAction()]
};

// add the rule
chrome.runtime.onInstalled.addListener(function(details) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([rule]);
  });
});

// click icon, send request to content script
// stackoverflow.com/questions/15711369 (add listener for icon click)
// https://developer.chrome.com/extensions/messaging (sends msg to content js)
chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: '1'}, function(response) {
      console.log(response.farewell);
    });
  });
});

// redirect one more time after navigating the tab to 1st page of thread
// stackoverflow.com/questions/20046803 (add self-remove onUpdated listener)
// stackoverflow.com/questions/23895377 (why listeners of content don't work)
function onceMoreYouOpenTheDoor(tabId, changeInfo, tab) {
  // console.log(changeInfo); // try it~!
  if (tab.url !== undefined && changeInfo.status == 'complete') {
    chrome.tabs.query(
        {active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {greeting: '2'}, function(response) {
        console.log(response.farewell);
      });
    });
    chrome.tabs.onUpdated.removeListener(onceMoreYouOpenTheDoor);
  }
}

// receive new url from content script, redirect the tab
// stackoverflow.com/questions/4859689 (redirect to a url)
chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.todo == 'fst') {
    chrome.tabs.onUpdated.addListener(onceMoreYouOpenTheDoor);
    chrome.tabs.update(sender.tab.id, {url: request.redirect});
  }
  if (request.todo == 'sao') { // for possible future extensions
    chrome.tabs.update(sender.tab.id, {url: request.redirect});
  }
});