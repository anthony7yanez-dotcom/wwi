// Original optional ambient score. No downloads or autoplay are required.
export function createAudioDirector(){let context,timer,nodes=[],enabled=false,scene='courtyard';
 function stop(){clearInterval(timer);for(const node of nodes){try{node.stop();}catch{}}nodes=[];}
 function phrase(){if(!enabled||context?.state!=='running')return;const warm=scene==='hope',battle=scene==='battle',base=warm?146.83:battle?82.41:110;
  for(const [index,ratio] of [1,warm?1.25:1.2,1.5].entries()){const osc=context.createOscillator(),gain=context.createGain(),now=context.currentTime;osc.type=index?'sine':'triangle';osc.frequency.value=base*ratio;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(index?.009:.015,now+1.8);gain.gain.exponentialRampToValueAtTime(.0001,now+7.8);osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(now+8);nodes.push(osc);osc.onended=()=>{nodes=nodes.filter(n=>n!==osc);};}
 }
 return {async setEnabled(value){enabled=value;stop();if(value){try{context??=new (window.AudioContext||window.webkitAudioContext)();await context.resume();phrase();timer=setInterval(phrase,8000);}catch{enabled=false;}}else if(context)await context.suspend();return enabled;},setScene(value){if(scene===value)return;scene=value;stop();if(enabled){phrase();timer=setInterval(phrase,8000);}},get enabled(){return enabled;},destroy(){stop();context?.close();}};
}
