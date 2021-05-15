const indexedDB =
  window.indexedDB ||
  window.msIndexedDB ||
  window.webkitIndexedDB ||
  window.mozIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

window.addEventListener("online", checkDatabase);