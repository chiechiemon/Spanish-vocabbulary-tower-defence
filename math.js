(function(root){
  "use strict";

  const SMALL=["cero","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve","veinte","veintiuno","veintidós","veintitrés","veinticuatro","veinticinco","veintiséis","veintisiete","veintiocho","veintinueve"];
  const TENS=["","","veinte","treinta","cuarenta","cincuenta","sesenta","setenta","ochenta","noventa"];
  const HUNDREDS=["","ciento","doscientos","trescientos","cuatrocientos","quinientos","seiscientos","setecientos","ochocientos","novecientos"];
  const OPS={
    "+":{term:"más",apply:(a,b)=>a+b},
    "−":{term:"menos",apply:(a,b)=>a-b},
    "×":{term:"por",apply:(a,b)=>a*b},
    "÷":{term:"dividido entre",apply:(a,b)=>a/b}
  };
  const LEVELS={
    easy:{max:20,change:10,factor:10,round:1},
    medium:{max:1000,change:25,factor:10,round:10},
    hard:{max:1000000,change:100,factor:10,round:1000}
  };

  function underHundred(n){
    if(n<30)return SMALL[n];
    const tens=Math.floor(n/10),ones=n%10;
    return TENS[tens]+(ones?" y "+SMALL[ones]:"");
  }
  function underThousand(n){
    if(n<100)return underHundred(n);
    if(n===100)return "cien";
    const hundreds=Math.floor(n/100),rest=n%100;
    return HUNDREDS[hundreds]+(rest?" "+underHundred(rest):"");
  }
  function beforeMil(words){
    return words.replace(/veintiuno$/,"veintiún").replace(/ y uno$/," y un").replace(/ uno$/," un").replace(/^uno$/,"un");
  }
  function numberToSpanish(n){
    if(!Number.isInteger(n)||n<0||n>1000000)throw new RangeError("numberToSpanish supports integers from 0 to 1,000,000");
    if(n===1000000)return "un millón";
    if(n<1000)return underThousand(n);
    const thousands=Math.floor(n/1000),rest=n%1000;
    const prefix=thousands===1?"mil":beforeMil(underThousand(thousands))+" mil";
    return prefix+(rest?" "+underThousand(rest):"");
  }
  function randomInt(min,max,rng){return Math.floor(rng()*(max-min+1))+min}
  function makeQuestion(levelName,rng=Math.random,forcedOperator){
    const cfg=LEVELS[levelName]||LEVELS.easy;
    const operator=forcedOperator||Object.keys(OPS)[randomInt(0,3,rng)];
    let left,right;
    if(operator==="+"){
      left=randomInt(0,cfg.max,rng);right=randomInt(0,Math.min(cfg.change,cfg.max-left),rng);
    }else if(operator==="−"){
      left=randomInt(0,cfg.max,rng);right=randomInt(0,Math.min(cfg.change,left),rng);
    }else if(operator==="×"){
      right=randomInt(0,cfg.factor,rng);
      const maxBase=right?Math.floor(cfg.max/right/cfg.round):Math.floor(cfg.max/cfg.round);
      left=randomInt(0,maxBase,rng)*cfg.round;
    }else{
      right=randomInt(1,cfg.factor,rng);
      const quotient=randomInt(0,Math.floor(cfg.max/right/cfg.round),rng)*cfg.round;
      left=right*quotient;
    }
    return{left,right,operator,term:OPS[operator].term,answer:OPS[operator].apply(left,right)};
  }

  const api={numberToSpanish,makeQuestion,LEVELS};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.SpanishMath=api;

  if(typeof document==="undefined")return;
  const $=id=>document.getElementById(id);
  let level="easy",score=0,current=null,answered=false;
  function selectLevel(next){
    level=next;score=0;
    document.querySelectorAll("[data-level]").forEach(b=>b.classList.toggle("active",b.dataset.level===level));
    nextQuestion();
  }
  function nextQuestion(){
    current=makeQuestion(level);answered=false;
    $("mathLeft").textContent=numberToSpanish(current.left);
    $("mathRight").textContent=numberToSpanish(current.right);
    $("mathOp").textContent=current.operator;$("mathOpTerm").textContent=current.term;
    $("mathAnswer").value="";$("mathAnswer").disabled=false;$("mathCheck").classList.remove("hide");$("mathSkip").classList.remove("hide");
    $("mathNext").classList.add("hide");$("mathFeedback").textContent="";$("mathFeedback").className="";
    $("mathScore").textContent="⭐ "+score;$("mathAnswer").focus();
  }
  function checkAnswer(){
    if(answered)return;
    const raw=$("mathAnswer").value.trim();
    if(!/^\d+$/.test(raw)){ $("mathFeedback").textContent="Escribe tu respuesta con cifras.";$("mathFeedback").className="bad";return }
    answered=true;const correct=Number(raw)===current.answer;
    if(correct)score++;
    $("mathScore").textContent="⭐ "+score;
    $("mathFeedback").className=correct?"ok":"bad";
    $("mathFeedback").innerHTML=(correct?"¡Correcto! ✅":"Incorrecto ❌")+"<span>La respuesta es "+current.answer.toLocaleString("es-ES")+": "+numberToSpanish(current.answer)+".</span>";
    $("mathAnswer").disabled=true;$("mathCheck").classList.add("hide");$("mathSkip").classList.add("hide");$("mathNext").classList.remove("hide");$("mathNext").focus();
  }
  $("mathBtn").onclick=()=>{show("math");selectLevel(level)};
  $("mathBack").onclick=()=>show("setup");
  $("mathCheck").onclick=checkAnswer;$("mathSkip").onclick=nextQuestion;$("mathNext").onclick=nextQuestion;
  $("mathAnswer").addEventListener("keydown",e=>{if(e.key==="Enter")checkAnswer()});
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>selectLevel(b.dataset.level));
})(typeof window!=="undefined"?window:globalThis);
