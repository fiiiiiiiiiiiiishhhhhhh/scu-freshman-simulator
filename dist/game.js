(() => {
'use strict';
const D=window.SCU_DATA, KEY='scu-freshman-notebook-v1';
const fresh=()=>({version:1,name:'小川',gender:'女',identityConfirmed:false,stage:0,unlocked:0,done:D.chapters.map(()=>[]),stats:D.initialStats(),lastDelta:null,energy:100,choices:{},sport:null,history:null,week:3,journal:[],reference:'botanical',pieces:[],plan:{work:2,club:1,competition:1,rest:2},planSaved:false});
let state=fresh(), storageAvailable=true;
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.version===1&&Array.isArray(saved.done)&&saved.done.length>=5&&saved.done.length<=D.chapters.length&&Number.isInteger(saved.stage)&&saved.stage>=0&&saved.stage<D.chapters.length){state={...fresh(),...saved};state.done=D.chapters.map((_,i)=>Array.isArray(saved.done[i])?saved.done[i]:[]);state.unlocked=Math.max(state.stage,Math.min(D.chapters.length-1,state.unlocked));}}catch{storageAvailable=false;}
let view=['schedule','journal'].includes(location.hash.slice(1))?location.hash.slice(1):'explore',scene=null,catalogGroup='sport',catalogError='',activePiece=null,toastTimer;
if(state.sport&&!D.catalog.some(c=>c.id===state.sport&&c.group==='sport')){state.sport=null;state.done[2]=state.done[2].filter(id=>!['sport','verify'].includes(id));state.sportImportNote='此前选择的是剧情示例班次，请在真实排课表中重新选择体育课。';save();}
const $=s=>document.querySelector(s), escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const completed=(id,stage=state.stage)=>state.done[stage].includes(id);
const selectedCourses=()=>[state.sport,state.history].map(id=>D.catalog.find(c=>c.id===id)).filter(Boolean).map(c=>({...c,status:'选中',kind:'自选'}));
const allCourses=()=>[...D.courses,...selectedCourses()];
const chapter=()=>D.chapters[state.stage], nextTask=()=>chapter().tasks.find(([id])=>!completed(id));
const finished=()=>chapter().tasks.every(([id])=>completed(id));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageAvailable=false;}}
function notify(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3600);}
function entry(id,title,text){if(!state.journal.some(e=>e.id===id))state.journal.push({id,title,text,chapter:chapter().tag});}
const statLabels={inspiration:'灵感',hair:'发量',grind:'肝度',gpa:'模拟GPA'};
function adjust(delta,label){const before=state.stats;state.stats=D.applyStats(before,delta);state.lastDelta={label,delta:Object.fromEntries(Object.keys(statLabels).map(k=>[k,Math.round((state.stats[k]-before[k])*100)/100]))};}
function deltaText(delta){return Object.entries(delta).filter(([,v])=>v).map(([k,v])=>`${statLabels[k]} ${v>0?'+':''}${k==='gpa'?v.toFixed(2):v}`).join(' · ')||'状态保持，继续自己的节奏。';}
function finishTask(id,text,energy=0,delta=null){if(completed(id))return;state.done[state.stage].push(id);state.energy=Math.max(0,Math.min(100,state.energy+energy));const title=chapter().tasks.find(t=>t[0]===id)?.[1]||id;const defaults={report:{inspiration:1},roommate:{inspiration:2,grind:-2},train:{grind:6,hair:-2},recover:{hair:3,grind:-3},read:{gpa:.05},pack:{grind:-2},listen:{inspiration:3},feedback:{inspiration:4,gpa:.05}};if(delta||defaults[id])adjust(delta||defaults[id],title);entry(`${state.stage}-${id}`,title,text+(delta?`（${deltaText(state.lastDelta.delta)}）`:''));save();render();notify(finished()?'这一章的任务完成了，可以继续下一章。':text);}
function setView(nextView) {
  const changed = view !== nextView;
  view = nextView;
  history.replaceState(null, '', `#${view}`);
  render();
  if (changed) window.scrollTo(0, 0);
}
function showModal(title,body){$('#modal-content').innerHTML=`<div class="modal-inner"><div class="modal-header"><h2>${title}</h2><button class="close" data-action="close-modal" aria-label="关闭弹窗">×</button></div>${body}</div>`;if(!$('#modal').open)$('#modal').showModal();}
function closeModal(){$('#modal').close();}
function render(){
 $('#profile-name').textContent=`新生${state.name}`;
 document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
 $('#app').innerHTML=!state.identityConfirmed?identityPage():view==='schedule'?schedulePage():view==='journal'?journalPage():explorePage();
}
const STORY=window.SCU_STORY;
const dialoguePortraits = new Map(
 Object.entries(STORY.characters).map(([id, character]) => [character.name, id]),
);
dialoguePortraits.set('你', 'hero');
dialoguePortraits.set('内心旁白', 'hero');
function refreshSavedStoryCopy() {
 const revisions = STORY.revisedResults;
 if (!revisions) return;
 let changed = false;
 const replace = (record, key) => {
  if (!record || !Object.hasOwn(revisions, record[key])) return;
  record[key] = revisions[record[key]];
  changed = true;
 };
 replace(state.novel?.pending, 'result');
 for (const entry of state.novel?.log ?? []) replace(entry, 'text');
 for (const entry of state.journal) replace(entry, 'text');
 if (changed) save();
}
function castMember(id){
 if(id === 'hero') {
  return {
   name: state.name,
   role: '设计学类新生 · 主角',
   spriteClass: state.gender === '男' ? 'vn-hero-male' : 'vn-hero-female',
  };
 }
 const c=STORY.characters[id];if(!c)return null;
 if(id==='amu')return {...c,role:state.gender==='男'?'你的男室友':'你的女室友',spriteClass:state.gender==='男'?'vn-amu-male':'vn-amu-female'};
 return {...c,role:id==='zhou'?'同班同学 · 不是室友':c.role};
}
function protagonistImage(gender=state.gender){return gender==='男'?'assets/protagonist-male-v2.png':'assets/protagonist-female.png';}
function identityPage(){
 const resuming=state.done.some(x=>x.length);
 return `<section class="identity-page"><div class="identity-intro"><p class="eyebrow">A NEW CHAPTER / 入学之前</p><h1>先认识一下，你是谁？</h1><p>一本空白手账，一段由你选择的大学生活。</p></div><form id="identity-form" class="identity-form"><label for="start-name">你的角色姓名</label><input id="start-name" name="playerName" required maxlength="12" autocomplete="off" placeholder="写下你的名字或昵称" value="${resuming?escape(state.name):''}"><fieldset><legend>选择主角性别</legend><div class="identity-options">${['女','男'].map(g=>`<label class="identity-option"><input type="radio" name="playerGender" value="${g}" required><span class="actor-sheet hero-${g==='男'?'male':'female'}" role="img" aria-label="${g}主角的像素立绘"></span><span>${g}生主角<small>匹配${g}室友阿沐</small></span></label>`).join('')}</div></fieldset><p class="identity-roles"><strong>先记住这三个人</strong><br>阿沐：你的室友，与你同寝室。<br>周言：设计学类同班同学，不是室友。<br>林禾：迎新志愿者学姐。</p><p class="hint">${resuming?'已有剧情、课表和草图会保留，确认角色后继续。':'姓名可以使用昵称。你的选择会自动保存在当前浏览器。'}</p><button type="submit" class="primary identity-start">${resuming?'确认角色，继续我的故事':'写下名字，走进川大'} →</button></form></section>`;
}
function commitIdentity(name,gender){
 name=String(name||'').trim().slice(0,12);
 if(!name||!['女','男'].includes(gender)){notify('请填写姓名，并选择主角性别。');return false;}
 const selected=D.catalog.find(c=>c.id===state.sport);
 if(selected?.gender&&selected.gender!==gender){notify('已选体育课有性别限制，请保留当前性别，或重新开始后更换。');return false;}
 state.name=name;state.gender=gender;state.identityConfirmed=true;save();return true;
}

