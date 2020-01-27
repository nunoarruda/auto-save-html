let isHTML = false;

function requestListener(details: any) {
  const filter = browser.webRequest.filterResponseData(details.requestId);
  const decoder = new TextDecoder("utf-8");
  let responseData = "";

  filter.ondata = event => {
    filter.write(event.data);
    if (isHTML) responseData += decoder.decode(event.data, { stream: true });
  };

  filter.onstop = () => {
    if (isHTML) createFile(responseData);
    filter.disconnect();
  };

  return {};
}

function headersListener(details: any) {
  switch (details.type) {
    case "main_frame":
    case "sub_frame":
    case "xmlhttprequest":
      if (details.statusCode === 200) {
        const responseHeaders = details.responseHeaders;
        const contentType = responseHeaders.find(
          (header: any) => header.name.toLowerCase() === "content-type"
        );
        isHTML = contentType.value.toLowerCase().includes("text/html");
      }
  }

  return { responseHeaders: details.responseHeaders };
}

function createFile(html: any) {
  const blob = new Blob([html], { type: "text/html" });
  const fileUrl = URL.createObjectURL(blob);

  const downloading = browser.downloads.download({
    url: fileUrl,
    filename: `AutoSave_${Date.now()}.htm`,
    conflictAction: "uniquify"
  });

  downloading.then(onStartedDownload, onFailedDownload);
}

function onStartedDownload(id: any) {
  console.log(`Started downloading: ${id}`);
}

function onFailedDownload(error: any) {
  console.log(`Download failed: ${error}`);
}

function onError(error: any) {
  console.log(`Error: ${error}`);
}

function onGot(storageObject: browser.storage.StorageObject) {
  const targets = storageObject.targetSites as string[] || ["*://*.example.com/*"];

  browser.webRequest.onBeforeRequest.addListener(
    requestListener,
    { urls: targets, types: ["main_frame", "sub_frame", "xmlhttprequest"] },
    ["blocking"]
  );

  browser.webRequest.onHeadersReceived.addListener(
    headersListener,
    { urls: targets },
    ["blocking", "responseHeaders"]
  );
}

const getting = browser.storage.local.get("targetSites");
getting.then(onGot, onError);
