let targetSiteElement: HTMLInputElement | null = null;

function restoreOption() {
  targetSiteElement = document.querySelector("#target-site");

  function setCurrentChoice(result: any) {
    if (targetSiteElement) {
      targetSiteElement.value = result.targetSite || "*://*.example.com/*";
    }
  }

  function onError(error: any) {
    console.log(`Error: ${error}`);
  }

  const getting = browser.storage.local.get("targetSite");
  getting.then(setCurrentChoice, onError);
}

function saveOption(ev: Event) {
  browser.storage.local
    .set({
      targetSite: targetSiteElement ? targetSiteElement.value : '*://*.example.com/*'
    })
    .then(() => browser.runtime.reload())
    .catch(err => console.error(err));

  ev.preventDefault();
}

document.addEventListener("DOMContentLoaded", restoreOption);
const form = document.querySelector("form");
if (form) {
  form.addEventListener("submit", saveOption);
}
