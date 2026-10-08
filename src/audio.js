import { ABILITY_PRESENTATIONS } from './ability-presentation.js';
// Original synthesized music: no downloads, streaming, or autoplay.
export const EFFECTS={
 attack:{notes:[180,90],duration:.18,type:'triangle',volume:.045},
 shot:{notes:[1100,70],duration:.13,type:'sawtooth',volume:.025,noise:.12},
 guard:{notes:[220,330],duration:.22,type:'triangle',volume:.035},
 skill:{notes:[220,440,660],duration:.45,type:'sine',volume:.035},
 heal:{notes:[392,494,587],duration:.55,type:'sine',volume:.025},
 hit:{notes:[95,45],duration:.16,type:'triangle',volume:.045},
 heavy:{notes:[65,32],duration:.35,type:'sawtooth',volume:.025,noise:.25},
 step:{notes:[85,60],duration:.045,type:'triangle',volume:.008},
 interact:{notes:[440,523],duration:.10,type:'sine',volume:.012},
 discover:{notes:[330,440,660],duration:.5,type:'sine',volume:.025},
 encounter:{notes:[110,82,55],duration:.5,type:'triangle',volume:.035},
 victory:{notes:[262,330,392,523],duration:.8,type:'sine',volume:.025},
 'sword-swing':{notes:[360,170],duration:.22,type:'triangle',volume:.018,noise:.2,filter:2200},
 'sword-impact':{notes:[1480,2310,740],duration:.28,type:'sine',volume:.028,noise:.06,filter:3600},
 'shield-raise':{notes:[330,247,165],duration:.24,type:'triangle',volume:.03},
 'shield-impact':{notes:[740,370,185],duration:.32,type:'triangle',volume:.04,noise:.09,filter:1300},
 'axe-swing':{notes:[200,90],duration:.30,type:'triangle',volume:.025,noise:.28,filter:1100},
 'axe-impact':{notes:[220,110,55],duration:.3,type:'triangle',volume:.045,noise:.11,filter:600},
 'hammer-swing':{notes:[150,70],duration:.32,type:'sine',volume:.028,noise:.25,filter:800},
 'hammer-impact':{notes:[98,196,73],duration:.4,type:'triangle',volume:.04,noise:.18,filter:450},
 'fist-swing':{notes:[300,160],duration:.14,type:'sine',volume:.014,noise:.12,filter:1700},
 'fist-impact':{notes:[130,65],duration:.16,type:'triangle',volume:.035,noise:.07,filter:500},
 'shot-impact':{notes:[240,80],duration:.15,type:'triangle',volume:.03,noise:.08,filter:800},
 'cloth-brace':{notes:[130,180],duration:.2,type:'sine',volume:.02,noise:.1,filter:800},
 'ward-raise':{notes:[247,370,494],duration:.35,type:'sine',volume:.025},
 'arcane-launch':{notes:[330,660,990],duration:.28,type:'sine',volume:.025},
 'arcane-impact':{notes:[880,440,220],duration:.32,type:'sine',volume:.03},
 'hex-launch':{notes:[233,277,370],duration:.34,type:'triangle',volume:.022},
 'hex-impact':{notes:[370,311,185],duration:.4,type:'sine',volume:.03},
 forge:{notes:[880,1760,440],duration:.35,type:'triangle',volume:.035,noise:.08,filter:2400},
};
for(const [id,p] of Object.entries(ABILITY_PRESENTATIONS))EFFECTS[id]={notes:p.notes,duration:p.duration/1000*.55,type:id.startsWith('warrior')?'triangle':id.startsWith('gunslinger')?'sawtooth':'sine',volume:.026,noise:['fan','embers','rain','stones','fracture'].includes(p.shape)?.14:0,filter:1500};
for(const [id,p] of Object.entries(ABILITY_PRESENTATIONS))EFFECTS[id+'-impact']={notes:[p.notes.at(-1),p.notes[0]/2],duration:.18,type:'triangle',volume:.022};
for(const [id,notes] of Object.entries({knight:[196,392,294],warrior:[110,165,330],paladin:[262,392,523],sorcerer:[220,440,880],witch:[233,311,466],gunslinger:[1320,660,110],monk:[294,392,587]}))EFFECTS[id+'-ability']={notes,duration:.48,type:'triangle',volume:.027};
export const MUSIC={
 courtyard:{title:'Coals Beneath the Veil',bpm:68,root:45,chords:[0,5,3,7],melody:[12,null,15,19,17,null,15,14],drums:false},
 forest:{title:'The Lantern Road',bpm:76,root:45,chords:[0,3,5,7],melody:[12,15,null,14,7,10,12,null],drums:false},
 dungeon:{title:'Stone Remembers',bpm:62,root:38,chords:[0,3,0,7],melody:[19,null,15,null,14,12,null,7],drums:false},
 marsh:{title:'Weight of a Promise',bpm:72,root:43,chords:[0,5,7,3],melody:[12,14,15,null,19,17,14,null],drums:false},
 hope:{title:'One Warm Morning',bpm:74,root:50,chords:[0,5,7,0],melody:[12,16,19,null,21,19,16,14],major:true,drums:false},
 battle:{title:'Steel Against the Night',bpm:124,root:40,chords:[0,3,5,7],melody:[12,7,15,14,12,19,17,14],drums:true},
 boss:{title:'Oath of the Last Guardian',bpm:144,root:38,chords:[0,1,5,7],melody:[12,13,19,12,20,19,13,7],drums:true},
};
export function musicForScene(scene){return scene==='boss'?MUSIC.boss:scene==='battle'?MUSIC.battle:scene==='hope'?MUSIC.hope:['greyfen','lornwatch'].includes(scene)?MUSIC.marsh:['shrine','sanctuary','hollows','beacon'].includes(scene)?MUSIC.dungeon:['forest','approach'].includes(scene)?MUSIC.forest:MUSIC.courtyard;}
const hz=midi=>440*2**((midi-69)/12);
export function createAudioDirector(){let context,timer,noiseBuffer,nodes=new Set(),enabled=false,scene='courtyard',destroyed=false,activation=0,nextBar=0,bar=0;
 function stop(){clearInterval(timer);timer=null;for(const node of nodes){try{node.stop();}catch{}}nodes.clear();}
 function envelope(source,start,duration,volume,filter){const gain=context.createGain();gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(volume,start+Math.min(.012,duration*.1));gain.gain.exponentialRampToValueAtTime(.0001,start+duration);let toneFilter;if(filter&&context.createBiquadFilter){toneFilter=context.createBiquadFilter();toneFilter.type='bandpass';toneFilter.frequency.value=filter;toneFilter.Q.value=.7;source.connect(toneFilter);toneFilter.connect(gain);}else source.connect(gain);gain.connect(context.destination);nodes.add(source);source.onended=()=>{nodes.delete(source);source.disconnect();toneFilter?.disconnect();gain.disconnect();};source.start(start);source.stop(start+duration+.01);}
 function voice(frequency,type,volume,start,duration,end=frequency){const osc=context.createOscillator();osc.type=type;osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),start+duration);envelope(osc,start,duration,volume);}
 function noise(start,duration,volume,filter=1800){if(!context.createBufferSource||!context.createBuffer)return voice(filter,'triangle',volume*.5,start,duration,80);if(!noiseBuffer){noiseBuffer=context.createBuffer(1,context.sampleRate,context.sampleRate);const data=noiseBuffer.getChannelData(0);let seed=93;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}}const source=context.createBufferSource();source.buffer=noiseBuffer;envelope(source,start,duration,volume,filter);}
 function schedule(){if(!enabled||context?.state!=='running')return;const score=musicForScene(scene),beat=60/score.bpm;if(nextBar<context.currentTime-.25)nextBar=context.currentTime;
  while(nextBar<context.currentTime+.5){const start=nextBar,root=score.root+score.chords[bar%4],third=score.major?4:3;
   for(const interval of [0,third,7])voice(hz(root+interval),'sine',.005,start,beat*3.8);
   for(let n=0;n<8;n++){const t=start+n*beat/2,note=score.melody[(n+(bar%2)*2)%8];if(note!==null)voice(hz(root+note),'triangle',score.drums?.012:.008,t,beat*.65);if(score.drums||n%2===0)voice(hz(root+(n%4===2?7:0)-12),'sine',.013,t,beat*.7);if(score.drums){if(n%2===0)voice(90,'sine',.022,t,.18,38);if(n%4===2)noise(t,.1,.008,1600);noise(t,.035,.0025,5200);}}
   nextBar+=beat*4;bar++;
  }
 }
 function startMusic(){clearInterval(timer);bar=0;nextBar=context.currentTime;schedule();timer=setInterval(schedule,250);}
 return {async setEnabled(value){const token=++activation;enabled=Boolean(value)&&!destroyed;stop();if(enabled){try{context??=new (window.AudioContext||window.webkitAudioContext)();await context.resume();if(token!==activation||!enabled)return enabled;startMusic();}catch{enabled=false;stop();}}else if(context)await context.suspend();return enabled;},
 effect(name){const effect=EFFECTS[name];if(!effect||!enabled||context?.state!=='running'||destroyed)return false;const start=context.currentTime;for(const [i,note] of effect.notes.entries())voice(note,effect.type,effect.volume,start+i*effect.duration/effect.notes.length,effect.duration/effect.notes.length,effect.notes[i+1]||note);if(effect.noise)noise(start,effect.noise,effect.volume*.65,effect.filter);return true;},
 setScene(value){if(scene===value)return;scene=value;stop();if(enabled&&context?.state==='running')startMusic();},get enabled(){return enabled;},get track(){return musicForScene(scene).title;},destroy(){destroyed=true;activation++;enabled=false;stop();context?.close();}};
}
