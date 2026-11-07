const enc=new TextEncoder(),dec=new TextDecoder();
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))),ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(code,salt){const k=await crypto.subtle.importKey("raw",enc.encode(code),"PBKDF2",false,["deriveKey"]);
return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:150000,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
async function encrypt(obj,code){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(code,salt),enc.encode(JSON.stringify(obj)));return{s:b64(salt),i:b64(iv),c:b64(ct)}}
async function decrypt(e,code){try{const p=await crypto.subtle.decrypt({name:"AES-GCM",iv:ub64(e.i)},await key(code,ub64(e.s)),ub64(e.c));return JSON.parse(dec.decode(p))}catch(x){return null}}