function novelState(){
 if(!state.novel){let index=STORY.nodes.findIndex(n=>n.tasks.length&&!n.tasks.every(id=>completed(id,n.stage)));if(index<0)index=18;state.novel={index,line:0,pending:null,flags:{},log:[],finished:false};save();}
 return state.novel;
}
function novelNode(){return STORY.nodes[novelState().index];}
function novelReady(){const n=novelNode();return n.tasks.every(id=>completed(id,n.stage));}
function novelLine(){const v=novelState(),n=novelNode();let lines=n.lines.map(x=>({...x}));
 if(n.id==='03'&&v.flags.metZhou&&n.reunionLine){
  const greeting=lines.find(line=>line.speaker==='周言');
  if(greeting)greeting.text=n.reunionLine;
 }
 if(n.id==='14'&&v.flags.keptReferences)lines.push({speaker:'你',text:'我选这张底图，是因为它的形态关系。我还保留了刚才的版本，想一起比较看看。'});
 if(n.id==='17'&&v.flags.helpedLuggage)lines.push({speaker:'周言',text:'上次一起搬箱子挺顺的，这次要不要也搭个伙？当然，先看你有没有时间。'});
 if(n.id==='19'){if(v.flags.helpedLuggage)lines.push({speaker:'周言',text:'下学期搬东西还叫我。项目分工也记得叫我一起商量。'});if(v.flags.firstNightRest)lines.push({speaker:'阿沐',text:'还记得开学第一天说以后再逛吗？这次走哪条路？'});}
 return {lines,current:lines[Math.min(v.line,lines.length-1)],atEnd:v.line>=lines.length};
}
function novelPage(){
 const v=novelState(),n=novelNode(),line=novelLine(),pending=v.pending,background=window.SCU_BACKGROUNDS?.[n.id];
 const teacherSpeaking = !pending && line.current.speaker === '老师';
 const reviewingWithTeacher = n.id === '14' && pending?.index !== 2;
 const sceneCharacter = teacherSpeaking || reviewingWithTeacher ? 'teacher' : n.character;
 const speakingCharacter = !pending && !line.atEnd && dialoguePortraits.get(line.current.speaker);
 const character = speakingCharacter || sceneCharacter;
 const c = castMember(character);
 const wait=pending&&n.tool&&!novelReady();
 const selecting=!pending&&line.atEnd;
 const text=pending?(wait?'你已经作出选择。接下来完成这一步，故事就会继续。':pending.result):line.current.text;
 const speaker=pending?(wait?'行动时间':'选择之后'):(line.current.speaker==='你'?state.name:line.current.speaker);
 let controls='';
 if(selecting)controls=`<div class="vn-options" aria-label="剧情选项">${n.options.map((o,i)=>`<button class="vn-option" data-action="vn-choice" data-id="${i}"><span>${String.fromCharCode(65+i)}</span>${escape(o.text)}<b>▶</b></button>`).join('')}</div>`;
 else if(wait)controls=`<button class="vn-continue" data-action="vn-tool">${escape(novelToolLabel(n))} ▶</button>`;
 else controls=`<button class="vn-continue" data-action="vn-next">${pending?(n.id==='19'?'查看这一学期的结局':'记下这一刻，继续'):'继续对话'} ▶</button>`;
 return `<section class="vn-shell"><div class="vn-topline"><div><span>SCU / PIXEL STORIES</span><h1>我的第一学期<span>川大设计新生模拟器</span></h1></div><button class="vn-small" data-action="vn-cast">人物与前情</button></div><section class="vn-stage vn-${n.setting} ${background?'vn-illustrated':''}" data-scene="${n.id}" aria-label="像素风剧情画面"><div class="vn-scenery" aria-hidden="true" ${background?`style="background-image:url('${escape(background.file)}');background-position:${background.position}"`: ''}></div>${!background&&['dorm','desk','classroom'].includes(n.setting)?'<div class="vn-room" aria-hidden="true"><div class="vn-window"></div><div class="vn-shelf"></div><div class="vn-room-desk"></div><div class="vn-chair"></div></div>':''}<div class="vn-chapter"><span>CHAPTER ${n.stage+1} / 8</span><strong>${escape(D.chapters[n.stage].tag)}</strong><small>场景 ${n.id} / 19 · ${escape(n.title)}</small></div><div class="vn-status" aria-label="本局属性">${Object.entries(statLabels).map(([key,label])=>`<span>${label}<strong>${key==='gpa'?state.stats[key].toFixed(2):state.stats[key]}</strong></span>`).join('')}</div>${c?`<div class="vn-character vn-${character} ${c.spriteClass||''}" role="img" aria-label="${escape(c.name)}的像素人物立绘"></div><div class="vn-character-tag">${escape(c.name)}<small>${escape(c.role)}</small></div>`:''}<div class="vn-scene-label">${background?escape(background.label):({campus:'江安 · 报到日',dorm:'宿舍 · 新生活',night:'宿舍 · 灯亮的时候',field:'校园 · 军训生活',desk:'书桌前 · 课表与选择',classroom:'艺术大楼 · 设计课堂',sunset:'学期末 · 再翻开第一页'})[n.setting]}</div><div class="vn-dialogue ${selecting?'choosing':''}"><div class="vn-name">${escape(selecting?'你的选择':speaker)}</div>${selecting?'<p class="vn-question">这一刻，你想怎么做？</p>':`<p class="vn-dialogue-text" aria-live="polite">${escape(text).replace(/\n/g,'<br>')}</p>`}${controls}${pending&&!wait&&n.id!=='19'&&state.lastDelta?`<div class="vn-delta">${escape(deltaText(state.lastDelta.delta))}</div>`:''}</div></section><div class="vn-bottom"><span>◆ 已自动存档 · 人物和对话为虚构剧情</span><div><button class="vn-small" data-action="vn-log">对话记录</button><button class="vn-small" data-action="open-campus-map">校园地图</button><button class="vn-small" data-view="schedule">我的课表</button><button class="vn-small" data-view="journal">成长手账</button></div></div><p class="vn-footnote">场景插画为像素风叙事背景，校园导航请查看你提供的真实地图。发量、肝度、模拟GPA均为游戏数值。</p></section>`;
}
function novelToolLabel(n){return ({face:'完成人脸录入流程',uniform:'购买当天的军训服',schedule:'查看预置课表',sport:'进入真实体育课选课',history:state.history?'核对课表并确认选课结果':'选择思政课程班次',studio:n.id==='15'?'修改草图并保存版本':'打开拼贴工作台，保存组合'})[n.tool]||'完成这一步';}
function novelTool(){const n=novelNode();state.stage=n.stage;state.unlocked=Math.max(state.unlocked,n.stage);save();switch(n.tool){case 'face':face();break;case 'uniform':uniform();break;case 'schedule':if(!completed('read',2))finishTask('read','已读懂预置课表与需要自行选择的课程。');setView('schedule');break;case 'sport':catalog('sport');break;case 'history':if(state.history){state.week=4;setView('schedule');}else catalog('history');break;case 'studio':studio();break;}}
function novelChoose(index){const v=novelState(),n=novelNode();if(v.pending||index<0||index>=n.options.length||!novelLine().atEnd)return;
 const o=n.options[index];v.pending={index,result:o.result||'你把这次选择记在手账里，准备继续。'};v.log.push({scene:n.id,speaker:'你的选择',text:o.text});state.stage=n.stage;state.unlocked=Math.max(state.unlocked,n.stage);
 const delta=n.tool?{}:index===0?{inspiration:2,grind:-1}:index===1?{inspiration:3,grind:2}:{hair:1,grind:-1};if(n.stage>=5&&n.id!=='19'){const late={16:[{inspiration:6,gpa:.15,grind:-6,hair:2},{inspiration:3,gpa:.05,grind:2,hair:2},{inspiration:9,grind:10,hair:-3}],17:[{inspiration:8,gpa:.25,grind:8,hair:-4},{inspiration:16,gpa:.35,grind:32,hair:-15},{inspiration:2,gpa:.12,grind:-6,hair:5}],18:[{inspiration:8,gpa:.5,grind:-5,hair:3},{inspiration:15,gpa:.4,grind:26,hair:-18},{inspiration:2,gpa:-.6,grind:-3,hair:3}]};for(const k of Object.keys(delta))delete delta[k];Object.assign(delta,late[Number(n.id)][index]);}
 if(n.id!=='19')adjust(delta,n.title);
 if(n.id==='01'&&index===2)v.flags.metZhou=true;if(n.id==='03'&&index===0)v.flags.helpedLuggage=true;if(n.id==='05'&&index===2)v.flags.firstNightRest=true;if(n.id==='12'){v.flags.keptReferences=index===0;state.reference=['botanical','architecture','ocean'][index];}
 if(n.id==='14'){state.choices.feedback=['reference','composition','fatigue'][index];state.feedbackSnapshot=JSON.stringify({reference:state.reference,pieces:state.pieces});}
 if(n.id==='19')state.endingQuote=o.text;
 save();render();
}
function novelNext(){const v=novelState(),n=novelNode();
 if(!v.pending){const line=novelLine();if(!line.atEnd){v.log.push({scene:n.id,speaker:line.current.speaker,text:line.current.text});v.line++;save();render();}return;}
 if(n.tool&&!novelReady()){notify('先完成本场景的操作，再继续剧情。');return;}
 v.log.push({scene:n.id,speaker:'选择之后',text:v.pending.result});
 for(const id of n.tasks){if(!completed(id,n.stage)){state.done[n.stage].push(id);entry(`story-${n.id}-${id}`,D.chapters[n.stage].tasks.find(t=>t[0]===id)?.[1]||n.title,v.pending.result);}}
 if(n.id==='19'){v.finished=true;save();setView('journal');window.scrollTo({top:0,behavior:'smooth'});return;}
 v.index++;v.line=0;v.pending=null;state.stage=STORY.nodes[v.index].stage;state.unlocked=Math.max(state.unlocked,state.stage);save();render();
}
function novelLog(){const v=novelState();showModal('这一段校园故事',v.log.length?`<div class="vn-log">${v.log.map(x=>`<article><small>场景 ${x.scene} · ${escape(x.speaker)}</small><p>${escape(x.text).replace(/\n/g,'<br>')}</p></article>`).join('')}</div>`:'<p>故事刚刚开始。读过的对话和作出的选择都会留在这里。</p>');}
function novelCast(){showModal('认识校园里的几个人',`<div class="vn-cast-list"><article><div class="actor-sheet cast-portrait hero-${state.gender==='男'?'male':'female'}" role="img" aria-label="主角立绘"></div><strong>${escape(state.name)}</strong><p>你 · ${state.gender}生主角</p></article>${Object.keys(STORY.characters).map(id=>{const c=castMember(id);return `<article>${id==='amu'?`<div class="actor-sheet cast-portrait amu-${state.gender==='男'?'male':'female'}" role="img" aria-label="阿沐立绘"></div>`:''}<strong>${c.name}</strong><p>${c.role}</p></article>`;}).join('')}</div><p>阿沐是与你同寝室的室友；周言是同班同学，不是室友；林禾是迎新志愿者学姐。室友阿沐的性别与主角匹配，周言保留原来的男同学设定。</p><p>剧情从报到开始，经过军训、选课、设计作业、比赛和小组合作，直到学期末。</p>`);}

