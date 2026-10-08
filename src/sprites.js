// The original sheets remain the default for returning saves and authored NPCs.
export const ORIGINAL_GENDER = {knight:'male',warrior:'male',paladin:'male',sorcerer:'male',witch:'female',gunslinger:'male',monk:'male'};
export const GENDERS = ['male','female'];
export function characterAppearance(id,gender) {
  const resolved=gender||ORIGINAL_GENDER[id],alternate=resolved!==ORIGINAL_GENDER[id];
  return {gender:resolved,alternate,rows:alternate?12:4,className:`sheet-${id}${alternate?' appearance-alt':''}`};
}
export function memberAppearance(game,member) {
  return characterAppearance(member.id,member===game.hero?member.gender:undefined);
}
