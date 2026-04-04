import { openDB } from "./db";
import type { Product } from "./types";

const STORE_NAME = "products";

export const saveProduct = async (product: Product): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.put(product);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(new Error("Failed to save product"));
    tx.onabort = () => reject(new Error("Save transaction was aborted"));
  });
};

export const getProductByBarcode = async (
  barcode: string
): Promise<Product | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(barcode);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error("Failed to fetch product"));
  });
};

export const getAllProducts = async (): Promise<Product[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Failed to fetch products"));
  });
};

export const deleteProduct = async (barcode: string): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(barcode);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to delete product"));
  });
};
