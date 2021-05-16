const indexedDB =
  window.indexedDB ||
  window.msIndexedDB ||
  window.webkitIndexedDB ||
  window.mozIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

//onupgradeneeded is an interface is the event handler for the upgradeneeded event, triggered when a database of a bigger version number than the existing stored database is loaded.

request.onupgradeneeded = (event) => {
    event.target.result.createObjectStore("pending", {
      keyPath: "id",
      autoIncrement: true
    });
  };

  //on error display error; otherwise proceed
  request.onerror = (err) => {
    console.log(err.message);
  };
  
  request.onsuccess = (event) => {
    db = event.target.result;
  
    if (navigator.onLine) {
      checkDatabase();
    }
  };

  // Function is clled when user does offline inquiry
  function saveRecord(record) {
    const transaction = db.transaction("pending", "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
  }

  //When user goes back online, what was done OFFLINE will be sent to server

function checkDatabase() {
    const transaction = db.transaction("pending", "readonly");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
          fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json"
            }
          })
            .then((response) => response.json())
            .then(() => {
              const transaction = db.transaction("pending", "readwrite");
              const store = transaction.objectStore("pending");
              store.clear();
            });
        }
      };
    }
  
window.addEventListener("online", checkDatabase);