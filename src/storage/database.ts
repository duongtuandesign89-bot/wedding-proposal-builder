export const DB_NAME = 'solis-proposal-builder'
export const DB_VERSION = 1

export function openDatabase(factory: IDBFactory | undefined): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!factory) { reject(new Error('IndexedDB unavailable')); return }
    const request = factory.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('proposals')) db.createObjectStore('proposals', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('images')) db.createObjectStore('images', { keyPath: 'id' })
    }
    request.onerror = () => reject(request.error ?? new Error('Cannot open IndexedDB'))
    request.onblocked = () => reject(new Error('IndexedDB upgrade blocked: close other Solis tabs'))
    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => db.close()
      resolve(db)
    }
  })
}
export function readRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
}
export function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed'))
  })
}
