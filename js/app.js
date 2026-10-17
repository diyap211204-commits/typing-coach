const $=s=>document.querySelector(s);
const WORDS="the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us".split(" ");
const L=[
{id:'home',name:'Home row',desc:'asdf jkl;',n:12,pool:"as ad sad dad fad lad all fall hall ask flask salad glass flag gash slash alfalfa half shall dash flash gad lag".split(" ")},
{id:'top',name:'Top row',desc:'qwerty uiop',n:10,pool:"quit power type write tire your wipe pretty route tower quiet report property require equip pirate output purple".split(" ")},
{id:'bottom',name:'Bottom row',desc:'zxcvbnm',n:12,pool:"zinc next vibe cab maxim mix bank cabin vex nab zoom mob convex vim cube bonnet exam".split(" ")},
{id:'words',name:'Common words',desc:'everyday English',n:14,pool:WORDS},
{id:'sent',name:'Sentences',desc:'capitals and punctuation',sent:1,n:2,pool:["Practice makes progress, not perfection.","The quick brown fox jumps over the lazy dog.","Good typists look at the screen, not the keys.","Accuracy first; speed follows with time.","Please send the report before Friday afternoon.","Small daily habits build lasting skills.","She sells sea shells by the shore.","Keep your wrists relaxed and your posture straight."]},
{id:'num',name:'Numbers & symbols',desc:'2026 $19.99 (24/7)',n:8,pool:"2026 4,500 $19.99 (24/7) #42 50% a+b=c 3.14159 name@mail.com 15:30 x*y 100-20 {id} [7] 8/9 \"ok\" what? 6&5".split(" ")},
{id:'code',name:'Code snippets',desc:'brackets and operators',n:3,pool:["const x = [];","if (a > b) {","return n * 2;","for (i = 0; i < 9; i++)","print('hi')","</div>","x => x + 1;","let y = {};","while (ok) { go(); }"]},
{id:'weak',name:'Weak-key drill',desc:'built from your mistakes',n:12,pool:[]}
];
const ROWS=["1234567890-=","qwertyuiop[]","asdfghjkl;'","zxcvbnm,./"];
const SH={'!':'1','@':'2','#':'3','$':'4','%':'5','^':'6','&':'7','*':'8','(':'9',')':'0','_':'-','+':'=','{':'[','}':']',':':';','"':"'",'<':',','>':'.','?':'/'};
const INV=Object.fromEntries(Object.entries(SH).map(([a,b])=>[b,a]));
const MULT=[['Short',1],['Medium',2],['Long',3]];
let hist=[],lenI=0,cur=L[0],text='',st=[],idx=0,t0=0,timer=null,errs=0,keys=0,pk={},samples=[],view='play',lastRes=null;
const rowOf=c=>{c=SH[c]||c.toLowerCase();return ROWS.findIndex(r=>r.includes(c))};
try{hist=JSON.parse(localStorage.getItem('ks_hist')||'[]')}catch(e){}
try{pk0=JSON.parse(localStorage.getItem('ks_weak')||'{}')}catch(e){}
var pk0=typeof pk0==='undefined'?{}:pk0;

