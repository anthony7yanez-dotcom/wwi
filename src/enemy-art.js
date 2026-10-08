export const ENEMY_VISUALS={
 wolf:{rows:12,base:0,columns:5,worldHeight:40,battleHeight:86,color:'#c96042'},
 sentinel:{rows:12,base:4,columns:6,worldHeight:62,battleHeight:120,color:'#d68562'},
 warden:{rows:12,base:8,columns:6,worldHeight:96,battleHeight:170,color:'#6ac6ce'},
 skeleton:{rows:10,base:0,columns:6,worldHeight:62,battleHeight:116,color:'#e5d7ab',variety:true},
 succubus:{rows:10,base:2,columns:6,worldHeight:65,battleHeight:120,color:'#c291ea',variety:true},
 ogre:{rows:10,base:4,columns:6,worldHeight:91,battleHeight:172,color:'#a4b17d',variety:true},
 undead:{rows:10,base:6,columns:6,worldHeight:60,battleHeight:112,color:'#8bc79e',variety:true},
 vampire:{rows:10,base:8,columns:6,worldHeight:67,battleHeight:126,color:'#e77880',variety:true},
};
const walkPoses={skeleton:[0,1,2,3,5,2],undead:[0,1,2,4,5,2],vampire:[0,1,2,4,5,2]};
export function enemyWalk(id,distance,reduced=false){const v=ENEMY_VISUALS[id],frame=reduced?0:Math.floor(distance/(id==='ogre'?11:7))%v.columns;return {row:v.base,frame:walkPoses[id]?.[frame]??frame,...v};}
