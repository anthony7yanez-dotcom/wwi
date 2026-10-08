// Authored loops stay within the open roads; positions are derived from saved distance.
export const PATROLS = {
  'wood-wolf':{speed:34,points:[[304,336],[400,336],[400,384],[304,384]]},
  'wood-sentinel':{speed:24,points:[[480,160],[480,240],[432,240],[432,160]]},
  'glade-wolf':{speed:30,points:[[784,352],[848,352],[848,384],[784,384]]},
  'shrine-warden':{speed:18,points:[[480,304],[544,304],[544,352],[480,352]]},
};
export function patrolLength(id){const points=PATROLS[id].points;return points.reduce((length,p,i)=>{const next=points[(i+1)%points.length];return length+Math.hypot(next[0]-p[0],next[1]-p[1]);},0);}
export function patrolPose(id,distance=0){
  const points=PATROLS[id].points;let remaining=((distance%patrolLength(id))+patrolLength(id))%patrolLength(id);
  for(let i=0;i<points.length;i++){
    const [x,y]=points[i],[tx,ty]=points[(i+1)%points.length],dx=tx-x,dy=ty-y,length=Math.hypot(dx,dy);
    if(remaining<length)return {x:x+dx*remaining/length,y:y+dy*remaining/length,facing:Math.abs(dx)>Math.abs(dy)?(dx>0?'east':'west'):(dy>0?'south':'north'),distance};
    remaining-=length;
  }
}
export function validPatrols(value){return value===undefined||Boolean(value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([id,distance])=>Object.hasOwn(PATROLS,id)&&Number.isFinite(distance)&&distance>=0&&distance<patrolLength(id)));}
