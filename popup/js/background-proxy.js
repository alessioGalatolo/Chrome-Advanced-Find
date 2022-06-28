'use strict';

/**
 * Create the Popup BackgroundProxy namespace.
 * */
register('Popup.BackgroundProxy', function (self) {
    let port = browser.runtime.connect({name: 'popup_to_background_port'});

    /**
     * Register the port message listener.
     * */
    self.openConnection = function() {
        registerPortListener(port);
    };

    /**
     * Close the port.
     * */
    self.closeConnection = function() {
        port.disconnect();
    };

    /**
     * Post a message to the background script.
     *
     * @param {object} message - The message to post to the background script.
     * */
    self.postMessage = function(message) {
        port.postMessage(message);
    };

    /**
     * Register the post message listener.
     *
     * @private
     * @param {object} port - The port to the background script
     * */
    function registerPortListener(port) {
        port.onMessage.addListener(messageHandler);
    }

    /**
     * Delegate actions from the message contents.
     *
     * @private
     * @param {object} response - The message received from the port.
     * */
    function messageHandler(response) {
        switch(response.action) {
            case 'install':
                Popup.BrowserAction.showInstallUpdateDetails(response.details);
                break;
            case 'action_init':
                Popup.BrowserAction.startExtension(response.response);
                break;
            case 'index_update':
                Popup.BrowserAction.updateIndex(response.index, response.total);
                break;
            case 'get_occurrence':
                Popup.BrowserAction.copyTextToClipboard(response.response);
                break;
            case 'invalidate':
                Popup.BrowserAction.updateSearch();
                break;
            case 'close':
                Popup.BrowserAction.closeExtension();
                break;
            case 'empty_regex':
            case 'invalid_regex':
            default:
                Popup.BrowserAction.error(response.action);
        }
    }
});
