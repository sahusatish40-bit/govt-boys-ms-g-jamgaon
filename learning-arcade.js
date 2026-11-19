/* Mini Learning Arcade: randomized maths, science and vocabulary rounds */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const mode=$("arcadeMode"),cls=$("arcadeClass"),startBtn=$("arcadeStart"),board=$("arcadeBoard"),progress=$("arcadeProgress"),points=$("arcadePoints");
if(!mode||!cls||!startBtn||!board)return;
let round=[],index=0,score=0,locked=false;
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
const make=(q,correct,wrong,why)=>{const opts=shuffle([String(correct),...wrong.map(String)]);return {q,opts,answer:String(correct),why};};
const science={
"6":[
["पौधे अपना भोजन मुख्यतः किस प्रक्रिया से बनाते हैं?", "प्रकाश संश्लेषण",["श्वसन","वाष्पोत्सर्जन","अंकुरण"],"प्रकाश संश्लेषण में पौधे प्रकाश ऊर्जा की सहायता से भोजन बनाते हैं।"],
["मानव शरीर में रक्त पंप करने वाला अंग कौन-सा है?","हृदय",["फेफड़ा","यकृत","गुर्दा"],"हृदय रक्त को पूरे शरीर में पंप करता है।"],
["पानी का सामान्य क्वथनांक समुद्र तल पर कितना है?","100°C",["0°C","50°C","200°C"],"सामान्य वायुदाब पर पानी लगभग 100°C पर उबलता है।"],
["पृथ्वी का प्राकृतिक उपग्रह कौन है?","चंद्रमा",["मंगल","शुक्र","सूर्य"],"चंद्रमा पृथ्वी का प्राकृतिक उपग्रह है।"],
["विटामिन C का अच्छा स्रोत कौन-सा है?","आँवला",["चावल","घी","नमक"],"आँवले में विटामिन C प्रचुर मात्रा में होता है।"]
],
"7":[
["पत्तियों में गैसों का आदान-प्रदान मुख्यतः किससे होता है?","रंध्र",["जड़ रोम","फूल","बीजपत्र"],"पत्तियों की सतह पर उपस्थित रंध्र गैसों के आदान-प्रदान में मदद करते हैं।"],
["अम्ल नीले लिटमस को किस रंग में बदलता है?","लाल",["हरा","पीला","नीला ही"],"अम्ल नीले लिटमस पत्र को लाल कर देता है।"],
["ऊष्मा का अच्छा चालक सामान्यतः कौन है?","ताँबा",["लकड़ी","प्लास्टिक","रबर"],"ताँबा धातु है और ऊष्मा का अच्छा चालक है।"],
["मानव में भोजन का अधिकांश अवशोषण कहाँ होता है?","छोटी आँत",["मुख","आमाशय","बड़ी आँत"],"छोटी आँत की भीतरी सतह पोषक तत्वों के अवशोषण के लिए अनुकूल होती है।"],
["जलवाष्प के ठंडा होकर जल की बूंद बनने की प्रक्रिया क्या है?","संघनन",["वाष्पीकरण","गलन","उर्ध्वपातन"],"संघनन में गैस ठंडी होकर द्रव में बदलती है।"]
],
"8":[
["कोशिका का नियंत्रण केंद्र किसे कहा जाता है?","केंद्रक",["रिक्तिका","कोशिका झिल्ली","कोशिका भित्ति"],"केंद्रक कोशिका की गतिविधियों को नियंत्रित करता है।"],
["ध्वनि किससे उत्पन्न होती है?","कंपन",["प्रकाश","छाया","चुंबकत्व"],"कंपन करती वस्तुएँ ध्वनि उत्पन्न करती हैं।"],
["विद्युत धारा का SI मात्रक क्या है?","ऐम्पियर",["वोल्ट","ओम","वाट"],"विद्युत धारा का SI मात्रक ऐम्पियर है।"],
["कार्बन का रासायनिक संकेत क्या है?","C",["Ca","Co","Cr"],"कार्बन का रासायनिक संकेत C है।"],
["प्रकाश का एक माध्यम से दूसरे माध्यम में मुड़ना क्या कहलाता है?","अपवर्तन",["परावर्तन","विक्षेपण","अवशोषण"],"माध्यम बदलने पर प्रकाश की दिशा बदलना अपवर्तन कहलाता है।"]
]};
const words={
"6":[["‘जल’ का समानार्थी शब्द चुनिए।","पानी",["अग्नि","आकाश","पवन"],"जल और पानी समानार्थी शब्द हैं।"],["‘दिन’ का विलोम क्या है?","रात",["सुबह","दोपहर","प्रकाश"],"दिन का विलोम रात है।"],["Choose the opposite of ‘hot’.","cold",["warm","heat","boiling"],"Cold is the opposite of hot."],["‘सुंदर’ का समानार्थी शब्द कौन-सा है?","मनोहर",["कठोर","कड़वा","कमजोर"],"मनोहर का अर्थ सुंदर या आकर्षक है।"]],
"7":[["Choose the plural of ‘child’.","children",["childs","childes","childrens"],"The plural form of child is children."],["‘साहस’ का अर्थ क्या है?","हिम्मत",["डर","आलस्य","ईर्ष्या"],"साहस का अर्थ हिम्मत या वीरता है।"],["Choose the correct past form of ‘go’.","went",["goed","gone","going"],"The simple past form of go is went."],["‘उन्नति’ का विलोम क्या है?","अवनति",["प्रगति","विकास","सफलता"],"अवनति का अर्थ गिरावट है, जो उन्नति का विलोम है।"]],
"8":[["Choose the correct synonym of ‘brave’.","courageous",["careless","silent","weak"],"Courageous means brave."],["‘आशा’ का विलोम क्या है?","निराशा",["विश्वास","उम्मीद","प्रसन्नता"],"निराशा, आशा का विलोम है।"],["Choose the passive form: ‘Rita writes a letter.’","A letter is written by Rita.",["A letter was written by Rita.","Rita is written by a letter.","A letter has wrote by Rita."],"Simple present passive uses is/am/are + past participle."],["‘जो कभी न मरे’ के लिए एक शब्द है—","अमर",["अज्ञानी","अदृश्य","अल्पायु"],"अमर का अर्थ है जो कभी न मरे।"]]};
function mathQuestion(c){
 const n=Number(c),op=Math.floor(Math.random()*4);
 let a,b,q,ans;
 if(op===0){a=Math.floor(Math.random()*(n===6?80: n===7?400:900))+20;b=Math.floor(Math.random()*(n===6?40: n===7?200:500))+10;q=a+" + "+b+" = ?";ans=a+b;}
 else if(op===1){a=Math.floor(Math.random()*(n===6?80: n===7?400:900))+50;b=Math.floor(Math.random()*(Math.min(a-1,n===6?35:n===7?180:450)))+1;q=a+" − "+b+" = ?";ans=a-b;}
 else if(op===2){a=Math.floor(Math.random()*(n===6?12: n===7?20:30))+2;b=Math.floor(Math.random()*(n===6?12: n===7?20:30))+2;q=a+" × "+b+" = ?";ans=a*b;}
 else {b=Math.floor(Math.random()*(n===6?10: n===7?15:20))+2;ans=Math.floor(Math.random()*(n===6?12: n===7?20:30))+2;a=b*ans;q=a+" ÷ "+b+" = ?";}
 const d=n===6?3:n===7?5:8;const wrong=shuffle([ans+d,ans-d,ans+2*d]).filter(x=>x!==ans).slice(0,3);while(wrong.length<3)wrong.push(ans+wrong.length+11);
 return make(q,ans,wrong.slice(0,3),"गणना को चरणबद्ध तरीके से जाँचें।");
}
function fromTuple(t){return make(t[0],t[1],t[2],t[3]);}
function begin(){
 stopClock();const c=cls.value,m=mode.value;
 if(m==="picture"||m==="match"||m==="puzzle"){beginExtra();return;}
 if(m==="math")round=Array.from({length:5},()=>mathQuestion(c));
 else round=shuffle((m==="science"?science:words)[c]).slice(0,5).map(fromTuple);
 index=0;score=0;draw();
 if(extraMode&&extraMode.value==="timed")startClock();
}
function draw(){
 locked=false;const item=round[index],m=mode.value;
 progress.textContent="प्रश्न "+(index+1)+" / "+round.length;points.textContent="⭐ "+score+" अंक";
 const names={math:"गणित मिशन",science:"विज्ञान चैलेंज",words:"शब्द-ज्ञान",picture:"चित्र पहचानो",puzzle:"शब्द पहेली"};
 board.innerHTML='<div class="game-subject-tag">'+names[m]+' • कक्षा '+cls.value+'वीं</div><div class="arcade-question"></div><div class="arcade-options"></div>';
 if(m==="puzzle"){
   const clue=item.q.replace(/^शब्द पहेली:\s*/,"").replace(/। सही शब्द चुनिए।$/,"");
   board.querySelector(".arcade-question").textContent="🔎 संकेत: "+clue;
   const letters=shuffle(Array.from(item.answer)).join(" · ");
   const tiles=document.createElement("div");tiles.className="puzzle-letters";tiles.textContent=letters;board.appendChild(tiles);
   const input=document.createElement("input");input.type="text";input.id="puzzleAnswer";input.className="puzzle-input";input.placeholder="अपना उत्तर यहाँ लिखें";input.autocomplete="off";input.setAttribute("aria-label","शब्द का उत्तर लिखें");board.appendChild(input);
   const check=document.createElement("button");check.type="button";check.className="cta";check.textContent="उत्तर जाँचें";check.addEventListener("click",()=>checkPuzzle());board.appendChild(check);
   input.addEventListener("keydown",e=>{if(e.key==="Enter")checkPuzzle();});
   return;
 }
 if(m==="picture"){
   const q=item.q.replace("इस चित्र में क्या दिखाया गया है? ","");
   const art=document.createElement("div");art.className="picture-display";art.textContent=q;board.insertBefore(art,board.querySelector(".arcade-question"));
   board.querySelector(".arcade-question").textContent="चित्र को देखकर सही नाम चुनिए।";
 }else board.querySelector(".arcade-question").textContent=item.q;
 const opts=board.querySelector(".arcade-options");
 item.opts.forEach(v=>{const b=document.createElement("button");b.type="button";b.className="arcade-option";b.textContent=v;b.addEventListener("click",()=>answer(v,b));opts.appendChild(b);});
}
function checkPuzzle(){
 if(locked)return;const input=$("puzzleAnswer");if(!input)return;
 const typed=input.value.trim().replace(/\s+/g,"").toLocaleLowerCase("hi");
 const expected=round[index].answer.trim().replace(/\s+/g,"").toLocaleLowerCase("hi");
 locked=true;const ok=typed===expected;if(ok)score+=10;
 input.disabled=true;const btn=board.querySelector(".cta");if(btn)btn.disabled=true;
 const f=document.createElement("p");f.className="arcade-feedback "+(ok?"good":"bad");f.textContent=ok?"✅ बिल्कुल सही! +10 अंक।":"❌ सही शब्द: "+round[index].answer;
 board.appendChild(f);points.textContent="⭐ "+score+" अंक";
 const next=document.createElement("button");next.type="button";next.className="cta";next.textContent=index===round.length-1?"🏁 परिणाम देखें":"अगली पहेली ➜";next.addEventListener("click",()=>{if(index<round.length-1){index++;draw();}else finish();});board.appendChild(next);
}
function answer(value,chosen){
 if(locked||seconds<=0)return;locked=true;const item=round[index],ok=value===item.answer;
 if(ok)score+=10;
 board.querySelectorAll(".arcade-option").forEach(b=>{b.disabled=true;if(b.textContent===item.answer)b.classList.add("is-right");else if(b===chosen)b.classList.add("is-wrong");});
 const f=document.createElement("p");f.className="arcade-feedback "+(ok?"good":"bad");f.textContent=(ok?"✅ बहुत बढ़िया! +10 अंक। ":"❌ सही उत्तर: "+item.answer+"। ")+item.why;board.appendChild(f);
 const next=document.createElement("button");next.type="button";next.className="cta";next.textContent=index===round.length-1?"🏁 परिणाम देखें":"अगला प्रश्न ➜";next.addEventListener("click",()=>{if(index<round.length-1){index++;draw();}else finish();});board.appendChild(next);points.textContent="⭐ "+score+" अंक";
}
function finish(){
 stopClock();
 const pct=Math.round(score/50*100);progress.textContent="राउंड पूरा हुआ";board.innerHTML='<div class="arcade-result">🏆 '+score+' / 50 अंक</div><h4>'+pct+'% सफलता</h4><p>'+(pct>=80?"शानदार प्रदर्शन! आपकी तैयारी बहुत अच्छी है।":pct>=50?"अच्छा प्रयास! थोड़ा और अभ्यास करें।":"कोई बात नहीं—फिर से खेलें और अपना रिकॉर्ड सुधारें।")+'</p><button type="button" class="cta" id="arcadeAgain">🔁 नया राउंड खेलें</button>';
 $("arcadeAgain").addEventListener("click",begin);
}
/* Extra arcade modes */
const extraMode=$("arcadeExtraMode");
const pictureBank=[["🌻","सूरजमुखी"],["🐘","हाथी"],["🚲","साइकिल"],["🍎","सेब"],["🌙","चंद्रमा"],["🏏","बल्ला"],["📚","पुस्तक"],["🌳","पेड़"],["🐟","मछली"],["🚂","रेलगाड़ी"]];
const puzzleBank=[["विद्यालय","जहाँ विद्यार्थी पढ़ने जाते हैं"],["पुस्तकालय","जहाँ पुस्तकें पढ़ने और लेने को मिलती हैं"],["पर्यावरण","हमारे चारों ओर का प्राकृतिक और सामाजिक परिवेश"],["स्वतंत्रता","अपने निर्णय स्वयं लेने की आजादी"],["गणित","संख्याओं और आकृतियों का अध्ययन"],["विज्ञान","प्रकृति और घटनाओं को प्रमाण से समझने का विषय"],["अनुशासन","नियमों का पालन करने की अच्छी आदत"],["मित्रता","दोस्तों के बीच प्रेम और विश्वास का संबंध"]];
let clock=null,seconds=60,matchCount=0,expectedPairs=5;
function stopClock(){if(clock){clearInterval(clock);clock=null;}}
function startClock(){stopClock();seconds=60;showClock();clock=setInterval(()=>{seconds--;showClock();if(seconds<=0){stopClock();timedEnd();}},1000);}
function showClock(){progress.textContent="⏱️ शेष समय "+seconds+" सेकंड";}
function timedEnd(){board.querySelectorAll("button").forEach(b=>b.disabled=true);board.innerHTML="<div class=\"arcade-result\">⏰ समय पूरा!</div><h4>"+score+" अंक</h4><p>समय के भीतर हल किए गए प्रश्नों का स्कोर।</p><button class=\"cta\" id=\"arcadeAgain\" type=\"button\">🔁 फिर खेलें</button>";$("arcadeAgain").addEventListener("click",begin);}
const cyclePools={};
function takeFresh(key,source,count){
 let remaining=cyclePools[key];
 if(!remaining||remaining.length===0)remaining=shuffle(source);
 const selected=remaining.splice(0,count);
 cyclePools[key]=remaining;
 return selected;
}
function beginExtra(){
 const m=mode.value,key=m+"-class-"+cls.value;
 if(m==="match"){startMatch();return;}
 if(m==="picture")round=takeFresh(key,pictureBank,5).map(p=>make("इस चित्र में क्या दिखाया गया है? "+p[0],p[1],shuffle(pictureBank.filter(x=>x[1]!==p[1]).map(x=>x[1])).slice(0,3),"चित्र को ध्यान से देखकर उसका नाम पहचानें।"));
 else round=takeFresh(key,puzzleBank,5).map(p=>make("शब्द पहेली: "+p[1]+"। सही शब्द चुनिए।",p[0],shuffle(puzzleBank.filter(x=>x[0]!==p[0]).map(x=>x[0])).slice(0,3),"संकेत में दिए गए अर्थ पर ध्यान दें।"));
 index=0;score=0;draw();if(extraMode&&extraMode.value==="timed")startClock();
}
function startMatch(){
 stopClock();score=0;matchCount=0;const chosen=takeFresh("match-class-"+cls.value,pictureBank,5);expectedPairs=chosen.length;
 const cards=shuffle(chosen.flatMap((p,i)=>[{id:i,label:p[0]+" "+p[1],kind:"picture"},{id:i,label:p[1],kind:"word"}]));
 board.innerHTML="<div class=\"game-subject-tag\">🧩 सही जोड़ी मिलाओ</div><p class=\"arcade-question\">एक चित्र और उसका सही नाम मिलाइए।</p><div class=\"match-grid\"></div><p id=\"matchFeedback\" class=\"arcade-feedback\">दो कार्ड चुनिए।</p>";
 const grid=board.querySelector(".match-grid");let first=null,busy=false;
 cards.forEach(card=>{const b=document.createElement("button");b.type="button";b.className="match-card";b.textContent="❔";b.addEventListener("click",()=>{
 if(busy||b.disabled||b===first)return;b.textContent=card.label;b.classList.add("revealed");
 if(!first){first={button:b,card};return;}busy=true;const one=first;const ok=one.card.id===card.id&&one.card.kind!==card.kind;const feedback=$("matchFeedback");
 if(ok){one.button.disabled=true;b.disabled=true;one.button.classList.add("matched");b.classList.add("matched");matchCount++;score+=10;feedback.textContent="✅ सही जोड़ी! "+matchCount+"/"+expectedPairs;points.textContent="⭐ "+score+" अंक";first=null;busy=false;if(matchCount===expectedPairs)finishMatch();}
 else{feedback.textContent="यह जोड़ी सही नहीं है। फिर प्रयास करें।";setTimeout(()=>{one.button.textContent="❔";b.textContent="❔";one.button.classList.remove("revealed");b.classList.remove("revealed");first=null;busy=false;},700);}
 });grid.appendChild(b);});progress.textContent=expectedPairs+" जोड़ियाँ मिलाएँ";points.textContent="⭐ 0 अंक";
}
function finishMatch(){board.innerHTML="<div class=\"arcade-result\">🏆 शानदार!</div><h4>50 / 50 अंक</h4><p>आपने सभी पाँच जोड़ियाँ सही मिलाईं।</p><button type=\"button\" class=\"cta\" id=\"arcadeAgain\">🔁 नया राउंड</button>";$("arcadeAgain").addEventListener("click",begin);progress.textContent="खेल पूरा हुआ";}
startBtn.addEventListener("click",begin);
})();