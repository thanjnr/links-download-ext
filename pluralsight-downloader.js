var pluralsightDownloader = function () {
    var moduleElements = [];
    var currentModule = null;    
    var currentModuleLinks = [];
    var index = 0;
    var workingTabId = null;
    var currentDownloadId = null;

    function changeModule(tabId) {
        if (moduleElements.length > 0) {
            currentModule = moduleElements.shift();
            
            var clickModule = `            
                var module = Array.prototype.map.call(
                    document.querySelectorAll("#tab-table-of-contents .module"), 
                    (element) => element)[${currentModule}]
                    .childNodes[0];

                if(module.className.indexOf('open') === -1) {
                    module.click();
                }
                `;

            chromeApi.executeScript(tabId, clickModule, function () {
                var getLessons = `
                        Array.prototype.map.call(
                            Array.prototype.map.call(
                            document.querySelectorAll("#tab-table-of-contents .module"), 
                            (element) => element)[${currentModule}]
                            .childNodes[1]
                            .childNodes,
                        (child, index) => index);
                    `;
    
                    chromeApi.executeScript(tabId, getLessons, function (result) {
                        if(result && result[0] && result[0].length > 0) {
                            currentModuleLinks = [...result[0]];
                        } else {
                            currentModuleLinks = [];
                        }
                        changeLesson(tabId);
                    });
                
            });
        }
    }

    function changeLesson(tabId) {
        if (currentModuleLinks.length > 0) {
            currentLesson = currentModuleLinks.shift();

            var clickLesson = `
            Array.prototype.map.call(
                document.querySelectorAll("#tab-table-of-contents .module"), 
                (element) => element)[${currentModule}]
                .childNodes[1]
                .childNodes[${currentLesson}]
                .click();

            Array.prototype.map.call(
                document.querySelectorAll("#tab-table-of-contents .module"), 
                (element) => element)[${currentModule}]
                .childNodes[1]
                .childNodes[${currentLesson}]
                .textContent;
                `;

                chromeApi.executeScript(tabId, clickLesson, function (result) {
                    var lesson = result[0].replace(/[^a-zA-Z ]/g, "").replace('m s', "");
                    setTimeout(() => {                        
                        downloadVideo(tabId, `Module-${currentModule+1}.${currentLesson+1}_${lesson}`);
                    }, 10000);
                });
        } else {
            changeModule(tabId);
        }
    }

    function downloadVideo(tabId, videoName) {
        console.log(videoName);
        var script = `document.querySelector("video.vjs-tech").src;`;

        chromeApi.executeScript(tabId, script, function (result) {
            console.log(result);
            if (result && result.length > 0) {
                if(result[0] != "") {
                    chromeApi.downLoadVideo(result[0], `${videoName}.mp4`, function (downloadId) {
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
            changeLesson(workingTabId);
        }
    }

    return {
        initiateDownload: function (tabId, url = "", startIndex = 1) {
            workingTabId = tabId;
            index = startIndex;

            var getModuleElements = `Array.prototype.map.call(
                document.querySelectorAll("#tab-table-of-contents .module"), 
                (element, index) => index);`;

            chromeApi.onDownloadChanged(onDownloadChanged);

            chromeApi.executeScript(tabId, getModuleElements, function (result) {
                if (result.length > 0) {
                    moduleElements = index > 1 ? result[0].slice(index - 1) : result[0];
                    if (moduleElements.length > 0) {
                        console.log(moduleElements);
                        changeModule(tabId);
                    }
                }
            });
        }
    };
}();