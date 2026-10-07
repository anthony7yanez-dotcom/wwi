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
