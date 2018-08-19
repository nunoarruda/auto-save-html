let targetSiteElement: HTMLInputElement = null;

function restoreOption() {
  targetSiteElement = document.querySelector("#target-site");

  function setCurrentChoice(result) {
    targetSiteElement.value = result.targetSite || "*://*.example.com/*";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  const getting = browser.storage.local.get("targetSite");
  getting.then(setCurrentChoice, onError);
}

function saveOption(ev: Event) {
  browser.storage.local
    .set({
      targetSite: targetSiteElement.value
    })
    .then(() => browser.runtime.reload())
    .catch(err => console.error(err));

  ev.preventDefault();
}

document.addEventListener("DOMContentLoaded", restoreOption);
document.querySelector("form").addEventListener("submit", saveOption);
