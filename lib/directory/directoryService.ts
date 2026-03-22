import { openDB } from "./db";
import { Product } from "./types";

const STORE_NAME = "products";

export const saveProduct = async (product: Product): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(product);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save product");
  });
};

export const getProductByUPC = async (upc: string): Promise<Product | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(upc);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject("Failed to fetch product");
  });
};

export const getAllProducts = async (): Promise<Product[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject("Failed to fetch products");
  });
};

export const deleteProduct = async (upc: string): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(upc);

    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to delete product");
  });
};
