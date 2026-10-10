const $=id=>document.getElementById(id);

function allWords(){return parse(DATA+"\n"+$("vocab").value)}
try{const v=localStorage.getItem("pd_custom");if(v){$("vocab").value=v;$("custom").open=true}}catch(e){}

function parse(t){return t.split(/\r?\n/).map(l=>l.split("\t")).filter(c=>c.length>=2&&c[0].trim()&&c[1].trim()).map(c=>({term:c[0].trim(),meaning:c[1].trim(),unit:(c[2]||"").trim(),ex:(c[3]||"").trim()}))}
function norm(s){return s.toLowerCase().replace(/\([^)]*\)/g," ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[¿¡?!.,;:]/g,"").replace(/\s+/g," ").trim()}
const STOP=new Set("to the a an of de het een la el los las un una".split(" "));
const words=s=>{const a=norm(s).split(" ").filter(Boolean);const c=a.filter(x=>!STOP.has(x));return c.length?c:a};
function lev(a,b){let p=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[b.length]}
const close=(a,b)=>{if(a===b)return true;const n=Math.max(a.length,b.length);const k=n>=8?2:n>=4?1:0;return k>0&&lev(a,b)<=k};
function answers(w,dir){
  const out=[];const add=s=>{const c=words(s.replace(/\b(here|hier):\s*/gi,""));if(c.length&&c[0])out.push(c)};
  if(dir==="es")w.meaning.split(/\s\/\s|,|;/).forEach(add);
  else w.term.split(/,\s|\s\/\s/).forEach(s=>{add(s);add(s.replace(/[()]/g,""));if(/\S\/\S/.test(s))s.replace(/\([^)]*\)/g,"").split("/").forEach(x=>{if(x.trim().length>2)add(x)})});
  return out;
}
function ok(typed,ans){
  const t=words(typed);if(!t.length||!t[0])return false;
  return ans.some(a=>{
    if(a.length<3)return t.length===a.length&&a.every((x,i)=>close(x,t[i]));
    const hit=a.filter(x=>t.some(y=>close(x,y))).length;
    return hit/a.length>=0.75&&t.length<=a.length+1;
  });
}
const FIX={"experiencia laboral":"f","potencia":"f"};
const EL=new Set("agua área acta aula arma alma águila hacha hambre ala asma alba ama".split(" "));
const NOART=new Set(["américa latina"]);
const GEN=/\s*\((m|f|m\/\s?f|m pl|f pl|m, pl)\)\s*$/;
function display(t){
  if(t.includes(", ")){const p=t.split(", ");if(p.length>1&&p.every(x=>GEN.test(x)))return p.map(display).join(" / ")}
  const m=t.match(GEN);if(!m)return t;
  const b=t.replace(GEN,"").trim(),k=b.toLowerCase();
  if(/\(g\)/.test(b)||/^(hacer|tener)\s/.test(k)||k.startsWith("(con)")||NOART.has(k))return b;
  let g=m[1].replace(/\s/g,"");
  if(g==="m"&&FIX[k])g=FIX[k];
  if(g==="m")return "el "+b;
  if(g==="f")return (EL.has(k.split(" ")[0])?"el ":"la ")+b;
  if(g==="mpl"||g==="m,pl")return "los "+b;
  if(g==="fpl")return "las "+b;
  if(g==="m/f"){
    if(/\S\/\S/.test(b)){const [x,y]=b.split("/");return y.length<=2?"el/la "+b:"el "+x+" / la "+y}
    return "el/la "+b;
  }
  return t;
}
function prompt(w,dir){return dir==="es"?display(w.term):w.meaning.split(/\s\/\s/)[0]}