function pick(a,n){const r=[];for(let i=0;i<n;i++)r.push(a[Math.floor(Math.random()*a.length)]);return r}
function gen(l,m){
 if(l.id==='weak'){
  const w=Object.entries(pk0).filter(([k,v])=>v.m>0).sort((a,b)=>b[1].m-a[1].m).slice(0,4).map(x=>x[0]);
  if(!w.length)return pick(WORDS,l.n*m).join(' ');
  let p=WORDS.concat(...L.map(x=>x.pool)).filter(x=>x.length<12&&w.some(c=>x.toLowerCase().includes(c)));
  if(p.length<6)p=p.concat(pick(w,3).map(c=>c+c+pick(w,2).join('')));
  return pick(p,l.n*m).join(' ');
 }
 if(l.sent)return [...l.pool].sort(()=>Math.random()-.5).slice(0,l.n+m).join(' ');
 return pick(l.pool,l.n*m).join(' ');
}
function best(id){const h=hist.filter(x=>x.id===id);return h.length?Math.max(...h.map(x=>x.wpm)):0}
function drawSide(){
 $('#lessons').innerHTML=L.map(l=>`<button class="lesson ${l.id===cur.id?'on':''}" data-id="${l.id}">${best(l.id)?`<em>${best(l.id)} wpm</em>`:''}<b>${l.name}</b><span>${l.desc}</span></button>`).join('');
 $('#lessons').querySelectorAll('button').forEach(b=>b.onclick=()=>{cur=L.find(x=>x.id===b.dataset.id);start()});
 $('#len').innerHTML=MULT.map((m,i)=>`<button aria-pressed="${i===lenI}" data-i="${i}">${m[0]}</button>`).join('');
 $('#len').querySelectorAll('button').forEach(b=>b.onclick=()=>{lenI=+b.dataset.i;start()});
 if(hist.length){
  const last=hist.slice(-10),mx=Math.max(...last.map(x=>x.wpm),10),pts=last.map((x,i)=>`${i*(200/Math.max(last.length-1,1))},${46-x.wpm/mx*40}`).join(' ');
  const avg=Math.round(hist.slice(-5).reduce((a,x)=>a+x.wpm,0)/Math.min(5,hist.length));
  $('#prog').innerHTML=`<svg viewBox="-4 0 208 52" width="100%" role="img" aria-label="Speed over last runs"><polyline points="${pts}" fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-linejoin="round"/></svg>Best ${Math.max(...hist.map(x=>x.wpm))} wpm · last 5 average ${avg} wpm · ${hist.length} runs`;
 }
}
function drawKb(){
 $('#kb').innerHTML=ROWS.map((r,i)=>`<div class="row" style="margin-left:${i*14}px">${[...r].map(c=>`<div class="k" data-k="${c}">${c}</div>`).join('')}</div>`).join('')+'<div class="row"><div class="k wide shift" data-k="shift">Shift</div><div class="k space" data-k=" ">space</div><div class="k wide" data-k="back">⌫</div></div>';
}
function keyEl(c){const b=SH[c]||c.toLowerCase();return document.querySelector(`.k[data-k="${CSS.escape(b)}"]`)}
function markNext(){
 document.querySelectorAll('.k.next').forEach(k=>k.classList.remove('next'));
 if(idx<text.length){const c=text[idx],k=keyEl(c);k&&k.classList.add('next');if(c!==c.toLowerCase()||SH[c]){const sk=document.querySelector('.k.shift');sk&&sk.classList.add('next')}}
}
function start(){
 clearInterval(timer);view='play';text=gen(cur,MULT[lenI][1]);st=Array(text.length).fill(0);idx=0;t0=0;errs=0;keys=0;pk={};samples=[];
 $('#rep').classList.remove('show');$('#play').style.display='';
 $('#text').innerHTML=[...text].map(c=>`<span>${c.replace('&','&amp;').replace('<','&lt;')}</span>`).join('');
 document.querySelectorAll('.k').forEach(k=>{k.style.removeProperty('--h')});setShift(false);
 paint();drawSide();ui(0);markNext();
}
function paint(){const s=$('#text').children;for(let i=0;i<s.length;i++)s[i].className=i===idx?'cur':st[i]===1?'ok':st[i]===2?'bad':'';$('#pb').style.width=(idx/text.length*100)+'%'}
const correct=()=>st.filter(x=>x===1).length;
function ui(el){
 $('#sA').textContent=(keys?Math.round((keys-errs)/keys*100):100)+'%';
 const s=Math.floor(el/1000);$('#sT').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');$('#sE').textContent=errs;
}
function tick(){
 const el=performance.now()-t0;ui(el);
 if(Math.floor(el/1000)>samples.length&&el>1500)samples.push(Math.round(correct()/5/(el/60000)));
}
function backspace(){if(idx>0){idx--;st[idx]=0;paint();markNext()}}
function typeChar(ch){
 if(!t0){t0=performance.now();timer=setInterval(tick,250)}
 const exp=text[idx],ok=ch===exp,k=exp.toLowerCase();
 pk[k]=pk[k]||{h:0,m:0};keys++;
 if(ok)pk[k].h++;else{pk[k].m++;errs++}
 st[idx]=ok?1:2;
 const ke=keyEl(exp);if(ke){ke.classList.add(ok?'hit':'miss');setTimeout(()=>ke.classList.remove('hit','miss'),140)}
 idx++;paint();markNext();ui(performance.now()-t0);
 if(idx>=text.length)finish();
}
document.addEventListener('keydown',e=>{
 if(view!=='play'){if(e.key==='Enter'){e.preventDefault();start()}return}
 if(e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.key==='Escape'){start();return}
 if(e.key==='Backspace'){e.preventDefault();backspace();return}
 if(e.key.length!==1)return;e.preventDefault();
 typeChar(e.key);
});
// on-screen keyboard: click or tap the keys to type
let shiftOn=false;
function setShift(v){shiftOn=v;const sk=document.querySelector('.k.shift');if(sk)sk.classList.toggle('on',v)}
$('#kb').addEventListener('mousedown',e=>{if(e.target.closest('.k'))e.preventDefault()});
$('#kb').addEventListener('click',e=>{
 const el=e.target.closest('.k');if(!el||view!=='play')return;
 const k=el.dataset.k;
 if(k==='shift'){setShift(!shiftOn);return}
 if(k==='back'){backspace();return}
 const ch=shiftOn?(INV[k]||k.toUpperCase()):k;
 setShift(false);
 typeChar(ch);
});
function finish(){
 clearInterval(timer);view='report';
 const el=performance.now()-t0,wpm=Math.round(correct()/5/(el/60000)),acc=Math.round((keys-errs)/keys*100);
 if(!samples.length)samples=[wpm];samples.push(wpm);
 const mean=samples.reduce((a,b)=>a+b,0)/samples.length,sd=Math.sqrt(samples.reduce((a,b)=>a+(b-mean)**2,0)/samples.length);
 const cons=Math.max(0,Math.round(100-sd/Math.max(mean,1)*100));
 const weak=Object.entries(pk).filter(([k,v])=>v.m>0).sort((a,b)=>b[1].m/(b[1].h+b[1].m)-a[1].m/(a[1].h+a[1].m)||b[1].m-a[1].m).slice(0,5);
 const prevBest=best(cur.id);
 lastRes={wpm,acc,weak,cons};
 hist.push({id:cur.id,wpm,acc,t:Date.now()});hist=hist.slice(-40);
 for(const[k,v]of Object.entries(pk)){const o=pk0[k]||{h:0,m:0};pk0[k]={h:Math.round(o.h*.8)+v.h,m:Math.round(o.m*.8)+v.m}}
 try{localStorage.setItem('ks_hist',JSON.stringify(hist));localStorage.setItem('ks_weak',JSON.stringify(pk0))}catch(e){}
 // heatmap
 for(const[k,v]of Object.entries(pk)){const ke=document.querySelector(`.k[data-k="${CSS.escape(k)}"]`);if(ke&&v.m)ke.style.setProperty('--h',Math.min(1,v.m/(v.h+v.m)*2.2))}
 document.querySelectorAll('.k.next').forEach(k=>k.classList.remove('next'));
 // suggestions
 const sug=[],lv=wpm<25?'beginner':wpm<40?'developing':wpm<60?'proficient':'fast';
 if(acc<90)sug.push('Accuracy is the priority. Slow down about 20% until you reach 95%; speed comes from clean, rhythmic keystrokes.');
 else if(acc<96)sug.push('Accuracy is decent. Aim for 97% or better before pushing speed.');
 else sug.push('Excellent accuracy. You can now push for more speed with the same control.');
 if(cons<70)sug.push('Your pace was uneven ('+cons+'% consistent). Try to keep a steady rhythm instead of bursts and stalls.');
 if(weak.length){
  const rs=weak.map(w=>rowOf(w[0])).filter(r=>r>=0),top=[0,1,2,3].map(r=>rs.filter(x=>x===r).length),tr=top.indexOf(Math.max(...top));
  if(top[tr]>=2)sug.push('Most slips are on the '+['number','top','home','bottom'][tr]+' row. Practise the row exercise, and keep fingers returning to the home row.');
  sug.push('Problem keys: '+weak.map(w=>w[0]===' '?'space':w[0]).join(', ')+'. A weak-key drill has been assigned.');
 }
 if(prevBest&&wpm>prevBest)sug.push('New personal best on this exercise (previous '+prevBest+' wpm).');
 sug.push(lv==='beginner'?'Level: '+lv+'. Keep your eyes on the screen and practise 10 minutes daily.':lv==='fast'?'Level: '+lv+'. Try code or symbols exercises to stay challenged.':'Level: '+lv+'. Daily 10-minute sessions typically add 5 to 10 wpm in a few weeks.');
 // next assignment
 let nxt,why;
 if(weak.length&&acc<97){nxt=L.find(x=>x.id==='weak');why='Weak-key drill on '+weak.slice(0,3).map(w=>w[0]).join(' ')}
 else{const i=L.findIndex(x=>x.id===cur.id),j=Math.min(i+1,L.length-2);nxt=acc>=95&&wpm>=25&&cur.id!=='weak'?L[j]:cur;why=nxt===cur?'Repeat this exercise to lift accuracy':'Next level: '+nxt.name}
 // chart
 const W=560,H=130,mx=Math.max(...samples,10)*1.15,px=i=>30+i*((W-40)/Math.max(samples.length-1,1)),py=v=>H-18-v/mx*(H-30);
 const path=samples.map((v,i)=>(i?'L':'M')+px(i)+','+py(v)).join('');
 const chart=`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Speed over time"><line x1="30" y1="${H-18}" x2="${W-10}" y2="${H-18}" stroke="var(--line)"/><path d="${path}" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linejoin="round"/><text x="2" y="${py(mx/1.15)+4}">${Math.round(mx/1.15)}</text><text x="2" y="${H-14}">0</text><text x="30" y="${H-3}">0s</text><text x="${W-40}" y="${H-3}">${Math.round(el/1000)}s</text></svg>`;
 $('#play').style.display='none';
 const r=$('#rep');r.classList.add('show');
 r.innerHTML=`<h2>${wpm} wpm at ${acc}% accuracy</h2><div class="tag">${cur.name}, ${Math.floor(el/1000)} seconds, ${errs} mistake${errs===1?'':'s'}, ${cons}% consistent</div>
 <div class="grid2"><div><h3>Speed over time</h3>${chart}<h3 style="margin-top:14px">Slowest, least accurate keys</h3>${weak.length?'<div class="weak">'+weak.map(w=>`<div><b>${w[0]===' '?'␣':w[0]}</b>${w[1].m} of ${w[1].h+w[1].m} missed</div>`).join('')+'</div>':'<div class="tag">No mistakes. Clean run.</div>'}<p class="tag">The keyboard below is shaded red where you missed most.</p></div>
 <div><h3>Suggestions</h3><ul class="sug">${sug.map(s=>`<li>${s}</li>`).join('')}</ul></div></div>
 <div class="assign"><b>Assigned next:</b> ${why}</div>
 <div class="actions"><button class="btn p" id="goNext">Start assigned exercise</button><button class="btn" id="again">Retry this exercise</button><span class="tag" style="align-self:center">or press Enter</span></div>`;
 $('#goNext').onclick=()=>{cur=nxt;start()};$('#again').onclick=()=>start();
 drawSide();
}
drawKb();start();