function explorePage(){return novelPage();}
function oldExplorePage(){return `<div class="layout"><aside class="left-rail">${dayCard()}${tasksCard()}<div class="chapter-list" aria-label="关卡进度">${D.chapters.map((c,i)=>`<button class="chapter-item ${i===state.stage?'active':''}" data-action="chapter" data-id="${i}" ${i>state.unlocked?'disabled':''}><i>${i<state.unlocked?'✓':String(i+1).padStart(2,'0')}</i><span>${c.tag}<small>${i>state.unlocked?'尚未解锁':i===state.stage?'正在体验':'可以回顾'}</small></span></button>`).join('')}</div></aside><section class="center">${storyCard()}<div class="stats-inline">${Object.entries(statLabels).map(([k,n])=>`<span>${n}<strong>${k==='gpa'?state.stats[k].toFixed(2):state.stats[k]}</strong></span>`).join('')}</div>${state.lastDelta?`<div class="delta-card" role="status"><span>刚刚的选择 · ${escape(state.lastDelta.label)}</span><strong>${deltaText(state.lastDelta.delta)}</strong></div>`:''}${mapCard()}</section><aside class="right-rail">${statsCard()}${rightRail()}</aside></div>`;}
function dayCard(){const total=chapter().tasks.length,n=state.done[state.stage].length;return `<div class="day-card"><small>${chapter().time} / CHAPTER 0${state.stage+1}</small><h2>${chapter().tag}</h2><p>${chapter().text}</p><div class="progress-label"><span>今日探索进度</span><span>${n} / ${total}</span></div><div class="progress-track"><i style="width:${n/total*100}%"></i></div></div>`;}
function tasksCard(){return `<section class="card task-panel"><h2 class="section-title">我的待办 <span>TO-DO LIST</span></h2><div class="tasks">${chapter().tasks.map(([id,name])=>`<button class="task ${completed(id)?'done':nextTask()?.[0]===id?'current':''}" data-task="${id}"><span class="check">${completed(id)?'✓':nextTask()?.[0]===id?'·':''}</span><span class="task-name">${name}</span></button>`).join('')}</div>${finished()?`<button class="primary chapter-next" data-action="advance">${state.stage===D.chapters.length-1?'查看我的学期结局 ↗':'继续下一章 →'}</button>`:''}</section>`;}
function tree(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="12" rx="13" ry="5" fill="#b8c3a0" opacity=".35"/><path d="M0 5v13" stroke="#a5956b" stroke-width="3"/><ellipse cy="-4" rx="12" ry="18" fill="#9fae7c"/><ellipse cx="-5" cy="-7" rx="8" ry="12" fill="#b4c18f"/><path d="M0-12v15" stroke="#8b9d6c" fill="none"/></g>`;}
function building(x,y,w,h,color='#d7c6a6',roof='#b88c6a',floors=2){let windows='';for(let r=0;r<floors;r++)for(let c=0;c<Math.floor(w/17);c++)windows+=`<rect x="${9+c*17}" y="${-h+12+r*17}" width="6" height="9" fill="#87968d" opacity=".75"/>`;return `<g transform="translate(${x} ${y})"><path d="M0 0l${w} 0 18-12-${w} 0Z" fill="#b1b795" opacity=".4"/><rect x="0" y="${-h}" width="${w}" height="${h}" fill="${color}"/><path d="M${w} ${-h}l18-11V-11L${w} 0Z" fill="#b5aa8d"/><path d="M-5 ${-h}l${w+9} 0 21-12-${w+9} 0Z" fill="${roof}"/>${windows}<rect x="${Math.round(w/2)-5}" y="-16" width="11" height="16" fill="#8b8a71"/><path d="M0 0h${w}" stroke="#adad90"/></g>`;}
function campusArt(){let trees='';[[56,83,1.1],[91,65,.9],[125,89,.9],[168,64,.8],[529,74,1],[565,106,.8],[587,145,1],[75,182,1],[103,207,.8],[555,290,1],[572,333,.85],[508,359,.8],[479,372,.9],[110,345,1],[64,317,1.1],[195,379,.8],[222,356,.8],[386,87,.8],[425,61,.8],[271,93,.8],[318,74,.9]].forEach(t=>trees+=tree(...t));return `<svg class="campus" viewBox="0 0 640 430" aria-label="江安校园叙事示意图，地点通过图上按钮探索" role="img"><defs><pattern id="grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".4" fill="#aab38e" opacity=".16"/></pattern></defs><rect width="640" height="430" fill="#eeefdf"/><rect width="640" height="430" fill="url(#grain)"/><path d="M-20 300C112 221 217 330 350 268S517 165 674 242" stroke="#c7d5c4" stroke-width="45" fill="none"/><path d="M-20 300C112 221 217 330 350 268S517 165 674 242" stroke="#dce6d7" stroke-width="30" fill="none"/><path d="M-20 300C112 221 217 330 350 268S517 165 674 242" stroke="#b0c9c0" stroke-width="17" fill="none"/><path d="M-20 302C112 223 217 332 350 270S517 167 674 244" stroke="#d7e4d9" stroke-width="1.5" fill="none"/><path d="M176 428L292 223 179 114M292 223l165-100M292 223l132 128M292 223L87 235" stroke="#e1dbc5" stroke-width="27" fill="none" stroke-linejoin="round"/><path d="M176 428L292 223 179 114M292 223l165-100M292 223l132 128M292 223L87 235" stroke="#f8f4e7" stroke-width="19" fill="none" stroke-linejoin="round"/><path d="M234 315l21-35M248 322l21-35" stroke="#b7ab8c" stroke-width="3"/><path d="M238 311l19-31 8 5-19 31Z" fill="#d7c8a8"/><ellipse cx="292" cy="220" rx="35" ry="23" fill="#e5d9bd"/><ellipse cx="292" cy="220" rx="23" ry="15" fill="#b7c79d"/><ellipse cx="292" cy="220" rx="13" ry="9" fill="#d6dfbc"/>${trees}${building(125,171,95,55,'#e3d6bd','#a77a5f',2)}${building(365,152,111,58,'#ddcfb3','#9c8b6a',2)}${building(440,364,81,52,'#d3c5a9','#a9856b',2)}${building(85,302,71,35,'#e0ccb0','#be9970',1)}${building(320,374,65,39,'#ddcdb4','#aa7e61',1)}<g transform="translate(444 215)"><path d="M0 0l89-11 26 34-90 13Z" fill="#bac99f" stroke="#a8b98d"/><path d="M11 4l68-8 17 23-68 9Z" fill="none" stroke="#e8eed6"/><path d="M45 0l15 26" stroke="#e8eed6"/><ellipse cx="54" cy="12" rx="8" ry="5" transform="rotate(-7)" fill="none" stroke="#e8eed6"/></g><g transform="translate(228 376)"><path d="M-29 13L0 0l31 11v8L0 9l-29 13Z" fill="#a7785c"/><path d="M-27 14v22M27 13v22" stroke="#b9a683" stroke-width="7"/><path d="M-27 36L1 24l28 10" fill="none" stroke="#bcbd9e"/></g><g transform="translate(285 248)"><ellipse cy="15" rx="12" ry="4" fill="#b4bea0"/><path d="M-4 3l-2 12m10-12 3 12" stroke="#576555" stroke-width="3"/><rect x="-7" y="-12" width="14" height="19" rx="6" fill="#c47f55"/><circle cy="-17" r="7" fill="#cdb48d"/><path d="M-7-20q7-10 14 1" fill="#455944"/><rect x="10" y="-2" width="10" height="16" rx="2" fill="#ddbd72"/><path d="M12-2v-4h5v4" stroke="#8c8866" fill="none"/></g><g transform="translate(602 47)" fill="#8a997c"><path d="M0 0l-5 17 5-4 5 4Z"/><text x="0" y="-6" text-anchor="middle" font-size="9" font-family="Georgia">N</text></g><text x="35" y="401" font-family="Georgia" font-style="italic" font-size="13" fill="#9ba586">A little adventure begins.</text></svg>`;}
const places=[['report','迎新报到点'],['face','人脸录入点'],['dorm','宿舍区'],['uniform','军训服购买点'],['field','军训场地'],['arts','艺术大楼'],['canteen','食堂与生活区']];
function campusMapArt(id) {
 return `<svg id="${id}" class="campus-map-art" viewBox="0 0 1521 1280" width="1521" height="1280"
  role="img" aria-label="四川大学江安校区平面图，含道路、建筑、水系及图例">
  <defs>
   <clipPath id="${id}-content">
    <path d="M862,106 876,119 901,112 925,135 918,141 908,145 906,149 1062,351 1074,359 1085,359 1098,352
        1204,271 1207,266 1189,247 1189,244 1224,215 1228,217 1243,238 1246,238 1275,217 1307,251 1307,254
        1280,273 1278,275 1279,278 1385,410 1389,412 1405,400 1439,449 1273,572 1263,584 1263,594 1266,600
        1305,640 1390,726 1388,730 1376,738 1208,845 1134,711 1123,701 1109,700 979,792 949,810 914,823
        764,861 758,899 697,903 692,879 687,879 342,963 328,970 323,979 327,1010 272,1021 267,1018
        264,1001 258,985 246,974 229,968 176,964 178,902 243,913 252,907 255,900 255,892 154,341
        119,340 120,304 139,302 144,297 134,243 182,235 188,282 192,290 316,278 446,259 512,245
        550,234 553,229 549,213 614,191 621,190 624,212 642,206 827,137 829,135 821,126 821,122Z"/>
    <rect x="972" y="911" width="359" height="199"/>
    <circle cx="248" cy="170" r="38.5"/>
   </clipPath>
  </defs>
  <rect width="1521" height="1280" fill="#fff"/>
  <image href="assets/jiang-an-campus-map.jpg" width="1521" height="1280" clip-path="url(#${id}-content)"/>
  <circle cx="248" cy="170" r="38.5" fill="none" stroke="#302b28" stroke-width="1.5"/>
  <path d="M235 116V82L260 116V82" fill="none" stroke="#302b28" stroke-width="4" stroke-linejoin="round"/>
 </svg>`;
}
function mapCard(){return `<section class="card map-card campus-photo-card"><div class="map-head"><div><h2>沿着地图，认识江安</h2><p>四川大学江安校区平面图</p></div><button class="map-badge" data-action="open-campus-map">放大查看 ↗</button></div><button class="campus-map-preview" data-action="open-campus-map" aria-label="放大查看四川大学江安校区平面图">${campusMapArt('campus-map-thumbnail')}<span>点击查看大图 ⤢</span></button><div class="map-task-links"><p>任务入口 <small>办理地点以当届通知为准</small></p><div>${places.map(([id,name])=>`<button class="map-task-link ${state.stage===0&&completed(id)?'done':''}" data-place="${id}">${name}${state.stage===0&&completed(id)?' ✓':''}</button>`).join('')}</div></div><div class="map-note"><span>校园底图 · 由你提供</span><span>原图红星标注西南校门</span></div></section>`;}
let campusMapZoom=1;
function openCampusMap(){campusMapZoom=1;showModal('江安校区 · 校园地图',`<div class="map-viewer"><div class="map-viewer-toolbar"><button class="secondary" data-action="campus-map-zoom" data-id="-0.25" aria-label="缩小校园地图">−</button><output id="campus-map-scale" aria-live="polite">100%</output><button class="secondary" data-action="campus-map-zoom" data-id="0.25" aria-label="放大校园地图">＋</button><button class="secondary" data-action="campus-map-reset">适应窗口</button><span>放大后可横向、纵向滚动查看</span></div><div class="map-viewer-scroll">${campusMapArt('campus-map-full')}</div><p class="hint">保留你提供的原图。图中的红星是原图标记，不代表角色的实时位置。</p></div>`);}
function zoomCampusMap(delta){campusMapZoom=Math.round(Math.max(1,Math.min(3,campusMapZoom+delta))*100)/100;const map=$('#campus-map-full');if(!map)return;map.style.width=`${campusMapZoom*100}%`;$('#campus-map-scale').textContent=`${Math.round(campusMapZoom*100)}%`;}
const taskScenes={
 report:{title:'一手行李，一手录取通知',text:'迎新点就在前面。你找到了设计学类的报到指引，志愿者请你先确认需要办理的事项。',actions:[['读完指引，完成报到','complete','report']]},
 face:{title:'把入学手续，一项项办好',text:'报到清单上还有人脸录入。先找到办理位置，按现场提示完成，再确认录入结果。',actions:[['前往人脸录入点','face']]},
 dorm:{title:'找到属于自己的那扇门',text:'带着行李，你沿着宿舍指引找到对应楼栋和寝室。进门前，先核对一次自己的住宿信息。',actions:[['核对信息，找到寝室','complete','dorm']]},
 luggage:{title:'把行李变成生活的样子',text:'箱子终于放下来了。你可以先整理床位和常用物品，也可以先向同学求助，一起把大件行李搬进去。',actions:[['先整理床位和常用物品','complete','luggage'],['和同学互相帮忙搬行李','help-luggage']]},
 uniform:{title:'今天还有一件事：购买军训服',text:'入学报到当天要购买军训服。按通知找到购买点，确认尺码与所需物品，再完成购买。',actions:[['挑选并确认尺码','uniform']]},
 roommate:{title:'“你好，你也是设计学类的吗？”',text:'室友也在整理东西。一个简单的招呼，或许就是大学里第一段关系的开始。',actions:[['介绍自己，交换称呼','complete','roommate'],['问问对方军训服买好了没有','complete','roommate']]},
 notice:{title:'把明天的集合安排记下来',text:'宿舍安顿好了。打开军训通知，确认集合时间、地点和需要带的东西；不清楚的地方向负责老师或同学确认。',actions:[['记下集合安排','complete','notice']]},
 gather:{title:'第一次，和新的集体站在一起',text:'你换好军训服，带着通知要求的用品，按指引来到集合点，找到自己的队伍。',actions:[['核对队伍，按时集合','complete','gather']]},
 train:{title:'从不熟悉，到慢慢跟上节奏',text:'新的口令、新的同学、新的作息。你试着听清要求、跟上队伍，也逐渐记住身边同学的名字。',actions:[['认真听要求，参加训练','complete','train']]},
 recover:{title:'忙碌的一天，也需要留白',text:'训练后的空闲时间，你想怎样安排？休息、吃饭和交流，都是适应新生活的一部分。',actions:[['和同学吃饭，互相聊聊','recover','聊过之后，对新集体多了一点熟悉。'],['先洗漱休息，整理明天的用品','recover','留出休息时间，也把明天准备好了。']]},
 read:{title:'课表已经有内容了，我还要选什么？',text:'预置课表不是空白的。先查看已有课程的周次、节次和地点，再读正式选课通知，确认需要自己选择的体育课和“五史”等课程。',actions:[['查看预置课表与选课说明','read-schedule']]},
 sport:{title:'正式选课：选一门适合自己的体育课',text:'正式选课开放了。查看班次时间、限制条件和项目要求，再选择课程；心仪班次已满时，可以考虑备选。',actions:[['进入体育课正式选课','catalog','sport']]},
 history:{title:'正式选课：“五史”课程',text:'先了解课程，再结合自己的兴趣和预置课表选择班次。这个原型保留“五史”课程名，并明确区分截图班次与剧情示例。',actions:[['进入“五史”正式选课','catalog','history']]},
 verify:{title:'提交之后，再确认一次',text:'查看选课结果是否成功写入课表，核对周次、节次、校区和地点。预置课程与已选课程会用不同颜色显示。',actions:[['打开课表核对结果','verify']]},
 'check-class':{title:'找到第3周的第一堂专业课',text:'截图显示，第3周星期一的1—4节和5—8节都有设计构成，地点是江安艺术大楼 A2-1。先把路线和用品准备好。',actions:[['查看第3周课表','class-schedule']]},
 pack:{title:'上课前，给自己留一点准备时间',text:'检查老师或课程通知要求的用品。对暂时不确定的材料先记下问题，再向老师确认，给自己的准备留出余量。',actions:[['整理随身用品，记下材料问题','complete','pack']]},
 classroom:{title:'艺术大楼 A2-1，就在前面',text:'按照课表和现场标识找到教室，核对课程信息。第一次走这条路线，提前一点出发会更从容。',actions:[['找到教室，准备上课','complete','classroom']]},
 listen:{title:'设计构成，从这次课堂开始',text:'根据你提供的经历，这门课包括平面、色彩和立体构成。平面构成在课堂中尝试综合材料拼贴，拿给老师看，再根据反馈调整。',actions:[['记下任务流程，开始第一次尝试','complete','listen']]},
 reference:{title:'找了很多图，还是没有方向',text:'先给这次尝试一个小切入点：你更想观察植物的形态、建筑的结构，还是波浪的节奏？先选一个，就有了开始的地方。',actions:[['打开参考底图与工作台','studio']]},
 collage:{title:'把材料放上去，看看会发生什么',text:'网纱、干花、蕾丝、布料、纸张、纽扣、金属齿轮……材料可以自由选择。先试两个元素，再调整位置，看看它们和底图如何相处。',actions:[['进入拼贴工作台','studio'],['先停一会儿，整理一下思路','rest']]},
 feedback:{title:'带着作品和问题，去找老师',text:'你做了一阵，也觉得有些累了。先说清自己卡在哪里，再听听反馈。以下对话为剧情示例，并非对真实老师的引述。',actions:[['“我找了很多参考，但不知道该选哪张。”','feedback','reference'],['“材料摆上去以后，画面很乱。”','feedback','composition'],['“我现在很累，也不知道下一步怎么改。”','feedback','fatigue']]},
 revise:{title:'只改一处，也是一种推进',text:'重新打开草图，尝试移动、删减或旋转一个元素，再比较变化。拍摄实际作品时，还需要检查反光，必要时再作后期处理。',actions:[['调整草图，保留一个版本','studio']]}
};
const taskMessages={report:'报到完成。接下来可以录人脸、安顿寝室和购买军训服。',dorm:'已经找到寝室，行李终于有了落脚点。',luggage:'床位和常用物品整理好了。',roommate:'你和室友互相认识了，后续可以一起确认通知。',notice:'已记录集合安排和用品清单。',gather:'你找到了队伍，完成第一次集合。',train:'一起训练之后，对新的作息更熟悉了。',pack:'随身用品和待确认的问题已经准备好了。',classroom:'已找到艺术大楼 A2-1。',listen:'已了解课堂作业的基本流程。'};
function canTask(id){
 const rules=state.stage===0?{face:'report',dorm:'report',luggage:'dorm',uniform:'report',roommate:'dorm'}:state.stage===1?{gather:'notice',train:'gather',recover:'train'}:state.stage===2?{sport:'read',history:'read'}:state.stage===3?{pack:'check-class',classroom:'pack',listen:'classroom'}:state.stage===4?{collage:'reference',feedback:'collage',revise:'feedback'}:Object.fromEntries(chapter().tasks.slice(1).map((t,i)=>[t[0],chapter().tasks[i][0]]));
 if(rules[id]&&!completed(rules[id])){const title=chapter().tasks.find(t=>t[0]===rules[id])?.[1];return `先完成“${title}”，再来这里。`;}
 if(id==='verify'&&(!state.sport||!state.history))return '请先完成体育课和“五史”课程的正式选课。';
 return null;
}
let sportsFilters={project:'',day:'',compatible:false,search:'',page:1};
function sportConflict(c){let earliest=null;for(const other of [...D.courses,...selectedCourses().filter(x=>x.group!=='sport')]){const hit=D.conflicts(c,other);if(hit&&(!earliest||hit.week<earliest.week))earliest=hit;}return earliest;}
function sportIssue(c){if(c.unavailable)return c.sourceNote;if(c.gender&&c.gender!==state.gender)return `限${c.gender}生，当前角色为${state.gender}`;const hit=sportConflict(c);return hit?`第${hit.week}周与“${hit.course}”冲突`:'';}
function sportCatalog(error=''){
 const projects=[...new Set(D.catalog.filter(c=>c.group==='sport').map(c=>c.project))];
 const unlocked=state.unlocked>=2&&completed('read',2), rows=D.catalog.filter(c=>c.group==='sport');
 const filtered=rows.filter(c=>(!sportsFilters.project||c.project===sportsFilters.project)&&(!sportsFilters.day||c.slots.some(s=>s.day===Number(sportsFilters.day)))&&(!sportsFilters.search||[c.name,c.code,c.section,c.teacher,c.sourceNote,c.slots[0].room].join(' ').toLowerCase().includes(sportsFilters.search.toLowerCase()))&&(!sportsFilters.compatible||!sportIssue(c)));
 const totalPages=Math.max(1,Math.ceil(filtered.length/16));sportsFilters.page=Math.min(totalPages,Math.max(1,sportsFilters.page));
 const shown=filtered.slice((sportsFilters.page-1)*16,sportsFilters.page*16),selected=D.catalog.find(c=>c.id===state.sport);
 showModal('体育课 · 真实班次选课',`<p>${escape(D.sportsMetadata.title)} · 共${rows.length}个班次、${projects.length}个项目。<br>当前角色：${escape(state.name)} · ${escape(state.gender)}。体育课仍在军训后正式开放选择。</p><div class="schedule-note">班次、教师、时间、地点和备注来自你提供的排课表。表格未提供实时名额或器材要求；游戏中的选择不连接真实教务系统。预置课程沿用你之前提供的截图。</div>${!unlocked?'<p class="locked-note">当前可浏览全部班次；完成军训并阅读预置课表后才能选择。</p>':''}${state.sportImportNote?`<div class="schedule-note">${escape(state.sportImportNote)}</div>`:''}${selected?`<div class="schedule-note">已选：${escape(selected.name)} · ${escape(selected.section)}班 · ${escape(selected.teacher)}${completed('verify',2)?'（已确认）':''}</div>`:''}<div class="sports-filters"><label>体育项目<select id="sports-project"><option value="">全部项目</option>${projects.map(p=>`<option value="${escape(p)}" ${p===sportsFilters.project?'selected':''}>${escape(p)}</option>`).join('')}</select></label><label>上课星期<select id="sports-day"><option value="">全部星期</option>${[1,2,3,4,5].map(d=>`<option value="${d}" ${String(d)===sportsFilters.day?'selected':''}>星期${['','一','二','三','四','五'][d]}</option>`).join('')}</select></label><label class="sports-search">搜索项目、教师或课程号<input id="sports-search" value="${escape(sportsFilters.search)}" placeholder="例如：游泳、888004010A21"></label><label class="inline-check"><input id="sports-compatible" type="checkbox" ${sportsFilters.compatible?'checked':''}>仅看无冲突且符合角色限制的班次</label><div class="choices"><button class="primary" data-action="sports-filter">应用筛选</button><button class="secondary" data-action="sports-clear">清除筛选</button></div></div>${error?`<div class="error-box" role="alert">${escape(error)}</div>`:''}<p class="sports-count" role="status">筛选结果 ${filtered.length} 个班次 · 第 ${sportsFilters.page} / ${totalPages} 页</p><div class="catalog">${shown.map(c=>{const issue=sportIssue(c);return `<article class="catalog-item"><span class="small-tag">真实排课 · 第${c.sourceRow}行</span><h3>${escape(c.name)} · ${escape(c.section)}班</h3><p>教师：${escape(c.teacher)}<br>课程号：${escape(c.code)}</p><p>${c.slots.map(s=>`${slotText(s)}<br>${escape(s.room)}`).join('<br>')}</p><p>${escape(c.description)}</p>${issue?`<p class="sports-issue">${escape(issue)}</p>`:'<p class="sports-fit">与当前课表无冲突</p>'}<button class="${state.sport===c.id?'secondary':'primary'}" data-action="enroll" data-id="${c.id}" ${!unlocked||c.unavailable||state.sport===c.id||completed('verify',2)?'disabled':''}>${state.sport===c.id?'已选中 ✓':c.unavailable?'单独申请 · 不开放选课':issue?'查看限制并尝试选择':'选择此班次 →'}</button></article>`;}).join('')}</div>${shown.length?'':'<div class="empty-state">没有符合当前条件的班次，试试调整筛选。</div>'}<div class="sports-pagination"><button class="secondary" data-action="sports-page" data-id="-1" ${sportsFilters.page===1?'disabled':''}>上一页</button><span>${sportsFilters.page} / ${totalPages}</span><button class="secondary" data-action="sports-page" data-id="1" ${sportsFilters.page>=totalPages?'disabled':''}>下一页</button></div><p class="hint">未注明性别限制的班次按原表展示，不推定为男生班或女生班。特殊体育课保留原备注，需单独申请。1学分沿用此前课表截图。</p>`);
}
function openTask(id){const err=canTask(id);if(err){notify(err);return;}scene=id;setView('explore');$('.story-card')?.scrollIntoView({behavior:'smooth',block:'nearest'});}
function placeTask(id){
 const maps=[{report:['report'],face:['face'],dorm:['dorm','luggage','roommate'],uniform:['uniform'],field:[],arts:[],canteen:[]},{dorm:['notice'],field:['gather','train'],canteen:['recover']},{report:['read','sport','history','verify']},{dorm:['pack'],arts:['check-class','classroom','listen']},{arts:['reference','collage','feedback','revise']}];
 const tasks=(maps[state.stage]||{dorm:chapter().tasks.map(t=>t[0]),arts:chapter().tasks.map(t=>t[0])})[id]||[];const todo=tasks.find(x=>!completed(x))||tasks[0];if(todo)openTask(todo);else{scene=`place-${id}`;render();}
}
function storyCard(){
 let id=scene&&(taskScenes[scene]||D.textEvents[scene])?scene:nextTask()?.[0];
 if(scene?.startsWith('place-'))return `<section class="card story-card"><div class="story-label"><i></i> CAMPUS MOMENT</div><h2>慢慢逛，也会慢慢熟悉</h2><p>这里是${escape(places.find(p=>`place-${p[0]}`===scene)?.[1]||'校园的一角')}。你记下了这个地点，接下来可以继续当天的待办。</p><div class="choices"><button class="secondary" data-action="next-task">回到当前任务 →</button></div></section>`;
 if(finished()&&!scene)return completedStory();
 if(D.textEvents[id]){const event=D.textEvents[id];return `<section class="card story-card text-story"><div class="story-label"><i></i> 文字选择 · ${chapter().tag}</div><h2>${event.title}</h2><p>${event.text}</p>${completed(id)?'<div class="choices"><button class="secondary" data-action="next-task">继续下一段故事 →</button></div>':`<div class="text-choices">${event.options.map(([text],i)=>`<button class="text-choice" data-action="text-choice" data-id="${id}" data-index="${i}"><span>${String.fromCharCode(65+i)}</span>${text}<i>↗</i></button>`).join('')}</div>`}</section>`;}
 const s=taskScenes[id];if(!s)return completedStory();
 return `<section class="card story-card"><div class="story-label"><i></i> ${completed(id)?'这一件，已经完成':'你的下一段故事'} · STORY ${String(chapter().tasks.findIndex(t=>t[0]===id)+1).padStart(2,'0')}</div><h2>${s.title}</h2><p>${s.text}</p><div class="choices">${completed(id)?`<button class="secondary" data-action="next-task">${finished()?'查看本章小结':'看看接下来做什么'} →</button>`:s.actions.map(([label,action,arg],i)=>`<button class="${i===0?'primary':'choice'}" data-action="${action}" data-id="${escape(arg||'')}">${label}${i===0?' ↗':''}</button>`).join('')}</div></section>`;
}
function completedStory(){return `<section class="card story-card"><div class="story-label"><i></i> CHAPTER COMPLETE</div><h2>${state.stage===0?'行李安顿好了，新生活也是。':state.stage===D.chapters.length-1?'这一学期，有了自己的形状。':'又熟悉了一点，也向前走了一点。'}</h2><p>${state.stage===D.chapters.length-1?'从报到、军训，到选课、作业与比赛，你已经练习了准备、核对、求助和调整。来看看这一局的学期结局。':'刚刚完成的事情已经记在成长手账里。带着这些小小的经验，继续下一段校园生活。'}</p><div class="choices"><button class="primary" data-action="advance">${state.stage===D.chapters.length-1?'查看我的学期结局':'继续下一章'} →</button><button class="secondary" data-view="journal">回看这一段经历</button></div></section>`;}
function statsCard(){return `<section class="card rail-card stats-card"><h3 class="section-title">这一局的状态 <span>MY STATUS</span></h3>${Object.entries(statLabels).map(([k,n])=>`<div class="stat-row"><div><span>${n}</span><strong>${k==='gpa'?state.stats[k].toFixed(2):state.stats[k]}<small> / ${k==='gpa'?'4.00':'100'}</small></strong></div><div class="stat-track"><i class="stat-${k}" style="width:${state.stats[k]/(k==='gpa'?4:100)*100}%"></i></div></div>`).join('')}<p class="hint">发量、肝度是趣味数值；模拟GPA为剧情指标，均不预测真实身体或成绩。</p></section>`;}
function portrait(){return `<svg viewBox="0 0 170 155" aria-hidden="true"><path d="M12 147C17 105 44 106 65 104h39c35 3 41 22 48 43Z" fill="#72846b"/><path d="M48 109l32 27 36-28-13-8H64Z" fill="#e8e4cf"/><path d="M79 109v19" stroke="#c6baa1"/><rect x="69" y="83" width="28" height="27" rx="9" fill="#d5b998"/><path d="M43 46C43 8 120 4 123 48l-5 44H48Z" fill="#4c5141"/><ellipse cx="83" cy="61" rx="32" ry="39" fill="#dfc6a4"/><path d="M49 56c-4-42 59-55 71-14l-25-6-12-11-13 22Z" fill="#4c5141"/><path d="M65 64h5m25 0h5" stroke="#5e5947" stroke-width="2" stroke-linecap="round"/><path d="M80 80q6 4 12-1" fill="none" stroke="#ac896c" stroke-width="2"/><path d="M41 124l-5 23m86-24 10 24" stroke="#5e7158" stroke-width="2"/><path d="M107 108l-6 39" stroke="#c3ad7d" stroke-width="9"/><path d="M130 118l12 16m-5-16-12 16" stroke="#91a27f" stroke-width="2"/></svg>`;}
function rightRail(){const msgs=[['辅导员 · 入学提醒','今天记得完成报到和人脸录入，安顿寝室后购买军训服。具体办理位置和安排，以当届通知为准。'],['军训 · 集合提醒','留意集合通知，确认时间、地点和用品。遇到不确定的事情，及时询问。'],['教务 · 选课提醒','先查看预置课表，再在正式开放时完成选课。提交之后，记得核对结果。'],['课堂 · 上课提醒','第3周的设计构成在艺术大楼 A2-1。先确认课表，再准备课堂用品。'],['工作台 · 小提示','先给自己一个小方向。找图、试材料、问问题，每一步都可以慢慢来。'],['工具 · 选择提醒','先从自己的任务和预算出发。设备之外，文件管理和备份也会影响工作体验。'],['项目 · 沟通提醒','决定参加之前，先了解要求；开始合作之后，记得确认分工与节点。'],['期末 · 提交提醒','检查文件、格式与提交结果，记得保留自己的过程记录。']][state.stage];const bag=[['报到清单',completed('report',0)],['人脸已录入',completed('face',0)],['寝室已安顿',completed('luggage',0)],['军训服',completed('uniform',0)],['已确认课表',completed('verify',2)],['拼贴草图',completed('collage',4)]];return `<section class="card rail-card character-card"><div class="portrait">${portrait()}</div><span class="tag">${escape(state.gender)} · 设计学类新生角色</span><h3>${escape(state.name)}的大学初体验</h3><p>每一步都可以自己选择。遇到不懂的，也可以停下来问一问。</p></section><section class="card rail-card"><div class="message-icon">✉</div><p class="message-title"><span class="notification-dot"></span>${msgs[0]}</p><p>${msgs[1]}</p></section><section class="card rail-card"><h3 class="section-title">随身小背包 <span>MY BAG</span></h3><div class="bag">${bag.map(([name,have])=>`<div class="bag-item ${have?'have':''}">${have?'✓':'＋'}<br>${name}</div>`).join('')}</div></section><div class="save-note">${storageAvailable?'进度已自动保存':'浏览器存储不可用，请保持页面打开'}</div>`;}
function schedulePage(){const w=state.week,active=allCourses(),blocks=[];for(const c of active)for(const s of D.liveSlots(c,w))blocks.push(`<button class="course-block${c.status==='选中'?' chosen':''}${s.start===s.end?' single-period':''}" style="grid-column:${s.day+1};grid-row:${s.start+1} / ${s.end+2}" data-action="course-detail" data-id="${c.id}"><strong>${escape(c.name)}</strong><small>${escape(s.room)}</small></button>`);let grid='<div class="grid-head" style="grid-row:1;grid-column:1">节次</div>';['周一','周二','周三','周四','周五'].forEach((x,i)=>grid+=`<div class="grid-head" style="grid-row:1;grid-column:${i+2}">${x}</div>`);for(let r=1;r<=12;r++){grid+=`<div class="grid-slot" style="grid-row:${r+1};grid-column:1">${String(r).padStart(2,'0')}</div>`;for(let c=2;c<=6;c++)grid+=`<div class="grid-slot" style="grid-row:${r+1};grid-column:${c}"></div>`;}
 const special=active.filter(c=>c.unscheduled&&w>=c.unscheduled.from&&w<=c.unscheduled.to).map(c=>`${c.name}：${c.note}`);if([16,17].includes(w))special.push('习近平新时代中国特色社会主义思想概论：本周为实践，不在课堂上课。');
 return `<section class="card page-card schedule-page"><div class="page-top"><h1><span class="page-icon" aria-hidden="true">▦</span>我的课表</h1><div class="week-picker"><button data-action="week" data-id="-1" aria-label="上一周" ${w===1?'disabled':''}>←</button><select id="week-select" aria-label="选择教学周">${Array.from({length:18},(_,i)=>`<option value="${i+1}" ${i+1===w?'selected':''}>第 ${i+1} 周</option>`).join('')}</select><button data-action="week" data-id="1" aria-label="下一周" ${w===18?'disabled':''}>→</button></div></div><div class="schedule-scroll" role="region" aria-label="每周课表，可横向滚动" tabindex="0"><div class="schedule-grid">${grid}${blocks.join('')}</div></div><div class="legend"><span><i></i>预置课程</span><span><i class="chosen"></i>正式选中的课程</span><span class="credit-total">合计 ${active.reduce((sum, course) => sum + course.credit, 0)} 学分</span></div>${special.length?`<div class="schedule-note">${special.map(escape).join('<br>')}</div>`:''}<div class="schedule-actions"><button class="secondary" data-action="all-courses">全部课程与周次</button><button class="secondary" data-action="catalog" data-id="sport">体育课正式选课</button><button class="secondary" data-action="catalog" data-id="history">“五史”正式选课</button>${state.stage===2&&state.sport&&state.history&&!completed('verify')?'<button class="primary" data-action="confirm-schedule">核对无误，确认选课结果 ✓</button>':''}<button class="secondary" data-view="explore">返回校园探索 →</button></div><p class="hint">周次和地点按用户提供截图录入，其他自选班次会逐一标注“剧情示例”；本页不连接学校教务系统。</p></section>`;}
function slotText(s){const week=s.from===s.to?`第${s.from}周`:`第${s.from}—${s.to}周`;return `${week} · 星期${['','一','二','三','四','五'][s.day]} · ${s.start}—${s.end}节${s.omit.length?`（第${s.omit.join('、')}周除外）`:''}`;}
function courseDetail(id){const c=allCourses().find(c=>c.id===id);if(!c)return;showModal(escape(c.name),`<span class="tag">${c.status} · ${c.credit}学分 · ${c.kind}</span>${c.slots.map(s=>`<p><strong>${slotText(s)}</strong><br>${escape(s.room)}</p>`).join('')}${c.note?`<div class="schedule-note">${escape(c.note)}</div>`:''}<p class="hint">${c.real===false?'此班次为剧情示例。':'课程信息来自用户提供的课表截图或体育排课表。'}</p><button class="secondary" data-action="close-modal">我记下了</button>`);}
function showAllCourses(){const chosenInSource=[D.catalog.find(c=>c.id==='rhythmic'),D.catalog.find(c=>c.id==='new-china')];showModal('截图课程 · 完整周次',`<p>预置状态与已选状态分开保留。截图总学分为33；游戏初始载入13门预置课，共30学分，自选后按实际选择累计。</p><div class="course-table-wrap"><table class="all-courses"><thead><tr><th>课程 / 学分</th><th>截图状态</th><th>时间与地点</th></tr></thead><tbody>${[...D.courses,...chosenInSource].map(c=>`<tr><td>${escape(c.name)}<small>${c.credit}学分</small></td><td>${c.status||'选中'}</td><td>${c.slots.map(s=>`${slotText(s)}<small>${escape(s.room)}</small>`).join('')}${c.note?`<small>${escape(c.note)}</small>`:''}</td></tr>`).join('')}</tbody></table></div>`);}
function catalog(group,error=''){catalogGroup=group;if(group==='sport'){sportCatalog(error);return;}catalogError=error;const enrolled=group==='sport'?state.sport:state.history;const unlocked=state.unlocked>=2&&completed('read',2);showModal(group==='sport'?'体育课 · 正式选课':'“五史”课程 · 正式选课',`<p>${group==='sport'?'先看项目、节次和限制，再选适合角色的课程。':'“五史”课程名称保留完整；本原型采用你提供的课程样本。课程要求应按目标年级通知更新。'}<br>当前角色：${escape(state.name)} · ${escape(state.gender)}。真实班次只录入截图可见的信息。</p>${!unlocked?'<div class="schedule-note">选课将在军训章节完成后开放。现在可以先查看课程信息。</div>':''}${error?`<div class="error-box" role="alert">${escape(error)}</div>`:''}${enrolled?`<div class="schedule-note">已选：${escape(D.catalog.find(c=>c.id===enrolled)?.name)}。本原型在确认前可重新选择同组课程；真实退改规则以学校通知为准。</div>`:''}<div class="catalog">${D.catalog.filter(c=>c.group===group).map(c=>`<article class="catalog-item"><span class="small-tag ${c.real?'':'example'}">${c.real?'截图真实班次':'剧情示例 / 非真实排课'}</span><h3>${c.name}</h3><p>${c.description}</p><p>${c.slots.map(s=>`${slotText(s)}<br>${escape(s.room)}`).join('<br>')||'本原型暂不开放此课程。'}</p><button class="${enrolled===c.id?'secondary':'primary'}" data-action="enroll" data-id="${c.id}" ${!unlocked||c.unavailable||enrolled===c.id||completed('verify',2)?'disabled':''}>${enrolled===c.id?'已选中 ✓':c.unavailable?'本样本学期未开设':c.full?'尝试选择 · 名额已满':'正式选择此班次 →'}</button></article>`).join('')}</div><p class="hint">剧情中的满额与冲突情境用于练习决策；不代表学校实时名额。2025秋通知中“五史”只开设前四门。</p>`);}
function enroll(id){const c=D.catalog.find(c=>c.id===id);if(!c||c.unavailable||state.unlocked<2||!completed('read',2)||completed('verify',2))return;if(c.full){catalog(c.group,'这个剧情示例班次已经满额。保留已选结果，看看还有没有合适的备选。');return;}if(c.gender&&state.gender!==c.gender){catalog(c.group,`此班次限制为${c.gender}生。请选择适合当前角色的班次，或在右上角修改虚构角色设定。`);return;}
 const against=[...D.courses,...selectedCourses().filter(x=>x.group!==c.group)];for(const x of against){const conflict=D.conflicts(c,x);if(conflict){catalog(c.group,`无法选入：第${conflict.week}周与“${conflict.course}”冲突。请核对周次和节次，选择其他班次。`);return;}}
 const firstChoice=!state.done[2].includes(c.group);state[c.group]=c.id;if(c.group==='sport')delete state.sportImportNote;state.done[2]=state.done[2].filter(x=>x!=='verify');if(firstChoice){state.done[2].push(c.group);adjust({gpa:.03},'核对课程信息后完成选课');}const eid=`2-${c.group}`;state.journal=state.journal.filter(e=>e.id!==eid);entry(eid,c.group==='sport'?'完成体育课正式选课':'完成“五史”正式选课',`选择了${c.name}，并检查了时间与限制。`);save();closeModal();scene=null;render();notify(`${c.name}已加入课表。`);}
const endingBadgePositions = {
 intense: '0% 0%',
 ddl: '50% 0%',
 creative: '100% 0%',
 balanced: '0% 50%',
 hair: '50% 50%',
 edge: '100% 50%',
 explorer: '0% 100%',
};
function endingCard(){const e=D.ending(state.stats);return `<section class="ending-card"><span class="eyebrow">学期结局</span><div class="ending-badge" style="--badge-position:${endingBadgePositions[e.id]}" aria-hidden="true"></div><h2>${e.name}</h2><p>${e.text}</p>${state.endingQuote?`<blockquote>${escape(state.endingQuote)}</blockquote>`:''}<div class="ending-stats">${Object.entries(statLabels).map(([k,n])=>`<span>${n}<strong>${k==='gpa'?state.stats[k].toFixed(2):state.stats[k]}</strong></span>`).join('')}</div><p class="hint">此结局由游戏规则匹配，是本局选择的叙事反馈；不代表真实成绩或人格评价。</p><div class="choices"><button class="primary" data-action="reset-dialog">换一种选择，再体验一次 ↗</button><button class="secondary" data-action="download-journal">保留这一局的手账 ↓</button></div></section>`;}
function journalPage(){return `<section class="card page-card journal-page"><div class="page-top"><h1><span class="page-icon" aria-hidden="true">▤</span>${escape(state.name)}的成长手账</h1><button class="secondary" data-action="download-journal">导出我的手账 ↓</button></div>${state.done[7].length===3&&(!state.novel||state.novel.finished)?endingCard():''}<div class="journal-grid"><div>${state.journal.length?state.journal.slice().reverse().map(e=>`<article class="journal-entry"><small>${escape(e.chapter)}</small><h3>${escape(e.title)}</h3><p>${escape(e.text)}</p></article>`).join(''):'<div class="empty-state">这里还没有记录。<br>从报到日开始，第一件小事很快就会出现在这里。</div>'}</div><aside><div class="journal-summary"><h3>留给自己的入学提醒</h3><p>① 看清通知，记下时间与地点。<br>② 选课后重新核对课表。<br>③ 不知道怎么开始时，先提出一个具体问题。<br>④ 给作业的修改、交流和休息留一点余量。</p><button class="primary" data-view="explore">继续我的校园故事 →</button></div><section class="card rail-card"><h3>忙碌的一周，怎么安排？</h3><p>把6个空闲时段分给作业、社团、比赛和休息，试着安排自己的节奏。这是独立的小练习，不影响关卡。</p><div class="plan-options">${[['work','设计作业'],['club','社团活动'],['competition','比赛准备'],['rest','休息与留白']].map(([k,n])=>`<div class="plan-row"><span>${n}</span><span><button data-action="plan" data-id="${k}" data-delta="-1" aria-label="减少${n}" ${state.plan[k]===0?'disabled':''}>−</button>${state.plan[k]}<button data-action="plan" data-id="${k}" data-delta="1" aria-label="增加${n}" ${Object.values(state.plan).reduce((a,b)=>a+b,0)>=6?'disabled':''}>＋</button></span></div>`).join('')}</div><p>已安排 ${Object.values(state.plan).reduce((a,b)=>a+b,0)} / 6 个时段</p><button class="secondary" data-action="save-plan">保存安排，看看反馈</button>${state.planSaved?`<div class="schedule-note">${planFeedback()}</div>`:''}</section><section class="card rail-card"><h3>关于这个体验原型</h3><p>故事来自新生提供的经历；对话、流程细节和地图布局为原型叙事。课程周次与地点按截图录入，未公开真实群号、老师姓名等信息。不会采集真实人脸或教务账号。</p><div class="source-list"><a href="https://jwc.scu.edu.cn/info/1069/10121.htm" target="_blank" rel="noopener">2025级新生选课通知 ↗</a><br><a href="https://jwc.scu.edu.cn/info/1069/10790.htm" target="_blank" rel="noopener">2026级新生选课通知 ↗</a></div><button class="secondary" data-action="reset-dialog" style="margin-top:15px">重新开始体验</button></section></aside></div></section>`;}
function planFeedback(){const p=state.plan;return [p.rest===0?'目前没有安排休息，试着为自己留一点调整空间。':'你为休息留出了空间。',p.work===0?'本周还没有作业时段，可以结合实际截止时间再核对一次。':`你安排了${p.work}个作业时段，可以进一步拆成找图、尝试和修改。`,p.competition>0?'比赛准备也需要先看任务、截止时间和团队要求。':'这次可以先把注意力放在自己的其他目标上。'].join('<br>');}
const references = {
  botanical: '植物形态',
  architecture: '建筑结构',
  ocean: '波浪节奏',
};
const materials = {
  flower: '干花',
  fabric: '格纹布料',
  lace: '蕾丝花边',
  gauze: '半透网纱',
  paper: '印刷纸张',
  gear: '金属齿轮',
  button: '纽扣',
  frame: '金属相框',
  sticker: '银杏贴纸',
};

function collageAsset(kind, id) {
  return `assets/collage/${kind}-${id}.svg`;
}

function boardHTML() {
  const reference = Object.hasOwn(references, state.reference) ? state.reference : 'botanical';
  const pieces = state.pieces.map((piece, index) => {
    if (!Object.hasOwn(materials, piece.type)) return '';
    const selected = index === activePiece;
    return `<div class="piece${selected ? ' active' : ''}" data-piece="${index}"
      role="button" tabindex="0" aria-pressed="${selected}"
      aria-label="${materials[piece.type]}，用方向键移动"
      style="left:${piece.x}%;top:${piece.y}%;--rotation:${piece.r}deg">
      <img src="${collageAsset('material', piece.type)}" alt="" draggable="false">
    </div>`;
  }).join('');
  return `<div class="collage-board" id="collage-board" aria-label="拼贴草图，拖动材料或使用方向键移动">
    <img class="board-art" src="${collageAsset('reference', reference)}" alt="${references[reference]}底图" draggable="false">
    ${pieces}
  </div>`;
}

function studio() {
  if (state.unlocked < 4) {
    notify('先完成前面的入学体验，再来试试第一张拼贴。');
    return;
  }
  showModal('第一次拼贴 · 小小工作台', `
    <p>挑一张底图，在画面上试摆材料，比较叠放前后的效果。</p>
    <h3 class="studio-heading">参考底图</h3>
    <div class="collage-references">
      ${Object.entries(references).map(([id, name]) => `<button class="collage-reference"
        data-action="reference" data-id="${id}" aria-pressed="${state.reference === id}">
        <img src="${collageAsset('reference', id)}" alt=""><span>${name}</span>
      </button>`).join('')}
    </div>
    <div class="studio">
      ${boardHTML()}
      <div class="studio-tools">
        <h3 class="studio-heading">材料盒</h3>
        <div class="material-tray">
          ${Object.entries(materials).map(([id, name]) => `<button class="material-swatch" data-action="add-piece" data-id="${id}">
            <img src="${collageAsset('material', id)}" alt=""><span>${name}</span>
          </button>`).join('')}
        </div>
        <div class="studio-actions">
          <button class="secondary" data-action="rotate-piece">↻ 旋转选中</button>
          <button class="secondary" data-action="remove-piece">− 移除选中</button>
          <button class="primary" data-action="save-collage">保存当前草图 ✓</button>
        </div>
      </div>
    </div>
    <p class="studio-instruction">点击材料加入画面，再拖动摆放，也可以用方向键微调。首次保存需放入至少两项材料。</p>
    ${completed('feedback', 4) ? '<div class="feedback-note">修改提示：试着移动、旋转或删减一项材料，比较调整前后的画面。</div>' : ''}
  `);
  bindDrag();
}

function drawBoard() {
  const board = $('#collage-board');
  if (!board) return;
  board.outerHTML = boardHTML();
  bindDrag();
}

function selectReference(id) {
  if (!Object.hasOwn(references, id)) return;
  state.reference = id;
  if (!completed('reference', 4)) {
    state.done[4].push('reference');
    entry('4-reference', '选定参考底图', `这次从“${references[id]}”开始找方向。`);
  }
  save();
  document.querySelectorAll('.collage-reference').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.id === id));
  });
  drawBoard();
  render();
}