function refreshUnits(){
  const us=[...new Set(allWords().map(w=>w.unit).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  const cur=$("unit").value,g={};
  us.forEach(u=>(g[u.split("_")[0]]=g[u.split("_")[0]]||[]).push(u));
  $("unit").innerHTML='<option value="">All units</option>'+Object.keys(g).map(k=>`<optgroup label="${k}"><option value="${k}">All of ${k}</option>${g[k].map(u=>`<option>${u}</option>`).join("")}</optgroup>`).join("");
  $("unit").value=[...$("unit").options].some(o=>o.value===cur)?cur:"";
}
$("vocab").addEventListener("input",refreshUnits);
refreshUnits();

function show(id){["setup","browse","progress","game","end"].forEach(s=>$(s).classList.toggle("hide",s!==id));if(id==="setup")updateWeakBtn()}
let G=null;
$("go").onclick=start;$("again").onclick=start;$("back").onclick=()=>show("setup");

function start(){
  const all=allWords();
  if(!all.length){$("err").textContent="Paste some vocab first (tab-separated), or load the sample.";show("setup");return}
  $("err").textContent="";
  try{localStorage.setItem("pd_custom",$("vocab").value)}catch(e){}
  const u=$("unit").value;
  let words=u?all.filter(w=>w.unit===u||w.unit.startsWith(u+"_")):all;
  if($("pool").value==="weak")words=words.filter(weak);
  if(!words.length){$("err").textContent="You haven't marked any weak words here yet. Tap ☆ next to a word in Browse vocabulary, or in the list after a game.";show("setup");return}
  if(G)G.en.forEach(e=>e.el.remove());
  G={words,dir:$("dir").value,lives:$("lives").value==="inf"?Infinity:(+$("lives").value||5),speed:+$("speed").value,missCount:0,score:0,killed:0,en:[],prev:0,sinceSpawn:99,miss:{},missList:[],lane:0,over:false};
  document.querySelectorAll(".enemy").forEach(e=>e.remove());
  show("game");$("msg").textContent="";$("ans").value="";$("ans").focus();hud();
  requestAnimationFrame(tick);
}
function hud(){
  $("hudLives").textContent=G.lives===Infinity?"❤️ ∞ · missed "+G.missCount:"❤️".repeat(Math.max(G.lives,0));
  $("score").textContent="⭐ "+G.score;
  $("wave").textContent="Wave "+(1+Math.floor(G.killed/8));
}
function spawn(){
  const on=new Set(G.en.map(e=>e.w.term));
  const pool=G.words.filter(w=>!on.has(w.term));
  if(!pool.length)return;
  const wt=pool.map(w=>1+(weak(w)?3:0)+(G.miss[w.term]||0));
  let r=Math.random()*wt.reduce((a,b)=>a+b,0),i=0;
  for(;i<pool.length-1;i++){r-=wt[i];if(r<=0)break}
  const w=pool[i],el=document.createElement("div");
  const txt=prompt(w,G.dir);el.className="enemy"+(txt.length>26?" long":"");el.textContent=txt;
  el.style.top=((G.lane++%5)*20+3)+"%";
  $("arena").appendChild(el);
  el.style.transform="translateX("+$("arena").clientWidth+"px)";
  G.en.push({w,x:100,el,ans:answers(w,G.dir)});
}
function tick(t){
  if(!G||G.over)return;
  const dt=G.prev?Math.min((t-G.prev)/1000,0.1):0;G.prev=t;
  const wave=1+Math.floor(G.killed/8);
  G.sinceSpawn+=dt;
  if(G.sinceSpawn>=Math.max(1.5,4-wave*0.25)/G.speed){G.sinceSpawn=0;spawn()}
  const W=$("arena").clientWidth;
  for(const e of [...G.en]){
    e.x-=(5+wave*1.2)*dt*G.speed;e.el.style.transform="translateX("+(e.x/100*W)+"px)";
    if(e.x<=8){
      e.el.remove();G.en.splice(G.en.indexOf(e),1);G.lives--;G.missCount++;
      G.miss[e.w.term]=(G.miss[e.w.term]||0)+1;{const p=P(e.w);p.m++;p.s=0;saveProg()}
      if(!G.missList.includes(e.w))G.missList.push(e.w);
      $("msg").textContent="💥 "+display(e.w.term)+" = "+e.w.meaning.split(/\s\/\s/)[0];
      hud();
      if(G.lives<=0)return finish();
    }
  }
  requestAnimationFrame(tick);
}
function submit(){
  if(!G||G.over)return;
  const a=$("ans").value;if(!norm(a))return;
  const hit=[...G.en].sort((p,q)=>p.x-q.x).find(e=>ok(a,e.ans));
  if(hit){
    hit.el.remove();G.en.splice(G.en.indexOf(hit),1);
    G.score+=10;G.killed++;{const p=P(hit.w);p.c++;p.s++;saveProg()}$("msg").textContent="✅ "+display(hit.w.term)+" = "+hit.w.meaning.split(/\s\/\s/)[0];
    $("ans").value="";hud();
  }else{
    $("ans").classList.remove("bad");void $("ans").offsetWidth;$("ans").classList.add("bad");
  }
}
$("ans").addEventListener("keydown",e=>{if(e.key==="Enter")submit()});
$("fire").onclick=submit;
$("menu").onclick=()=>{if(G){G.over=true;G.en=[];document.querySelectorAll(".enemy").forEach(e=>e.remove())}show("setup")};
$("quit").onclick=()=>{if(G&&!G.over)finish()};
function finish(){
  G.over=true;show("end");
  $("final").textContent="Score: "+G.score+" · Words defeated: "+G.killed+" · Missed: "+G.missCount;
  const box=$("missed");box.textContent="";
  if(G.missList.length){
    const h=document.createElement("p");h.textContent="Words that got through. Tap ☆ to mark the ones you want to practice:";box.appendChild(h);
    const ul=document.createElement("ul");
    G.missList.forEach(w=>{const li=document.createElement("li"),sb=mk("button",weak(w)?"★":"☆","star");sb.title="Mark or unmark as weak";sb.onclick=()=>{toggleWeak(w);sb.textContent=weak(w)?"★":"☆"};li.appendChild(sb);li.appendChild(document.createTextNode(" "+display(w.term)+" = "+w.meaning));ul.appendChild(li)});
    box.appendChild(ul);
  }
}

// ---- Vocabulary browser ----
function mk(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e}
function renderBrowse(){
  const u=$("bunit").value,q=norm($("bsearch").value);
  let ws=allWords().filter(w=>!u||w.unit===u||w.unit.startsWith(u+"_"));
  ws=ws.map((w,i)=>[w,i]).sort((a,b)=>a[0].unit.localeCompare(b[0].unit,undefined,{numeric:true})||a[1]-b[1]).map(x=>x[0]);
  if($("bweak").value==="weak")ws=ws.filter(weak);
  if(q)ws=ws.filter(w=>norm(display(w.term)+" "+w.meaning+" "+w.ex).includes(q));
  $("bcount").textContent=ws.length+" words"+($("bweak").value==="weak"&&!ws.length?". Tap ☆ next to a word (or in the list after a game) to mark it as weak.":"");
  const t=mk("table"),hr=mk("tr");
  ["Spanish","Meaning","Example","Weak"].forEach(h=>hr.appendChild(mk("th",h)));
  t.appendChild(hr);
  let last=null;
  ws.forEach(w=>{
    if(w.unit!==last){last=w.unit;const r=mk("tr",null,"u"),c=mk("td",w.unit||"Custom words");c.colSpan=4;r.appendChild(c);t.appendChild(r)}
    const r=mk("tr");
    r.appendChild(mk("td",display(w.term),"es"));r.appendChild(mk("td",w.meaning));r.appendChild(mk("td",w.ex));r.appendChild(starCell(w));
    t.appendChild(r);
  });
  $("btable").textContent="";$("btable").appendChild(t);
}
$("browseBtn").onclick=()=>{$("bunit").innerHTML=$("unit").innerHTML;$("bunit").value=$("unit").value;$("bsearch").value="";$("bweak").value="all";show("browse");renderBrowse()};
$("bback").onclick=()=>show("setup");
$("bunit").onchange=renderBrowse;
$("bsearch").oninput=renderBrowse;

// ---- Saved progress (spaced repetition) ----
let PROG={};
try{PROG=JSON.parse(localStorage.getItem("pd_progress")||"{}")}catch(e){PROG={}}
function saveProg(){try{localStorage.setItem("pd_progress",JSON.stringify(PROG))}catch(e){}}
const P=w=>PROG[w.term]||(PROG[w.term]={c:0,m:0,s:0});
const getP=w=>PROG[w.term]||{c:0,m:0,s:0};
const mastered=w=>getP(w).s>=3;
const weak=w=>!!getP(w).w;

function pstat(ws){let m=0,k=0;ws.forEach(w=>{if(weak(w))k++;else if(mastered(w))m++});return{m,k,n:ws.length}}
function prow(label,ws){
  const s=pstat(ws),r=mk("div",null,"prow");
  r.appendChild(mk("span",label,"l"));
  const bar=mk("div",null,"bar"),g=mk("i",null,"g"),x=mk("i",null,"r");
  g.style.width=(100*s.m/s.n)+"%";x.style.width=(100*s.k/s.n)+"%";
  bar.appendChild(g);bar.appendChild(x);r.appendChild(bar);
  r.appendChild(mk("span",s.m+"/"+s.n+(s.k?" · "+s.k+" weak":""),"t"));
  return r;
}
function renderProgress(){
  const all=allWords().filter(w=>w.unit),root=$("ptable");root.textContent="";
  const t=pstat(all);
  $("psum").textContent=t.m+" of "+t.n+" words mastered · "+t.k+" weak";
  const g={};
  all.forEach(w=>{const k=w.unit.split("_")[0];((g[k]=g[k]||{})[w.unit]=g[k][w.unit]||[]).push(w)});
  const nat=(a,b)=>a.localeCompare(b,undefined,{numeric:true});
  Object.keys(g).sort(nat).forEach(k=>{
    const d=mk("details",null,"g"),sm=mk("summary"),units=g[k];
    sm.appendChild(prow(k,Object.values(units).flat()));d.appendChild(sm);
    const inner=mk("div",null,"pin");
    Object.keys(units).sort(nat).forEach(u=>inner.appendChild(prow(u,units[u])));
    d.appendChild(inner);root.appendChild(d);
  });
}
$("progBtn").onclick=()=>{show("progress");renderProgress()};
$("pback").onclick=()=>show("setup");
let resetTimer;
$("preset").onclick=()=>{
  const b=$("preset");
  if(b.dataset.arm){PROG={};saveProg();delete b.dataset.arm;b.textContent="Reset progress";renderProgress()}
  else{b.dataset.arm="1";b.textContent="Click again to erase all progress";clearTimeout(resetTimer);resetTimer=setTimeout(()=>{delete b.dataset.arm;b.textContent="Reset progress"},4000)}
};

// ---- Marking weak words yourself ----
function toggleWeak(w){const p=P(w);p.w=p.w?0:1;saveProg()}
function updateWeakBtn(){$("weakBtn").textContent="★ My weak words ("+allWords().filter(weak).length+")"}
function starCell(w){
  const td=mk("td"),b=mk("button",weak(w)?"★":"☆","star");
  b.title="Mark or unmark as weak";
  b.onclick=()=>{
    toggleWeak(w);b.textContent=weak(w)?"★":"☆";
    if($("bweak").value==="weak"&&!weak(w)){td.parentNode.remove();$("bcount").textContent=Math.max(0,parseInt($("bcount").textContent)-1)+" words"}
  };
  td.appendChild(b);
  if(mastered(w)&&!weak(w))td.appendChild(mk("span"," ✓"));
  return td;
}
$("bweak").onchange=renderBrowse;
$("weakBtn").onclick=()=>{$("bunit").innerHTML=$("unit").innerHTML;$("bunit").value="";$("bsearch").value="";$("bweak").value="weak";show("browse");renderBrowse()};
updateWeakBtn();
