function restoreOption() {
    function setCurrentChoice(result) {
        document.querySelector('#target-site').value = result.targetSite || 'https://example.com/*';
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    const getting = browser.storage.local.get('targetSite');
    getting.then(setCurrentChoice, onError);
}

function saveOption(e) {
    browser.storage.local.set({
        targetSite: document.querySelector('#target-site').value
    });
    browser.runtime.reload();
    e.preventDefault();
}

document.addEventListener('DOMContentLoaded', restoreOption);
document.querySelector('form').addEventListener('submit', saveOption);
