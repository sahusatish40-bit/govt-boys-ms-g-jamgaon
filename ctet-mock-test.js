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
const paper=$("ctetPaper"),group=$("ctetGroup"),groupWrap=$("ctetGroupWrap"),l1=$("ctetLang1"),l2=$("ctetLang2"),start=$("ctetStart"),status=$("ctetBankStatus"),candidateName=$("ctetCandidateName");
if(!paper||!start)return;
languages.forEach((name,i)=>{const o1=new Option(name+" ("+langCodes[i]+")",name),o2=new Option(name+" ("+langCodes[i]+")",name);l1.add(o1);l2.add(o2)});
l1.value="हिंदी";l2.value="अंग्रेज़ी";
try{if(candidateName)candidateName.value=localStorage.getItem("ss_ctet_candidate_name")||""}catch(e){}
if(candidateName)candidateName.addEventListener("change",()=>{try{localStorage.setItem("ss_ctet_candidate_name",candidateName.value.trim())}catch(e){}});
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
let questions=[],answers={},review={},pos=0,seconds=5400,tick=null,finished=false,currentTestNo=0,activeStudentName="",ctetDb=null,ctetUid="",cloudHistory=[];
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function seriesKey(){return "ss_ctet_series_"+paper.value+"_"+(paper.value==="II"?group.value:"all")+"_"+l1.value+"_"+l2.value}
function nextTestNo(){try{return (Number(localStorage.getItem(seriesKey())||"0")+1)}catch(e){return 1}}
function begin(){
 if(!ctetUid){alert("कृपया पहले अपने Google खाते से लॉगिन करें।");return}
 const studentName=candidateName?candidateName.value.trim():"";
 if(!studentName){alert("कृपया विद्यार्थी का पूरा नाम लिखें।");if(candidateName)candidateName.focus();return}
 activeStudentName=studentName;
 try{localStorage.setItem("ss_ctet_candidate_name",studentName)}catch(e){}
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
  const chosen=[];
  const take=(arr,n)=>{const picked=shuffle(arr).slice(0,n);chosen.push(...picked);};
  take(fresh.filter(x=>x.difficulty==="आसान"),Math.ceil(b.count*0.20));
  take(fresh.filter(x=>x.difficulty==="मध्यम"),Math.ceil(b.count*0.40));
  take(fresh.filter(x=>["उच्च","कठिन"].includes(x.difficulty)),Math.ceil(b.count*0.25));
  take(fresh.filter(x=>x.difficulty==="अत्यंत चुनौतीपूर्ण"),Math.ceil(b.count*0.15));
  const pickedIds=new Set(chosen.map(x=>String(x.id||x.q)));
  const remaining=shuffle(fresh.filter(x=>!pickedIds.has(String(x.id||x.q))));
  if(chosen.length<b.count)chosen.push(...remaining.slice(0,b.count-chosen.length));
  const finalChosen=shuffle(chosen).slice(0,b.count);
  if(finalChosen.length<b.count){alert("इस खंड में पर्याप्त अलग-अलग प्रश्न उपलब्ध नहीं हैं।");return}
  selected.push(...finalChosen);
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
function connectCloud(){
 try{
  if(!window.firebase){const el=$("ctetCloudStatus");if(el)el.textContent="Firebase सेवा लोड नहीं हुई।";return}
  const config={apiKey:"AIzaSyAGPlqFFNCmQIj9ROjF9Ujj4C9a8Z5f9cQ",authDomain:"govt-boys-ms-g-jamgaon.firebaseapp.com",projectId:"govt-boys-ms-g-jamgaon",storageBucket:"govt-boys-ms-g-jamgaon.firebasestorage.app",messagingSenderId:"1076919620059",appId:"1:1076919620059:web:b1c1bfcdb1d9e260d8d7fe",measurementId:"G-7CCE542ZGG"};
  if(!firebase.apps.length)firebase.initializeApp(config);
  ctetDb=firebase.firestore();
  const auth=firebase.auth();
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  const login=$("ctetGoogleLogin"),logout=$("ctetGoogleLogout");
  if(login)login.addEventListener("click",async()=>{
   const provider=new firebase.auth.GoogleAuthProvider();
   provider.setCustomParameters({prompt:"select_account"});
   try{await auth.signInWithPopup(provider)}
   catch(err){if(err.code==="auth/popup-blocked"||err.code==="auth/popup-closed-by-user"){try{await auth.signInWithRedirect(provider)}catch(e){const el=$("ctetCloudStatus");if(el)el.textContent="Google लॉगिन नहीं हो पाया: "+(e.code||e.message)}}else{const el=$("ctetCloudStatus");if(el)el.textContent="Google लॉगिन नहीं हो पाया: "+(err.code||err.message)}}
  });
  if(logout)logout.addEventListener("click",()=>auth.signOut());
  auth.getRedirectResult().catch(err=>{const el=$("ctetCloudStatus");if(el)el.textContent="लॉगिन त्रुटि: "+(err.code||err.message)});
  auth.onAuthStateChanged(async user=>{
   ctetUid=user?user.uid:"";cloudHistory=[];
   if(user){
    try{const snap=await ctetDb.collection("ctet_results").doc(ctetUid).collection("attempts").orderBy("date","desc").limit(30).get();cloudHistory=snap.docs.map(d=>d.data());renderHistory();const el=$("ctetCloudStatus");if(el)el.textContent="✓ लॉगिन: "+(user.displayName||user.email||"Google खाता")+" · आपकी निजी अंकसूचियाँ ऑनलाइन उपलब्ध हैं।";if(login)login.classList.add("hidden");if(logout)logout.classList.remove("hidden");if(start)start.disabled=!buckets().every(b=>b.items.length>=b.count)||l1.value===l2.value;
    }catch(err){const el=$("ctetCloudStatus");if(el)el.textContent="परिणाम लोड नहीं हुए: "+(err.code||err.message)}
   }else{renderHistory();const el=$("ctetCloudStatus");if(el)el.textContent="अपनी पुरानी अंकसूची देखने और टेस्ट देने के लिए Google लॉगिन करें।";if(login)login.classList.remove("hidden");if(logout)logout.classList.add("hidden");if(start)start.disabled=true}
  });
 }catch(err){const el=$("ctetCloudStatus");if(el)el.textContent="Firebase सेवा उपलब्ध नहीं: "+(err.message||"")}
}
function renderHistory(){
 const box=$("ctetHistoryList");if(!box)return;
 let history=cloudHistory.slice().sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
 if(!ctetUid){box.textContent="अपनी निजी ऑनलाइन अंकसूची देखने के लिए पहले Google लॉगिन करें।";return}if(!history.length){box.textContent="इस Google खाते से अभी कोई जमा किया हुआ परिणाम उपलब्ध नहीं है।";return}
 box.innerHTML="";
 history.slice(0,30).forEach((item,index)=>{
  const row=document.createElement("div");row.className="entry";
  const title=document.createElement("strong");
  const paperName=item.paper==="II"?"Paper-II":"Paper-I";
  title.textContent=(item.studentName?item.studentName+" · ":"")+"Mock Test "+(item.testNo||"—")+" · "+paperName+(item.paper==="II"?(item.group==="social"?" · सामाजिक अध्ययन":" · गणित एवं विज्ञान"):"");
  const detail=document.createElement("p");
  const date=item.date?new Date(item.date).toLocaleString("hi-IN"):"तिथि उपलब्ध नहीं";
  detail.textContent=date+" · अंक: "+item.score+"/90 · सही: "+item.score+" · गलत: "+item.wrong+" · अनुत्तरित: "+item.unanswered;
  const langs=document.createElement("small");langs.textContent="Language-I: "+(item.language1||"—")+" | Language-II: "+(item.language2||"—");
  const view=document.createElement("button");view.type="button";view.className="secondary";view.textContent="अंकसूची देखें";
  const sheet=document.createElement("div");sheet.className="history-sheet hidden";sheet.style.cssText="border:2px solid #087e78;border-radius:14px;padding:16px;margin-top:12px;background:#fff";
  view.addEventListener("click",()=>{
   const opening=sheet.classList.contains("hidden");
   if(!opening){sheet.classList.add("hidden");view.textContent="अंकसूची देखें";return}
   sheet.innerHTML="";
   const head=document.createElement("div");head.style.cssText="text-align:center;border-bottom:2px solid #d7e9e6;padding-bottom:10px;margin-bottom:12px";
   const logo=document.createElement("img");logo.src="images/School_Mono.jpg";logo.alt="विद्यालय का मोनोग्राम";logo.style.cssText="width:78px;height:78px;object-fit:contain;display:block;margin:0 auto 8px";
   const school=document.createElement("div");school.style.cssText="font-weight:900;color:#123d59;line-height:1.5";school.textContent="शासकीय उच्चतर माध्यमिक विद्यालय जी- जामगाँव (बालक माध्य.)";
   const location=document.createElement("div");location.style.cssText="font-size:13px;color:#526979";location.textContent="वि.ख.:- कुरुद, जिला:- धमतरी (छ.ग.)";
   const heading=document.createElement("h3");heading.textContent="अभ्यास परीक्षा अंकसूची";heading.style.margin="6px 0";
   const mast=document.createElement("div");mast.textContent="CTET MOCK TEST";mast.style.cssText="font-size:20px;font-weight:900;letter-spacing:1px;color:#087e78";
   const sub=document.createElement("div");sub.textContent="Mock Test "+(item.testNo||"—")+" · पूर्व परिणाम";sub.className="muted";
   head.append(logo,mast,school,location,heading,sub);sheet.appendChild(head);
   const meta=document.createElement("div");meta.className="grid";
   const fields=[["विद्यार्थी का नाम",item.studentName||"पूर्व परिणाम में नाम दर्ज नहीं"],["पेपर",paperName+(item.paper==="II"?" · "+(item.group==="social"?"सामाजिक अध्ययन":"गणित एवं विज्ञान"):"")],["Language-I / II",(item.language1||"—")+" / "+(item.language2||"—")],["दिनांक एवं समय",date]];
   fields.forEach(([k,v])=>{const cell=document.createElement("div");cell.className="item";cell.style.padding="9px";const label=document.createElement("small");label.className="muted";label.textContent=k;const value=document.createElement("div");value.style.fontWeight="700";value.textContent=v;cell.append(label,value);meta.appendChild(cell)});sheet.appendChild(meta);
   const score=Number(item.score)||0,wrong=Number(item.wrong)||0,unanswered=Number(item.unanswered)||0;
   const pct=Number.isFinite(Number(item.percentage))?Number(item.percentage):(score/90*100),eligible=pct>=60;
   const table=document.createElement("div");table.style.cssText="margin-top:14px;border:1px solid #dce8ee;border-radius:10px;overflow:hidden";
   const addRow=(aText,bText,header=false)=>{const line=document.createElement("div");line.style.cssText="display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-bottom:1px solid #e6eef1;background:"+(header?"#eaf5f3":"#fff");const a=document.createElement(header?"strong":"span"),b=document.createElement(header?"strong":"span");a.textContent=aText;b.textContent=bText;line.append(a,b);table.appendChild(line)};
   addRow("विषय / खंड","प्राप्तांक / पूर्णांक",true);
   if(Array.isArray(item.sectionMarks)&&item.sectionMarks.length){item.sectionMarks.forEach(x=>addRow(x.label,(Number(x.marks)||0)+" / "+(Number(x.total)||0)))}else{addRow("विषयवार अंक","पुराने रिकॉर्ड में उपलब्ध नहीं")}
   addRow("GRAND TOTAL",score+" / 90");addRow("गलत उत्तर",String(wrong));addRow("अनुत्तरित प्रश्न",String(unanswered));addRow("कुल प्रतिशत",pct.toFixed(2)+"%");
   sheet.appendChild(table);
   const verdict=document.createElement("div");verdict.style.cssText="margin-top:14px;padding:13px;border-radius:12px;text-align:center;font-size:20px;font-weight:900;background:"+(eligible?"#e5f7eb":"#fff0e8")+";color:"+(eligible?"#176b36":"#a33a24");verdict.textContent=eligible?"✓ ELIGIBLE":"✗ NOT ELIGIBLE";sheet.appendChild(verdict);
   const note=document.createElement("p");note.className="muted";note.style.textAlign="center";note.textContent="पात्रता मानदंड: 60% (54/90 अंक)। यह केवल अभ्यास टेस्ट का परिणाम है, आधिकारिक CTET पात्रता प्रमाणपत्र नहीं। पुराने परिणाम में प्रश्नवार उत्तर-समीक्षा सुरक्षित नहीं थी; यह अंकसूची उपलब्ध सारांश के आधार पर बनाई गई है।";sheet.appendChild(note);
   const print=document.createElement("button");print.type="button";print.textContent="प्रिंट / PDF सेव करें";print.addEventListener("click",()=>{document.body.classList.add("history-print");window.print()});sheet.appendChild(print);
   sheet.classList.remove("hidden");view.textContent="अंकसूची बंद करें";
  });
  row.append(title,detail,langs,document.createElement("br"),view,sheet);box.appendChild(row);
 });
}
window.addEventListener("afterprint",()=>document.body.classList.remove("history-print"));
function finish(auto){if(finished)return;finished=true;if(tick)clearInterval(tick);let correct=0;questions.forEach((q,i)=>{if(answers[i]!==undefined&&q.options[answers[i]].correct)correct++});const wrong=Object.keys(answers).length-correct,unanswered=90-Object.keys(answers).length;
 $("ctetExam").classList.add("hidden");const r=$("ctetResult");r.classList.remove("hidden");r.innerHTML="";
 const percentage=(correct/90)*100;
 const eligible=percentage>=60;
 const sheet=document.createElement("div");sheet.className="item";sheet.style.cssText="border:2px solid #087e78;border-radius:16px;padding:18px;margin:12px 0;background:#fbfefd";
 const head=document.createElement("div");head.style.cssText="text-align:center;border-bottom:2px solid #d7e9e6;padding-bottom:10px;margin-bottom:12px";
 const logo=document.createElement("img");logo.src="images/School_Mono.jpg";logo.alt="विद्यालय का मोनोग्राम";logo.style.cssText="width:82px;height:82px;object-fit:contain;display:block;margin:0 auto 8px";head.appendChild(logo);
 const school=document.createElement("div");school.style.cssText="font-weight:900;color:#123d59;line-height:1.5";school.textContent="शासकीय उच्चतर माध्यमिक विद्यालय जी- जामगाँव (बालक माध्य.)";
 const location=document.createElement("div");location.style.cssText="font-size:13px;color:#526979";location.textContent="वि.ख.:- कुरुद, जिला:- धमतरी (छ.ग.)";
 const mast=document.createElement("div");mast.textContent="CTET MOCK TEST";mast.style.cssText="font-size:20px;font-weight:900;letter-spacing:1px;color:#087e78";
 const title=document.createElement("h2");title.style.margin="6px 0";title.textContent="अभ्यास परीक्षा अंकसूची";
 const sub=document.createElement("div");sub.className="muted";sub.textContent="Mock Test "+currentTestNo+" · "+(auto?"समय पूरा — स्वतः जमा":"सफलतापूर्वक जमा");
 head.append(mast,school,location,title,sub);sheet.appendChild(head);
 const meta=document.createElement("div");meta.className="grid";
 const metaItems=[["विद्यार्थी का नाम",activeStudentName],["परीक्षा","CTET Mock Test"],["पेपर",paper.value==="II"?"Paper-II (कक्षा 6–8)":"Paper-I (कक्षा 1–5)"],["विषय समूह",paper.value==="II"?(group.value==="social"?"सामाजिक अध्ययन":"गणित एवं विज्ञान"):"—"],["Language-I / II",l1.value+" / "+l2.value],["दिनांक एवं समय",new Date().toLocaleString("hi-IN")]];
 metaItems.forEach(([k,v])=>{const cell=document.createElement("div");cell.className="item";cell.style.padding="9px";const label=document.createElement("small");label.className="muted";label.textContent=k;const value=document.createElement("div");value.style.fontWeight="700";value.textContent=v;cell.append(label,value);meta.appendChild(cell)});sheet.appendChild(meta);
 const table=document.createElement("div");table.style.cssText="margin-top:14px;border:1px solid #dce8ee;border-radius:10px;overflow:hidden";
 const addMarkRow=(label,value,header=false)=>{const row=document.createElement("div");row.style.cssText="display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-bottom:1px solid #e6eef1;background:"+(header?"#eaf5f3":"#fff");const left=document.createElement(header?"strong":"span");left.textContent=label;const right=document.createElement(header?"strong":"span");right.style.fontWeight="700";right.textContent=value;row.append(left,right);table.appendChild(row)};
 addMarkRow("विषय / खंड","प्राप्तांक / पूर्णांक",true);
 const sectionMarks=buckets().map(b=>{const qs=questions.filter(q=>q.section===b.section&&(b.section!=="language"||q.language===b.lang));const marks=qs.reduce((n,q)=>{const qi=questions.indexOf(q);return n+(answers[qi]!==undefined&&q.options[answers[qi]].correct?1:0)},0);const label=b.section==="cdp"?"CDP (बाल विकास एवं शिक्षाशास्त्र)":b.section==="language"?(b.lang===l1.value?"Language-I":"Language-II")+" ("+b.lang+")":b.section==="maths"?"Mathematics":b.section==="evs"?"EVS":b.section==="science"?"Science":"Social Studies";return {label,marks,total:b.count}});
 sectionMarks.forEach(x=>addMarkRow(x.label,x.marks+" / "+x.total));
 addMarkRow("GRAND TOTAL",correct+" / 90");addMarkRow("गलत उत्तर",String(wrong));addMarkRow("अनुत्तरित प्रश्न",String(unanswered));addMarkRow("कुल प्रतिशत",percentage.toFixed(2)+"%");
 sheet.appendChild(table);
 const verdict=document.createElement("div");verdict.style.cssText="margin-top:14px;padding:14px;border-radius:12px;text-align:center;font-size:20px;font-weight:900;background:"+(eligible?"#e5f7eb":"#fff0e8")+";color:"+(eligible?"#176b36":"#a33a24");
 verdict.textContent=eligible?"✓ ELIGIBLE":"✗ NOT ELIGIBLE";sheet.appendChild(verdict);
 const note=document.createElement("p");note.className="muted";note.style.textAlign="center";note.textContent="पात्रता मानदंड: 60% (54/90 अंक) · यह केवल अभ्यास टेस्ट का परिणाम है, आधिकारिक CTET पात्रता प्रमाणपत्र नहीं।";sheet.appendChild(note);
 r.appendChild(sheet);
 const h=document.createElement("h3");h.textContent="प्रश्नों की उत्तर-समीक्षा";r.appendChild(h);
 questions.forEach((q,i)=>{const d=document.createElement("div");d.className="entry";const chosen=answers[i];const isCorrect=chosen!==undefined&&q.options[chosen].correct;d.style.border="1px solid "+(isCorrect?"#b8e3c2": "#f0b5b5");d.style.borderLeft="6px solid "+(isCorrect?"#218838":"#dc3545");d.style.background=isCorrect?"#f0fff4":"#fff1f1";d.style.borderRadius="10px";d.style.padding="12px";d.style.margin="10px 0";const title=document.createElement("strong");title.style.color=isCorrect?"#176b36":"#b4232d";title.textContent=(i+1)+". "+q.q;const detail=document.createElement("p");detail.style.color=isCorrect?"#176b36":"#b4232d";detail.style.fontWeight="700";detail.textContent=(isCorrect?"✓ सही उत्तर":"✗ गलत उत्तर")+" · आपका उत्तर: "+(chosen===undefined?"नहीं दिया":q.options[chosen].v)+" | सही उत्तर: "+q.options.find(x=>x.correct).v;const ex=document.createElement("p");ex.className="muted";ex.textContent=q.explanation||"व्याख्या शीघ्र जोड़ी जाएगी।";d.append(title,detail,ex);r.appendChild(d)});
 const again=document.createElement("button");again.textContent="नया Mock Test";again.addEventListener("click",()=>{r.classList.add("hidden");start.disabled=false;refreshStatus()});r.prepend(again);
 const savedAttempt={date:new Date().toISOString(),studentName:activeStudentName,paper:paper.value,testNo:currentTestNo,group:group.value,language1:l1.value,language2:l2.value,score:correct,wrong,unanswered,percentage:Number(percentage.toFixed(2)),eligibility:eligible?"Eligible":"Not Eligible",sectionMarks};
 if(ctetDb&&ctetUid){ctetDb.collection("ctet_results").doc(ctetUid).collection("attempts").add(savedAttempt).then(()=>{cloudHistory.unshift(savedAttempt);renderHistory();const sync=$("ctetCloudStatus");if(sync)sync.textContent="✓ आपकी अंकसूची सुरक्षित रूप से ऑनलाइन सेव हो गई है।"}).catch(err=>{const sync=$("ctetCloudStatus");if(sync)sync.textContent="ऑनलाइन सेव नहीं हो पाया; अंकसूची इस मोबाइल में सुरक्षित है। "+(err.code||"")})}
 renderHistory();
}
$("ctetPrev").addEventListener("click",()=>{if(pos>0){pos--;draw()}});
$("ctetNext").addEventListener("click",()=>{if(pos<89){pos++;draw()}});
$("ctetReview").addEventListener("click",()=>{review[pos]=!review[pos];draw()});
$("ctetSubmit").addEventListener("click",()=>{if(confirm("क्या आप टेस्ट जमा करना चाहते हैं?"))finish(false)});
start.addEventListener("click",begin);refreshStatus();renderHistory();connectCloud();
})();