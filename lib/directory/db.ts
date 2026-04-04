const DB_NAME = "dfas_directory";
const DB_VERSION = 1;
const STORE_NAME = "products";

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Error opening IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "barcode",
        });

        store.createIndex("brand", "brand", { unique: false });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("productCategory", "productCategory", {
          unique: false,
        });
      }
    };
  });
};
