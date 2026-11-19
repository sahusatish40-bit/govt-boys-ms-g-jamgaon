/* MINI LEARNING GAME — ज्ञान जोड़ी मिलान */
(function(){
  "use strict";
  const banks={
    hindi:[
      ["सूर्य","रवि"],["जल","नीर"],["पृथ्वी","धरती"],["वन","जंगल"],["आकाश","गगन"],["कमल","पंकज"]
    ],
    english:[
      ["Brave","बहादुर"],["River","नदी"],["Clean","स्वच्छ"],["Begin","शुरू करना"],["Quick","तेज़"],["Kind","दयालु"]
    ],
    maths:[
      ["त्रिभुज","3 भुजाएँ"],["वर्ग","4 बराबर भुजाएँ"],["आयत","विपरीत भुजाएँ बराबर"],["1/2","आधा"],["परिमाप","चारों ओर की कुल लंबाई"],["समकोण","90°"]
    ],
    science:[
      ["जड़","जल का अवशोषण"],["पत्ती","भोजन बनाना"],["हृदय","रक्त पंप करना"],["वाष्पीकरण","द्रव से गैस"],["बल","धक्का या खिंचाव"],["ऑक्सीजन","श्वसन में उपयोगी गैस"]
    ],
    social:[
      ["भारत की राजधानी","नई दिल्ली"],["छत्तीसगढ़ की राजधानी","रायपुर"],["ग्राम पंचायत","स्थानीय स्वशासन"],["मानचित्र","स्थान का चित्रात्मक निरूपण"],["संविधान","देश का सर्वोच्च कानून"],["महानदी","छत्तीसगढ़ की प्रमुख नदी"]
    ],
    sanskrit:[
      ["फलम्","फल"],["जलम्","पानी"],["पुस्तकम्","पुस्तक"],["गजः","हाथी"],["विद्यालयः","स्कूल"],["मित्रम्","मित्र"]
    ]
  };
  const root=document.getElementById("pairMatchGame");
  if(!root)return;
  const subject=root.querySelector("#pairGameSubject");
  const board=root.querySelector("#pairGameBoard");
  const status=root.querySelector("#pairGameStatus");
  const moves=root.querySelector("#pairGameMoves");
  const start=root.querySelector("#pairGameStart");
  const labels={hindi:"हिंदी",english:"English",sanskrit:"संस्कृत",maths:"गणित",science:"विज्ञान",social:"सामाजिक विज्ञान"};
  let first=null,second=null,lock=false,matched=0,attempts=0,deck=[];
  const shuffle=a=>{const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;};
  function startGame(){
    first=second=null;lock=false;matched=0;attempts=0;
    const pairs=shuffle(banks[subject.value]).slice(0,5);
    deck=shuffle(pairs.flatMap((p,i)=>[{pair:i,text:p[0]},{pair:i,text:p[1]}]));
    board.innerHTML="";
    deck.forEach((item,i)=>{
      const b=document.createElement("button");
      b.type="button";b.className="pair-card";b.dataset.index=String(i);
      b.setAttribute("aria-label","छिपा हुआ कार्ड");
      b.innerHTML='<span class="pair-card-back">?</span><span class="pair-card-front"></span>';
      b.addEventListener("click",()=>flip(b,item));
      board.appendChild(b);
    });
    status.textContent="10 कार्डों में 5 सही जोड़ियाँ खोजिए।";
    moves.textContent="प्रयास: 0";
    start.textContent="🔄 नया खेल";
  }
  function flip(button,item){
    if(lock||button.classList.contains("is-open")||button.classList.contains("is-matched"))return;
    button.classList.add("is-open");
    button.querySelector(".pair-card-front").textContent=item.text;
    button.setAttribute("aria-label",item.text);
    if(!first){first={button,item};return;}
    second={button,item};attempts++;moves.textContent="प्रयास: "+attempts;
    if(first.item.pair===second.item.pair){
      first.button.classList.add("is-matched");second.button.classList.add("is-matched");
      matched++;first=null;second=null;
      status.textContent="बहुत अच्छा! सही जोड़ी मिल गई।";
      if(matched===5)status.textContent="🎉 शानदार! आपने "+attempts+" प्रयासों में सभी 5 जोड़ियाँ पूरी कीं।";
    }else{
      lock=true;status.textContent="कोई बात नहीं—फिर कोशिश कीजिए।";
      const a=first,b=second;first=null;second=null;
      window.setTimeout(()=>{
        [a.button,b.button].forEach(x=>{x.classList.remove("is-open");x.querySelector(".pair-card-front").textContent="";x.setAttribute("aria-label","छिपा हुआ कार्ड");});
        lock=false;
      },850);
    }
  }
  start.addEventListener("click",startGame);
  subject.addEventListener("change",startGame);
  startGame();
})();