const DB_NAME = "dfas_directory";
const DB_VERSION = 1;
const STORE_NAME = "products";

export interface DirectoryDB extends IDBDatabase {}

export const openDB = (): Promise<DirectoryDB> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error opening DB");

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "upc",
        });

        // Indexes for future filtering/search
        store.createIndex("brand", "brand", { unique: false });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("type", "type", { unique: false });
      }
    };
  });
};
