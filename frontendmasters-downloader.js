var frontendmastersDownloader = function () {
    var globalLinks = [];
    var index = 0;
    var workingTabId = null;
    var currentUrl = null;
    var currentDownloadId = null;

    function changeCurrentTabUrl(tabId) {
        if (globalLinks.length > 0) {
            currentUrl = globalLinks.shift();
            chromeApi.changeCurrentTabUrl(tabId, currentUrl);
        }
    }

    function onTabUpdated(tabId, changeInfo, tab) {
        if (tab.url == currentUrl && changeInfo.status == 'complete') {
            var urlSegments = tab.url.split('/');
            var course = urlSegments[urlSegments.length - 3];
            var lesson = urlSegments[urlSegments.length - 2];
            setTimeout(() => {
                downloadVideo(tabId, `${course}_${index}_${lesson}`);
                index++;
            }, 5000);
        }
    }

    function downloadVideo(tabId, videoName) {
        var script = `document.querySelector("video.vjs-tech").src;`;

        chromeApi.executeScript(tabId, script, function (result) {
            console.log(result);
            if (result && result.length > 0) {
                if (result[0] != "") {
                    chromeApi.downLoadVideo(result[0], `${videoName}.webm`, function (downloadId) {
                        currentDownloadId = downloadId;
                    });
                } else {
                    setTimeout(() => {
                        downloadVideo(tabId, videoName);
                    }, 10000);
                }
            }
        });
    }

    function onDownloadChanged(downloadInfo) {
        if (downloadInfo.id === currentDownloadId && downloadInfo.state && downloadInfo.state.current === "complete") {
            changeCurrentTabUrl(workingTabId);
        }
    }

    return {
        initiateDownload: function (tabId, url = "", startIndex = 1) {
            workingTabId = tabId;
            index = startIndex;
            
            var getAllLessonsLinks = `Array.prototype.map.call(
                document.querySelectorAll(".FMPlayerLessonList .FMPlayerScrolling li>a.lesson"), 
                (element) => element.href)`;

            chromeApi.addTabUpdateListener(onTabUpdated);
            chromeApi.onDownloadChanged(onDownloadChanged);

            chromeApi.executeScript(tabId, getAllLessonsLinks, function (result) {
                if (result.length > 0) {
                    globalLinks = index > 1 ? result[0].slice(index - 1) : result[0];

                    if (globalLinks.length > 0) {
                        changeCurrentTabUrl(tabId);
                    }
                }
            })
        }
    };
}();