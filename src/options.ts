let targetSitesList: string[] = [];

function onOptionsError(error: any) {
  console.error(`Error: ${error}`);
}

function restoreTargetSites(selectElement: HTMLSelectElement | null) {
  function loadTargetSites() {
    targetSitesList.forEach(site => {
      const option = document.createElement('option');
      option.text = site;
      selectElement?.add(option);
    });
  }

  // Get target sites list
  browser.storage.local
    .get('targetSites')
    .then(storageObject => {
      if (storageObject.targetSites) {
        targetSitesList = storageObject.targetSites as string[]
        loadTargetSites();
      } else {
        // add example if there's no list yet
        addSite('*://*.example.com/*');
      }
    })
    .catch(onOptionsError);
}

function addSite(site: string) {
  targetSitesList.push(site);

  browser.storage.local
    .set({targetSites: targetSitesList})
    .then(() => browser.runtime.reload())
    .catch(onOptionsError);
}

function deleteSite(index: number) {
  targetSitesList.splice(index, 1);

  // add example if the list is empty
  if (!targetSitesList.length) {
    addSite('*://*.example.com/*');
  }

  browser.storage.local
    .set({targetSites: targetSitesList})
    .then(() => browser.runtime.reload())
    .catch(onOptionsError);
}

function init() {
  const form = document.querySelector('form');
  const selectElement = document.querySelector('select');
  const deleteButton = document.querySelector<HTMLInputElement>('#deleteButton');
  const inputElement = document.querySelector<HTMLInputElement>('#siteInput');

  restoreTargetSites(selectElement);

  deleteButton?.addEventListener('click', ev => {
    if (selectElement) {
      deleteSite(selectElement.selectedIndex);
    }
    
    ev.preventDefault();
  });

  form?.addEventListener('submit', ev => {
    if (inputElement) {
      addSite(inputElement.value)
    }
    
    ev.preventDefault();
  });
}

document.addEventListener('DOMContentLoaded', init);