function bindDrag() {
  const board = $('#collage-board');
  if (!board) return;

  function movePiece(piece, element, x, y) {
    piece.x = Math.max(0, Math.min(75, x));
    piece.y = Math.max(0, Math.min(68, y));
    element.style.left = `${piece.x}%`;
    element.style.top = `${piece.y}%`;
  }

  const pieces = board.querySelectorAll('[data-piece]');
  pieces.forEach(element => {
    const index = Number(element.dataset.piece);
    const piece = state.pieces[index];
    const select = () => {
      activePiece = index;
      pieces.forEach(other => {
        other.classList.toggle('active', other === element);
        other.setAttribute('aria-pressed', String(other === element));
      });
    };

    element.addEventListener('pointerdown', event => {
      event.preventDefault();
      select();
      const {clientX, clientY, pointerId} = event;
      const {x, y} = piece;
      element.setPointerCapture(pointerId);
      const move = next => movePiece(
        piece, element,
        x + (next.clientX - clientX) / board.clientWidth * 100,
        y + (next.clientY - clientY) / board.clientHeight * 100,
      );
      const end = () => {
        element.removeEventListener('pointermove', move);
        element.removeEventListener('lostpointercapture', end);
        save();
      };
      element.addEventListener('pointermove', move);
      element.addEventListener('lostpointercapture', end);
    });
    element.addEventListener('focus', select);
    element.addEventListener('keydown', event => {
      const offsets = {ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2]};
      if (!Object.hasOwn(offsets, event.key)) return;
      event.preventDefault();
      const [dx, dy] = offsets[event.key];
      movePiece(piece, element, piece.x + dx, piece.y + dy);
      save();
    });
  });
}
function saveCollage(){if(state.pieces.length<2){notify('先放上至少两项材料，尝试一次画面组合。');return;}if(!completed('reference',4)){state.done[4].push('reference');entry('4-reference','选定参考底图',`这次从“${references[state.reference]}”开始找方向。`);}if(!completed('collage',4)){state.done[4].push('collage');entry('4-collage','完成一次综合材料组合','先试着做出草图，再带着具体问题向老师请教。');state.energy=Math.max(0,state.energy-12);adjust({inspiration:6,grind:7},'完成第一次材料尝试');}else if(completed('feedback',4)&&!completed('revise',4)){if(JSON.stringify({reference:state.reference,pieces:state.pieces})===state.feedbackSnapshot){notify('试着移动、旋转或删减一项材料，再保存调整后的版本。');return;}state.done[4].push('revise');entry('4-revise','保存了调整后的草图','根据反馈尝试调整，保留版本，并记得在实际拍摄后检查反光。');adjust({inspiration:5,gpa:.1},'根据反馈调整作品');}save();scene=null;closeModal();render();notify('草图已保存，可以继续下一步。');}
function feedback(kind){const texts={reference:'剧情示例反馈：先选一个你想表达的方向，再比较两张候选图。试着说出选择的理由。',composition:'剧情示例反馈：可以先暂时拿走一个元素，看看主体和背景的关系有没有更清楚。',fatigue:'剧情示例反馈：先把当前版本保存下来，留一点休息时间，再从一个具体的小修改开始。'};state.choices.feedback=kind;state.feedbackSnapshot=JSON.stringify({reference:state.reference,pieces:state.pieces});finishTask('feedback',texts[kind]);showModal('把反馈变成下一步',`<div class="feedback-note">${texts[kind]}</div><p>真实老师的具体意见仍需要你们补充。这里先练习“表达困难—听取意见—尝试修改”的过程。</p><div class="choices"><button class="primary" data-action="studio">带着反馈，再改一处 →</button><button class="secondary" data-action="close-modal">先记在手账里</button></div>`);}
function profile(){showModal('我的角色与室友',`<div class="profile-portraits"><div><div class="actor-sheet hero-${state.gender==='男'?'male':'female'}" role="img" aria-label="当前主角立绘"></div><strong>你 · ${escape(state.name)}</strong></div><div><div class="actor-sheet amu-${state.gender==='男'?'male':'female'}" role="img" aria-label="当前室友立绘"></div><strong>室友 · 阿沐</strong></div></div><label for="player-name">角色姓名</label><input id="player-name" required maxlength="12" value="${escape(state.name)}" autocomplete="off"><label for="player-gender">主角性别</label><select id="player-gender">${['女','男'].map(v=>`<option ${v===state.gender?'selected':''}>${v}</option>`).join('')}</select><p class="hint">女生主角匹配女室友阿沐，男生主角匹配男室友阿沐。周言是同班男同学，不随主角性别更改。</p><div class="choices"><button class="primary" data-action="save-profile">保存角色设定</button></div>`);}

