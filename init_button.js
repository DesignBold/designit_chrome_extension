(function (doc) {
    var style = doc.createElement('style');
    style.type = 'text/css';
    style.innerHTML = "";
    doc.getElementsByTagName('head')[0].appendChild(style);
})(document);
var DB_EXTENSION = {
    min_dimension : 50,
    max_dimension : 4000,
    default_min_width : 100,
    default_min_height : 100,
    default_max_width : 1200,
    default_max_height : 800
};
var DBSDK_EXTENSION = {};
/* bind event & handler on element */
DBSDK_EXTENSION.bindEventHandler = function (target, type, callback, useCapture) {
    useCapture = useCapture || false;
    if (target.addEventListener) {
        target.addEventListener(type, callback, useCapture);
    }
    else {
        target.attachEvent('on' + type, callback);
    }
};
/* unbind event handler & return callback */
DBSDK_EXTENSION.unbindEventHandler = function (target, type, callback, useCapture) {
    useCapture = useCapture || false;
    if (target.removeEventListener) {
        target.removeEventListener(type, callback, useCapture);
    }
    else {
        target.detachEvent('on' + type, callback);
    }
};

var iframeOnLoad = function () {
    DBSDK_EXTENSION.source_frame = window.document.getElementById("designbold-extension-iframe");
};

var iframe = document.createElement('iframe');
iframe.style.display = 'none';
iframe.style.position = 'fixed';
iframe.style.zIndex = "100000";
iframe.style.top = 0;
iframe.style.left = 0;
iframe.style.border = 0;
iframe.width = '100%';
iframe.height = '100%';
iframe.src = chrome.runtime.getURL("chrome_extension.html");
iframe.name = "designbold-extension-iframe";
iframe.id = "designbold-extension-iframe";
document.body.appendChild(iframe);
DBSDK_EXTENSION.unbindEventHandler(iframe, 'load', iframeOnLoad, true);
DBSDK_EXTENSION.bindEventHandler(iframe, 'load', iframeOnLoad, true);

var DBExtensionMessageListener = function (e) {
    var action = e.data.action || '';
    if (action === '#db-extension#design-button#close') {
        var designboldframe = document.getElementById("designbold-extension-iframe");
        designboldframe.style.display = "none";
    }
}
DBSDK_EXTENSION.bindEventHandler(window, 'message', DBExtensionMessageListener, false);
DBSDK_EXTENSION.allow = false;
DBSDK_EXTENSION.init_designbold_layer = function(){
    var button = document.createElement("a");
    button.className = "db-btn-designit";
    button.id = "design_bold_hover_button";
    button.innerHTML = "Design";
    button.style.zIndex = 99999;
    button.style.position = "absolute";
    button.style.display = "none";
    document.body.appendChild(button);
};
DBSDK_EXTENSION.init_hover_action = function(){
    chrome.storage.sync.get({
        defaultDocumentType: "blog-graphic",
        hoverButtonStatus : 0,
        hoverButtonPosition : 1,
        minWidth : DB_EXTENSION.default_min_width,
        maxWidth : DB_EXTENSION.default_max_width,
        minHeight : DB_EXTENSION.default_min_height,
        maxHeight : DB_EXTENSION.default_max_height,
    }, function(items) {
        var images = document.querySelectorAll("img");
        if (images.length > 0){
            for (var i=0;i < images.length;i++){
                items.minWidth = parseInt(items.minWidth);
                items.maxWidth = parseInt(items.maxWidth);
                items.minHeight = parseInt(items.minHeight);
                items.maxHeight = parseInt(items.maxHeight);
                images[i].db_config = items;
                images[i].addEventListener("mouseover",DBSDK_EXTENSION.mouseover_function,false);
                images[i].addEventListener("mouseleave",DBSDK_EXTENSION.mouseleave_function,false);
            }
        }
    });

};

DBSDK_EXTENSION.mouseover_function = function(event){
    var el = event.target;
    var rect = el.getBoundingClientRect();
    var image_src = el.src;
    var button = document.querySelector("#design_bold_hover_button");
    var scroll_top = document.documentElement.scrollTop;
    var db_config = el.db_config;
    if (rect.width >= db_config.minWidth && rect.width <= db_config.maxWidth && rect.height >= db_config.minHeight && rect.height <= db_config.maxHeight){
        switch (db_config.hoverButtonPosition){
            case "1" :
                button.style.top = (scroll_top + rect.top + 10) + "px";
                button.style.left = (rect.left + 10) + "px";
                break;
            case "2" :
                button.style.top = (scroll_top + rect.top + 10) + "px";
                button.style.left = (rect.left + rect.width - 90) + "px";
                break;
            case "3" :
                button.style.top = (scroll_top + rect.top + rect.height - 40) + "px";
                button.style.left = (rect.left + 10) + "px";
                break;
            case "4" :
                button.style.top = (scroll_top + rect.top + rect.height - 40) + "px";
                button.style.left = (rect.left + rect.width - 90) + "px";
                break;
            default :
                button.style.top = (scroll_top + rect.top + 10) + "px";
                button.style.left = (rect.left + 10) + "px";
                break;
        }
        button.style.display = "block";
        button.removeEventListener("click",DBSDK_EXTENSION.start_design_tool,false);
        button.dataset.image = el.src;
        button.onclick = DBSDK_EXTENSION.start_design_tool;
    }

};
DBSDK_EXTENSION.mouseleave_function = function(event){
    var el = event.target;
    var rect = el.getBoundingClientRect();
    var image_src = el.src;
    var button = document.querySelector("#design_bold_hover_button");
    var scroll_top = document.documentElement.scrollTop;
    if ( (event.clientX >= rect.left + rect.width) || (event.clientX <= rect.left) || event.clientY <= rect.top || event.clientY >= (rect.top + rect.height) ){
        button.style.display = "none";
        button.dataset.image = "";
        button.onclick = function(){
            return false;
        };
    }
};


DBSDK_EXTENSION.start_design_tool = function(event){
    var el = event.target;
    var image_src = el.dataset.image;
    console.log(image_src);
    chrome.storage.sync.get({
        defaultDocumentType: 'blog-graphic',
    }, function(items) {
        var document_type = items.defaultDocumentType;
        var designboldframe = document.getElementById("designbold-extension-iframe");
        var data= {action:"#db#design-button#start_design_tool",image:image_src,param:{doc_type:document_type}};
        console.log({action:"#db#design-button#start_design_tool",image:image_src,param:{doc_type:document_type}});
        designboldframe.contentWindow.postMessage(data,"*");
        designboldframe.style.display="block";
    });
};

chrome.storage.sync.get({
    hoverButtonStatus: 0,
}, function(items) {
    items.hoverButtonStatus = parseInt(items.hoverButtonStatus)
    if (items.hoverButtonStatus){
        DBSDK_EXTENSION.meta_allow = document.querySelector("meta[name='designbold']");
        if (DBSDK_EXTENSION.meta_allow == null){
            DBSDK_EXTENSION.allow = true;
        }
        else{
            if (DBSDK_EXTENSION.meta_allow.content == "no"){
                DBSDK_EXTENSION.allow = false;
            }
            else{
                DBSDK_EXTENSION.allow = true;
            }
        }
    }
    if (DBSDK_EXTENSION.allow){
        window.onload = function(){
            DBSDK_EXTENSION.init_designbold_layer();
            DBSDK_EXTENSION.init_hover_action();
        }
    }
});
