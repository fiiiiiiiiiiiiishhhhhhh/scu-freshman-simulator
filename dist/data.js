(function(root){
const slot=(day,start,end,from,to,room,omit=[])=>({day,start,end,from,to,room,omit});
const arts='江安 · 艺术大楼 A2-1';
const intensive=(a,b)=>[slot(1,1,4,a,b,arts),slot(1,5,8,a,b,arts),slot(3,1,4,a,b,arts),slot(3,5,8,a,b,arts)];
const courses=[
{id:'english',code:'105943020',name:'通用英语Ⅲ-1',credit:2,status:'置入',kind:'必修',slots:[slot(2,1,2,3,18,'江安 · 文科楼三区 204')]},
{id:'career',code:'101350010',name:'艺术类学生职业生涯导航',credit:1,status:'置入',kind:'选修',slots:[slot(4,5,7,7,12,'江安 · 综合楼C座 C205')]},
{id:'seminar',code:'101396010',name:'新生研讨课',credit:1,status:'置入',kind:'必修',slots:[slot(5,1,4,3,6,'江安 · 一教B座 B305')]},
{id:'design-history',code:'101897040',name:'设计史',credit:4,status:'置入',kind:'必修',slots:[slot(2,5,8,3,18,'江安 · 一教B座 B202')]},
{id:'digital',code:'101930040',name:'数字设计基础',credit:4,status:'置入',kind:'必修',slots:intensive(13,16)},
{id:'material',code:'101931040',name:'设计与材料',credit:4,status:'置入',kind:'必修',slots:intensive(8,11)},
{id:'composition',code:'101932040',name:'设计构成',credit:4,status:'置入',kind:'必修',slots:intensive(3,6)},
{id:'thought',code:'107447030',name:'习近平新时代中国特色社会主义思想概论',credit:3,status:'置入',kind:'必修',note:'第16—17周为实践，不在课堂上课。',slots:[slot(1,10,12,3,18,'江安 · 综合楼C座 C505',[16,17])]},
{id:'security',code:'107482010',name:'国家安全教育',credit:1,status:'置入',kind:'必修',slots:[slot(5,5,6,6,6,'江安 · 一教B座 B204'),slot(5,5,6,10,10,'江安 · 一教B座 B204')]},
{id:'military-theory',code:'900004020',name:'军事理论',credit:2,status:'置入',kind:'必修',slots:[slot(5,10,11,4,15,'江安 · 一教B座 B301')]},
{id:'military-training',code:'900005020',name:'军事技能',credit:2,status:'置入',kind:'必修',note:'第1—2周；截图未给出具体节次和地点。',unscheduled:{from:1,to:2},slots:[]},
{id:'ai',code:'902013010',name:'人工智能素养Ⅰ（通用）',credit:1,status:'置入',kind:'必修',slots:[slot(4,3,4,8,11,'江安 · 图书馆 AI素养教育创新实验室'),slot(5,1,2,7,7,'江安 · 综合楼C座 C307')]},
{id:'mental',code:'912002010',name:'大学生心理健康',credit:1,status:'置入',kind:'必修',slots:[slot(4,10,11,11,18,'江安 · 一教B座 B501')]}
];
const sports=root.SCU_SPORTS||(typeof require==='function'?require('./sports-data.js'):null);
const catalog=[
...sports.courses,
{id:'new-china',group:'history',name:'新中国史',credit:2,code:'106812020',real:true,description:'截图中的已选班次。',slots:[slot(2,10,12,3,13,'江安 · 一教B座 B407')]},
{id:'party',group:'history',name:'中共党史',credit:2,real:false,description:'课程名来自“五史”；以下班次为剧情示例。',slots:[slot(4,1,2,3,18,'教学楼（剧情示例）')]},
{id:'reform',group:'history',name:'改革开放史',credit:2,real:false,description:'剧情示例：与部分周次的预置课冲突。',slots:[slot(4,5,6,3,18,'教学楼（剧情示例）')]},
{id:'socialism',group:'history',name:'社会主义发展史',credit:2,real:false,description:'课程名来自“五史”；以下班次为剧情示例。',slots:[slot(3,10,12,3,18,'教学楼（剧情示例）')]},
{id:'nation',group:'history',name:'中华民族发展史',credit:2,real:false,unavailable:true,description:'课程全名含“中华民族的凝聚与演进”。2025秋通知未开设；本原型采用该课程样本。',slots:[]}
];
const chapters=[
{title:'你好，川大',tag:'入学报到日',time:'DAY 01',text:'先安顿好自己，再慢慢认识这座校园。',tasks:[['report','完成入学报到','迎新报到点'],['face','录入人脸','人脸录入点'],['dorm','找到自己的寝室','宿舍区'],['luggage','搬行李、整理床位','宿舍区'],['uniform','购买军训服','军训服购买点'],['roommate','认识新室友','宿舍区']]},
{title:'一起迎接清晨',tag:'军训生活',time:'WEEK 01—02',text:'第一声集合哨响起，你已经不是独自一人。',tasks:[['notice','查看集合通知','宿舍区'],['gather','前往军训集合点','军训场地'],['train','体验集体训练','军训场地'],['recover','安排休息与交流','食堂与生活区']]},
{title:'课表，由你补全',tag:'正式选课',time:'开课前',text:'预置课表已经在这里，看看还需要自己选什么。',tasks:[['read','读懂预置课表','教务通知'],['sport','正式选择体育课','正式选课入口'],['history','正式选择“五史”课程','正式选课入口'],['verify','核对选课结果','我的课表']]},
{title:'走进第一间教室',tag:'第一次上课',time:'WEEK 03',text:'沿着课表上的地点，开始新的学习日常。',tasks:[['check-class','查找第一堂专业课','我的课表'],['pack','准备课堂用品','宿舍区'],['classroom','找到艺术大楼 A2-1','艺术大楼'],['listen','理解课堂任务','艺术大楼']]},
{title:'把想法，慢慢拼出来',tag:'设计构成初体验',time:'WEEK 03—06',text:'第一次没有标准答案的作业，从一次小小的尝试开始。',tasks:[['reference','选定一张参考底图','设计工作台'],['collage','尝试综合材料拼贴','设计工作台'],['feedback','拿给老师看并记录反馈','艺术大楼'],['revise','根据反馈调整并留档','设计工作台']]},
{title:'工具，也有自己的选择题',tag:'我的第一台设计电脑',time:'开课之后',text:'有了课堂体验，再想想自己需要怎样的工具。',tasks:[['needs','了解课程需求与预算','宿舍区'],['computer','选择自己的设备方案','宿舍区'],['backup','安排文件与备份','宿舍区']]},
{title:'要不要，试一次比赛？',tag:'比赛与小组合作',time:'学期中段',text:'机会很多，你可以选择适合自己的那一个。',tasks:[['contest','决定是否报名比赛','艺术大楼'],['team','面对第一次团队分工','艺术大楼'],['deadline','安排作业和项目的进度','艺术大楼']]},
{title:'学期末，给自己一份答案',tag:'期末与学期结算',time:'SEMESTER END',text:'作业、截止时间和生活，最后再做几次自己的选择。',tasks:[['review','整理这一学期的任务','宿舍区'],['final-work','面对期末设计作业','艺术大楼'],['submission','决定最后一天怎么过','宿舍区']]}
];
const textEvents={
 needs:{title:'“设计生是不是一定要买最贵的电脑？”',text:'刚上过几次课，群里已经聊起设备。你手里还有一台能用的旧机，预算也有限。你准备先做什么？',options:[['先问清课程软件需求，列出自己的预算',{inspiration:3,grind:-3,gpa:.08},'你把软件需求和预算记下来，选择开始有了依据。'],['先看看同学都在用什么型号',{inspiration:5,grind:3},'你获得了不少参考，也发现别人的需求不一定和自己一样。'],['暂时不考虑，等实际用不动再处理',{hair:3,grind:6,gpa:-.05},'你暂时省下了决策精力，也给自己留下一项待办。']]},
 computer:{title:'把预算花在自己的需要上',text:'核对需求后，你发现设备方案各有取舍。这里没有真实品牌和价格，你选择的是自己的准备方式。',options:[['在预算内选够用的设备，预留配件与材料空间',{inspiration:4,hair:2,grind:-5,gpa:.1},'设备够用，材料和日常支出也有余量。'],['保留旧机，提前确认可用的备用设备',{hair:5,grind:3,gpa:.02},'你保留了预算，同时需要提前处理设备兼容和使用安排。'],['超出原定预算追求高配，之后再压缩其他支出',{inspiration:6,hair:-4,grind:10},'设备性能有了余量，预算安排却变得更紧；性能本身不会直接提高课程成绩。']]},
 backup:{title:'“最终版_最终不改版”到底是哪一版？',text:'文件开始越来越多。一次软件卡顿，让你意识到工作流程也会影响作业体验。',options:[['给文件编号，并保留两个位置的备份',{inspiration:2,grind:-6,gpa:.12},'你建立了一个能找回、能比较的版本记录。'],['先做作品，文件以后再整理',{inspiration:4,grind:8,gpa:-.04},'你保持着创作节奏，不过找文件和返工的风险仍在。'],['临近交作业时再集中整理',{hair:-2,grind:5,gpa:.02},'整理任务被推迟到了截止时间附近。']]},
 contest:{title:'比赛通知发进了班级群',text:'专业作业还在进行，比赛也开始报名。学期中段，你想怎样分配这份注意力？',options:[['选一个与当前兴趣接近、规模适合的题目',{inspiration:10,hair:-3,grind:9,gpa:.1},'你决定尝试一个有边界的新任务，先读清楚交付要求。'],['挑战更大的题目，准备投入大量课余时间',{inspiration:15,hair:-12,grind:22,gpa:.12},'你选择了高投入的探索，也需要承担更密集的时间安排。'],['这次先不报名，把当前作业做扎实',{inspiration:2,hair:7,grind:-9,gpa:.16},'你把时间留给了眼前的学习；以后仍然可以选择其他机会。']]},
 team:{title:'第一次合作，谁来做哪一部分？',text:'比赛或课程小组都需要一起交付。讨论结束后，大家好像都觉得“差不多明白了”，但分工还没有写下来。',options:[['一起明确分工、文件规范和中途检查时间',{inspiration:6,grind:-6,gpa:.12},'组员对目标和节点有了共同理解。'],['怕麻烦，自己先把大部分接下来',{inspiration:4,hair:-10,grind:19,gpa:.08},'短期推进很快，你承担的工作量也明显增加了。'],['先等别人开始，再看看自己能做什么',{hair:3,grind:8,gpa:-.22},'等待让自己的投入减少了，但交付责任仍需要沟通。']]},
 deadline:{title:'作业和项目的截止时间撞在了一起',text:'一天只有这么多时间。你准备如何处理已经承诺的事情？',options:[['拆分任务，和组员确认先后顺序，留出休息',{inspiration:5,hair:7,grind:-10,gpa:.18},'你让进度变得可见，也给修改留出了空间。'],['连续熬夜，把两个任务都往前推',{inspiration:8,hair:-18,grind:24,gpa:.08},'这一轮进度前移了，疲惫也累积起来。后续仍需要检查质量。'],['主动协商缩小项目范围，保证基本交付',{inspiration:2,hair:5,grind:-7,gpa:.05},'你调整了目标，在约定范围内保留可完成的方案。']]},
 review:{title:'期末到了，先从哪里开始？',text:'设计作业、理论课复习和零散待办堆在一起。你打开任务本，决定第一步。',options:[['列出提交要求、截止时间和还不懂的问题',{inspiration:3,hair:3,grind:-6,gpa:.2},'你明确了需要完成的内容，也知道哪些地方需要求助。'],['先做最喜欢的视觉效果，其他稍后考虑',{inspiration:12,hair:-5,grind:12,gpa:-.08},'画面探索很投入，其他任务依然需要安排。'],['等最后几天再一起处理',{hair:4,grind:14,gpa:-.35},'你获得了眼前的空闲，但留给准备和修改的时间缩短了。']]},
 'final-work':{title:'期末作业，还想再好一点',text:'作品已经有了雏形。你发现一个新的方向，但距离提交也越来越近。',options:[['按反馈改关键问题，分几次完成',{inspiration:8,hair:5,grind:-7,gpa:.22},'你让修改围绕具体问题展开，保留了稳定交付的余量。'],['推倒重来，通宵把新方向做出来',{inspiration:16,hair:-22,grind:27,gpa:.14},'新方向带来了探索成果，同时大幅增加了工作负荷。'],['先保留能完成的部分，再检查基本要求',{inspiration:1,hair:5,grind:-3,gpa:-.12},'你收缩了范围，需要进一步核对是否满足基本交付要求。']]},
 submission:{title:'提交前的最后一天',text:'学期快结束了，作品也接近完成。最后这段时间，你准备留给什么？',options:[['检查文件和提交结果，留档后好好休息',{hair:9,grind:-12,gpa:.15},'你确认交付、保留过程，给这个学期画上一个安稳的句号。'],['再加一轮效果，把剩余时间全部用完',{inspiration:10,hair:-12,grind:17,gpa:.05},'你抓住最后的创作时间，也承担了更紧的提交节奏。'],['先离开电脑，提交细节回头再确认',{hair:7,grind:3,gpa:-.3},'你先停下来了，提交是否成功仍是这次经历里的一个提醒。']]}
};
const initialStats=()=>({inspiration:45,hair:86,grind:25,gpa:2.6});
function applyStats(stats,delta){const result={...stats};for(const k of ['inspiration','hair','grind','gpa'])result[k]=Math.max(0,Math.min(k==='gpa'?4:100,Math.round((result[k]+(delta[k]||0))*100)/100));return result;}
function ending(s){
 if(s.gpa<2.45)return {id:'edge',name:'挂科边缘 · 剧情结局',icon:'△',text:'几次延后的准备，让提交和复习变得匆忙。这里的模拟GPA提醒你：下一次可以更早确认要求，也更早开口求助。'};
 if(s.grind>=72&&s.gpa<3.3)return {id:'ddl',name:'DDL冒险家',icon:'⚡',text:'你投入了不少力气，也体验了截止时间的推力。把任务拆小、及时沟通，或许能让下次的忙碌更有效。'};
 if(s.grind>=70&&s.gpa>=3.3)return {id:'intense',name:'卷王的一学期',icon:'✳',text:'这一学期你持续投入、积极推进，完成了不少挑战。手账也记录了代价：下一段路，可以试着给恢复和调整多留一点位置。'};
 if(s.inspiration>=91&&s.gpa>=3.35)return {id:'creative',name:'灵感迸发 · 设计新芽',icon:'✦',text:'观察、尝试和修改积累成了自己的方向。你开始能解释作品，也愿意把想法落实到下一次行动里。'};
 if(s.hair>=70&&s.grind<=60&&s.gpa>=3.15)return {id:'balanced',name:'平衡大师',icon:'☀',text:'学习、尝试和休息有了各自的位置。你在探索中建立节奏，也为下一次改变留出了空间。'};
 if(s.hair>=90&&s.grind<=50)return {id:'hair',name:'发量王者',icon:'❋',text:'你选择给自己留白，这一局的趣味发量值保持得很好。接下来，也可以在保留生活节奏的同时，为感兴趣的学习目标多安排一点行动。'};
 return {id:'explorer',name:'自己的节奏 · 探索进行时',icon:'↗',text:'你的这一学期有尝试、有犹豫，也有调整。结局只是暂时的截面，手账里那些具体的小经验会陪你继续向前。'};
}
const liveSlots=(c,w)=>c.slots.filter(s=>w>=s.from&&w<=s.to&&!s.omit.includes(w));
function conflicts(a,b){for(let w=1;w<=18;w++)for(const x of liveSlots(a,w))for(const y of liveSlots(b,w))if(x.day===y.day&&x.start<=y.end&&y.start<=x.end)return {week:w,course:b.name};return null;}
root.SCU_DATA={courses,catalog,chapters,liveSlots,conflicts,textEvents,initialStats,applyStats,ending,sportsMetadata:sports.metadata};
if(typeof module!=='undefined')module.exports=root.SCU_DATA;
})(typeof window!=='undefined'?window:globalThis);
