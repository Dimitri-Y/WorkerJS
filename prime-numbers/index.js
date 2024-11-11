var statusDisplay;
var worker;
var searchButtonWorker;
var searchButtonAsync;
var searchButtonSync;
var cancelButton;
var primeContainer;
var asyncController;

window.onload = function () {
  statusDisplay = document.getElementById("status");
  searchButtonWorker = document.getElementById("searchButtonWorker");
  searchButtonAsync = document.getElementById("searchButtonAsync");
  searchButtonSync = document.getElementById("searchButtonSync");
  cancelButton = document.getElementById("cancelButton");
  primeContainer = document.getElementById("primeContainer");
};

function doSearchWithWorker() {
  primeContainer.innerHTML = '';
  searchButtonWorker.disabled = true;

  var fromNumber = parseInt(document.getElementById("from").value.trim());
  var toNumber = parseInt(document.getElementById("to").value.trim());

  if (isNaN(fromNumber) || isNaN(toNumber)) {
    cancelSearch('Причина: введено не числа');
    return;
  }

  if (fromNumber <= 0) {
    cancelSearch('Причина: початок відліку повинен бути натуральним числом, більше 0');
    return;
  }

  var blob = new Blob([document.querySelector('#FindPrimes').textContent]);
  var blobURL = window.URL.createObjectURL(blob);

  worker = new Worker(blobURL);
  worker.onmessage = receivedWorkerMessage;
  worker.onerror = workerError;

  worker.postMessage({ from: fromNumber, to: toNumber });

  statusDisplay.innerHTML = `Веб воркер працює від (${fromNumber} до ${toNumber}) ...`;
}

function receivedWorkerMessage(event) {
  var message = event.data;

  if (message.type === "PrimeList") {
    var primes = message.data;
    displayPrimes(primes);
  } else if (message.type === "Progress") {
    statusDisplay.innerHTML = message.data + "% виконано ...";
  }
}

function workerError(error) {
  statusDisplay.innerHTML = error.message;
}

function cancelSearch(errorMessage) {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  if (asyncController) { asyncController.abort(); }
  primeContainer.innerHTML = '';
  statusDisplay.innerHTML = `Пошук відмовлено. ${errorMessage}`;

  enableButtons();
}

function enableButtons() {
  searchButtonWorker.disabled = false;
  searchButtonAsync.disabled = false;
  searchButtonSync.disabled = false;
}

function displayPrimes(primes) {
  primeContainer.innerHTML = '';
  var primeList = primes.join(", ");
  var displayList = document.getElementById("primeContainer");
  displayList.innerHTML = primeList;

  if (primeList.length === 0) {
    statusDisplay.innerHTML = "Не знайдено ні одного результату.";
  } else {
    statusDisplay.innerHTML = "Результати:";
  }
  enableButtons();
}

// Асинхронний пошук простих чисел
async function doSearchAsync() {
  primeContainer.innerHTML = '';
  searchButtonAsync.disabled = true;

  var fromNumber = parseInt(document.getElementById("from").value.trim());
  var toNumber = parseInt(document.getElementById("to").value.trim());

  if (isNaN(fromNumber) || isNaN(toNumber)) {
    cancelSearch('Причина: введено не числа');
    return;
  }

  if (fromNumber <= 0) {
    cancelSearch('Причина: початок відліку повинен бути натуральним числом, більше 0');
    return;
  }

  statusDisplay.innerHTML = `Асинхронний пошук працює від (${fromNumber} до ${toNumber}) ...`;
  asyncController = new AbortController();
  const { signal } = asyncController;
  try {
    const primes = await findPrimesAsync(fromNumber, toNumber, signal);
    displayPrimes(primes);
  }
  catch (error) {
    if (error.name === 'AbortError') { statusDisplay.innerHTML = 'Асинхронний пошук відмінено.'; }
    else {
      statusDisplay.innerHTML = `Помилка: ${error.message}`;
    } enableButtons();
  }
}

async function findPrimesAsync(fromNumber, toNumber, signal) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (signal.aborted) {
        reject(new DOMException('Відмінено', 'AbortError'));
        return;
      }
      const primes = [];
      for (let i = fromNumber; i <= toNumber; i++) {
        if (isPrime(i))
          primes.push(i);
      }
      resolve(primes);
    }, 0);
  });
}

function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

// Синхронний пошук простих чисел
function doSearchSync() {
  primeContainer.innerHTML = '';
  searchButtonSync.disabled = true;

  var fromNumber = parseInt(document.getElementById("from").value.trim());
  var toNumber = parseInt(document.getElementById("to").value.trim());

  if (isNaN(fromNumber) || isNaN(toNumber)) {
    cancelSearch('Причина: введено не числа');
    return;
  }

  if (fromNumber <= 0) {
    cancelSearch('Причина: початок відліку повинен бути натуральним числом, більше 0');
    return;
  }

  statusDisplay.innerHTML = `Синхронний пошук працює від (${fromNumber} до ${toNumber}) ...`;

  const primes = findPrimesSync(fromNumber, toNumber);
  displayPrimes(primes);
}

function findPrimesSync(fromNumber, toNumber) {
  const primes = [];
  for (let i = fromNumber; i <= toNumber; i++) {
    if (isPrime(i)) primes.push(i);
  }
  return primes;
}
