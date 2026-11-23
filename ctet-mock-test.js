/* School Sathi CTET Mock Test engine v1
 * Question records are loaded from ctet-question-bank.js as window.CTET_QUESTION_BANK.
 * Each record: {paper:"I"|"II",section:"cdp"|"language"|"maths"|"evs"|"science"|"social",group?:"maths"|"social",language?:"Hindi"|"English",q,options:[...4],answer:0..3,explanation}
 */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const languages=["असमिया","बंगाली","बोडो","डोगरी","अंग्रेज़ी","गोंडी","गुजराती","हिंदी","कन्नड़","कश्मीरी","कोंकणी","मैथिली","मलयालम","मणिपुरी","मराठी","मिज़ो","नेपाली","ओड़िया","पंजाबी","संस्कृत","संथाली","सिंधी","तमिल","तेलुगु","तिब्बती","उर्दू","खासी"];
const langCodes=["03","04","21","22","01","—","06","02","07","23","24","25","09","10","11","12","13","14","15","16","26","27","17","18","19","20","08"];
const bank=()=>Array.isArray(window.CTET_QUESTION_BANK)?window.CTET_QUESTION_BANK:[];
const paper=$("ctetPaper"),group=$("ctetGroup"),groupWrap=$("ctetGroupWrap"),l1=$("ctetLang1"),l2=$("ctetLang2"),start=$("ctetStart"),status=$("ctetBankStatus");
if(!paper||!start)return;
languages.forEach((name,i)=>{if(name==="गोंडी")return;const o1=new Option(name+" ("+langCodes[i]+")",name),o2=new Option(name+" ("+langCodes[i]+")",name);l1.add(o1);l2.add(o2)});
l1.value="हिंदी";l2.value="अंग्रेज़ी";
paper.addEventListener("change",()=>{groupWrap.classList.toggle("hidden",paper.value!=="II");refreshStatus()});
[group,l1,l2].forEach(x=>x.addEventListener("change",refreshStatus));
function eligible(){
 const p=paper.value,g=group.value,a=bank();
 const sections=p==="I"?["cdp","language","maths","evs"]:["cdp","language",g==="maths"?"maths":"social"];
 return a.filter(x=>x.paper===p&&sections.includes(x.section)&&
   (x.section!=="language"||x.language===l1.value||x.language===l2.value)&&
   (p!=="II"||x.section!=="maths"&&x.section!=="social"||x.group===g));
}
function refreshStatus(){
 const n=eligible().length;
 status.textContent=n>=90?"प्रश्न बैंक उपलब्ध: "+n+" · टेस्ट शुरू किया जा सकता है":"प्रश्न बैंक में अभी "+n+"/90 उपयुक्त प्रश्न हैं। 90 प्रश्न पूरे होने पर टेस्ट सक्रिय होगा।";
 start.disabled=n<90||l1.value===l2.value;
 if(l1.value===l2.value)status.textContent="Language-I और Language-II अलग-अलग चुनें।";
}
let questions=[],answers={},review={},pos=0,seconds=5400,tick=null,finished=false;
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function begin(){
 if(l1.value===l2.value){alert("Language-I और Language-II अलग चुनें।");return}
 const pool=eligible();if(pool.length<90){alert("अभी 90 अलग-अलग उपयुक्त प्रश्न उपलब्ध नहीं हैं। प्रश्न बैंक पूरा होने पर टेस्ट शुरू होगा।");return}
 questions=shuffle(pool).slice(0,90).map(q=>({...q,options:shuffle(q.options.map((v,i)=>({v,correct:i===q.answer}))) }));
 answers={};review={};pos=0;seconds=5400;finished=false;
 $("ctetResult").classList.add("hidden");$("ctetExam").classList.remove("hidden");start.disabled=true;
 draw();tick=setInterval(()=>{seconds--;clock();if(seconds<=0)finish(true)},1000);
}
function clock(){$("ctetTimer").textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0")}
function draw(){
 const q=questions[pos];$("ctetProgress").textContent="प्रश्न "+(pos+1)+" / 90";$("ctetAnswered").textContent="हल: "+Object.keys(answers).length;clock();
 const box=$("ctetQuestion");box.innerHTML="";
 const h=document.createElement("h3");h.textContent=q.q;box.appendChild(h);
 const sec=document.createElement("p");sec.className="muted";sec.textContent="खंड: "+q.section.toUpperCase()+(review[pos]?" · समीक्षा हेतु चिन्हित":"");box.appendChild(sec);
 q.options.forEach((o,i)=>{const label=document.createElement("label");label.style.display="block";label.style.padding="10px";label.style.borderTop="1px solid #e4edf1";const input=document.createElement("input");input.type="radio";input.name="ctetAnswer";input.checked=answers[pos]===i;input.addEventListener("change",()=>{answers[pos]=i;drawNav();$("ctetAnswered").textContent="हल: "+Object.keys(answers).length});label.append(input,document.createTextNode(" "+String.fromCharCode(65+i)+". "+o.v));box.appendChild(label)});
 $("ctetPrev").disabled=pos===0;$("ctetNext").textContent=pos===89?"अंतिम प्रश्न":"अगला";
 drawNav();
}
function drawNav(){const nav=$("ctetNav");nav.innerHTML="";questions.forEach((_,i)=>{const b=document.createElement("button");b.type="button";b.className="secondary";b.textContent=(i+1)+(review[i]?" ⚑":"")+(answers[i]!==undefined?" ✓":"");b.style.minWidth="42px";b.style.margin="3px";b.addEventListener("click",()=>{pos=i;draw()});nav.appendChild(b)})}
function finish(auto){if(finished)return;finished=true;if(tick)clearInterval(tick);let correct=0;questions.forEach((q,i)=>{if(answers[i]!==undefined&&q.options[answers[i]].correct)correct++});const wrong=Object.keys(answers).length-correct,unanswered=90-Object.keys(answers).length;
 $("ctetExam").classList.add("hidden");const r=$("ctetResult");r.classList.remove("hidden");r.innerHTML="";
 const h=document.createElement("h3");h.textContent=auto?"समय पूरा — टेस्ट स्वतः जमा हुआ":"टेस्ट सफलतापूर्वक जमा हुआ";r.appendChild(h);
 const p=document.createElement("p");p.textContent="अंक: "+correct+" / 90 · सही: "+correct+" · गलत: "+wrong+" · अनुत्तरित: "+unanswered;r.appendChild(p);
 questions.forEach((q,i)=>{const d=document.createElement("div");d.className="entry";const title=document.createElement("strong");title.textContent=(i+1)+". "+q.q;const detail=document.createElement("p");detail.textContent="आपका उत्तर: "+(answers[i]===undefined?"नहीं दिया":q.options[answers[i]].v)+" | सही उत्तर: "+q.options.find(x=>x.correct).v;const ex=document.createElement("p");ex.className="muted";ex.textContent=q.explanation||"व्याख्या शीघ्र जोड़ी जाएगी।";d.append(title,detail,ex);r.appendChild(d)});
 const again=document.createElement("button");again.textContent="नया Mock Test";again.addEventListener("click",()=>{r.classList.add("hidden");start.disabled=false;refreshStatus()});r.prepend(again);
 try{const history=JSON.parse(localStorage.getItem("ss_ctet_attempts_v1")||"[]");history.unshift({date:new Date().toISOString(),paper:paper.value,group:group.value,score:correct,wrong,unanswered});localStorage.setItem("ss_ctet_attempts_v1",JSON.stringify(history.slice(0,30)))}catch(e){}
}
$("ctetPrev").addEventListener("click",()=>{if(pos>0){pos--;draw()}});
$("ctetNext").addEventListener("click",()=>{if(pos<89){pos++;draw()}});
$("ctetReview").addEventListener("click",()=>{review[pos]=!review[pos];draw()});
$("ctetSubmit").addEventListener("click",()=>{if(confirm("क्या आप टेस्ट जमा करना चाहते हैं?"))finish(false)});
start.addEventListener("click",begin);refreshStatus();
})();