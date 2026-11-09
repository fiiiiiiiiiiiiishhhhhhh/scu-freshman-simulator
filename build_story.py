"""Compile the reviewed Markdown story into dialogue/choice data, without touching saves."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parent
source=(root/'剧情脚本-第一学期.md').read_text(encoding='utf-8')
stages=[0,0,0,0,0,1,1,2,2,2,3,4,4,4,4,5,6,7,7]
tasks=[['report'],['face'],['dorm','luggage'],['uniform'],['roommate'],['notice'],['gather','train','recover'],['read'],['sport'],['history','verify'],['check-class','pack','classroom','listen'],['reference'],['collage'],['feedback'],['revise'],['needs','computer','backup'],['contest','team','deadline'],['review','final-work','submission'],[]]
chars=['linhe','linhe','zhou','amu','amu','amu','zhou','amu','amu','amu','zhou','zhou','amu','zhou','zhou','linhe','zhou','amu','linhe']
settings=['campus','campus','dorm','campus','night','dorm','field','desk','desk','desk','classroom','classroom','classroom','classroom','classroom','dorm','classroom','night','sunset']
toolmap={2:'face',4:'uniform',8:'schedule',9:'sport',10:'history',13:'studio',15:'studio'}
nodes=[]
for section in re.split(r'^## ',source,flags=re.M):
    m=re.match(r'(\d{2})｜([^\n]+)\n',section)
    if not m: continue
    number=int(m[1]); i=number-1; body=section[m.end():]
    chunks=re.split(r'^- ([ABC])．(.+)$',body,flags=re.M)
    intro=chunks[0]
    lines=[]
    for paragraph in re.split(r'\n\s*\n',intro):
        p=paragraph.strip()
        if not p or p.startswith(('**','若','如果','以上为','实际班次','界面信息卡')):continue
        speaker='旁白'
        hit=re.match(r'^(旁白|内心旁白|林禾|阿沐|周言|你|现场提示|老师|老师介绍任务)：',p)
        if hit:speaker=hit[1];p=p[hit.end():]
        lines.append({'speaker':speaker,'text':p.strip('“”')})
    options=[]
    for k in range(1,len(chunks),3):
        label,text,rest=chunks[k:k+3]
        result=[]
        for ln in rest.splitlines():
            if ln.startswith('  - ') and not ln.startswith(('  - 后续','  - 记录')):result.append(ln[4:])
        options.append({'text':text.strip('“”'),'result':'\n'.join(result)})
    assert len(options)==3,(number,options)
    nodes.append(dict(id=str(number).zfill(2),title=m[2],stage=stages[i],tasks=tasks[i],character=chars[i],setting=settings[i],lines=lines or [dict(speaker='旁白',text=m[2])],options=options,tool=toolmap.get(number)))
    if number == 3:
        reunion = re.search(r'^若01选C，周言的开场改为：“(.+)”$', intro, flags=re.M)
        assert reunion, 'Missing alternate greeting for Zhou Yan'
        nodes[-1]['reunionLine'] = reunion[1]
assert len(nodes)==19
nodes[8]['options'][0]['result']='你先按兴趣找到项目，再检查班次时间与限制。确认选入后，课程写进了课表。'
nodes[8]['options'][1]['result']='筛掉冲突班次之后，可选列表短了一些。你选到了一门适合当前角色的体育课。'
nodes[8]['options'][2]['result']='你和阿沐比较了各自的选择，最后还是按自己的条件确认了班次。'
for op in nodes[9]['options']:op['result']='你核对了当前开设课程和所选班次，最后重新打开课表，确认选课结果已经写入。'
characters = {
    'linhe': {'name': '林禾', 'role': '迎新志愿者 · 学姐', 'lane': 0},
    'amu': {'name': '阿沐', 'role': '你的室友', 'lane': 1},
    'zhou': {'name': '周言', 'role': '设计学类同班同学 · 不是室友', 'lane': 2},
    'teacher': {'name': '老师', 'role': '设计构成课老师'},
}
revised_results = {
    '如果12选A，主角能够引用选图理由；如果13选B，则打开版本对比。老师围绕你的意图继续讨论。': nodes[13]['options'][1]['result'],
    '重新拍摄后反光减轻，玩家检查细节，再进入后期整理。': nodes[14]['options'][0]['result'],
    '如果前面保存过过程图，直接解锁比较；否则先补拍一组，不能凭空生成已有记录。': nodes[14]['options'][1]['result'],
}
payload = {'title': '我的第一学期', 'characters': characters, 'nodes': nodes, 'revisedResults': revised_results}
out='(function(root){const data='+json.dumps(payload,ensure_ascii=False,indent=2)+';root.SCU_STORY=data;if(typeof module!=="undefined")module.exports=data;})(typeof window!=="undefined"?window:globalThis);\n'
(root/'dist/story-data.js').write_text(out,encoding='utf-8')
print(f'Compiled {len(nodes)} scenes / {sum(len(n["options"]) for n in nodes)} choices from reviewed story.')
