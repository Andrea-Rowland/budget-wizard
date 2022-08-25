// create variable to hold db connection
let db;
const indexedDB = 
  window.indexedDB || 
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

// establish a connection to IndexedDB database called 'budget_wizard' and set it to version 1
const request = indexedDB.open('budget_wizard', 1);

// this event will emit if the database version changes (nonexistent to version 1, v1 ro v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table) called 'pending', set it to have an aut incrementing primary key of sorts
    db.createObjectStore('pending', { autoIncrement: true });
};

// upon successful
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradeneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        // we haven't created this yet but will soon
        checkDatabase();
        // uploadTransaction();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode)
};

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['pending'], 'readwrite');

    // access the object store for 'pending'
    const transactionObjectStore = transaction.objectStore('pending');

    // add record to your store with add method
    transactionObjectStore.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => {        
          return response.json();
        })
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
      }
    };
  }
  
  window.addEventListener("online", checkDatabase);
  