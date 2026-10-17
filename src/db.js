const connection=new Promise((resolve,reject)=>{const request=indexedDB.open('raahi',1);request.onupgradeneeded=()=>{request.result.createObjectStore('data');request.result.createObjectStore('pendingChanges',{keyPath:'id',autoIncrement:true});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
export async function read(key,fallback=null){const db=await connection;return new Promise((resolve,reject)=>{const req=db.transaction('data').objectStore('data').get(key);req.onsuccess=()=>resolve(req.result??fallback);req.onerror=()=>reject(req.error);});}
export async function save(key,value){const db=await connection;return new Promise((resolve,reject)=>{const tx=db.transaction(['data','pendingChanges'],'readwrite');tx.objectStore('data').put(value,key);tx.objectStore('pendingChanges').add({key,value,updatedAt:new Date().toISOString()});tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}

// Keep the transcript, extracted data and confirmation in one atomic transaction.
export async function saveOnboarding(state) {
  const db = await connection;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['data', 'pendingChanges'], 'readwrite');
    const records = { onboarding: state };
    if (state.onboardingComplete) records.profile = state.profile;
    for (const [key, value] of Object.entries(records)) {
      tx.objectStore('data').put(value, key);
      tx.objectStore('pendingChanges').add({ key, value, updatedAt: new Date().toISOString() });
    }
    tx.oncomplete = () => resolve(state);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// Clear records, not the database or service-worker cache: reset also works offline.
export async function clearAllRaahiData() {
  const db = await connection;
  // Remove only Raahi's keys; other apps on the same origin are left alone.
  for (const key of Object.keys(localStorage)) {
    if (/^raahi/i.test(key)) localStorage.removeItem(key);
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['data', 'pendingChanges'], 'readwrite');
    tx.objectStore('data').clear();
    tx.objectStore('pendingChanges').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
