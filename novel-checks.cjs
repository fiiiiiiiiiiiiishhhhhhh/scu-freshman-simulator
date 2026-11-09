const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const story=require('./dist/story-data.js'),data=require('./dist/data.js'),backgrounds=require('./dist/scene-backgrounds.js');
assert.equal(story.nodes.length,19);assert.equal(story.nodes.reduce((n,x)=>n+x.options.length,0),57);
const mapped=new Set(story.nodes.flatMap(n=>n.tasks));for(const chapter of data.chapters)for(const [id] of chapter.tasks)assert(mapped.has(id),id);
const full=fs.readFileSync('./dist/game.js','utf8');const fragment=full.slice(full.indexOf('const STORY=window.SCU_STORY;'),full.indexOf('function explorePage(){return novelPage();}'));
for(const route of [0,1,2]){
 const state={done:data.chapters.map(()=>[]),stage:0,unlocked:0,stats:data.initialStats(),choices:{},pieces:[],reference:'botanical'};
 const ctx={window:{SCU_STORY:story,SCU_BACKGROUNDS:backgrounds,scrollTo(){}},D:data,state,completed:(id,s=state.stage)=>state.done[s].includes(id),save(){},render(){},notify(){},entry(){},setView(v){ctx.view=v;},adjust(d){state.stats=data.applyStats(state.stats,d);},face(){},uniform(){},catalog(){},studio(){},showModal(){},escape:x=>x,statLabels:{},deltaText(){return '';},finishTask(id){state.done[state.stage].push(id);}};
 vm.createContext(ctx);vm.runInContext(fragment+'\nthis.next=novelNext;this.choose=novelChoose;this.line=novelLine;this.node=novelNode;this.init=novelState;this.page=novelPage;',ctx);ctx.init();
 for(let i=0;i<19;i++){
  assert.equal(ctx.node().id,String(i+1).padStart(2,'0'));
  const html=ctx.page();assert(html.includes(backgrounds[ctx.node().id].file));assert(html.includes('vn-illustrated'));assert(!html.includes('class="vn-room"'));
  while(!ctx.line().atEnd)ctx.next();
  ctx.choose(route);const after=JSON.stringify(state.stats);ctx.choose((route+1)%3);assert.equal(JSON.stringify(state.stats),after,'Repeated choice must not award stats twice');
  const n=ctx.node();if(n.tool&&!n.tasks.every(id=>ctx.completed(id,n.stage))){ctx.next();assert.equal(ctx.node().id,n.id,'Tool scenes must wait for completion');for(const id of n.tasks)if(!ctx.completed(id,n.stage))state.done[n.stage].push(id);}
  ctx.next();
 }
 assert(state.novel.finished);assert.equal(ctx.view,'journal');assert.equal(state.done.reduce((n,x)=>n+x.length,0),31);assert(state.endingQuote);assert(state.novel.log.length>40);
 if(route===0)assert(state.novel.flags.helpedLuggage);if(route===2)assert(state.novel.flags.metZhou&&state.novel.flags.firstNightRest);
}
console.log('PASS: 19 scenes / 57 choices; all 31 tasks mapped; 3 complete routes; conditional memory, action gates, no duplicate rewards and ending completion.');
