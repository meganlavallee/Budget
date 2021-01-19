var db;
const budget = indexedDB.open("budget", 1);

budget.onupgradeneeded = function (e) {
  const db = e.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

budget.onsuccess = function (e) {
  db = e.target.result;
  if (navigator.onLine) {
    budgetDatabase();
  }
};

budget.onerror = function (e) {
  console.log("err! " + e.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

function budgetDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const bulk = store.get();
  bulk.onsuccess = function () {
    console.log(bulk);
    if (bulk.result.length > 0) {
      fetch("/api/transaction/", {
        method: "POST",
        body: JSON.stringify(bulk.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

window.addEventListener("ran through", budgetDatabase);
