const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const data=JSON.parse(fs.readFileSync('dist/offers.json','utf8'));
const nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{value:({sailing:'january',occupancy:'4',sort:'knownPax',quantity:'1'})[id]||'',checked:false,addEventListener(){},setAttribute(){}});return nodes.get(id);}
const context={window:{ADORA_OFFERS:data},document:{getElementById:node,addEventListener(){}}};
vm.createContext(context);
for(const name of ['groups','app'])vm.runInContext(fs.readFileSync(`dist/${name}.js`,'utf8'),context);
const {combinations}=context.window.AdoraGroups;
const {compute}=context.window.AdoraPlanner;
let count=0;
for(const season of ['january','holiday']){
 const offers=data.filter(o=>o.season===season);
 for(let pax=2;pax<=10;pax++){
  const groups=combinations(offers,pax),ids=new Set();assert(groups.length>0);
  for(const group of groups){
   assert.equal(group.pax,pax);assert(!ids.has(group.id));ids.add(group.id);
   const parts=group.components||[group],c=compute(group);
   assert.equal(parts.reduce((sum,o)=>sum+o.pax,0),pax);
   assert.equal(c.packageUSD,parts.reduce((sum,o)=>sum+o.packageUSD,0));
   assert.equal(c.tipHKD,parts.reduce((sum,o)=>sum+o.tipHKD*o.pax,0));
   assert.equal(c.portUSD,150*pax);assert.equal(c.downUSD,300*pax);
   assert.equal(c.overallPHP,c.packageUSD*63+20*pax*63+c.tipHKD*8+1620*pax);
   const repeated=compute(group,2);for(const field of ['packageUSD','tipHKD','pax','cabins','downUSD','overallPHP','savingsUSD'])assert.equal(repeated[field],c[field]*2);
   if(pax===5)assert.deepEqual(Array.from(parts,p=>p.pax).sort(),[2,3]);
   if(group.components)assert.equal(c.savingsUSD,parts.reduce((sum,p)=>sum+compute(p).savingsUSD,0));
   count++;
  }
 }
}
for(const offer of data)assert.equal(compute(offer).packageUSD,offer.packageUSD);
const mixed=context.window.AdoraGroups.makeGroup([data[0],data[10]]);
assert.equal(compute(mixed).tipHKD,840*2+960*3);
const balcony=context.window.AdoraGroups.makeGroup([data[6],data[3]]);
assert.equal(compute(balcony).fareUSD,3864+2725);
assert.equal(balcony.cabins,3);assert.equal(balcony.pax,7);
assert.throws(()=>combinations(data,1));assert.throws(()=>combinations(data,11));
console.log(`Verified ${count} exact-size combinations, both seasons, repeats, mixed gratuities, source totals and promos.`);