function uniform(){showModal('报到当天 · 购买军训服',`<p>先根据现场建议选择尺码，再确认是否合身。这是流程体验，尺码不对应真实商品库存或售价。</p><label for="uniform-size">选择角色的尺码</label><select id="uniform-size"><option value="">请选择</option>${['S','M','L','XL','XXL'].map(s=>`<option>${s}</option>`).join('')}</select><label class="inline-check"><input type="checkbox" id="uniform-checked"> 已核对尺码与通知要求</label><div class="choices"><button class="primary" data-action="buy-uniform">确认购买，放进背包</button></div><p class="hint">具体购买位置、价格及物品内容，后续按你们当届实际通知补充。</p>`);}
function face() {
  const hero = state.gender === '男' ? 'hero-male' : 'hero-female';
  showModal('人脸录入 · 流程体验', `
    <p>请将角色的脸对准录入框。下方是虚构角色的头像，不会打开摄像头。</p>
    <div class="face-demo" role="img" aria-label="${escape(state.name)}的角色头像">
      <span class="actor-sheet ${hero}" aria-hidden="true"></span>
    </div>
    <div class="choices face-actions">
      <button class="primary" data-action="complete-face">按提示完成，确认录入成功 ✓</button>
    </div>`);
}
function advance(){if(!finished())return;if(state.stage===D.chapters.length-1){setView('journal');window.scrollTo({top:0,behavior:'smooth'});return;}state.stage++;state.unlocked=Math.max(state.unlocked,state.stage);scene=null;save();setView('explore');window.scrollTo({top:0,behavior:'smooth'});}
function resetDialog(){showModal('重新开启这段校园生活？','<p>这会清除当前浏览器保存的角色、关卡进度、课表选择和草图。可以先导出成长手账。</p><div class="choices"><button class="secondary" data-action="download-journal">先导出手账</button><button class="primary" data-action="reset-confirm">清除本地进度并重新开始</button></div>');}
function downloadJournal(){const lines=[`${state.name}的川大新生手账`,'',...(state.done[7].length===3?[`学期结局：${D.ending(state.stats).name}`]:[]),...Object.entries(statLabels).map(([k,n])=>`${n}：${state.stats[k]}（游戏数值）`),'',...state.journal.flatMap(e=>[`[${e.chapter}] ${e.title}`,e.text,'']),'本周安排：',...Object.entries({work:'设计作业',club:'社团活动',competition:'比赛准备',rest:'休息与留白'}).map(([k,n])=>`${n}：${state.plan[k]}个时段`),'','本手账来自体验原型，具体校务安排以当届学校通知为准。'];const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='我的川大新生手账.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('成长手账已导出。');}
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-view]');if(!b||b.disabled)return;if(b.dataset.view){setView(b.dataset.view);return;}if(b.dataset.task){openTask(b.dataset.task);return;}if(b.dataset.place){placeTask(b.dataset.place);return;}const id=b.dataset.id,action=b.dataset.action;if(!action)return;
 switch(action){
 case 'vn-next':novelNext();break;
 case 'vn-choice':novelChoose(Number(id));break;
 case 'vn-tool':novelTool();break;
 case 'vn-log':novelLog();break;
 case 'vn-cast':novelCast();break;
 case 'sports-filter':sportsFilters={project:$('#sports-project').value,day:$('#sports-day').value,search:$('#sports-search').value.trim(),compatible:$('#sports-compatible').checked,page:1};sportCatalog();break;
 case 'sports-clear':sportsFilters={project:'',day:'',search:'',compatible:false,page:1};sportCatalog();break;
 case 'sports-page':sportsFilters.page+=Number(id);sportCatalog();break;
 case 'open-campus-map':openCampusMap();break;
 case 'campus-map-zoom':zoomCampusMap(Number(id));break;
 case 'campus-map-reset':campusMapZoom=1;zoomCampusMap(0);if($('.map-viewer-scroll')){$('.map-viewer-scroll').scrollTop=0;$('.map-viewer-scroll').scrollLeft=0;}break;
 case 'text-choice':{const err=canTask(id);if(err){notify(err);break;}if(completed(id))break;const choice=D.textEvents[id]?.options[Number(b.dataset.index)];if(!choice)break;const [label,delta,result]=choice;state.choices[id]=Number(b.dataset.index);scene=null;finishTask(id,result,0,delta);notify(`${result} ${deltaText(state.lastDelta.delta)}`);break;}
 case 'close-modal':closeModal();break;
 case 'chapter':state.stage=Number(id);scene=null;save();setView('explore');break;
 case 'next-task':scene=null;render();break;
 case 'complete':{const err=canTask(id);if(err){notify(err);break;}scene=null;finishTask(id,taskMessages[id]||'这件事完成了。',['luggage','train'].includes(id)?-12:0);break;}
 case 'help-luggage':state.choices.luggage='help';scene=null;finishTask('luggage','你和同学互相帮忙，行李和床位都安顿好了。',-5);break;
 case 'face':face();break;
 case 'complete-face':closeModal();scene=null;finishTask('face','已完成角色人脸录入，并确认成功。');break;
 case 'uniform':uniform();break;
 case 'buy-uniform':{const size=$('#uniform-size').value;if(!size||!$('#uniform-checked').checked){notify('请先选择尺码，并确认已核对。');break;}state.choices.uniform=size;closeModal();scene=null;finishTask('uniform',`报到当天买好了军训服，已核对${size}码。`);break;}
 case 'recover':scene=null;finishTask('recover',id,22);break;
 case 'read-schedule':if(state.stage===2&&!completed('read'))finishTask('read','已查看预置课表，确认体育课和相应思政课程需要自行选择。');setView('schedule');break;
 case 'catalog':catalog(id);break;
 case 'enroll':enroll(id);break;
 case 'verify':state.week=4;save();setView('schedule');break;
 case 'confirm-schedule':if(state.stage!==2||!state.sport||!state.history)return;scene=null;finishTask('verify','选课结果已写入课表，核对了课程时间、周次和地点。');setView('explore');break;
 case 'week':state.week=Math.max(1,Math.min(18,state.week+Number(id)));save();render();break;
 case 'course-detail':courseDetail(id);break;
 case 'all-courses':showAllCourses();break;
 case 'class-schedule':state.week=3;scene=null;finishTask('check-class','已确认第3周星期一的设计构成在艺术大楼 A2-1。');setView('schedule');break;
 case 'advance':advance();break;
 case 'studio':studio();break;
 case 'reference':selectReference(id);break;
 case 'add-piece':if(!Object.hasOwn(materials,id))break;if(state.pieces.length>=8){notify('先用这8项材料试试组合，也可以删掉一些再添加。');break;}state.pieces.push({type:id,x:20+state.pieces.length*4,y:20+state.pieces.length*3,r:0});activePiece=state.pieces.length-1;save();drawBoard();break;
 case 'rotate-piece':if(activePiece===null||!state.pieces[activePiece]){notify('先点选一项画面中的材料。');break;}state.pieces[activePiece].r+=15;save();drawBoard();break;
 case 'remove-piece':if(activePiece===null||!state.pieces[activePiece]){notify('先点选一项画面中的材料。');break;}state.pieces.splice(activePiece,1);activePiece=null;save();drawBoard();break;
 case 'save-collage':saveCollage();break;
 case 'feedback':feedback(id);break;
 case 'rest':state.energy=Math.min(100,state.energy+15);entry('4-rest','给自己一点留白','保存现有想法，短暂休息后再继续。');save();render();notify('先歇一歇，保留当前的想法。');break;
 case 'save-profile':if(commitIdentity($('#player-name').value,$('#player-gender').value)){closeModal();render();notify('角色与室友设定已保存。');}break;
 case 'plan':{const amount=Object.values(state.plan).reduce((a,b)=>a+b,0),delta=Number(b.dataset.delta);if(delta===1&&amount>=6)break;state.plan[id]=Math.max(0,Math.min(6,state.plan[id]+delta));state.planSaved=false;save();render();break;}
 case 'save-plan':state.planSaved=true;save();render();notify('本周安排已保存，可以继续调整。');break;
 case 'download-journal':downloadJournal();break;
 case 'reset-dialog':resetDialog();break;
 case 'reset-confirm':state=fresh();scene=null;activePiece=null;save();closeModal();setView('explore');notify('新的报到日开始了。');break;
 }
});
document.addEventListener('submit',e=>{if(e.target.id!=='identity-form')return;e.preventDefault();const gender=e.target.querySelector('input[name=playerGender]:checked')?.value;if(commitIdentity($('#start-name').value,gender)){setView('explore');window.scrollTo({top:0,behavior:'smooth'});notify('你好，'+state.name+'，你的川大生活开始了。');}});
document.addEventListener('change',e=>{if(e.target.id==='week-select'){state.week=Number(e.target.value);save();render();}});
$('#profile').addEventListener('click',profile);
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);view=['schedule','journal'].includes(h)?h:'explore';render();});
refreshSavedStoryCopy();
render();
})();
