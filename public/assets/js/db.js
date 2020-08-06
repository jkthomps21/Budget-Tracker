let db;
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(error);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingObjectStore = transaction.objectStore("pending");
    pendingObjectStore.add(record);
}

function checkDatabase() {
    console.log(db);
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingObjectStore = transaction.objectStore("pending");
    const getAll = pendingObjectStore.getAll();

    getAll.onsuccess = function () {
        console.log("[DB] Onsuccess triggered");
        console.log(getAll.result);
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const pendingObjectStore = transaction.objectStore("pending");
                    pendingObjectStore.clear();
                });
        }
    };
}

window.addEventListener("online", checkDatabase);