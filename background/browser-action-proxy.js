'use strict';

/**
 * Initialize the port connection with the browser action popup.
 * */
browser.runtime.onConnect.addListener((browserActionPort) => {
    if(browserActionPort.name !== 'popup_to_background_port') {
        return;
    }

    let activeTab = null;
    browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
        activeTab = tabs[0];

        // invoke action on message from popup script
        browserActionPort.onMessage.addListener((message) => {
            actionDispatch(message, activeTab, (resp) => {
                browserActionPort.postMessage(resp);
            });
        });

        // handle extension close
        browserActionPort.onDisconnect.addListener(() => {
            chrome.storage.local.get('options', function(options) {
            if(!options || !options.persistent_highlights) {
                restorePageState(activeTab);
            } else {
                restorePageState(activeTab, false);
            }

            activeTab = null;
        });
    });
});

/**
 * Dispatcher for calls for action by the browser action popup.
 * Invokes the appropriate function in the Background based on the
 * message.action field.
 *
 * @param {object} message - The message received from the popup
 * @param {object} tab - Information about the active tab in the current window
 * @param {function} sendResponse - Function used to issue a response back to the popup.
 * */
function actionDispatch(message, tab, sendResponse) {
    let action = message.action;
    switch(action) {
        case 'update':
            updateSearch(message, tab, sendResponse);
            break;
        case 'next':
            seekSearch(message, true, tab, sendResponse);
            break;
        case 'previous':
            seekSearch(message, false, tab, sendResponse);
            break;
        case 'replace_next':
            replaceNext(message, tab, sendResponse);
            break;
        case 'replace_all':
            replaceAll(message, tab, sendResponse);
            break;
        case 'follow_link':
            followLinkUnderFocus(message, tab, sendResponse);
            break;
        case 'action_init':
            initializeBrowserAction(message, tab, sendResponse);
            break;
        case 'get_occurrence':
            extractOccurrences(message, tab, sendResponse);
            break;
    }
}
