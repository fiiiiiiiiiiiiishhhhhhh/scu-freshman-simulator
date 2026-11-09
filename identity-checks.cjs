const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const data=require('./dist/data.js'),story=require('./dist/story-data.js');
const full=fs.readFileSync('./dist/game.js','utf8');
const fragment=full.slice(full.indexOf('const STORY=window.SCU_STORY;'),full.indexOf('function explorePage(){return novelPage();}'));
const state={name:'旧角色',gender:'女',done:data.chapters.map(()=>[]),stage:2,unlocked:2,stats:data.initialStats(),pieces:[{type:'paper',x:24,y:12,r:0}],sport:null,history:null,journal:[{id:'keep-me'}],novel:{index:7,line:1,pending:null,flags:{metZhou:true},log:[],finished:false}};
state.done[0]=['report','face'];
const ctx={window:{SCU_STORY:story},D:data,state,save(){},notify(){},escape:s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),statLabels:{}};
vm.createContext(ctx);vm.runInContext(fragment+'\nthis.commit=commitIdentity;this.cast=castMember;this.start=identityPage;',ctx);
const before=JSON.stringify({done:state.done,stats:state.stats,pieces:state.pieces,journal:state.journal,novel:state.novel});
assert.equal(ctx.commit('  ','男'),false);assert.equal(ctx.commit('测试','未知'),false);
assert.equal(state.name,'旧角色');
for(const gender of ['男','女']){
 assert.equal(ctx.commit('  新同学  ',gender),true);
 assert.equal(state.name,'新同学');assert.equal(state.identityConfirmed,true);
 assert.equal(ctx.cast('amu').role,'你的'+gender+'室友');
 assert.equal(ctx.cast('amu').spriteClass,'vn-amu-'+(gender==='男'?'male':'female'));
 assert.equal(ctx.cast('zhou').spriteClass,undefined);
 assert.equal(ctx.cast('zhou').role,'同班同学 · 不是室友');
 assert.equal(JSON.stringify({done:state.done,stats:state.stats,pieces:state.pieces,journal:state.journal,novel:state.novel}),before);
}
state.name='\"><img src=x onerror=alert(1)>';
assert(!ctx.start().includes('value=""><img'));
const restricted=data.catalog.find(c=>c.group==='sport'&&c.gender==='女'&&!c.unavailable);
assert(restricted);state.sport=restricted.id;assert.equal(ctx.commit('不同性别','男'),false);assert.equal(state.gender,'女');
assert.equal(ctx.commit('同一性别','女'),true);
console.log('PASS: required identity; same-gender roommate; unchanged classmate; progress preserved; name escaping; sports restriction.');
