'use strict';

/**
 * Create the Content namespace. This component is injected into the
 * page and delegates messages to the parser or highlighter.
 * */
register('Content', function(self) {

    /**
     * State variables, used to recover the extension state if the extension
     * is closed accidentally.
     * */
    let regex = null;
    let index = null;
    let selected = null;

    /**
     * Register a message listener to the extension background script.
     * */
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {
            case 'init':
                selected = window.getSelection().toString();
                sendResponse({model: Content.Parser.buildDOMReferenceObject()});
                return true;
            case 'fetch':
                sendResponse({
                    success: true,
                    regex: regex,
                    index: index,
                    selection: selected,
                    iframes: document.getElementsByTagName('iframe').length
                });
                return true;
            case 'restore':
                selected = null;
                Content.Parser.restoreWebPage(message.uuids);
                return false;
        }

        //Highlighter Actions
        switch(message.action) {
            case 'update':
                regex = message.regex;
                index = message.index;
                Content.Highlighter.restore();
                Content.Highlighter.highlightAll(message.occurrenceMap, message.regex, message.options);
                Content.Highlighter.seekHighlight(message.index, message.options);
                break;
            case 'seek':
                index = message.index;
                Content.Highlighter.seekHighlight(message.index, message.options);
                break;
            case 'highlight_restore':
                Content.Highlighter.restore();
                break;
            case 'replace':
                Content.Highlighter.replace(message.index, message.replaceWith);
                break;
            case 'replace_all':
                Content.Highlighter.replaceAll(message.replaceWith);
                break;
            case 'follow_link':
                Content.Highlighter.followLinkUnderFocus();
                break;
        }

        return false;
    });
});
