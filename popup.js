'use strict';

document.addEventListener('DOMContentLoaded', () => {
  chromeApi.getCurrentTabUrl((tabId, url) => {
    var downloadButton = document.getElementById('download-button');
    var downloader = wistiaDownloader;

    if(url.indexOf('frontendmasters') > -1) {
      downloader = frontendmastersDownloader;
    }
    
    if(url.indexOf('app.pluralsight.com') > -1) {
      downloader = pluralsightDownloader;
    }

    downloadButton.addEventListener('click', () => {
      var startIndex = document.getElementById('start-index').value;
      if (!startIndex) {
        startIndex = 1;
      }
      console.log(downloader);
      console.log(chromeApi);
      console.log(startIndex);
      chromeApi.getCurrentTabUrl(downloader.initiateDownload, startIndex);
    });
  });
});