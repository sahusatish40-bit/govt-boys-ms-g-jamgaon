// Independent fallback for Live Gallery: runs separately from the main site script.
(function(){
 const box=document.getElementById("liveGallery");
 if(!box)return;
 let done=false;
 function fail(msg){if(done)return;done=true;box.innerHTML="<p>"+msg+"</p><button id='galleryStandaloneRetry'>फिर से प्रयास करें</button>";document.getElementById("galleryStandaloneRetry").onclick=()=>{done=false;start();};}
 async function start(){
  box.textContent="Gallery स्वतंत्र रूप से लोड हो रही है…";
  try{
   if(!window.firebase){
    await loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js");
   }else if(!firebase.firestore){
    await loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js");
   }
   const cfg={apiKey:"AIzaSyAGPlqFFNCmQIj9ROjF9Ujj4C9a8Z5f9cQ",authDomain:"govt-boys-ms-g-jamgaon.firebaseapp.com",projectId:"govt-boys-ms-g-jamgaon",storageBucket:"govt-boys-ms-g-jamgaon.firebasestorage.app",messagingSenderId:"1076919620059",appId:"1:1076919620059:web:b1c1bfcdb1d9e260d8d7fe"};
   if(!firebase.apps.length)firebase.initializeApp(cfg);
   firebase.firestore().collection("school_gallery").get().then(s=>{
    if(done)return;done=true;box.innerHTML="";
    if(s.empty){box.textContent="अभी कोई फोटो उपलब्ध नहीं है।";return;}
    s.docs.forEach(d=>{
      const x=d.data();if(!x.photoDataUrl)return;
      const card=document.createElement("article");card.className="gallery-photo-card";
      const im=document.createElement("img");im.src=x.photoDataUrl;im.alt=x.caption||"विद्यालय गतिविधि";im.loading="lazy";im.style.cssText="max-width:100%;height:auto";
      const cap=document.createElement("p");cap.textContent=(x.category||"")+" • "+(x.caption||"विद्यालय गतिविधि");card.append(im,cap);box.append(card);
    });
   }).catch(e=>fail("Gallery त्रुटि: "+(e.code||e.message)));
  }catch(e){fail("Gallery SDK त्रुटि: "+e.message);}
 }
 function loadScript(url){return new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=url;s.onload=resolve;s.onerror=()=>reject(Error("SDK डाउनलोड विफल"));document.head.appendChild(s);});}
 start();
})();