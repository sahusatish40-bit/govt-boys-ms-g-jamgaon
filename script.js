// School Sathi: Admin, Notices, Students and Exams
const firebaseConfig={apiKey:"AIzaSyAGPlqFFNCmQIj9ROjF9Ujj4C9a8Z5f9cQ",authDomain:"govt-boys-ms-g-jamgaon.firebaseapp.com",projectId:"govt-boys-ms-g-jamgaon",storageBucket:"govt-boys-ms-g-jamgaon.firebasestorage.app",messagingSenderId:"1076919620059",appId:"1:1076919620059:web:b1c1bfcdb1d9e260d8d7fe",measurementId:"G-7CCE542ZGG"};
const ADMIN_UID="Y79AJ2xs8mTjaWepHml1lA74fj83";
const langBtn=document.getElementById("langBtn");
let currentLang="hi";
function setLang(next){currentLang=next;document.documentElement.lang=next;document.querySelectorAll("[data-hi]").forEach(e=>{if(e.dataset[next]!==undefined)e.textContent=e.dataset[next];});if(langBtn)langBtn.textContent=next==="hi"?"English":"हिंदी";}
if(langBtn)langBtn.addEventListener("click",()=>setLang(currentLang==="hi"?"en":"hi"));
function loadFirebase(url){return new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=url;s.onload=resolve;s.onerror=()=>reject(Error("Firebase SDK लोड नहीं हुआ"));document.head.appendChild(s);});}

async function startSchoolWebsite(){
 const adminBox=document.querySelector(".adminbox"),noticeList=document.getElementById("noticeList");
 try{
  if(adminBox)adminBox.innerHTML="<p>Firebase लोड हो रहा है…</p>";
  await loadFirebase("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
  await loadFirebase("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js");
  await loadFirebase("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js");
  if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);
  const auth=firebase.auth(),db=firebase.firestore();
  if(adminBox)adminBox.innerHTML=`
  <p><strong>विद्यालय एडमिन लॉगिन</strong></p>
  <div id="loginBox"><label>Admin Email</label><input id="adminEmail" type="email" autocomplete="username" placeholder="अपना ईमेल लिखें"><label>Password</label><input id="adminPassword" type="password" autocomplete="current-password" placeholder="अपना पासवर्ड लिखें"><button id="loginBtn" type="button">Login</button><p id="loginMessage"></p></div>
  <div id="adminTools" hidden><h3>Admin Dashboard</h3><button id="logoutBtn" type="button">Logout</button><hr>
  <h3>नई विद्यालयीन सूचना</h3><input id="noticeInput" maxlength="180" placeholder="सूचना लिखें"><button id="addNotice" type="button">Publish Notice</button><p id="adminMessage"></p><hr>
  <h3>विद्यार्थी प्रबंधन (केवल एडमिन)</h3>
  <label>विद्यार्थी का नाम *</label><input id="studentName" maxlength="80" placeholder="पूरा नाम">
  <label>कक्षा *</label><select id="studentClass"><option value="6">कक्षा 6वीं</option><option value="7">कक्षा 7वीं</option><option value="8">कक्षा 8वीं</option></select>
  <label>रोल नंबर *</label><input id="studentRoll" maxlength="20" placeholder="रोल नंबर">
  <label>अभिभावक का नाम</label><input id="guardianName" maxlength="80" placeholder="अभिभावक का नाम">
  <label>जन्मतिथि</label><input id="studentDob" type="date">
  <label>पूरा पता</label><textarea id="studentAddress" maxlength="300" rows="2" placeholder="ग्राम, पोस्ट, तहसील, जिला"></textarea>
  <label>मोबाइल नंबर</label><input id="studentMobile" type="tel" inputmode="numeric" maxlength="15" placeholder="अभिभावक का मोबाइल नंबर">
  <button id="saveStudent" type="button">विद्यार्थी जोड़ें</button><p id="studentMessage"></p>
  <label>कक्षा के अनुसार सूची</label><select id="studentFilter"><option value="all">सभी कक्षाएँ</option><option value="6">कक्षा 6वीं</option><option value="7">कक्षा 7वीं</option><option value="8">कक्षा 8वीं</option></select><div id="studentList"></div>
  <hr><section><h3>परीक्षा प्रबंधन (सत्र 2026–27)</h3>
  <label>परीक्षा का नाम *</label><input id="examTitle" maxlength="100" placeholder="जैसे मासिक परीक्षा जुलाई 2026">
  <label>कक्षा *</label><select id="examClass"><option value="6">कक्षा 6वीं</option><option value="7">कक्षा 7वीं</option><option value="8">कक्षा 8वीं</option></select>
  <label>विषय और पूर्णांक — हर पंक्ति: विषय, थ्योरी अंक, प्रैक्टिकल अंक</label>
  <textarea id="examSubjects" rows="5" placeholder="हिंदी,20,5&#10;अंग्रेजी,20,5&#10;गणित,25,0"></textarea><small>प्रैक्टिकल नहीं हो तो 0 लिखें। उदाहरण: गणित,25,0</small>
  <button id="createExam" type="button">परीक्षा बनाएँ</button><p id="examMessage"></p>
  <label>मौजूदा परीक्षा चुनें</label><select id="examSelect"><option value="">परीक्षा चुनें</option></select><div id="examMarksArea"></div></section></div>
  <small>विद्यार्थियों और परीक्षा के अंक केवल अधिकृत एडमिन को दिखाई देते हैं।</small>`;
  const el=id=>document.getElementById(id),show=(n,m)=>{if(n)n.textContent=m;};
  const loginBox=el("loginBox"),adminTools=el("adminTools"),loginMessage=el("loginMessage"),adminMessage=el("adminMessage"),studentMessage=el("studentMessage"),studentList=el("studentList"),studentFilter=el("studentFilter");
  let students=[],stopStudents=null,exams=[];
  function renderNotices(snap){if(!noticeList)return;noticeList.innerHTML="";if(snap.empty){noticeList.textContent="अभी कोई नई सूचना उपलब्ध नहीं है।";return;}snap.forEach(doc=>{const d=doc.data(),a=document.createElement("article"),t=document.createElement("b"),date=document.createElement("time");a.className="notice";t.textContent=d.text||"";date.textContent=d.createdAt?d.createdAt.toDate().toLocaleDateString("hi-IN"):"नई सूचना";a.append(date,t);if(auth.currentUser?.uid===ADMIN_UID){const b=document.createElement("button");b.textContent="हटाएँ";b.onclick=async()=>{if(confirm("क्या यह सूचना हटाएँ?"))try{await db.collection("notices").doc(doc.id).delete();}catch(e){alert(e.message);}};a.appendChild(b);}noticeList.appendChild(a);});}
  db.collection("notices").orderBy("createdAt","desc").limit(30).on
