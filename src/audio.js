// Original procedural score and effects. One context, unlocked by a player gesture.
export const EFFECTS={
 attack:{notes:[180,90],duration:.18,type:'triangle',volume:.045},
 shot:{notes:[1100,70],duration:.13,type:'sawtooth',volume:.025},
 guard:{notes:[220,330],duration:.22,type:'triangle',volume:.035},
 skill:{notes:[220,440,660],duration:.45,type:'sine',volume:.035},
 heal:{notes:[392,494,587],duration:.55,type:'sine',volume:.025},
 hit:{notes:[95,45],duration:.16,type:'triangle',volume:.045},
 heavy:{notes:[65,32],duration:.35,type:'sawtooth',volume:.025},
 step:{notes:[85,60],duration:.045,type:'triangle',volume:.008},
 interact:{notes:[440,523],duration:.10,type:'sine',volume:.012},
 discover:{notes:[330,440,660],duration:.5,type:'sine',volume:.025},
 encounter:{notes:[110,82,55],duration:.5,type:'triangle',volume:.035},
 victory:{notes:[262,330,392,523],duration:.8,type:'sine',volume:.025},
};
export function createAudioDirector(){let context,timer,nodes=new Set(),enabled=false,scene='courtyard',destroyed=false,activation=0;
 function stop(){clearInterval(timer);timer=null;for(const node of nodes){try{node.stop();}catch{}}nodes.clear();}
 function voice(frequency,type,volume,start,duration,end=frequency){const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),start+duration);gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(volume,start+Math.min(.01,duration*.15));gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(gain);gain.connect(context.destination);nodes.add(osc);osc.onended=()=>{nodes.delete(osc);osc.disconnect();gain.disconnect();};osc.start(start);osc.stop(start+duration+.01);}
 function phrase(){if(!enabled||context?.state!=='running')return;const warm=scene==='hope',battle=scene==='battle',marsh=['greyfen','hollows','beacon'].includes(scene),base=warm?146.83:battle?82.41:marsh?98:110;
  for(const [index,ratio] of [1,warm?1.25:1.2,1.5].entries())voice(base*ratio,index?'sine':'triangle',index?.009:.015,context.currentTime,7.8);
 }
 return {async setEnabled(value){const token=++activation;enabled=Boolean(value)&&!destroyed;stop();if(enabled){try{context??=new (window.AudioContext||window.webkitAudioContext)();await context.resume();if(token!==activation||!enabled)return enabled;phrase();timer=setInterval(phrase,8000);}catch{enabled=false;}}else if(context)await context.suspend();return enabled;},
 effect(name){const effect=EFFECTS[name];if(!effect||!enabled||context?.state!=='running'||destroyed)return false;const start=context.currentTime;for(const [i,note] of effect.notes.entries())voice(note,effect.type,effect.volume,start+i*effect.duration/effect.notes.length,effect.duration/effect.notes.length,effect.notes[i+1]||note);return true;},
 setScene(value){if(scene===value)return;scene=value;stop();if(enabled){phrase();timer=setInterval(phrase,8000);}},get enabled(){return enabled;},destroy(){destroyed=true;activation++;enabled=false;stop();context?.close();}};
}
