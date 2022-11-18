// When a user clicks on the browser action...
chrome.browserAction.onClicked.addListener(() => {
  // Listen for onHeadersReceived events to redirect images to :orig (original image)
  chrome.webRequest.onHeadersReceived.addListener( (req) => {
      return {
        ...(req.url.endsWith(':orig') ? {} : { redirectUrl: req.url.replace('?format=', '.').replace(/(&name=.*)/, ':orig')})
      };
    },
    { urls: [ '*://pbs.twimg.com/media/*' ], types: [ 'image' ] },
    [ 'blocking', 'responseHeaders' ],
  );


  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    // reload tab so that we get full size images
    chrome.tabs.reload(activeTab.id, {}, () => {
      let count = 0;
      let timer = setInterval(() => {
        chrome.tabs.executeScript(activeTab.id, {
            code: `document.querySelector('[data-testid="primaryColumn"] [role="region"] > div') !== null`,
        }, (data) => {
            if (count === 20 || (data && data[0])){
                // page is ready (or 10s ellapsed), tell the active tab to load the entire thread.
                chrome.tabs.sendMessage(activeTab.id, { message: 'load_entire_thread' });
                clearInterval(timer)
            } else {
              count++;
            }
        })
      }, 500);
    });
  });
});
