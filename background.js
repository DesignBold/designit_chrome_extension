// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  var image_src = info.srcUrl;
    chrome.storage.sync.get({
        defaultDocumentType: 'blog-graphic',
    }, function(items) {
        var document_type = items.defaultDocumentType;
        chrome.tabs.executeScript(tab.id,{
            code : 'var designboldframe = document.getElementById("designbold-extension-iframe");var data= {action:"#db#design-button#start_design_tool",image:"'+image_src+'",param:{doc_type:"'+document_type+'"}};designboldframe.contentWindow.postMessage(data,"*");designboldframe.style.display="block";'
        },function(){

        });
    });
});

chrome.contextMenus.create({
  id: 'open',
  title: chrome.i18n.getMessage('openContextMenuTitle'),
  contexts: ['image'],
});

chrome.browserAction.onClicked.addListener(function(activeTab)
{
    chrome.storage.sync.get({
        defaultDocumentType: 'blog-graphic',
    }, function(items) {
        var document_type = items.defaultDocumentType;
        chrome.tabs.executeScript(activeTab.id,{
            code : 'var designboldframe = document.getElementById("designbold-extension-iframe");var data= {action:"#db#design-button#start_design_tool",image:"",param:{doc_type:"'+document_type+'"}};designboldframe.contentWindow.postMessage(data,"*");designboldframe.style.display="block";'
        },function(){

        });
    });
});
