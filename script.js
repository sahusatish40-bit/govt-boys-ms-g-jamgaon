function renderGalleryUploader(box,db){
  if(box.dataset.ready==="1")return;box.dataset.ready="1";
  box.innerHTML="<h3>📤 Admin: गतिविधि फोटो अपलोड</h3><label>Album चुनें</label><select id='activityPhotoCategory'><option>योग</option><option>No Bag Day</option><option>विद्यालय कार्यक्रम</option><option>विज्ञान गतिविधि</option><option>खेल</option><option>अन्य</option></select><input id='activityPhotoInput' type='file' accept='image/*'><input id='activityPhotoCaption' type='text' placeholder='फोटो का शीर्षक / गतिविधि'><button id='activityPhotoUpload'>📤 फोटो अपलोड करें</button><p id='activityUploadMessage'></p>";
  const btn=box.querySelector("#activityPhotoUpload"),input=box.querySelector("#activityPhotoInput"),caption=box.querySelector("#activityPhotoCaption"),category=box.querySelector("#activityPhotoCategory"),msg=box.querySelector("#activityUploadMessage");
  btn.onclick=async()=>{try{if(!input.files[0])throw Error("पहले फोटो चुनें");btn.disabled=true;msg.textContent="फोटो तैयार हो रही है...";const data=await compressPosterFile(input.files[0]);await db.collection("school_gallery").add({photoDataUrl:data,caption:caption.value.trim()||"विद्यालय गतिविधि",category:category.value,createdAt:firebase.firestore.FieldValue.serverTimestamp()});msg.textContent="✓ फोटो Album में अपलोड हो गई!";input.value="";caption.value="";}catch(e){msg.textContent=e.message}finally{btn.disabled=false}};
}// School Sathi: Admin, Notices, Students and Exams

const firebaseConfig = {
  apiKey: "AIzaSyAGPlqFFNCmQIj9ROjF9Ujj4C9a8Z5f9cQ",
  authDomain: "govt-boys-ms-g-jamgaon.firebaseapp.com",
  projectId: "govt-boys-ms-g-jamgaon",
  storageBucket: "govt-boys-ms-g-jamgaon.firebasestorage.app",
  messagingSenderId: "1076919620059",
  appId: "1:1076919620059:web:b1c1bfcdb1d9e260d8d7fe",
  measurementId: "G-7CCE542ZGG"
};

const ADMIN_UID = "Y79AJ2xs8mTjaWepHml1lA74fj83";

const langBtn = document.getElementById("langBtn");
let currentLang = "hi";

function setLang(next) {
  currentLang = next;
  document.documentElement.lang = next;

  document.querySelectorAll("[data-hi]").forEach(e => {
    if (e.dataset[next] !== undefined) {
      e.textContent = e.dataset[next];
    }
  });

  if (langBtn) {
    langBtn.textContent = next === "hi" ? "English" : "हिंदी";
  }
}

if (langBtn) {
  langBtn.addEventListener("click", () => {
    setLang(currentLang === "hi" ? "en" : "hi");
  });
}


async function compressPosterFile(file){
  if(!file)return "";
  if(!file.type.startsWith("image/"))throw Error("कृपया JPG या PNG फोटो चुनें");
  let source=null,cleanup=()=>{};
  try{
    if("createImageBitmap" in window){
      try{source=await createImageBitmap(file);cleanup=()=>source&&source.close&&source.close()}catch(e){}
    }
    if(!source){
      const img=new Image(),url=URL.createObjectURL(file);cleanup=()=>URL.revokeObjectURL(url);
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error("फोटो नहीं खुली। कृपया PNG को JPG में बदलकर या दूसरी फोटो चुनकर प्रयास करें।"));img.src=url});
      source=img;
    }
    const max=1200,scale=Math.min(1,max/Math.max(source.width,source.height));
    const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(source.width*scale));canvas.height=Math.max(1,Math.round(source.height*scale));
    const ctx=canvas.getContext("2d");if(!ctx)throw Error("फोटो तैयार नहीं हो सकी");
    ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);
    let q=.72,data=canvas.toDataURL("image/jpeg",q);while(data.length>650000&&q>.35){q-=.08;data=canvas.toDataURL("image/jpeg",q)}
    if(data.length>700000)throw Error("फोटो बहुत बड़ी है; छोटी फोटो चुनें");
    return data;
  }catch(e){throw e}finally{cleanup()}
}

