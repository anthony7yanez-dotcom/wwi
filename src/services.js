import { ITEMS, addItem } from './inventory.js';
import { partyMembers } from './companions.js';
import { heroStats, log } from './engine.js';

// Roadhouses and pilgrim shelters share the same services. Their signs are
// non-solid landmarks, so adding them does not invalidate earlier saves.
export const ROADHOUSES = [
 {id:'house-courtyard',map:'courtyard',x:608,y:368,name:'The Last Coal Inn',host:'Keeper Della'},
 {id:'house-forest',map:'forest',x:336,y:240,name:'The Lantern Bough',host:'Keeper Fen'},
 {id:'house-shrine',map:'shrine',x:272,y:496,name:'Pilgrim’s Rest',host:'Keeper Sera'},
 {id:'house-lornwatch',map:'lornwatch',x:816,y:368,name:'The Timber Hearth',host:'Keeper Noll'},
 {id:'house-greyfen',map:'greyfen',x:736,y:336,name:'The Reed Lantern',host:'Keeper Ysra'},
 {id:'house-hollows',map:'hollows',x:272,y:528,name:'The Underroad Shelter',host:'Keeper Bran'},
 {id:'house-beacon',map:'beacon',x:688,y:496,name:'The Thornroad Shelter',host:'Keeper Venn'},
].map(h=>({...h,kind:'service'}));
const HARKER=[{map:'supply',x:624,y:336,name:'Harker’s repairs & supplies'},{map:'lornwatch',x:720,y:256,name:'Harker’s repairs & supplies'}];
export function nearbyService(world,game){if(!world||world.battle||world.conversation||game.status!=='preparing')return null;return [...ROADHOUSES,...HARKER].find(h=>h.map===world.map&&Math.hypot(h.x-world.x,h.y-world.y)<=58)||null;}
export function shopOffers(game){return [...partyMembers(game).flatMap(h=>[[`tempered-${h.id}`,20],[`ward-armor-${h.id}`,35]]),['mended-cloak',20],['potion',15]];}
export function purchase(game,world,id){if(!nearbyService(world,game))return false;const offer=shopOffers(game).find(([item])=>item===id);if(!offer||game.gold<offer[1]||id!=='potion'&&(game.inventory||[]).some(key=>key===id||ITEMS[key].forgeBase===id))return false;if(id==='potion')game.potions++;else if(!addItem(game,id))return false;game.gold-=offer[1];log(game,`Purchased ${id==='potion'?'a healing potion':ITEMS[id].name}.`,'story');return true;}
export function upgradeOffer(game,id){const item=ITEMS[id];if(!item?.forgeBase||!game.inventory?.includes(id)||item.tier>=2)return null;const tier=(item.tier||0)+1;if(game.inventory.includes(`${item.forgeBase}-forge-${tier}`))return null;return {id:`${item.forgeBase}-forge-${tier}`,price:tier===1?30:50,level:tier+1};}
export function upgradeGear(game,world,id){const offer=upgradeOffer(game,id);if(!nearbyService(world,game)||!offer||game.gold<offer.price||game.hero.level<offer.level)return false;const index=game.inventory.indexOf(id);game.inventory[index]=offer.id;for(const h of partyMembers(game))for(const [slot,equipped] of Object.entries(h.equipment||{}))if(equipped===id)h.equipment[slot]=offer.id;game.gold-=offer.price;log(game,`The blacksmith reforges ${ITEMS[offer.id].name}.`,'story');return true;}
export function restAtInn(game,world){if(!nearbyService(world,game)||game.gold<5)return false;game.gold-=5;for(const h of partyMembers(game)){const stats=heroStats(h);h.hp=stats.hp;h.mp=stats.mp;h.guard=false;}log(game,'A warm bed, a shared meal. The entire roster recovers health and focus.','heal');return true;}
export function servicesContent(game,world,esc,tab='inn'){const h=nearbyService(world,game);if(!h)return '<h2 id="dialog-title">Return to a roadhouse</h2><p>Inn, shop, and forge services require a nearby keeper or Harker.</p>';const nav=`<nav class="pause-tabs" aria-label="Roadhouse services">${[['inn','Inn'],['shop','Shop'],['forge','Blacksmith']].map(([id,name])=>`<button data-action="service-tab" data-tab="${id}" class="${tab===id?'selected':''}">${name}</button>`).join('')}</nav>`;let body;
 if(tab==='inn')body=`<h3>A night under a roof</h3><p>Restores health and focus to the protagonist and every recruited companion, including reserves. Supplies are purchased separately. Existing public hearths remain free.</p><button data-action="inn-rest" ${game.gold<5?'disabled':''}>Rest the whole party · 5 gold</button>`;
 else if(tab==='forge')body=`<p>Reforge repaired class weapons and ward-road cloaks twice. First temper: level 2, 30 gold. Second temper: level 3, 50 gold. Each temper adds 3 weapon attack or 1 armor. Equipped gear stays equipped.</p><div class="inventory-grid">${(game.inventory||[]).filter(id=>ITEMS[id].forgeBase).map(id=>{const i=ITEMS[id],o=upgradeOffer(game,id);return `<article><h3>${esc(i.name)}</h3><p>${i.description}</p><button data-action="forge-upgrade" data-item="${id}" ${!o||game.gold<o.price||game.hero.level<o.level?'disabled':''}>${o?`Reforge · ${o.price} gold · Level ${o.level}`:'Fully reforged'}</button></article>`;}).join('')||'<p>Purchase a repaired weapon or mended cloak first.</p>'}</div>`;
 else body=`<p>Gear is tailored to your recruited roster. Equip purchases in Menu → Equipment.</p><div class="inventory-grid">${shopOffers(game).map(([id,price])=>{const i=ITEMS[id],owned=id!=='potion'&&(game.inventory||[]).some(key=>key===id||ITEMS[key].forgeBase===id);return `<article><h3>${id==='potion'?'Healing potion':esc(i.name)}</h3><p>${id==='potion'?'Restores up to 50 health or revives the weakest active ally during combat.':i.description}</p><button data-action="buy" data-item="${id}" ${owned||game.gold<price?'disabled':''}>${owned?'Already owned':`Buy · ${price} gold`}</button></article>`;}).join('')}</div>`;
 return `<div class="eyebrow">THE WARD ROADS · REST & REPAIRS</div><h2 id="dialog-title">${esc(h.name)}</h2><p>${game.gold} gold · ${game.potions} potions</p>${nav}${body}<p id="service-status" role="status"></p>`;
}
