let isHTML = false;

function requestListener(details) {
    const filter = browser.webRequest.filterResponseData(details.requestId);
    const decoder = new TextDecoder('utf-8');
    let responseData = '';

    filter.ondata = event => {
        filter.write(event.data);
        if (isHTML) responseData += decoder.decode(event.data, {stream: true});
    }

    filter.onstop = () => {
        if (isHTML) createFile(responseData);
        filter.disconnect();
    }

    return {};
}

function headersListener(details) {
    switch (details.type) {
        case 'main_frame':
        case 'sub_frame':
        case 'xmlhttprequest':
            if (details.statusCode == 200) {
                const responseHeaders = details.responseHeaders;
                const contentType = responseHeaders.find(header => header.name == 'Content-Type');
                isHTML = contentType.value.includes('text/html');
            }
    }

    return {responseHeaders: details.responseHeaders};
}

function createFile(html) {
    const blob = new Blob([html], {type: 'text/html'});
    const fileUrl = URL.createObjectURL(blob);

    const downloading = browser.downloads.download({
        url: fileUrl,
        filename: `AutoSave_${Date.now()}.htm`,
        conflictAction: 'uniquify'
    });

    downloading.then(onStartedDownload, onFailedDownload);
}

function onStartedDownload(id) {
    console.log(`Started downloading: ${id}`);
}

function onFailedDownload(error) {
    console.log(`Download failed: ${error}`);
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function onGot(item) {
    const target = item.targetSite || 'https://example.com/*';

    browser.webRequest.onBeforeRequest.addListener(
        requestListener,
        {urls: [target], types: ['main_frame', 'sub_frame', 'xmlhttprequest']},
        ['blocking']
    );
    
    browser.webRequest.onHeadersReceived.addListener(
        headersListener,
        {urls: [target]},
        ['blocking', 'responseHeaders']
    );
}

const getting = browser.storage.local.get('targetSite');
getting.then(onGot, onError);
