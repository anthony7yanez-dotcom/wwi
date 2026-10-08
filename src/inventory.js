import { memberName } from './companions.js';
const weapons={knight:['Weathered longsword','Honed longsword'],warrior:['Woodcutter’s axe','Rehung axe'],paladin:['Sanctuary hammer','Balanced sanctuary hammer'],sorcerer:['Apprentice staff','Inscribed focus staff'],witch:['Old hazel staff','Bound hazel staff'],gunslinger:['Courier’s pistol','Serviced courier’s pistol'],monk:['Worn hand wraps','Reinforced hand wraps']};
export const ITEMS={
 'thorn-signet':{id:'thorn-signet',name:'Thorn King’s Signet',slot:'charm',defense:2,focus:1,description:'A beacon-era signet. Reduces each incoming strike by 2 and restores 1 extra focus after an enemy phase.'},
 ...Object.fromEntries(Object.entries(weapons).flatMap(([id,[basic,better]])=>[[`starter-${id}`,{id:`starter-${id}`,name:basic,slot:'weapon',classId:id,attack:0,description:'The tool you practiced with before this journey began.'}],[`tempered-${id}`,{id:`tempered-${id}`,name:better,slot:'weapon',classId:id,attack:3,description:'Careful repairs add 3 to basic attack damage.'}]])),
 'travel-coat':{id:'travel-coat',name:'Worn travel coat',slot:'armor',defense:0,description:'Patched many times. It still keeps off some of the cold.'},
 'mended-cloak':{id:'mended-cloak',name:'Mended ward-road cloak',slot:'armor',defense:2,description:'Reduces each incoming strike by 2 damage, after guarding.'},
 'veilglass-mirror':{id:'veilglass-mirror',name:'Veilglass Mirror',slot:'charm',focus:1,description:'Reveals the sanctuary sigil with Read Sigil. Restores 1 extra focus after each enemy phase.'},
 'ember-glass':{id:'ember-glass',name:'Emberglass pendant',slot:'charm',focus:1,description:'An old pilgrim’s keepsake. Restores 1 extra focus after each enemy phase.'},
};
// Reforging uses explicit item identities, preserving ownership and save validation.
for(const [id,item] of Object.entries(ITEMS))if(id.startsWith('tempered-')||id==='mended-cloak'){
 item.forgeBase=id;item.tier=0;
 for(const tier of [1,2]){const key=`${id}-forge-${tier}`;ITEMS[key]={...item,id:key,tier,name:`${item.name} +${tier}`,attack:(item.attack||0)+(item.slot==='weapon'?tier*3:0),defense:(item.defense||0)+(item.slot==='armor'?tier:0),description:`${item.description} Reforging adds ${item.slot==='weapon'?tier*3+' attack':tier+' armor'}.`};}
}
for(const [id,[name]] of Object.entries(weapons)){const key=`ward-armor-${id}`;ITEMS[key]={id:key,name:`${id[0].toUpperCase()+id.slice(1)} ward attire`,slot:'armor',classId:id,defense:3,description:'Class-fitted ward attire. Reduces each incoming strike by 3 damage.'};}
export function equipmentBonuses(member){const equipped=Object.values(member.equipment||{}).map(id=>ITEMS[id]).filter(Boolean);return {attack:equipped.reduce((n,i)=>n+(i.attack||0),0),defense:equipped.reduce((n,i)=>n+(i.defense||0),0),focus:equipped.reduce((n,i)=>n+(i.focus||0),0)};}
export function initializeInventory(game){if(!game.inventory){game.inventory=[`starter-${game.hero.id}`,'travel-coat'];game.hero.equipment={weapon:`starter-${game.hero.id}`,armor:'travel-coat',charm:null};}return game;}
export function addItem(game,id){if(!ITEMS[id])return false;initializeInventory(game);if(game.inventory.includes(id))return false;game.inventory.push(id);return true;}
export function equipItem(game,memberId,itemId){
 if(game.status!=='preparing'||!game.inventory?.includes(itemId))return false;
 const members=[game.hero,...game.companions],member=members.find(h=>h.id===memberId),item=ITEMS[itemId];
 if(!member||!item||item.classId&&item.classId!==memberId||members.some(h=>h!==member&&Object.values(h.equipment||{}).includes(itemId)))return false;
 member.equipment??={weapon:null,armor:null,charm:null};member.equipment[item.slot]=itemId;return true;
}
export function unequipSlot(game,memberId,slot){const h=[game.hero,...game.companions].find(h=>h.id===memberId);if(game.status!=='preparing'||!h?.equipment||!['weapon','armor','charm'].includes(slot)||!h.equipment[slot])return false;h.equipment[slot]=null;return true;}
export function validInventory(game){
 if(game.inventory===undefined)return [game.hero,...game.companions].every(h=>h.equipment===undefined);
 if(!Array.isArray(game.inventory)||game.inventory.length>Object.keys(ITEMS).length||new Set(game.inventory).size!==game.inventory.length||!game.inventory.every(id=>Object.hasOwn(ITEMS,id)))return false;
 const equipped=[];
 for(const h of [game.hero,...game.companions]){if(h.equipment===undefined)continue;if(!h.equipment||Array.isArray(h.equipment)||Object.keys(h.equipment).some(slot=>!['weapon','armor','charm'].includes(slot)))return false;for(const [slot,id] of Object.entries(h.equipment)){if(id===null)continue;const item=ITEMS[id];if(!item||item.slot!==slot||item.classId&&item.classId!==h.id||!game.inventory.includes(id)||equipped.includes(id))return false;equipped.push(id);}}
 return true;
}
export function inventoryContent(game,esc){
 const members=[game.hero,...game.companions];return `<div class="eyebrow">THE WARD ROAD · SUPPLIES & EQUIPMENT</div><h2 id="dialog-title">What you carry<span>.</span></h2><p>${game.potions} healing potions · ${game.gold} gold. Potions restore up to 50 health to the weakest active ally during combat. Equipment can be changed between encounters.</p><div class="inventory-members">${members.map(h=>`<section><h3>${h===game.hero?esc(game.name):esc(memberName(game,h))} · ${h.id}</h3>${['weapon','armor','charm'].map(slot=>`<p>${slot.toUpperCase()} · <b>${esc(ITEMS[h.equipment?.[slot]]?.name||'Unequipped')}</b>${h.equipment?.[slot]?` <button data-action="unequip" data-member="${h.id}" data-slot="${slot}" ${game.status!=='preparing'?'disabled':''}>Remove</button>`:''}</p>`).join('')}</section>`).join('')}</div><div class="inventory-grid">${(game.inventory||[]).map(id=>{const item=ITEMS[id],owner=members.find(h=>Object.values(h.equipment||{}).includes(id));return `<article><small>${item.slot.toUpperCase()}</small><h3>${esc(item.name)}</h3><p>${item.description}</p>${owner?`<span>Equipped by ${owner===game.hero?esc(game.name):esc(memberName(game,owner))}</span>`:members.filter(h=>!item.classId||item.classId===h.id).map(h=>`<button data-action="equip" data-item="${id}" data-member="${h.id}" ${game.status!=='preparing'?'disabled':''}>Equip: ${h===game.hero?esc(game.name):esc(memberName(game,h))}</button>`).join('')}</article>`;}).join('')}</div><div class="modal-footer"><span>Every useful item has a place in your journey.</span><button class="primary-button" data-action="close">Return</button></div>`;
}
