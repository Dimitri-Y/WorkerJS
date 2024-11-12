const offlineForm = document.getElementById('offline-form');
const dataField = document.getElementById('data-field');
const submitButton = document.getElementById('submit-button');
const clearCacheButton = document.getElementById('clear-cache-button');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(function (registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
}

offlineForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = dataField.value;
    localStorage.setItem('offlineData', value);
    navigator.serviceWorker.controller.postMessage({
        type: 'SAVE_TO_LOCAL_STORAGE',
        key: 'offlineData',
        value: value
    });
    alert('Дані збережено для офлайн використання!');
});

document.addEventListener('DOMContentLoaded', (event) => {
    if (localStorage.getItem('offlineData')) {
        dataField.value = localStorage.getItem('offlineData');
    }

});

clearCacheButton.addEventListener('click', () => {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE'
        });
        alert('Кеш видалено успішно!');
    }
});