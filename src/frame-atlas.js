import { ENEMY_VISUALS } from './enemy-art.js';
// Atlas registration is a renderer concern: original artwork remains untouched.
// Generated sheets have uneven row spacing; fixed fractions can cut off feet
// or leak pixels from the next action into the current one.
const rowsCache=new WeakMap(),sheetCache=new Map();
export function measureRows(pixels,width,height,channels,rows){
 const counts=Array.from({length:height},(_,y)=>{let n=0;for(let x=0;x<width;x++)if(pixels[(y*width+x)*channels+3]>128)n++;return n;});
 const boundaries=[0],stride=height/rows;
 for(let row=1;row<rows;row++){
  const nominal=row*stride,lo=Math.max(boundaries.at(-1)+Math.floor(stride*.6),Math.floor(nominal-stride*.22)),hi=Math.min(height-1,Math.ceil(nominal+stride*.22));let best=Math.round(nominal),score=Infinity;
  for(let y=lo;y<=hi;y++){const occupancy=(counts[y-1]+counts[y]+counts[y+1])/3;const value=occupancy+Math.abs(y-nominal)*.08;if(value<score){score=value;best=y;}}
  boundaries.push(best);
 }
 boundaries.push(height);return boundaries;
}
function rowBounds(image,rows){let cache=rowsCache.get(image);if(!cache){cache=new Map();rowsCache.set(image,cache);}if(cache.has(rows))return cache.get(rows);
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const bounds=measureRows(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height,4,rows);cache.set(rows,bounds);return bounds;
}
export function frameRect(image,columns,rows,row,frame){const bounds=rowBounds(image,rows),sx=Math.round(frame*image.naturalWidth/columns),end=Math.round((frame+1)*image.naturalWidth/columns);return {sx,sy:bounds[row],sw:end-sx,sh:bounds[row+1]-bounds[row]};}
export function silhouette(pixels,width,height){
 const seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let best={area:0,left:0,right:width,top:0,bottom:height,foot:width/2};
 for(let origin=0;origin<seen.length;origin++){
  if(seen[origin]||pixels[origin*4+3]<128)continue;let read=0,write=1,left=width,right=0,top=height,bottom=0;queue[0]=origin;seen[origin]=1;
  while(read<write){const i=queue[read++],x=i%width,y=Math.floor(i/width);left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);
   if(pixels[i*4+3]>180&&Math.max(pixels[i*4],pixels[i*4+1],pixels[i*4+2])>48)bottom=Math.max(bottom,y+1);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy,j=ny*width+nx;if(nx<0||nx>=width||ny<0||ny>=height||seen[j]||pixels[j*4+3]<128)continue;seen[j]=1;queue[write++]=j;}
  }
  if(write>best.area){let sum=0,n=0;for(let j=0;j<write;j++){const i=queue[j],y=Math.floor(i/width);if(y>=bottom-5&&y<bottom&&pixels[i*4+3]>180&&Math.max(pixels[i*4],pixels[i*4+1],pixels[i*4+2])>48){sum+=i%width;n++;}}best={area:write,left:Math.max(0,left-2),right:Math.min(width,right+2),top:Math.max(0,top-2),bottom:Math.min(height,(bottom||height)+1),foot:n?sum/n:width/2};}
 }
 return best;
}
export async function registeredSheet(url,columns,rows,enemy=false){const key=url+':'+columns+':'+rows+':'+enemy;if(sheetCache.has(key))return sheetCache.get(key);
 const pending=(async()=>{const image=new Image();image.src=url;await image.decode();const cell=Math.ceil(Math.max(image.width/columns,image.height/rows)),atlas=document.createElement('canvas');atlas.width=columns*cell;atlas.height=rows*cell;const ctx=atlas.getContext('2d');ctx.imageSmoothingEnabled=false;const frames=[];
  for(let row=0;row<rows;row++){for(let frame=0;frame<columns;frame++){
   // Wolf death has six cells while its other rows have five. Normalize all
   // enemy rows to six columns, repeating the last pose only when necessary.
   const count=enemy&&row<3?5:columns,sourceFrame=Math.min(frame,count-1),r=frameRect(image,count,rows,row,sourceFrame),sample=document.createElement('canvas');sample.width=r.sw;sample.height=r.sh;const sc=sample.getContext('2d',{willReadFrequently:true});sc.drawImage(image,r.sx,r.sy,r.sw,r.sh,0,0,r.sw,r.sh);const b=silhouette(sc.getImageData(0,0,r.sw,r.sh).data,r.sw,r.sh);frames.push({row,frame,r,b});
  }await new Promise(resolve=>requestAnimationFrame(resolve));}
  // Keep one scale across every action. Uneven padding must never make an
  // attacking character shrink; allow enough room for off-center weapons.
  const extent=Math.max(...frames.map(({b})=>Math.max(b.bottom-b.top,2*(b.foot-b.left),2*(b.right-b.foot)))),scale=Math.min(1,cell*.9/extent);
  const pose=document.createElement('canvas');pose.width=pose.height=cell;const pc=pose.getContext('2d',{willReadFrequently:true});pc.imageSmoothingEnabled=false;
  for(const {row,frame,r,b} of frames){pc.clearRect(0,0,cell,cell);pc.drawImage(image,r.sx+b.left,r.sy+b.top,b.right-b.left,b.bottom-b.top,cell/2+(b.left-b.foot)*scale,cell*.94-(b.bottom-b.top)*scale,(b.right-b.left)*scale,(b.bottom-b.top)*scale);
   // Nearest-neighbor scaling can omit a one-pixel heel. Register the visible
   // result again so that resampling cannot reintroduce idle foot jitter.
   const visible=silhouette(pc.getImageData(0,0,cell,cell).data,cell,cell),dx=Math.round(cell/2-visible.foot),dy=Math.round(cell*.94-visible.bottom);ctx.save();ctx.beginPath();ctx.rect(frame*cell,row*cell,cell,cell);ctx.clip();ctx.drawImage(pose,frame*cell+dx,row*cell+dy);ctx.restore();if(frame===columns-1)await new Promise(resolve=>requestAnimationFrame(resolve));
  }
  return atlas.toDataURL('image/png');
 })();sheetCache.set(key,pending);return pending;
}
export function registerSprites(root){const pending=[];
 for(const el of root.querySelectorAll('.frame-sprite,.battle-enemy')){
  const enemy=el.classList.contains('battle-enemy');if(enemy&&!el.closest('.party-arena'))continue;
  const url=getComputedStyle(el).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];if(!url)continue;
  const rows=Number(el.dataset.rows||(enemy?12:4));pending.push(registeredSheet(url,6,rows,enemy&&rows===12).then(async value=>{if(!el.isConnected)return;el.style.backgroundImage=`url("${value}")`;if(enemy){el.style.backgroundSize=`600% ${rows*100}%`;const v=ENEMY_VISUALS[el.dataset.enemy],img=new Image();img.src=value;await img.decode();const cell=img.width/6,sample=document.createElement('canvas');sample.width=sample.height=cell;const sc=sample.getContext('2d',{willReadFrequently:true});sc.drawImage(img,0,v.base*cell,cell,cell,0,0,cell,cell);const body=silhouette(sc.getImageData(0,0,cell,cell).data,cell,cell);el.style.setProperty('--enemy-size',`${v.battleHeight*cell/(body.bottom-body.top)}px`);el.dataset.aimY=String(.94-(body.bottom-body.top)/cell/2);el.dataset.bodyHeight=String(v.battleHeight);}el.dataset.registered='true';}).catch(()=>{el.dataset.registered='false';}));
 }
 return Promise.all(pending);
}
