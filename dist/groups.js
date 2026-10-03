(() => {
'use strict';
const sum=(items,key)=>items.reduce((total,item)=>total+item[key],0);
function makeGroup(parts){
 if(parts.length===1)return parts[0];
 const counts=new Map();for(const part of parts)counts.set(part.name,(counts.get(part.name)||0)+1);
 const name=[...counts].map(([name,count])=>(count>1?`${count} × `:'')+name).join(' + ');
 return {id:'group:'+parts.map(p=>p.id).join('-'),name,pax:sum(parts,'pax'),cabins:sum(parts,'cabins'),season:parts[0].season,components:parts,fares:parts.flatMap(p=>p.fares),tipTotalHKD:parts.reduce((total,p)=>total+p.tipHKD*p.pax,0),referenceFareUSD:parts.reduce((total,p)=>total+(p.originalFares?p.originalFares.reduce((a,b)=>a+b,0):p.fares[0]*p.pax),0),promo:parts.some(p=>p.promo||p.originalFares)};
}
function combinations(offers,pax){
 if(!Number.isInteger(pax)||pax<2||pax>10)throw new Error('Choose 2–10 guests.');
 const result=[];
 function visit(start,remaining,parts){if(!remaining){result.push(makeGroup(parts));return;}for(let i=start;i<offers.length;i++){const offer=offers[i];if(offer.pax<=remaining)visit(i,remaining-offer.pax,[...parts,offer]);}}
 visit(0,pax,[]);return result;
}
window.AdoraGroups={combinations,makeGroup};
})();
