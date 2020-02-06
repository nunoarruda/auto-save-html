let targetSitesList: string[] = [];

function onOptionsError(error: any) {
  console.error(`Error: ${error}`);
}

function showSelectOptions(selectElement: HTMLSelectElement | null) {
  function addSelectOptions() {
    // cleanup possible previous options
    while (selectElement?.lastChild) {
      selectElement.removeChild(selectElement.lastChild);
    }

    // add options
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
      const targets = storageObject.targetSites as string[] | undefined;

      if (targets?.length) {
        targetSitesList = targets;
        addSelectOptions();
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
    .then(() => console.log('Site added:', site))
    .catch(onOptionsError);
}

function deleteSite(index: number) {
  const deletedElements = targetSitesList.splice(index, 1);

  browser.storage.local
    .set({targetSites: targetSitesList})
    .then(() => console.log('Site deleted:', deletedElements))
    .catch(onOptionsError);
}

function initOptions() {
  const form = document.getElementById('optionsForm') as HTMLFormElement | null;
  const selectElement = document.getElementById('selectElement') as HTMLSelectElement | null;
  const deleteButton = document.getElementById('deleteButton') as HTMLInputElement | null;
  const inputElement = document.getElementById('siteInput') as HTMLInputElement | null;

  showSelectOptions(selectElement);

  browser.storage.onChanged.addListener((changes: browser.storage.ChangeDict, areaName: browser.storage.StorageName) => {
    if (areaName === 'local') {
      showSelectOptions(selectElement);
    }
  });

  deleteButton?.addEventListener('click', ev => {
    if (selectElement) {
      deleteSite(selectElement.selectedIndex);
    }
    
    ev.preventDefault();
  });

  form?.addEventListener('submit', ev => {
    if (inputElement) {
      addSite(inputElement.value);
    }
    
    ev.preventDefault();
  });
}

document.addEventListener('DOMContentLoaded', initOptions);
