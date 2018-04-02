/* 
Automate wistia video download
1.Right click copy url
2.Copy id from end of href; e.g. wvideo=qd09h9eoa5
3.append to http://fast.wistia.net/embed/iframe
4.view source and get first url ending with .bin
5.paste to new tab and change to .mp4
*/

var wistiaDownloader = function () {
    var globalLinks = [];
    var index = 0;
    var workingTabId = null;
    var titlesMap = null;

    function changeCurrentTabUrl(tabId) {
        if (globalLinks.length > 0) {
            var link = globalLinks.shift();
            chromeApi.changeCurrentTabUrl(tabId, link);
        }
    }

    function onTabUpdated(tabId, changeInfo, tab) {
        if (tabId == workingTabId && changeInfo.status == 'complete') {
            
            var key = tab.url.substring(tab.url.lastIndexOf("/") + 1);
            setTimeout(() => {
                downloadVideo(tabId, `${titlesMap[key]}`);
                index++;
            }, 20000);
        }
    }

    function downloadVideo(tabId, videoName) {
        var getVideoLinkScript = `Array.prototype.reduce.call(
                document.querySelectorAll("script"), 
                (a, b) => {
                    var text = b.childNodes[0] ? b.childNodes[0].textContent : '';
                    text = text.substring(text.indexOf("url") + 6, text.indexOf('.bin'));
                    if(text.indexOf('https://') == 0) {
                        a.push(text);
                    }
                    return a;
                }, [])`;

            chromeApi.executeScript(tabId, getVideoLinkScript, function (result) {
            if (result && result.length > 0) {
                chromeApi.downLoadVideo(`${result[0][0]}.mp4`, `${videoName}.mp4`, function (downloadItem) {
                    changeCurrentTabUrl(tabId);
                });
            }
        });
    }

    return {
        initiateDownload: function (tabId, url = "", startIndex = 1) {
            workingTabId = tabId;
            index = startIndex;
            titlesMap = null;

            var getEmbedLinksScript = `Array.prototype.reduce.call(
                document.querySelectorAll("script[type='application/ld+json'"), 
                (a, b) => {
                  let url = JSON.parse(b.childNodes[0].data)['@id'];
                  if(url.indexOf('https') > -1) {
                    return [...a, url];
                  } else {
                    return a;
                  }
                },
                [])`;

            var getVideoTitlesScript = `Array.prototype.reduce.call(
                document.querySelectorAll(".program-video"), 
                (a, b) => {
                    var src = b.childNodes[0].childNodes[0].src;
                    src = src.substring(src.lastIndexOf("/") + 1);
                    
                    if(src.indexOf('.jsonp') > -1) {
                        src = src.replace('.jsonp', '');
                        a[src] = b.childNodes[1].childNodes[0].innerHTML;
                    } 
                    return a;
                },
                {})`;

            chromeApi.addTabUpdateListener(onTabUpdated);
            chromeApi.executeScript(tabId, getEmbedLinksScript, function (result) {
                if (result.length > 0) {
                    globalLinks = index > 1 ? result[0].slice(index - 1) : result[0];
                    if (globalLinks.length > 0) {
                        chromeApi.executeScript(tabId, getVideoTitlesScript, function (titlesScriptResult) {
                            titlesMap = titlesScriptResult[0];
                            changeCurrentTabUrl(tabId);
                        });
                    }
                }
            });
        }
    };
}();