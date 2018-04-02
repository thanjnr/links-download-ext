'use strict';

document.addEventListener('DOMContentLoaded', () => {
  chromeApi.getCurrentTabUrl((tabId, url) => {
    var downloadButton = document.getElementById('download-button');
    var downloader = wistiaDownloader;

    if(url.indexOf('frontendmasters') > -1) {
      downloader = frontendmastersDownloader;
    }

    downloadButton.addEventListener('click', () => {
      var startIndex = document.getElementById('start-index').value;
      if (!startIndex) {
        startIndex = 1;
      }
      chromeApi.getCurrentTabUrl(downloader.initiateDownload, startIndex);
    });
  });
});