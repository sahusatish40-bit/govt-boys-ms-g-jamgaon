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
 const c=cls.value,m=mode.value;
 if(m==="math")round=Array.from({length:5},()=>mathQuestion(c));
 else round=shuffle((m==="science"?science:words)[c]).slice(0,5).map(fromTuple);
 index=0;score=0;draw();
}
function draw(){
 locked=false;const item=round[index];
 progress.textContent="प्रश्न "+(index+1)+" / "+round.length;points.textContent="⭐ "+score+" अंक";
 board.innerHTML='<div class="game-subject-tag">'+(mode.value==="math"?"गणित मिशन":mode.value==="science"?"विज्ञान चैलेंज":"शब्द-ज्ञान")+' • कक्षा '+cls.value+'वीं</div><div class="arcade-question"></div><div class="arcade-options"></div>';
 board.querySelector(".arcade-question").textContent=item.q;
 const opts=board.querySelector(".arcade-options");
 item.opts.forEach((v)=>{const b=document.createElement("button");b.type="button";b.className="arcade-option";b.textContent=v;b.addEventListener("click",()=>answer(v,b));opts.appendChild(b);});
}
function answer(value,chosen){
 if(locked)return;locked=true;const item=round[index],ok=value===item.answer;
 if(ok)score+=10;
 board.querySelectorAll(".arcade-option").forEach(b=>{b.disabled=true;if(b.textContent===item.answer)b.classList.add("is-right");else if(b===chosen)b.classList.add("is-wrong");});
 const f=document.createElement("p");f.className="arcade-feedback "+(ok?"good":"bad");f.textContent=(ok?"✅ बहुत बढ़िया! +10 अंक। ":"❌ सही उत्तर: "+item.answer+"। ")+item.why;board.appendChild(f);
 const next=document.createElement("button");next.type="button";next.className="cta";next.textContent=index===round.length-1?"🏁 परिणाम देखें":"अगला प्रश्न ➜";next.addEventListener("click",()=>{if(index<round.length-1){index++;draw();}else finish();});board.appendChild(next);points.textContent="⭐ "+score+" अंक";
}
function finish(){
 const pct=Math.round(score/50*100);progress.textContent="राउंड पूरा हुआ";board.innerHTML='<div class="arcade-result">🏆 '+score+' / 50 अंक</div><h4>'+pct+'% सफलता</h4><p>'+(pct>=80?"शानदार प्रदर्शन! आपकी तैयारी बहुत अच्छी है।":pct>=50?"अच्छा प्रयास! थोड़ा और अभ्यास करें।":"कोई बात नहीं—फिर से खेलें और अपना रिकॉर्ड सुधारें।")+'</p><button type="button" class="cta" id="arcadeAgain">🔁 नया राउंड खेलें</button>';
 $("arcadeAgain").addEventListener("click",begin);
}
startBtn.addEventListener("click",begin);
})();