
var chromeApi = function () {
    return {
        addTabUpdateListener: function (callback) {
            chrome.tabs.onUpdated.addListener(callback);
        },
        executeScript: function (tabId, script, callback) {
            chrome.tabs.executeScript(tabId, { code: script }, callback);
        },
        changeCurrentTabUrl: function (tabId, link) {
            console.log(url);
            console.log(tabId);
            chrome.tabs.update(tabId, { url: link });
        },
        getCurrentTabUrl: function (callback, startIndex = 1) {
            var queryInfo = {
                active: true,
                currentWindow: true
            };

            chrome.tabs.query(queryInfo, (tabs) => {
                var tab = tabs[0];
                var url = tab.url;

                // tab.url is only available if the "activeTab" permission is declared.
                // If you want to see the URL of other tabs (e.g. after removing active:true
                // from |queryInfo|), then the "tabs" permission is required to see their
                // "url" properties.
                console.assert(typeof url == 'string', 'tab.url should be a string');

                callback(tab.id, url, startIndex);
            });
        },
        downLoadVideo: function (videoUrl, videoName, callback) {
            console.info(`Downloading ${videoUrl} to file ${videoName}`)
            chrome.downloads.download({
                url : videoUrl,
                filename : videoName,
                conflictAction : 'uniquify'
            }, callback); 
        },
        onDownloadChanged: function(callback) {
            chrome.downloads.onChanged.addListener(callback);
        }
    }
}();