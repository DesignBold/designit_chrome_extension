// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var COLLECTION_URI = "https://www.designbold.com/collection/"

chrome.browserAction.onClicked.addListener(function(activeTab)
{
    chrome.storage.sync.get({
        defaultDocumentType: 'blog-graphic',
    }, function(items) {
        window.open(COLLECTION_URI + items.defaultDocumentType);
    });
});


var lastTabId;
// Remove context menus for a given tab, if needed
function removeContextMenus(tabId) {
    if (lastTabId === tabId) chrome.contextMenus.removeAll();
}
// chrome.contextMenus onclick handlers:
var clickHandlers = {
    startDesignTool : function(info, tab) {
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
        // Example: Remove contextmenus for context
        removeContextMenus(tab.id);
    }
};

chrome.extension.onConnect.addListener(function(port) {
    if (!port.sender.tab || port.name != 'contextMenus') {
        // Unexpected / unknown port, do not interfere with it
        return;
    }
    var tabId = port.sender.tab.id;
    port.onDisconnect.addListener(function() {
        removeContextMenus(tabId);
    });
    // Whenever a message is posted, expect that it's identical to type
    // createProperties of chrome.contextMenus.create, except for onclick.
    // "onclick" should be a string which maps to a predefined function
    port.onMessage.addListener(function(data) {
        var action = data.action;
        if (action == 'create'){
            chrome.contextMenus.removeAll(function() {
                chrome.contextMenus.create({
                    id: 'designbold-context-menu',
                    title: chrome.i18n.getMessage('openContextMenuTitle'),
                    onclick : clickHandlers.startDesignTool,
                    contexts: ['image'],
                });
            });
        }
        else if (action == "remove"){
            chrome.contextMenus.removeAll(function() {
            });
        }

    });
});

// When a tab is removed, check if it added any context menu entries. If so, remove it
chrome.tabs.onRemoved.addListener(removeContextMenus);