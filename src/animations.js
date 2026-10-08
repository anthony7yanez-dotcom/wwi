// Timings cover anticipation, contact, and recovery; combat advances after recovery.
export const CHARACTER_MOVES = {
  knight: { color: '#9bd8e6', attack: ['Sword thrust', 'steel-slash', 720], guard: ['Shield wall', 'shield-wall', 680], skill: ['Shield bash', 'shield-shock', 860] },
  warrior: { color: '#f09368', attack: ['Axe chop', 'axe-cleave', 780], guard: ['Iron stance', 'iron-stance', 700], skill: ['Rending axe', 'blood-cleave', 940] },
  paladin: { color: '#ffe0a0', attack: ['Hammer strike', 'hammer-strike', 760], guard: ['Sacred bulwark', 'sacred-bulwark', 760], skill: ['Sacred light', 'sacred-light', 1040] },
  sorcerer: { color: '#64e3ed', attack: ['Arcane bolt', 'arcane-bolt', 700], guard: ['Arcane barrier', 'arcane-barrier', 780], skill: ['Soulfire', 'soulfire', 1080] },
  witch: { color: '#e699e1', attack: ['Hex lash', 'hex-lash', 740], guard: ['Shadow veil', 'shadow-veil', 780], skill: ['Siphon soul', 'siphon-soul', 1060] },
  gunslinger: { color: '#ffce85', attack: ['Quick shot', 'quick-shot', 640], guard: ['Evasive crouch', 'evasive-crouch', 640], skill: ['Deadeye shot', 'deadeye-shot', 920] },
  monk: { color: '#a7edc7', attack: ['Flying fist', 'flying-fist', 740], guard: ['Mountain stance', 'mountain-stance', 720], skill: ['Inner balance', 'inner-balance', 1020] },
};

export function characterMove(heroId, action) {
  const hero = CHARACTER_MOVES[heroId];
  const [label, effect, duration] = action === 'potion' ? ['Drink potion', 'potion-heal', 600] : hero[action];
  return { name: action === 'potion' ? 'potion-drink' : `${heroId}-${action}`, label, effect, duration, color: action === 'potion' ? '#a8dd93' : hero.color };
}

export const ENEMY_MOVES = {
  wolf:{base:0,columns:5,attack:['Raking bite',650],heavy:['Crimson maul',900],death:['Withered collapse',700]},
  sentinel:{base:4,columns:6,attack:['Crescent slash',780],heavy:['Crimson sweep',1080],death:['Ashen fall',820]},
  warden:{base:8,columns:6,attack:['Stone cleave',1000],heavy:['Rootquake',1320],death:['Broken roots',1100]},
};
export function enemyMove(id,action){const move=ENEMY_MOVES[id];return {row:move.base+{attack:1,heavy:2,death:3}[action],columns:id==='wolf'&&action==='death'?6:move.columns,label:move[action][0],duration:move[action][1]};}