function loadFirebase(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.onload = resolve;
    s.onerror = () => reject(Error("Firebase SDK लोड नहीं हुआ"));
    document.head.appendChild(s);
  });
}

async function startSchoolWebsite() {
  const adminBox = document.querySelector(".adminbox");
  const noticeList = document.getElementById("noticeList");

  try {
    if (adminBox) {
      adminBox.innerHTML = "<p>Firebase लोड हो रहा है…</p>";
    }

    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
    );

    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"
    );

    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"
    );

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
await loadFirebase(
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
);
    const auth = firebase.auth();
    const db = firebase.firestore();
    // Firestore-based public activity photo gallery (no Firebase Storage)
    const galleryBox=document.getElementById("liveGallery");
    const galleryFilters=document.getElementById("liveGalleryFilters");
    if(galleryBox){
      let galleryDocs=[];
      let activeAlbum="सभी";
      const albums=["सभी","योग","No Bag Day","विद्यालय कार्यक्रम","विज्ञान गतिविधि","खेल","अन्य"];
      const renderAlbum=()=>{
        if(galleryFilters){galleryFilters.innerHTML="";albums.forEach(album=>{const btn=document.createElement("button");btn.textContent=album;btn.className="album-filter"+(album===activeAlbum?" active":"");btn.onclick=()=>{activeAlbum=album;renderAlbum()};galleryFilters.appendChild(btn)});}
        galleryBox.innerHTML="";
        const shown=galleryDocs.filter(d=>activeAlbum==="सभी"||d.category===activeAlbum);
        if(!shown.length){galleryBox.textContent=activeAlbum==="सभी"?"अभी कोई फोटो उपलब्ध नहीं है।":"इस Album में अभी फोटो नहीं हैं।";return;}
        shown.forEach(({id,data})=>{
          const card=document.createElement("article");card.className="gallery-photo-card";
          const im=document.createElement("img");im.src=data.photoDataUrl;im.alt=data.caption||"विद्यालय गतिविधि";im.loading="lazy";
          im.onclick=()=>{const overlay=document.createElement("div");overlay.className="gallery-lightbox";const large=document.createElement("img");large.src=data.photoDataUrl;const close=document.createElement("button");close.textContent="✕ बंद करें";close.onclick=()=>overlay.remove();overlay.append(large,close);overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};document.body.appendChild(overlay)};
          const cap=document.createElement("p");cap.textContent=(data.category||"अन्य")+" • "+(data.caption||"विद्यालय गतिविधि");
          const dl=document.createElement("a");dl.href=data.photoDataUrl;dl.download="school-activity.jpg";dl.textContent="📥 फोटो डाउनलोड करें";dl.className="poster-download";
          card.append(im,cap,dl);
          if(auth.currentUser?.uid===ADMIN_UID){const del=document.createElement("button");del.textContent="🗑️ हटाएँ";del.onclick=async()=>{if(confirm("फोटो हटाएँ?"))await db.collection("school_gallery").doc(id).delete()};card.appendChild(del);}
          galleryBox.appendChild(card);
        });
      };
      db.collection("school_gallery").orderBy("createdAt","desc").onSnapshot(snap=>{galleryDocs=snap.docs.map(doc=>({id:doc.id,data:doc.data()}));renderAlbum();},err=>{galleryBox.textContent="Gallery लोड नहीं हुई: "+err.message;});
    }
    const galleryAdmin=document.getElementById("galleryUploadAdmin");
    if(galleryAdmin&&auth.currentUser?.uid===ADMIN_UID)renderGalleryUploader(galleryAdmin,db);
    auth.onAuthStateChanged(user=>{if(galleryAdmin){if(user?.uid===ADMIN_UID)renderGalleryUploader(galleryAdmin,db);else{galleryAdmin.innerHTML="";galleryAdmin.dataset.ready="";}}});
