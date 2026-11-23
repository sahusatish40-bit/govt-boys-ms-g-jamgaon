/* School Sathi CTET Mock Test engine v1
 * Question records are loaded from ctet-question-bank.js as window.CTET_QUESTION_BANK.
 * Each record: {paper:"I"|"II",section:"cdp"|"language"|"maths"|"evs"|"science"|"social",group?:"maths"|"social",language?:"Hindi"|"English",q,options:[...4],answer:0..3,explanation}
 */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const languages=["अंग्रेज़ी","हिंदी","असमिया","बंगाली","गारो","गुजराती","कन्नड़","खासी","मलयालम","मणिपुरी","मराठी","मिज़ो","नेपाली","ओड़िया","पंजाबी","संस्कृत","तमिल","तेलुगु","तिब्बती","उर्दू","बोडो","डोगरी","कश्मीरी","कोंकणी","मैथिली","संथाली","सिंधी"];
const langCodes=["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27"];
const bank=()=>Array.isArray(window.CTET_QUESTION_BANK)?window.CTET_QUESTION_BANK:[];
const paper=$("ctetPaper"),group=$("ctetGroup"),groupWrap=$("ctetGroupWrap"),l1=$("ctetLang1"),l2=$("ctetLang2"),start=$("ctetStart"),status=$("ctetBankStatus");
if(!paper||!start)return;
languages.forEach((name,i)=>{const o1=new Option(name+" ("+langCodes[i]+")",name),o2=new Option(name+" ("+langCodes[i]+")",name);l1.add(o1);l2.add(o2)});
l1.value="हिंदी";l2.value="अंग्रेज़ी";
paper.addEventListener("change",()=>{groupWrap.classList.toggle("hidden",paper.value!=="II");refreshStatus()});
[group,l1,l2].forEach(x=>x.addEventListener("change",refreshStatus));
function buckets(){
 const p=paper.value,g=group.value,a=bank().filter(x=>x.paper===p);
 const specs=p==="I"
  ? [["cdp",null,18],["language",l1.value,18],["language",l2.value,18],["maths",null,18],["evs",null,18]]
  : g==="maths"
   ? [["cdp",null,18],["language",l1.value,18],["language",l2.value,18],["maths","maths",18],["science","maths",18]]
   : [["cdp",null,18],["language",l1.value,18],["language",l2.value,18],["social","social",36]];
 return specs.map(([section,lang,count])=>({section,lang,count,items:a.filter(x=>x.section===section&&(section!=="language"||x.language===lang)&&(p!=="II"||!["maths","science","social"].includes(section)||x.group===g))}));
}
function refreshStatus(){
 const bs=buckets(),ready=bs.every(b=>b.items.length>=b.count);
 const summary=bs.map(b=>(b.section==="language"?b.lang:b.section)+": "+b.items.length+"/"+b.count).join(" · ");
 status.textContent=(ready?"प्रश्न बैंक तैयार · ":"प्रश्न बैंक अधूरा · ")+summary;
 start.disabled=!ready||l1.value===l2.value;
 if(l1.value===l2.value)status.textContent="Language-I और Language-II अलग-अलग चुनें।";
}
let questions=[],answers={},review={},pos=0,seconds=5400,tick=null,finished=false,currentTestNo=0;
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function seriesKey(){return "ss_ctet_series_"+paper.value+"_"+(paper.value==="II"?group.value:"all")+"_"+l1.value+"_"+l2.value}
function nextTestNo(){try{return (Number(localStorage.getItem(seriesKey())||"0")+1)}catch(e){return 1}}
function begin(){
 if(l1.value===l2.value){alert("Language-I और Language-II अलग चुनें।");return}
 const bs=buckets();if(!bs.every(b=>b.items.length>=b.count)){alert("चुने गए प्रत्येक खंड में निर्धारित प्रश्न पूरे नहीं हैं।");return}
 const usedKey=seriesKey()+"_used_questions";
 let used={};try{used=JSON.parse(localStorage.getItem(usedKey)||"{}");if(!used||typeof used!=="object"||Array.isArray(used))used={}}catch(e){used={}}
 const selected=[];
 for(const b of bs){
  const bucketKey=b.section+"_"+(b.lang||"all");
  const available=b.items.filter(q=>!((used[bucketKey]||[]).includes(String(q.id||q.q))));
  // If this section has fewer unused questions than one test needs, start a fresh cycle for this section.
  if(available.length<b.count)used[bucketKey]=[];
  const fresh=b.items.filter(q=>!((used[bucketKey]||[]).includes(String(q.id||q.q))));
  if(fresh.length<b.count){alert("प्रश्न बैंक में इस खंड के लिए पर्याप्त अलग-अलग प्रश्न नहीं हैं।");return}
  const chosen=shuffle(fresh).slice(0,b.count);
  selected.push(...chosen);
  used[bucketKey]=[...(used[bucketKey]||[]),...chosen.map(q=>String(q.id||q.q))];
 }
 questions=shuffle(selected).map(q=>({...q,options:shuffle(q.options.map((v,i)=>({v,correct:i===q.answer}))) }));
 try{localStorage.setItem(usedKey,JSON.stringify(used))}catch(e){alert("इस ब्राउज़र में No-Repeat रिकॉर्ड सेव नहीं हो पाया। प्रश्न दोहराए जा सकते हैं।")}
 answers={};review={};pos=0;seconds=5400;finished=false;currentTestNo=nextTestNo();try{localStorage.setItem(seriesKey(),String(currentTestNo))}catch(e){}
 $("ctetResult").classList.add("hidden");$("ctetExam").classList.remove("hidden");start.disabled=true;
 const testLabel=$("ctetTestNumber");if(testLabel)testLabel.textContent="Mock Test "+currentTestNo+" · क्रमांक "+currentTestNo+" · No-Repeat चक्र";
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
function renderHistory(){
 const box=$("ctetHistoryList");if(!box)return;
 let history=[];try{history=JSON.parse(localStorage.getItem("ss_ctet_attempts_v1")||"[]")}catch(e){}
 if(!history.length){box.textContent="अभी इस ब्राउज़र में कोई जमा किया हुआ परिणाम उपलब्ध नहीं है।";return}
 box.innerHTML="";
 history.slice(0,30).forEach(item=>{
  const row=document.createElement("div");row.className="entry";
  const title=document.createElement("strong");
  const paperName=item.paper==="II"?"Paper-II":"Paper-I";
  title.textContent="Mock Test "+(item.testNo||"—")+" · "+paperName+(item.paper==="II"?(item.group==="social"?" · सामाजिक अध्ययन":" · गणित एवं विज्ञान"):"");
  const detail=document.createElement("p");
  const date=item.date?new Date(item.date).toLocaleString("hi-IN"):"तिथि उपलब्ध नहीं";
  detail.textContent=date+" · अंक: "+item.score+"/90 · सही: "+item.score+" · गलत: "+item.wrong+" · अनुत्तरित: "+item.unanswered;
  const langs=document.createElement("small");langs.textContent="Language-I: "+(item.language1||"—")+" | Language-II: "+(item.language2||"—");
  row.append(title,detail,langs);box.appendChild(row);
 });
}
function finish(auto){if(finished)return;finished=true;if(tick)clearInterval(tick);let correct=0;questions.forEach((q,i)=>{if(answers[i]!==undefined&&q.options[answers[i]].correct)correct++});const wrong=Object.keys(answers).length-correct,unanswered=90-Object.keys(answers).length;
 $("ctetExam").classList.add("hidden");const r=$("ctetResult");r.classList.remove("hidden");r.innerHTML="";
 const percentage=(correct/90)*100;
 const eligible=percentage>=60;
 const sheet=document.createElement("div");sheet.className="item";sheet.style.cssText="border:2px solid #087e78;border-radius:16px;padding:18px;margin:12px 0;background:#fbfefd";
 const head=document.createElement("div");head.style.cssText="text-align:center;border-bottom:2px solid #d7e9e6;padding-bottom:10px;margin-bottom:12px";
 const school=document.createElement("div");school.style.cssText="font-weight:800;color:#087e78;letter-spacing:.4px";school.textContent="SCHOOL SATHI · CTET PRACTICE";
 const title=document.createElement("h2");title.style.margin="6px 0";title.textContent="अभ्यास परीक्षा अंकसूची";
 const sub=document.createElement("div");sub.className="muted";sub.textContent="Mock Test "+currentTestNo+" · "+(auto?"समय पूरा — स्वतः जमा":"सफलतापूर्वक जमा");
 head.append(school,title,sub);sheet.appendChild(head);
 const meta=document.createElement("div");meta.className="grid";
 const metaItems=[["परीक्षा","CTET Mock Test"],["पेपर",paper.value==="II"?"Paper-II (कक्षा 6–8)":"Paper-I (कक्षा 1–5)"],["विषय समूह",paper.value==="II"?(group.value==="social"?"सामाजिक अध्ययन":"गणित एवं विज्ञान"):"—"],["Language-I / II",l1.value+" / "+l2.value],["दिनांक एवं समय",new Date().toLocaleString("hi-IN")]];
 metaItems.forEach(([k,v])=>{const cell=document.createElement("div");cell.className="item";cell.style.padding="9px";const label=document.createElement("small");label.className="muted";label.textContent=k;const value=document.createElement("div");value.style.fontWeight="700";value.textContent=v;cell.append(label,value);meta.appendChild(cell)});sheet.appendChild(meta);
 const table=document.createElement("div");table.style.cssText="margin-top:14px;border:1px solid #dce8ee;border-radius:10px;overflow:hidden";
 const rows=[["विवरण","प्राप्तांक / कुल"],["सही उत्तर",correct+" / 90"],["गलत उत्तर",wrong],["अनुत्तरित प्रश्न",unanswered],["कुल प्राप्तांक",correct+" / 90"],["प्रतिशत",percentage.toFixed(2)+"%"]];
 rows.forEach((pair,i)=>{const row=document.createElement("div");row.style.cssText="display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-bottom:1px solid #e6eef1;background:"+(i===0?"#eaf5f3":"#fff");const left=document.createElement(i===0?"strong":"span");left.textContent=pair[0];const right=document.createElement(i===0?"strong":"span");right.style.fontWeight="700";right.textContent=pair[1];row.append(left,right);table.appendChild(row)});sheet.appendChild(table);
 const verdict=document.createElement("div");verdict.style.cssText="margin-top:14px;padding:14px;border-radius:12px;text-align:center;font-size:20px;font-weight:900;background:"+(eligible?"#e5f7eb":"#fff0e8")+";color:"+(eligible?"#176b36":"#a33a24");
 verdict.textContent=eligible?"✓ ELIGIBLE":"✗ NOT ELIGIBLE";sheet.appendChild(verdict);
 const note=document.createElement("p");note.className="muted";note.style.textAlign="center";note.textContent="पात्रता मानदंड: 60% (54/90 अंक) · यह केवल अभ्यास टेस्ट का परिणाम है, आधिकारिक CTET पात्रता प्रमाणपत्र नहीं।";sheet.appendChild(note);
 r.appendChild(sheet);
 const h=document.createElement("h3");h.textContent="प्रश्नों की उत्तर-समीक्षा";r.appendChild(h);
 questions.forEach((q,i)=>{const d=document.createElement("div");d.className="entry";const chosen=answers[i];const isCorrect=chosen!==undefined&&q.options[chosen].correct;d.style.border="1px solid "+(isCorrect?"#b8e3c2": "#f0b5b5");d.style.borderLeft="6px solid "+(isCorrect?"#218838":"#dc3545");d.style.background=isCorrect?"#f0fff4":"#fff1f1";d.style.borderRadius="10px";d.style.padding="12px";d.style.margin="10px 0";const title=document.createElement("strong");title.style.color=isCorrect?"#176b36":"#b4232d";title.textContent=(i+1)+". "+q.q;const detail=document.createElement("p");detail.style.color=isCorrect?"#176b36":"#b4232d";detail.style.fontWeight="700";detail.textContent=(isCorrect?"✓ सही उत्तर":"✗ गलत उत्तर")+" · आपका उत्तर: "+(chosen===undefined?"नहीं दिया":q.options[chosen].v)+" | सही उत्तर: "+q.options.find(x=>x.correct).v;const ex=document.createElement("p");ex.className="muted";ex.textContent=q.explanation||"व्याख्या शीघ्र जोड़ी जाएगी।";d.append(title,detail,ex);r.appendChild(d)});
 const again=document.createElement("button");again.textContent="नया Mock Test";again.addEventListener("click",()=>{r.classList.add("hidden");start.disabled=false;refreshStatus()});r.prepend(again);
 try{const history=JSON.parse(localStorage.getItem("ss_ctet_attempts_v1")||"[]");history.unshift({date:new Date().toISOString(),testNo:currentTestNo,paper:paper.value,group:group.value,language1:l1.value,language2:l2.value,score:correct,wrong,unanswered,percentage:Number(percentage.toFixed(2)),eligibility:eligible?"Eligible":"Not Eligible"});localStorage.setItem("ss_ctet_attempts_v1",JSON.stringify(history.slice(0,30)));renderHistory()}catch(e){}
}
$("ctetPrev").addEventListener("click",()=>{if(pos>0){pos--;draw()}});
$("ctetNext").addEventListener("click",()=>{if(pos<89){pos++;draw()}});
$("ctetReview").addEventListener("click",()=>{review[pos]=!review[pos];draw()});
$("ctetSubmit").addEventListener("click",()=>{if(confirm("क्या आप टेस्ट जमा करना चाहते हैं?"))finish(false)});
start.addEventListener("click",begin);refreshStatus();renderHistory();
})();