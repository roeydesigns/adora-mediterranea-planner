(() => {
'use strict';
const data=window.ADORA_OFFERS;
const sailings={january:{season:'january',label:'Jan 2–6, 2027',nights:4,route:'Manila → Miyakojima → Manila'},christmas:{season:'holiday',label:'Dec 21–27, 2026',nights:6,route:'Manila → Naha → Miyakojima → Manila'},newyear:{season:'holiday',label:'Dec 27, 2026–Jan 2, 2027',nights:6,route:'Manila → Naha → Miyakojima → Manila'}};
const $=id=>document.getElementById(id);
const php=x=>'₱'+x.toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
const usd=x=>'USD '+x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const hkd=x=>'HKD '+x.toLocaleString('en-US');
function compute(o,quantity=1){
 if(!Number.isInteger(quantity)||quantity<1||quantity>100)throw new Error('Number of quoted bookings must be a whole number from 1 to 100.');
 const pax=o.pax*quantity, fareUSD=o.fares.reduce((a,b)=>a+b,0)*quantity,portUSD=150*pax,packageUSD=fareUSD+portUSD,arrivalUSD=20*pax,tipHKD=(o.tipTotalHKD??o.tipHKD*o.pax)*quantity,packagePHP=packageUSD*63,onboardPHP=arrivalUSD*63+tipHKD*8,downUSD=300*pax,taxPHP=1620*pax,exclusionsPHP=onboardPHP+taxPHP,exclusionsUSD=exclusionsPHP/63,overallPHP=packagePHP+exclusionsPHP,overallUSD=overallPHP/63,referenceFareUSD=o.components?o.referenceFareUSD*quantity:o.originalFares?o.originalFares.reduce((a,b)=>a+b,0)*quantity:o.fares[0]*pax,savingsUSD=referenceFareUSD-fareUSD;
 return {taxPHP,exclusionsPHP,exclusionsUSD,overallPHP,overallUSD,overallPerPax:overallPHP/pax,referenceFareUSD,savingsUSD,pax,cabins:o.cabins*quantity,fareUSD,portUSD,packageUSD,packagePHP,arrivalUSD,tipHKD,onboardPHP,knownPHP:packagePHP+onboardPHP,downUSD,downPHP:downUSD*63,balancePHP:packagePHP-downUSD*63,packagePerPax:packagePHP/pax,knownPerPax:(packagePHP+onboardPHP)/pax};
}
let selected=data.find(o=>o.season==='january'&&o.name==='Quad Interior Cabin');
let quantity=1;
const groupCache=new Map();
let visibleOffers=12,previousGroup='';
function candidates(){
 const season=sailings[$('sailing').value].season,pax=$('occupancy').value,key=season+':'+pax;
 if(!groupCache.has(key)){const offers=data.filter(o=>o.season===season);groupCache.set(key,pax==='all'?offers:window.AdoraGroups.combinations(offers,Number(pax)));}
 return [...groupCache.get(key)].sort((a,b)=>{const ac=compute(a),bc=compute(b);const key=$('sort').value==='package'?'packagePHP':$('sort').value==='knownTotal'?'overallPHP':'overallPerPax';return ac[key]-bc[key]||a.cabins-b.cabins||String(a.id).localeCompare(String(b.id));});
}
function groupFares(group){
 let guest=0,cabin=0;
 return group.components.map(part=>{const cabinStart=cabin+1;cabin+=part.cabins;
 return `<div class="group-cabin-heading">${part.name}<small>Cabin ${cabinStart}${part.cabins>1?`–${cabin}`:''} · ${part.pax} pax${part.name==='Two Twin Balcony Cabins'?' · 3+1 promo':part.originalFares?' · USD 89 off per pax':part.promo?' · 4th guest fare free':''}</small></div>`+part.fares.map((fare,i)=>{guest++;const cabinNumber=cabinStart+(part.cabins===2&&i>=2?1:0);const detail=part.originalFares?`Original <del>${money(part.originalFares[i])}</del> · Less ${money(part.discountPerPaxUSD)} per pax`:fare===0?'FREE cruise fare':part.fares[0]>fare?`${money(part.fares[0]-fare)} less than Pax 1 fare`:'';return row(`Pax ${guest} · Cabin ${cabinNumber}${quantity>1?` × ${quantity} bookings`:''}`,detail,fare*quantity,false,fare===0?'free-fare':'');}).join('');
 }).join('');
}
function gratuityDetail(group){const rates=new Map();for(const part of group.components||[group])rates.set(part.tipHKD,(rates.get(part.tipHKD)||0)+part.pax*quantity);return [...rates].map(([rate,pax])=>`${nativeFee(rate,'HKD')} per pax × ${pax} pax`).join(' + ');}
function money(valueUSD){return $('convert-php').checked?php(valueUSD*63):usd(valueUSD);}
function nativeFee(value,currency){return $('convert-php').checked?php(value*(currency==='HKD'?8:currency==='USD'?63:1)):currency==='HKD'?hkd(value):currency==='USD'?usd(value):php(value);}
function currencyParts(dollars,hongKong,pesos){return `<span>${usd(dollars)}</span><span>+ ${hkd(hongKong)}</span><span>+ ${php(pesos)}</span>`;}
function rowText(label,detail,value){return `<div class="calc-row total"><span>${label}<small>${detail}</small></span><b class="currency-parts">${value}</b></div>`;}
function row(label,detail,valueUSD,total=false,highlight=''){return `<div class="calc-row${total?' total':''}${highlight?' '+highlight:''}"><span>${label}${detail?`<small>${detail}</small>`:''}</span><b>${money(valueUSD)}</b></div>`;}

function renderFullView(){
 $('full-booking-name').textContent=selected.name;
 $('full-booking-meta').textContent=$('selected-meta').textContent;
 $('full-convert-php').checked=$('convert-php').checked;
 for(const id of ['full-fares','full-exclusions','full-payments'])$(id).replaceChildren();
 let afterExclusions=false;
 for(const child of $('calculation').children){
  if(child.classList.contains('exclusions')){afterExclusions=true;$('full-exclusions').append(child.cloneNode(true));}
  else if(child.classList.contains('promo-saving'))$('full-exclusions').append(child.cloneNode(true));
  else if(afterExclusions||child.classList.contains('cabin-total')||child.classList.contains('per-pax-rate'))$('full-payments').append(child.cloneNode(true));
  else $('full-fares').append(child.cloneNode(true));
 }
}
function renderCalculation(){
 const c=compute(selected,quantity),s=sailings[$('sailing').value],converted=$('convert-php').checked;
 $('selected-name').textContent=selected.name;
 $('selected-meta').textContent=`${s.label} · ${c.pax} pax · ${c.cabins} cabin${c.cabins===1?'':'s'}`;
 const balconyPromo=selected.name==='Two Twin Balcony Cabins';
 const fares=selected.components?groupFares(selected):selected.fares.map((fare,i)=>{
 const less=selected.fares[0]-fare;
 const label=`Pax ${i+1}${selected.cabins===2?` · Cabin ${i<2?1:2}`:''}${quantity>1?` × ${quantity} bookings`:''}`;
 const detail=balconyPromo?(fare===0?'3+1 promo · FREE cruise fare':`Regular fare · ${money(fare)} per pax`):selected.originalFares?`Original <del>${money(selected.originalFares[i])}</del> · Less ${money(selected.discountPerPaxUSD)} per pax${quantity>1?` · ${money(fare)} each`:''}`:fare===0?'FREE cruise fare':less>0?`${money(less)} less than Pax 1 fare${quantity>1?` · ${money(fare)} each`:''}`:quantity>1?`${money(fare)} each`:'';
 return row(label,detail,fare*quantity,false,balconyPromo&&fare===0?'free-fare':'');
 }).join('');
 const saving=selected.components?`<div class="promo-saving"><b>${c.cabins} cabins for ${c.pax} pax${c.savingsUSD>0?` · Save ${money(c.savingsUSD)}`:''}</b><small>${selected.components.map(p=>p.name).join(' + ')}${c.savingsUSD>0?'<br>Savings compared with original Twin Interior rates and each cabin’s Pax 1 fare for all its guests.':''}</small></div>`:balconyPromo?`<div class="promo-saving balcony-promo"><b>Balcony Twin · 3+1 promo</b><small>${c.pax} pax · ${c.cabins} Twin Balcony cabins · 2 guests per cabin</small><p>${3*quantity} regular fares × ${money(selected.fares[0])} + <strong>${quantity===1?'4th pax FREE':`${quantity} free fares`}</strong><br>Cruise fare total: <strong>${money(c.fareUSD)}</strong></p><b>Save ${money(c.savingsUSD)} in cruise fares</b><small>Port charges and exclusions apply to all ${c.pax} pax.</small></div>`:selected.originalFares?`<div class="promo-saving"><b>Twin Interior promo · ${money(selected.discountPerPaxUSD)} off per pax</b><small>Original <del>${money(selected.originalFares[0])}</del> → ${money(selected.fares[0])} per pax<br>Total fare savings: ${money(c.savingsUSD)} for ${c.pax} pax.</small></div>`:c.savingsUSD>0?`<div class="promo-saving"><b>${selected.promo?(selected.cabins===2?'3+1 promo':'4th guest sails free'):'Reduced guest fare'} · Save ${money(c.savingsUSD)}</b><small>Compared with ${c.pax} guests at Pax 1’s ${money(selected.fares[0])} fare.</small></div>`:'';
 $('calculation').innerHTML=`${saving}<h4 class="breakdown-label">Cruise fare per guest</h4>${fares}${row('Total cruise fare','',c.fareUSD,true)}${row('Port charges',`${money(150)} per pax × ${c.pax}`,c.portUSD)}${row(c.cabins===1?'Total price for the cabin':'Total price for the cabins','Cruise fare + port charges',c.packageUSD,true,'cabin-total')}<div class="per-pax-rate"><span>Rate per pax</span><strong>${money(c.packageUSD/c.pax)}</strong></div><section class="exclusions"><h4>Exclusions and payments</h4><ul><li><span>PH travel tax<small>${nativeFee(1620,'PHP')} per pax × ${c.pax} pax<br>Pay online on your own or onboard</small></span><b>${nativeFee(c.taxPHP,'PHP')}</b></li><li><span>Japan tourist arrival fee<small>${money(20)} per pax × ${c.pax} pax<br>Pay onboard</small></span><b>${money(c.arrivalUSD)}</b></li><li><span>Cruise gratuities<small>${gratuityDetail(selected)}<br>Pay onboard</small></span><b>${nativeFee(c.tipHKD,'HKD')}</b></li><li><span>Travel insurance</span><em>Not priced</em></li><li><span>Optional tour / shore excursion</span><em>Not priced</em></li></ul>${converted?row('Total of exclusions',`${c.pax} pax · Priced items only`,c.exclusionsUSD,true):rowText('Total of exclusions',`${c.pax} pax · Priced items only`,currencyParts(c.arrivalUSD,c.tipHKD,c.taxPHP))}</section><div class="trip-total"><span>Overall total cost<small>Cabin price + priced exclusions · ${c.pax} pax</small></span><strong class="${converted?'':'currency-parts'}">${converted?php(c.overallPHP):currencyParts(c.packageUSD+c.arrivalUSD,c.tipHKD,c.taxPHP)}</strong></div><div class="down-payment"><span class="payment-label">Total down payment · ${c.pax} pax</span><strong>${money(c.downUSD)}</strong><p>USD 300 × ${c.pax} pax = <b>${usd(c.downUSD)}</b>${converted?`<br>${usd(c.downUSD)} × ₱63 = <b>${php(c.downPHP)}</b>`:''}</p><small>Included in the cabin price.</small></div>${row('Remaining cabin balance','After down payment; excludes separate payments',c.packageUSD-c.downUSD)}<p class="currency-note">${converted?'USD × 63 · HKD × 8':'Original currencies shown. Check Convert to PHP for one combined total.'} Insurance and excursions are not included.</p>`;
 if($('full-breakdown').open)renderFullView();
}
function renderGuide(){
 const key=$('sailing').value;
 const dates={christmas:['Dec 23, 2026','Dec 24, 2026'],newyear:['Dec 31, 2026','Dec 30, 2026'],january:['Jan 4, 2027',null]}[key];
 $('tour-dates').textContent=`For your sailing · Miyakojima: ${dates[0]}${dates[1]?` · Naha: ${dates[1]}`:' · No Naha stop'}`;
 const tours=[{port:'Miyakojima',name:'Route A · Shopping',rate:128,promo:92,stops:'Aeon Mall or San-A Mall → Don Quijote Miyakojima Store',date:dates[0]}, {port:'Miyakojima',name:'Route B · Island sights',rate:128,promo:92,stops:'Miyakojima Observatory → Irabu Bridge (drive-by) → Local Business Center',date:dates[0]}];
 if(dates[1])tours.push({port:'Naha',name:'Route A · City highlights',rate:98,promo:78,stops:'Shuri Castle Park (outer castle) → Senaga Island Sea Breeze Terrace → Kokusai-dori Street → Duty-free shop',date:dates[1]},{port:'Naha',name:'Route B · Culture & shopping',rate:118,promo:88,stops:'Okinawa World Culture Kingdom + Gyokusendo Cave (tickets included) → Outlet Mall Ashibinaa → Itoman Seafood Market → Duty-free shop',date:dates[1]});
 $('tour-options').innerHTML=tours.map(t=>`<article class="tour-card"><div class="tour-port">${t.port} · ${t.date}</div><h3>${t.name}</h3><p class="tour-price">USD ${t.promo}<small> / pax · Special offer</small></p><p class="tour-discount"><del>USD ${t.rate}</del> <b>Save USD ${t.rate-t.promo} / pax</b></p><details class="guide-more"><summary>View route & inclusions</summary><p>${t.stops}</p><p>5–7 hours · Private bus · English-speaking guide<br>Pickup and return: cruise terminal.</p></details><a class="source-link" data-image-open href="sources/${t.port==='Miyakojima'?'miyakojima-oct21.jpg':'naha-oct21.jpg'}" target="_blank" rel="noopener">Open ${t.port} flyer ↗</a></article>`).join('');
 const theme=key==='christmas'?'Christmas party theme':key==='newyear'?'New Year party theme':'';
 $('sailing-theme').hidden=!theme;$('sailing-theme').textContent=theme;
}
function render(){
 const list=candidates();
 if(!list.some(o=>o.id===selected.id)){selected=list.find(o=>o.name===selected.name)||list[0];}
 const groupKey=$('sailing').value+':'+$('occupancy').value;if(groupKey!==previousGroup){visibleOffers=12;previousGroup=groupKey;}
 const s=sailings[$('sailing').value];
 $('route').textContent=s.route;
 $('offer-count').textContent=list.length;
 const shown=list.slice(0,Math.max(visibleOffers,list.findIndex(o=>o.id===selected.id)+1));
 $('offers').innerHTML=shown.map(o=>{const c=compute(o);return `<button type="button" class="cabin-option" data-offer="${o.id}" aria-pressed="${o.id===selected.id}" aria-label="Select ${o.name}"><span class="radio-dot" aria-hidden="true"></span><span><span class="cabin-name">${o.name}${o.id===list[0].id?'<span class="pill">Lowest cost / pax</span>':''}</span><span class="cabin-meta">${o.pax} pax · ${o.cabins} cabin${o.cabins===1?'':'s'}${o.components?`<br><span class="promo">${o.fares.filter(f=>f===0).length?`${o.fares.filter(f=>f===0).length} free cruise fare${o.fares.filter(f=>f===0).length>1?'s':''}`:o.components.some(p=>p.originalFares)?'Twin Interior discount included':''}</span>`:o.promoType?`<br><span class="promo">USD ${o.discountPerPaxUSD} off per pax</span>`:o.promo?`<br><span class="promo">${o.cabins===2?'3+1 promo · 3 pay + 1 free':'4th guest’s cruise fare free'}</span>`:''}</span></span><span class="cabin-price"><strong>${php(c.packagePerPax)}</strong><small>/ pax · fare + port charges</small><small class="package-price">${php(c.packagePHP)} package</small></span></button>`;}).join('');
 $('more-options').hidden=shown.length>=list.length;$('more-options').textContent=`Show more combinations (${list.length-shown.length} remaining)`;
 $('comparison-note').textContent=$('occupancy').value==='all'?'Per-pax costs are averages for different group sizes. Package prices are for one complete booking.':'Each option fits the exact guest count. Package prices cover one complete group booking; per-pax costs are averages.';
 $('dates').innerHTML=Object.entries(sailings).map(([key,date])=>{const o=selected.components?window.AdoraGroups.makeGroup(selected.components.map(p=>data.find(o=>o.season===date.season&&o.name===p.name))):data.find(o=>o.season===date.season&&o.name===selected.name),c=compute(o);return `<tr class="${key===$('sailing').value?'selected':''}"><td>${date.label}<small>${date.nights} nights · ${date.season==='january'?'Miyakojima':'Naha + Miyakojima'}</small></td><td class="price">${php(c.packagePHP)}</td><td class="price">${php(c.overallPerPax)}</td></tr>`;}).join('');
 renderCalculation();
 renderGuide();
}
document.addEventListener('click',e=>{const link=e.target.closest('[data-image-open]');if(!link)return;e.preventDefault();$('source-image').src=link.href;$('source-title').textContent=link.textContent.replace(' ↗','');$('image-viewer').showModal();});
$('open-breakdown').addEventListener('click',()=>{if($('calculation').hidden)return;renderFullView();$('full-breakdown').showModal();});
$('close-breakdown').addEventListener('click',()=>{$('full-breakdown').close();});
$('full-convert-php').addEventListener('change',()=>{$('convert-php').checked=$('full-convert-php').checked;renderCalculation();});
$('close-image').addEventListener('click',()=>{$('image-viewer').close();});
$('more-options').addEventListener('click',()=>{visibleOffers+=12;render();});
$('convert-php').addEventListener('change',renderCalculation);
for(const id of ['sailing','occupancy','sort'])$(id).addEventListener('change',render);
$('offers').addEventListener('click',e=>{const button=e.target.closest('[data-offer]');if(button){selected=candidates().find(o=>String(o.id)===button.dataset.offer);render();}});
$('quantity').addEventListener('input',()=>{const q=Number($('quantity').value),valid=Number.isInteger(q)&&q>=1&&q<=100;$('quantity-error').hidden=valid;$('quantity').setAttribute('aria-invalid',String(!valid));if(valid){quantity=q;$('calculation').hidden=false;renderCalculation();}else $('calculation').hidden=true;});
window.AdoraPlanner={compute,getSelection:()=>({sailing:$('sailing').value,offerId:selected.id,quantity,...compute(selected,quantity)})};
render();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'configure_cruise_comparison',description:'Select a quoted Adora cruise arrangement and repeat count, update the visible comparison, and return its PHP booking breakdown. Does not reserve a cabin.',inputSchema:{type:'object',properties:{sailing:{type:'string',enum:Object.keys(sailings)},offerName:{type:'string',enum:[...new Set(data.map(o=>o.name))]},quantity:{type:'integer',minimum:1,maximum:100}},required:['sailing','offerName','quantity'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Object.hasOwn(sailings,input.sailing)||!Number.isInteger(input.quantity)||input.quantity<1||input.quantity>100)throw new Error('Invalid sailing or booking count.');const offer=data.find(o=>o.name===input.offerName&&o.season===sailings[input.sailing].season);if(!offer)throw new Error('Quoted cabin arrangement not found.');$('sailing').value=input.sailing;$('occupancy').value=String(offer.pax);$('quantity').value=String(input.quantity);$('quantity-error').hidden=true;$('quantity').setAttribute('aria-invalid','false');$('calculation').hidden=false;selected=offer;quantity=input.quantity;render();return window.AdoraPlanner.getSelection();}})).catch(()=>{});}catch{}}
})();
