// Five safe ASCII characters carry four image bytes. Excluding HTML/JS quoting
// characters avoids escape overhead, and preserves every byte of the artwork.
export const BASE85_ALPHABET=Array.from({length:94},(_,i)=>String.fromCharCode(i+33)).filter(c=>!['"',"'",'<','>','`','\\','&','/'].includes(c)).slice(0,85).join('');
export function encode85(bytes){
 const parts=[];
 for(let i=0;i<bytes.length;i+=4){
   let n=(bytes[i]*16777216+(bytes[i+1]||0)*65536+(bytes[i+2]||0)*256+(bytes[i+3]||0));
   let group='';for(let j=0;j<5;j++){group=BASE85_ALPHABET[n%85]+group;n=Math.floor(n/85);}parts.push(group);
 }
 return parts.join('');
}
export function decode85(data,size,alphabet){
 const digits=new Int16Array(128);digits.fill(-1);for(let i=0;i<alphabet.length;i++)digits[alphabet.charCodeAt(i)]=i;
 const bytes=new Uint8Array(size);let output=0;
 for(let i=0;i<data.length;i+=5){let n=0;for(let j=0;j<5;j++)n=n*85+digits[data.charCodeAt(i+j)];
   for(let j=3;j>=0;j--){if(output+j<size)bytes[output+j]=n%256;n=Math.floor(n/256);}output+=4;
 }
 return bytes;
}
