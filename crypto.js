const enc=new TextEncoder(),dec=new TextDecoder();
const b64=b=>{const u=new Uint8Array(b);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode(...u.subarray(i,i+8192));return btoa(s)},ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(code,salt){const k=await crypto.subtle.importKey("raw",enc.encode(code),"PBKDF2",false,["deriveKey"]);
return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:150000,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
async function encrypt(obj,code){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(code,salt),enc.encode(JSON.stringify(obj)));return{s:b64(salt),i:b64(iv),c:b64(ct)}}
async function decrypt(e,code){try{const p=await crypto.subtle.decrypt({name:"AES-GCM",iv:ub64(e.i)},await key(code,ub64(e.s)),ub64(e.c));return JSON.parse(dec.decode(p))}catch(x){return null}}
async function encryptBytes(bytes,code){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
const ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(code,salt),bytes));const o=new Uint8Array(28+ct.length);o.set(salt);o.set(iv,16);o.set(ct,28);return o}
async function decryptBytes(b,code){return new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv:b.slice(16,28)},await key(code,b.slice(0,16)),b.slice(28)))}
