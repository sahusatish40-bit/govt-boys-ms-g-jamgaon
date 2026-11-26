// School Sathi: Admin, Notices, Students and Exams

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


async function compressPosterFile(file){if(!file)return "";if(!file.type.startsWith("image/"))throw Error("कृपया image file चुनें");const img=new Image();const url=URL.createObjectURL(file);try{await new Promise((r,j)=>{img.onload=r;img.onerror=()=>j(Error("Image पढ़ नहीं सकी"));img.src=url});const max=1200,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);let q=.72,data=canvas.toDataURL("image/jpeg",q);while(data.length>650000&&q>.35){q-=.08;data=canvas.toDataURL("image/jpeg",q)}if(data.length>700000)throw Error("फोटो बहुत बड़ी है; छोटी फोटो चुनें");return data}finally{URL.revokeObjectURL(url)}}

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

    // सभी लोगों के लिए सार्वजनिक शिक्षक सूची
    const publicTeacherBox = document.getElementById("publicTeacherList");

    if (publicTeacherBox) {
      db.collection("teachers_public").onSnapshot(
        snap => {
          publicTeacherBox.innerHTML = "";

          if (snap.empty) {
            publicTeacherBox.textContent =
              "शिक्षकों की जानकारी शीघ्र उपलब्ध होगी।";
            return;
          }

          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
            .forEach(t => {
              const card = document.createElement("article");
              card.className = "card";

              if (t.photo) {
                const img = document.createElement("img");
                img.src = t.photo;
                img.alt = t.name || "शिक्षक";
                img.style.cssText =
                  "width:100%;height:180px;object-fit:cover;border-radius:10px";
                card.appendChild(img);
              }

              const name = document.createElement("h3");
              name.textContent = t.name || "शिक्षक";
              card.appendChild(name);

              const post = document.createElement("p");
              post.textContent = "पद: " + (t.post || "—");
              card.appendChild(post);

              const subject = document.createElement("p");
              subject.textContent = "विषय: " + (t.subject || "—");
              card.appendChild(subject);

              publicTeacherBox.appendChild(card);
            });
        },
        error => {
          publicTeacherBox.textContent =
            "शिक्षक सूची लोड नहीं हुई: " + error.message;
        }
      );
    }

    if (adminBox) {
      adminBox.innerHTML = `
        <p><strong>विद्यालय एडमिन लॉगिन</strong></p>

        <div id="loginBox">
          <label>Admin Email</label>
          <input id="adminEmail" type="email"
            autocomplete="username" placeholder="अपना ईमेल लिखें">

          <label>Password</label>
          <input id="adminPassword" type="password"
            autocomplete="current-password" placeholder="अपना पासवर्ड लिखें">

          <button id="loginBtn" type="button">Login</button>
          <p id="loginMessage"></p>
        </div>

        <div id="adminTools" hidden style="display:none!important">
          <h3>Admin Dashboard</h3>
          <section id="adminDashboard" class="admin-dashboard">
            <div class="admin-dashboard-head"><div><span class="admin-eyebrow">SCHOOL MANAGEMENT</span><h3>📊 विद्यालय डैशबोर्ड</h3><p>सत्र 2026–27 का त्वरित विवरण</p></div><button id="refreshAdminDashboard" type="button" class="admin-refresh">↻ Refresh</button></div>
            <div class="admin-stat-grid">
              <article class="admin-stat"><span>🎓</span><div><small>कुल विद्यार्थी</small><strong id="dashStudents">—</strong><em id="dashClassBreakdown">कक्षा 6: — · 7: — · 8: —</em></div></article>
              <article class="admin-stat"><span>👨‍🏫</span><div><small>कुल शिक्षक</small><strong id="dashTeachers">—</strong><em>शिक्षक सूची</em></div></article>
              <article class="admin-stat"><span>📝</span><div><small>कुल परीक्षाएँ</small><strong id="dashExams">—</strong><em>परीक्षा प्रबंधन</em></div></article>
              <article class="admin-stat"><span>🎂</span><div><small>जन्मदिन रिकॉर्ड</small><strong id="dashBirthdays">—</strong><em>जन्मदिन कार्ड</em></div></article>
              <article class="admin-stat"><span>📢</span><div><small>विद्यालय सूचनाएँ</small><strong id="dashNotices">—</strong><em>सूचना बोर्ड</em></div></article>
            </div>
            <div class="admin-quick-area"><strong>⚡ Quick Management</strong><div class="admin-quick-links"><a href="#adminNoticeManagement">📢 सूचना</a><a href="#adminEventManagement">📅 कार्यक्रम</a><a href="#adminStudentManagement">🎓 विद्यार्थी</a><a href="#digitalAttendance">📅 उपस्थिति</a><a href="#birthdayManagement">🎂 जन्मदिन</a><a href="#teacherManagement">👨‍🏫 शिक्षक</a><a href="#adminExamManagement">📝 परीक्षा</a><a href="#creativityAdmin">🌟 रचनात्मकता</a><a href="#adminGalleryManagement">🖼️ गैलरी</a></div></div>
            <p id="adminDashboardMessage" class="admin-dashboard-message" aria-live="polite">डैशबोर्ड का डेटा लोड हो रहा है…</p>
            <p id="adminDashboardDate" class="admin-dashboard-date"></p>
            <section class="admin-roadmap" aria-label="School Sathi सुविधा विस्तार योजना">
              <div class="admin-roadmap-heading"><div><span class="admin-eyebrow">10-STEP SCHOOL SAATHI UPGRADE</span><h4>🚀 वेबसाइट विकास योजना</h4><p>तैयार सुविधाओं को खोलने के लिए चरण पर टैप करें</p></div><span class="admin-roadmap-progress">8 / 10 चरण पूर्ण / उपलब्ध</span></div>
              <ol class="admin-roadmap-list">
                <li class="is-done"><span>01</span><div><a href="#adminDashboard" class="roadmap-step-link"><strong>Advanced Admin Panel</strong><small>डैशबोर्ड, त्वरित प्रबंधन और मोबाइल नेविगेशन</small></a></div><em>खोलें</em></li>
                <li class="is-done"><span>02</span><div><a href="#adminStudentManagement" class="roadmap-step-link"><strong>Student Digital Profile</strong><small>फोटो लिंक, रोल नंबर, अभिभावक और विद्यार्थी विवरण</small></a></div><em>खोलें</em></li>
                <li class="is-ready"><span>03</span><div><a href="#student-result" class="roadmap-step-link"><strong>Smart Report Card</strong><small>विषयवार अंक, ग्रेड, परीक्षा-वार प्रगति और प्रिंट योग्य रिपोर्ट</small></a></div><em>खोलें</em></li>
                <li class="is-done"><span>04</span><div><a href="#digitalAttendance" class="roadmap-step-link"><strong>Digital Attendance</strong><small>दैनिक उपस्थिति एवं मासिक रजिस्टर</small></a></div><em>उपलब्ध</em></li>
                <li class="is-ready"><span>05</span><div><a href="#learning-games" class="roadmap-step-link"><strong>Smart Learning Zone</strong><small>लर्निंग गेम्स और प्रश्न बैंक उपलब्ध; अध्यायवार विविध प्रश्नों का विस्तार जारी</small></a></div><em>विस्तार जारी</em></li>
                <li class="is-done"><span>06</span><div><a href="#notice" class="roadmap-step-link"><strong>Notice & Event Center</strong><small>सूचना पटल, आगामी कार्यक्रम और एडमिन प्रकाशन</small></a></div><em>उपलब्ध</em></li>
                <li class="is-done"><span>07</span><div><a href="#resources" class="roadmap-step-link"><strong>Digital Library</strong><small>कक्षा-वार अध्ययन सामग्री, SCERT/NCERT पुस्तक लिंक और Grammar</small></a></div><em>उपलब्ध</em></li>
                <li class="is-done"><span>08</span><div><a href="teacher-corner.html" class="roadmap-step-link"><strong>Teacher Corner</strong><small>Smart Lesson Plan, दैनिक डायरी, गतिविधि रिकॉर्ड और Sync</small></a></div><em>उपलब्ध</em></li>
                <li class="is-planned"><span>09</span><div><strong>Security & Backup</strong><small>नियमों की समीक्षा, सुरक्षित बैकअप/रीस्टोर और ऑडिट लॉग का काम बाकी</small></div><em>शेष कार्य</em></li>
                <li class="is-done"><span>10</span><div><strong>Mobile App / PWA</strong><small>इंस्टॉल योग्य वेब ऐप और सेव किए गए पेजों का ऑफलाइन shell</small></div><em>उपलब्ध</em></li>
              </ol>
            </section>
          </section>

          <button id="logoutBtn" type="button">Logout</button>
          <hr>

       <hr>
<h3 id="adminGalleryManagement">🖼️ Gallery Management</h3>
<p>विद्यालय की तस्वीरों का प्रबंधन</p>

<div id="adminGalleryList">
  <p>Gallery लोड हो रही है...</p>
</div>
<hr>
          <h3 id="adminNoticeManagement">नई विद्यालयीन सूचना</h3>
          <input id="noticeInput" maxlength="180" placeholder="सूचना लिखें">
          <label>पोस्टर (वैकल्पिक, JPEG में संकुचित होगा)</label><input id="noticePoster" type="file" accept="image/*">
          <button id="addNotice" type="button">Publish Notice</button>
          <p id="adminMessage"></p>
          
<hr>
<h3 id="adminEventManagement">📅 विद्यालय कार्यक्रम प्रबंधन</h3>
<p>नया कार्यक्रम जोड़ें</p>

<label>कार्यक्रम का नाम *</label>
<input id="eventTitle" maxlength="100"
  placeholder="जैसे: मासिक परीक्षा">

<label>कार्यक्रम की तारीख *</label>
<input id="eventDate" type="date">

<label>कार्यक्रम का प्रकार</label>
<select id="eventType">
  <option value="परीक्षा">परीक्षा</option>
  <option value="अवकाश">अवकाश</option>
  <option value="No Bag Day">No Bag Day</option>
  <option value="विद्यालय गतिविधि">विद्यालय गतिविधि</option>
  <option value="अन्य">अन्य</option>
</select>

<label>कार्यक्रम का विवरण</label>
<textarea id="eventDescription" rows="3"
  maxlength="300"
  placeholder="कार्यक्रम की जानकारी लिखें"></textarea>
<label>कार्यक्रम पोस्टर (वैकल्पिक)</label><input id="eventPoster" type="file" accept="image/*">

<button id="addEvent" type="button">
  📅 कार्यक्रम प्रकाशित करें
</button>
<p id="eventMessage"></p>
<hr>

          <hr>

          <h3 id="adminStudentManagement">विद्यार्थी प्रबंधन (केवल एडमिन)</h3>

          <label>विद्यार्थी का नाम *</label>
          <input id="studentName" maxlength="80" placeholder="पूरा नाम">

          <label>कक्षा *</label>
          <select id="studentClass">
            <option value="6">कक्षा 6वीं</option>
            <option value="7">कक्षा 7वीं</option>
            <option value="8">कक्षा 8वीं</option>
          </select>

          <label>रोल नंबर *</label>
          <input id="studentRoll" maxlength="20" placeholder="रोल नंबर">

          <label>अभिभावक का नाम</label>
          <input id="guardianName" maxlength="80" placeholder="अभिभावक का नाम">

          <label>जन्मतिथि</label>
          <input id="studentDob" type="date">

          <label>पूरा पता</label>
          <textarea id="studentAddress" maxlength="300"
            rows="2" placeholder="ग्राम, पोस्ट, तहसील, जिला"></textarea>

          <label>मोबाइल नंबर</label>
          <input id="studentMobile" type="tel"
            inputmode="numeric" maxlength="15"
            placeholder="अभिभावक का मोबाइल नंबर">

          <label>विद्यार्थी फोटो लिंक (वैकल्पिक)</label>
          <input id="studentPhotoUrl" type="url" maxlength="500" placeholder="https://... फोटो का लिंक">

          <button id="saveStudent" type="button">विद्यार्थी जोड़ें</button>
          <p id="studentMessage"></p>

          <label>कक्षा के अनुसार सूची</label>
         <label>विद्यार्थी खोजें (नाम या रोल नंबर)</label>
<input id="studentSearch" type="search" placeholder="नाम या रोल नंबर लिखें">
          <select id="studentFilter">
            <option value="all">सभी कक्षाएँ</option>
            <option value="6">कक्षा 6वीं</option>
            <option value="7">कक्षा 7वीं</option>
            <option value="8">कक्षा 8वीं</option>
          </select>

          <details class="admin-compact-list">
            <summary><span>🎓 पूरी विद्यार्थी सूची देखें</span><small id="studentListCount">सूची खोलें</small></summary>
            <div id="studentList" class="admin-list-content"></div>
          </details>

<hr>
<section id="digitalAttendance" class="attendance-module">
  <h3>📅 Digital Attendance — दैनिक उपस्थिति</h3>
  <p>कक्षा और तारीख चुनकर उपस्थिति दर्ज करें। सेव करने पर उसी तारीख का रिकॉर्ड अपडेट होगा।</p>
  <div class="attendance-controls">
    <label for="attendanceDate">उपस्थिति की तारीख</label>
    <input id="attendanceDate" type="date">
    <label for="attendanceClass">कक्षा</label>
    <select id="attendanceClass">
      <option value="6">कक्षा 6वीं</option>
      <option value="7">कक्षा 7वीं</option>
      <option value="8">कक्षा 8वीं</option>
    </select>
    <button id="loadAttendance" type="button">विद्यार्थी सूची लोड करें</button>
    <button id="allPresentAttendance" type="button" class="secondary">सभी उपस्थित</button>
    <button id="allAbsentAttendance" type="button" class="secondary">सभी अनुपस्थित</button>
  </div>
  <p id="attendanceMessage" aria-live="polite"></p>
  <div id="attendanceRoster" style="overflow-x:auto"></div>
  <button id="saveAttendance" type="button" disabled>💾 उपस्थिति सेव करें</button>
  <hr>
  <h3>📊 मासिक उपस्थिति रजिस्टर</h3>
  <label for="attendanceMonth">माह चुनें</label>
  <input id="attendanceMonth" type="month">
  <label for="attendanceReportClass">कक्षा</label>
  <select id="attendanceReportClass">
    <option value="6">कक्षा 6वीं</option>
    <option value="7">कक्षा 7वीं</option>
    <option value="8">कक्षा 8वीं</option>
  </select>
  <button id="loadAttendanceReport" type="button">मासिक रिपोर्ट देखें</button>
  <p id="attendanceReportMessage" aria-live="polite"></p>
  <div id="attendanceReport" style="overflow-x:auto"></div>
</section>
<hr>

<section id="privateStudentDetails">
  <details class="admin-compact-list">
    <summary><span>🔒 निजी विद्यार्थी विवरण (केवल मुख्य Admin)</span><small>विवरण खोलें</small></summary>
    <div class="admin-list-content">
      <button id="loadPrivateStudents" type="button">निजी विवरण देखें</button>
      <div style="margin:12px 0">
        <label>विद्यार्थी खोजें</label>
        <input type="search" id="privateStudentSearch" placeholder="विद्यार्थी का नाम लिखें">
        <label>कक्षा चुनें</label>
        <select id="privateClassFilter">
          <option value="all">सभी कक्षाएँ</option>
          <option value="6">कक्षा 6वीं</option>
          <option value="7">कक्षा 7वीं</option>
          <option value="8">कक्षा 8वीं</option>
        </select>
      </div>
      <p id="privateStudentMessage"></p>
      <div id="privateStudentList"></div>
    </div>
  </details>
</section>
<hr>


<hr>

<hr>
<section id="excelImport">
  <h3>📥 Excel से विद्यार्थी Import करें</h3>

  <p>केवल कक्षा 6वीं, 7वीं और 8वीं का डेटा लिया जाएगा।</p>

  <input
    type="file"
    id="studentExcelFile"
    accept=".xlsx,.xls"
  >

  <button id="previewExcel" type="button">
    Excel डेटा Preview करें
  </button>

  <p id="excelImportMessage"></p>
  <div id="excelPreview"></div>

  <button id="confirmExcelImport" type="button" hidden>
    पुष्टि करें और Firebase में सेव करें
  </button>
</section>
<hr>

<hr>

<hr><section id="creativityAdmin"><h3>🌟 विद्यार्थी रचनात्मकता – समीक्षा एवं प्रकाशन</h3><p>बच्चों द्वारा भेजी गई रचनाओं को जाँचकर प्रकाशित करें।</p><div id="creativityAdminList"><p>लॉगिन के बाद सूची लोड होगी।</p></div></section><hr>
<section id="birthdayManagement">
  <h3>🎂 जन्मदिन कार्ड प्रबंधन</h3>
  <p>विद्यार्थी या शिक्षक का जन्मदिन जोड़ें। जन्मदिन हर वर्ष अपने-आप दिखाई देगा।</p>
  <label>व्यक्ति का प्रकार *</label>
  <select id="birthdayRole">
    <option value="विद्यार्थी">विद्यार्थी</option>
    <option value="शिक्षक">शिक्षक</option>
  </select>
  <label>नाम *</label>
  <input id="birthdayName" maxlength="80" placeholder="पूरा नाम">
  <label>कक्षा / पद</label>
  <input id="birthdayDetail" maxlength="80" placeholder="जैसे कक्षा 7वीं / शिक्षक">
  <label>जन्मतिथि *</label>
  <input id="birthdayDate" type="date">
  <label>फोटो लिंक (वैकल्पिक)</label>
  <input id="birthdayPhoto" type="url" placeholder="फोटो का URL">
  <button id="saveBirthday" type="button">🎉 जन्मदिन जोड़ें</button>
  <p id="birthdayMessage"></p>
  <button id="syncStudentBirthdays" type="button">🎂 विद्यार्थियों की DOB से कार्ड अपडेट करें</button>
  <p id="syncBirthdayMessage"></p>
  <details class="admin-compact-list">
    <summary><span>🎂 जन्मदिन की पूरी सूची देखें</span><small id="adminBirthdayCount">सूची खोलें</small></summary>
    <div id="adminBirthdayList" class="admin-list-content"></div>
  </details>
</section>
<hr>

<section id="teacherManagement">
  <h3>👨‍🏫 शिक्षक प्रबंधन</h3>

  <label>शिक्षक का नाम *</label>
  <input id="teacherName" maxlength="80"
    placeholder="शिक्षक का पूरा नाम">

  <label>पद</label>
  <input id="teacherPost" maxlength="80"
    placeholder="जैसे व्याख्याता / शिक्षक">

  <label>विषय</label>
  <input id="teacherSubject" maxlength="80"
    placeholder="जैसे हिंदी / अंग्रेजी / गणित">

  <label>मोबाइल नंबर</label>
  <input id="teacherMobile" type="tel"
    maxlength="15" placeholder="मोबाइल नंबर">

  <label>फोटो लिंक (वैकल्पिक)</label>
  <input id="teacherPhoto" type="url"
    placeholder="फोटो का URL">

  <button id="saveTeacher" type="button">
    शिक्षक जोड़ें
  </button>

  <p id="teacherMessage"></p>

  <h3>शिक्षकों की सूची</h3>
  <div id="teacherList"></div>
</section>
          <hr>

          <hr>
          <section id="schoolBackupPanel" class="admin-backup-panel">
            <h3>🛡️ Security & Backup Center</h3>
            <p>विद्यालय के महत्वपूर्ण Firestore रिकॉर्ड का JSON बैकअप डाउनलोड करें और आवश्यकता पड़ने पर उसी बैकअप से डेटा वापस जोड़ें।</p>
            <div class="backup-actions">
              <button id="downloadSchoolBackup" type="button">⬇️ पूरा Backup डाउनलोड करें</button>
              <label for="restoreSchoolBackupFile">Backup JSON फ़ाइल चुनें</label>
              <input id="restoreSchoolBackupFile" type="file" accept=".json,application/json">
              <button id="restoreSchoolBackup" type="button" disabled>♻️ Backup से Restore करें</button>
            </div>
            <p id="schoolBackupMessage" aria-live="polite"></p>
            <small>सुरक्षा: यह सुविधा केवल मुख्य Admin के लिए है। Restore मौजूदा दस्तावेज़ों को समान ID पर अपडेट/जोड़ता है; यह अन्य रिकॉर्ड नहीं मिटाता। बैकअप फ़ाइल सुरक्षित स्थान पर रखें। इसमें विद्यार्थियों की निजी जानकारी हो सकती है।</small>
          </section>
          <hr>
          <section id="adminExamManagement">
            <h3>परीक्षा प्रबंधन (सत्र 2026–27)</h3>

            <label>परीक्षा का नाम *</label>
            <input id="examTitle" maxlength="100"
              placeholder="जैसे मासिक परीक्षा जुलाई 2026">

            <label>कक्षा *</label>
            <select id="examClass">
              <option value="6">कक्षा 6वीं</option>
              <option value="7">कक्षा 7वीं</option>
              <option value="8">कक्षा 8वीं</option>
            </select>

            <label>
              विषय और पूर्णांक — हर पंक्ति:
              विषय, थ्योरी अंक, प्रैक्टिकल अंक
            </label>

            <textarea id="examSubjects" rows="5"
              placeholder="हिंदी,20,5
अंग्रेजी,20,5
गणित,25,0"></textarea>

            <small>
              प्रैक्टिकल नहीं हो तो 0 लिखें।
              उदाहरण: गणित,25,0
            </small>

            <button id="createExam" type="button">परीक्षा बनाएँ</button>
            <p id="examMessage"></p>

            <label>मौजूदा परीक्षा चुनें</label>
            <select id="examSelect">
              <option value="">परीक्षा चुनें</option>
            </select>

            <div id="examMarksArea"></div>
          </section>
        </div>

        <small>
          विद्यार्थियों और परीक्षा के अंक केवल अधिकृत एडमिन को दिखाई देते हैं।
        </small>
      `;
    }

    const el = id => document.getElementById(id);
    const show = (n, m) => {
      if (n) n.textContent = m;
    };
    
    // Admin-only JSON backup and additive restore for school records.
    const backupCollections = [
      "students", "students_public", "students_private", "attendance",
      "teachers", "exams", "notices", "events", "birthdays",
      "creativity_submissions", "nmmse_results"
    ];
    const backupMessage = el("schoolBackupMessage");
    let selectedRestoreFile = null;

    function encodeBackupValue(value) {
      if (value instanceof firebase.firestore.Timestamp) {
        return { __schoolSathiType: "timestamp", value: value.toDate().toISOString() };
      }
      if (value instanceof Date) {
        return { __schoolSathiType: "date", value: value.toISOString() };
      }
      if (Array.isArray(value)) return value.map(encodeBackupValue);
      if (value && typeof value === "object") {
        const out = {};
        Object.keys(value).forEach(key => out[key] = encodeBackupValue(value[key]));
        return out;
      }
      return value;
    }

    function decodeBackupValue(value) {
      if (Array.isArray(value)) return value.map(decodeBackupValue);
      if (value && typeof value === "object") {
        if (value.__schoolSathiType === "timestamp") {
          return firebase.firestore.Timestamp.fromDate(new Date(value.value));
        }
        if (value.__schoolSathiType === "date") return new Date(value.value);
        const out = {};
        Object.keys(value).forEach(key => out[key] = decodeBackupValue(value[key]));
        return out;
      }
      return value;
    }

    async function collectSchoolBackup() {
      const backup = {
        format: "school-sathi-firestore-backup",
        version: 1,
        school: "शासकीय उच्चतर माध्यमिक विद्यालय जी- जामगाँव (बालक माध्य.)",
        createdAt: new Date().toISOString(),
        collections: {}
      };
      for (const name of backupCollections) {
        const snap = await db.collection(name).get();
        backup.collections[name] = snap.docs.map(doc => ({
          id: doc.id,
          data: encodeBackupValue(doc.data())
        }));
      }
      const examSnap = await db.collection("exams").get();
      backup.subcollections = { examMarks: {} };
      for (const examDoc of examSnap.docs) {
        const marksSnap = await db.collection("exams").doc(examDoc.id)
          .collection("marks").get();
        backup.subcollections.examMarks[examDoc.id] = marksSnap.docs.map(doc => ({
          id: doc.id,
          data: encodeBackupValue(doc.data())
        }));
      }
      return backup;
    }

    el("downloadSchoolBackup")?.addEventListener("click", async () => {
      if (auth.currentUser?.uid !== ADMIN_UID) {
        return show(backupMessage, "केवल मुख्य Admin बैकअप बना सकता है।");
      }
      const button = el("downloadSchoolBackup");
      button.disabled = true;
      show(backupMessage, "सभी संग्रहों का बैकअप तैयार हो रहा है…");
      try {
        const backup = await collectSchoolBackup();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "School-Sathi-Backup-" + new Date().toISOString().slice(0,10) + ".json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        const total = Object.values(backup.collections).reduce((sum, rows) => sum + rows.length, 0);
        show(backupMessage, "✓ Backup डाउनलोड हो गया। मुख्य संग्रहों में " + total + " रिकॉर्ड और परीक्षा अंक भी शामिल हैं।");
      } catch (error) {
        show(backupMessage, "Backup नहीं बन पाया: " + error.message);
      } finally {
        button.disabled = false;
      }
    });

    el("restoreSchoolBackupFile")?.addEventListener("change", event => {
      selectedRestoreFile = event.target.files?.[0] || null;
      el("restoreSchoolBackup").disabled = !selectedRestoreFile;
      show(backupMessage, selectedRestoreFile ? "फ़ाइल चुनी गई: " + selectedRestoreFile.name + " — Restore से पहले जाँचें।" : "");
    });

    el("restoreSchoolBackup")?.addEventListener("click", async () => {
      if (auth.currentUser?.uid !== ADMIN_UID) {
        return show(backupMessage, "केवल मुख्य Admin Restore कर सकता है।");
      }
      if (!selectedRestoreFile) return show(backupMessage, "पहले Backup JSON फ़ाइल चुनें।");
      if (!confirm("Restore मौजूदा रिकॉर्डों को समान ID पर अपडेट/जोड़ सकता है। यह अन्य रिकॉर्ड नहीं मिटाएगा। क्या आगे बढ़ें?")) return;
      const button = el("restoreSchoolBackup");
      button.disabled = true;
      show(backupMessage, "Backup फ़ाइल जाँची जा रही है…");
      try {
        const backup = JSON.parse(await selectedRestoreFile.text());
        if (backup.format !== "school-sathi-firestore-backup" || backup.version !== 1 ||
            !backup.collections || typeof backup.collections !== "object") {
          throw new Error("यह School Sathi का मान्य Backup JSON नहीं है।");
        }
        let batch = db.batch();
        let writes = 0;
        let restored = 0;
        async function commitBatchIfNeeded(force = false) {
          if (writes >= 400 || (force && writes > 0)) {
            await batch.commit();
            batch = db.batch();
            writes = 0;
          }
        }
        for (const name of backupCollections) {
          const rows = backup.collections[name] || [];
          if (!Array.isArray(rows)) throw new Error(name + " संग्रह का प्रारूप गलत है।");
          for (const row of rows) {
            if (!row || typeof row.id !== "string" || !row.id || !row.data || typeof row.data !== "object") {
              throw new Error(name + " में एक रिकॉर्ड अमान्य है।");
            }
            batch.set(db.collection(name).doc(row.id), decodeBackupValue(row.data));
            writes++;
            restored++;
            await commitBatchIfNeeded();
          }
        }
        const markGroups = backup.subcollections?.examMarks || {};
        for (const [examId, rows] of Object.entries(markGroups)) {
          if (!Array.isArray(rows)) throw new Error("परीक्षा अंक रिकॉर्ड का प्रारूप गलत है।");
          for (const row of rows) {
            if (!row || typeof row.id !== "string" || !row.id || !row.data || typeof row.data !== "object") {
              throw new Error("परीक्षा अंक में एक रिकॉर्ड अमान्य है।");
            }
            batch.set(db.collection("exams").doc(examId).collection("marks").doc(row.id), decodeBackupValue(row.data));
            writes++;
            restored++;
            await commitBatchIfNeeded();
          }
        }
        if (writes > 0) await batch.commit();
        show(backupMessage, "✓ Restore पूरा हुआ। " + restored + " रिकॉर्ड जोड़े/अपडेट किए गए। पेज को Refresh करें।");
      } catch (error) {
        show(backupMessage, "Restore पूरा नहीं हुआ: " + error.message + " कृपया Admin access और Firestore rules जाँचें।");
      } finally {
        button.disabled = false;
      }
    });

    



function updateAdminDashboardDate() {
  const node = document.getElementById("adminDashboardDate");
  if (!node) return;
  node.textContent = "आज की तारीख: " + new Date().toLocaleDateString("hi-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}

async function refreshAdminDashboard() {
  const message = document.getElementById("adminDashboardMessage");
  const button = document.getElementById("refreshAdminDashboard");
  if (auth.currentUser?.uid !== ADMIN_UID) return;
  if (button) button.disabled = true;
  if (message) message.textContent = "डैशबोर्ड अपडेट हो रहा है…";
  try {
    const [studentSnap, teacherSnap, examSnap, birthdaySnap, noticeSnap] = await Promise.all([
      db.collection("students").get(), db.collection("teachers").get(),
      db.collection("exams").get(), db.collection("birthdays").get(),
      db.collection("notices").get()
    ]);
    const classCounts = { "6": 0, "7": 0, "8": 0 };
    studentSnap.docs.forEach(doc => {
      const cls = String(doc.data().className || "");
      if (Object.prototype.hasOwnProperty.call(classCounts, cls)) classCounts[cls]++;
    });
    const setCount = (id, value) => {
      const node = document.getElementById(id);
      if (node) node.textContent = String(value);
    };
    setCount("dashStudents", studentSnap.size);
    setCount("dashTeachers", teacherSnap.size);
    setCount("dashExams", examSnap.size);
    setCount("dashBirthdays", birthdaySnap.size);
    setCount("dashNotices", noticeSnap.size);
    const breakdown = document.getElementById("dashClassBreakdown");
    if (breakdown) breakdown.textContent = "कक्षा 6: " + classCounts["6"] + " · 7: " + classCounts["7"] + " · 8: " + classCounts["8"];
    if (message) message.textContent = "✓ जानकारी सफलतापूर्वक अपडेट हुई";
  } catch (error) {
    if (message) message.textContent = "डैशबोर्ड डेटा लोड नहीं हुआ: " + error.message;
  } finally {
    if (button) button.disabled = false;
  }
}

async function loadAdminGallery() {
  const box = document.getElementById("adminGalleryList");
  if (!box) return;

  box.textContent = "फोटो लोड हो रही हैं...";

  try {
    const response = await fetch(
      "https://api.github.com/repos/sahusatish40-bit/govt-boys-ms-g-jamgaon/contents/images"
    );

    if (!response.ok) throw new Error("फोटो सूची नहीं मिली");

    const files = await response.json();
    const images = files.filter(file =>
      file.type === "file" &&
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    );

    box.innerHTML = "";

    if (!images.length) {
      box.textContent = "कोई फोटो उपलब्ध नहीं है।";
      return;
    }

    images.forEach(file => {
      const card = document.createElement("div");
      card.style.cssText =
        "padding:12px;border:1px solid #ddd;margin:10px;border-radius:10px;display:inline-block;vertical-align:top;max-width:230px;width:100%;box-sizing:border-box";

      const img = document.createElement("img");
      img.src = file.download_url;
      img.alt = file.name;
      img.style.cssText =
        "width:100%;height:150px;object-fit:cover;border-radius:8px";

      const name = document.createElement("p");
      name.textContent = file.name;
      name.style.overflowWrap = "anywhere";

      const newName = document.createElement("input");
      newName.type = "text";
      newName.placeholder = "नया फोटो नाम लिखें";
      newName.style.cssText = "width:100%;padding:8px;box-sizing:border-box";

      const rename = document.createElement("button");
      rename.textContent = "✏️ Rename";
      rename.type = "button";
      rename.onclick = async () => {
        if (!newName.value.trim()) {
          alert("पहले नया नाम लिखें।");
          return;
        }

        try {
          await navigator.clipboard.writeText(file.name);
        } catch (e) {
          alert("पुराना नाम कॉपी नहीं हुआ: " + file.name);
        }

        alert(
          "पुराना नाम कॉपी किया गया। GitHub Actions में Filename में Paste करें और New filename में नया नाम लिखें: " +
          newName.value.trim()
        );

        window.open(
          "https://github.com/sahusatish40-bit/govt-boys-ms-g-jamgaon/actions/workflows/gallery-manager.yml",
          "_blank"
        );
      };

      const remove = document.createElement("button");
      remove.textContent = "🗑️ Delete";
      remove.type = "button";
      remove.onclick = async () => {
        if (!confirm("क्या यह फोटो हटानी है?\n" + file.name)) return;

        try {
          await navigator.clipboard.writeText(file.name);
        } catch (e) {
          alert("फोटो का नाम: " + file.name);
        }

        alert("GitHub Actions में Action = delete चुनें और Filename में फोटो का नाम Paste करें।");

        window.open(
          "https://github.com/sahusatish40-bit/govt-boys-ms-g-jamgaon/actions/workflows/gallery-manager.yml",
          "_blank"
        );
      };

      card.append(img, name, newName, rename, remove);
      box.appendChild(card);
    });

  } catch (error) {
    box.textContent = "त्रुटि: " + error.message;
  }
}


    el("refreshAdminDashboard")?.addEventListener("click", refreshAdminDashboard);

    const loginBox = el("loginBox");
    const adminTools = el("adminTools");
    const loginMessage = el("loginMessage");
    const adminMessage = el("adminMessage");
    const studentMessage = el("studentMessage");
    const studentList = el("studentList");
    const studentFilter = el("studentFilter");
const studentSearch = el("studentSearch");
    let students = [];
    let stopStudents = null;
    let exams = [];



    // Student Creativity Corner: public submissions are pending until admin approval.
    const creativityGallery = document.getElementById("creativityGallery");
    const creativityAdminList = document.getElementById("creativityAdminList");
    const creativeSubmitMessage = document.getElementById("creativeSubmitMessage");
    const creativeCategoryLabels = ["कला एवं चित्रकारी","कहानी, कविता एवं लेखन","विज्ञान एवं नवाचार मॉडल","गायन, नृत्य एवं अभिनय","मेरी उपलब्धियाँ","पुस्तक समीक्षा","हरित विद्यालय गतिविधि","ज्ञान चुनौती"];

    function safeHttpsUrl(value) {
      if (!value) return "";
      try { const u = new URL(value); return u.protocol === "https:" ? u.href : null; }
      catch (_) { return null; }
    }

    function makeCreativityCard(item, adminMode) {
      const card = document.createElement("article"); card.className = "creativity-card";
      const tag = document.createElement("span"); tag.className = "creativity-tag"; tag.textContent = item.category || "विद्यार्थी रचना"; card.appendChild(tag);
      const title = document.createElement("h3"); title.textContent = item.title || "शीर्षक"; card.appendChild(title);
      const meta = document.createElement("p"); meta.className = "creativity-meta"; meta.textContent = (item.studentName || "विद्यार्थी") + " • कक्षा " + (item.className || "—"); card.appendChild(meta);
      const body = document.createElement("p"); body.className = "creativity-description"; body.textContent = item.description || ""; card.appendChild(body);
      if (item.mediaUrl) { const link = document.createElement("a"); link.href = item.mediaUrl; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = "📎 फोटो / वीडियो देखें"; card.appendChild(link); }
      if (adminMode) {
        const status = document.createElement("p"); status.className = "creativity-meta"; status.textContent = "स्थिति: " + (item.status === "approved" ? "प्रकाशित" : item.status === "rejected" ? "अस्वीकृत" : "लंबित"); card.appendChild(status);
        const actions = document.createElement("div"); actions.className = "creativity-actions";
        if (item.status !== "approved") { const approve = document.createElement("button"); approve.type="button"; approve.textContent="✓ प्रकाशित करें"; approve.onclick=async()=>{try{await db.collection("creativity_submissions").doc(item.id).update({status:"approved",reviewedAt:firebase.firestore.FieldValue.serverTimestamp()});}catch(e){alert("प्रकाशित नहीं हुआ: "+e.message);}}; actions.appendChild(approve); }
        if (item.status !== "rejected") { const reject = document.createElement("button"); reject.type="button"; reject.className="secondary"; reject.textContent="अस्वीकृत"; reject.onclick=async()=>{try{await db.collection("creativity_submissions").doc(item.id).update({status:"rejected"});}catch(e){alert("अपडेट नहीं हुआ: "+e.message);}}; actions.appendChild(reject); }
        const remove = document.createElement("button"); remove.type="button"; remove.className="danger"; remove.textContent="हटाएँ"; remove.onclick=async()=>{if(confirm("क्या यह रचना हटानी है?")){try{await db.collection("creativity_submissions").doc(item.id).delete();}catch(e){alert("हटाया नहीं जा सका: "+e.message);}}}; actions.appendChild(remove); card.appendChild(actions);
      }
      return card;
    }

    if (creativityGallery) {
      db.collection("creativity_submissions").where("status","==","approved").onSnapshot(snap=>{
        creativityGallery.innerHTML="";
        if(snap.empty){creativityGallery.textContent="अभी कोई रचना प्रकाशित नहीं हुई है। बच्चों की रचनाएँ जल्द यहाँ दिखाई देंगी।";return;}
        snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).forEach(item=>creativityGallery.appendChild(makeCreativityCard(item,false)));
      },err=>{creativityGallery.textContent="रचनाएँ लोड नहीं हुईं: "+err.message;});
    }

    const submitCreativityButton = document.getElementById("submitCreativity");
    if (submitCreativityButton) submitCreativityButton.addEventListener("click",async()=>{
      const studentName=document.getElementById("creativeName").value.trim();
      const className=document.getElementById("creativeClass").value;
      const category=document.getElementById("creativeCategory").value;
      const title=document.getElementById("creativeTitle").value.trim();
      const description=document.getElementById("creativeDescription").value.trim();
      const rawMedia=document.getElementById("creativeMedia").value.trim();
      const mediaUrl=safeHttpsUrl(rawMedia);
      if(!studentName||!className||!title||!description){creativeSubmitMessage.textContent="कृपया नाम, कक्षा, शीर्षक और रचना भरें।";return;}
      if(!creativeCategoryLabels.includes(category)||studentName.length>80||title.length>100||description.length>1800){creativeSubmitMessage.textContent="कृपया सही जानकारी भरें।";return;}
      if(rawMedia && !mediaUrl){creativeSubmitMessage.textContent="मीडिया लिंक https:// से शुरू होना चाहिए।";return;}
      submitCreativityButton.disabled=true; creativeSubmitMessage.textContent="रचना भेजी जा रही है…";
      try{
        await db.collection("creativity_submissions").add({studentName,className,category,title,description,mediaUrl,status:"pending",createdAt:firebase.firestore.FieldValue.serverTimestamp()});
        ["creativeName","creativeClass","creativeTitle","creativeDescription","creativeMedia"].forEach(id=>document.getElementById(id).value="");
        creativeSubmitMessage.textContent="धन्यवाद! आपकी रचना शिक्षक के पास समीक्षा के लिए भेज दी गई है। स्वीकृति के बाद वेबसाइट पर दिखाई देगी।";
      }catch(e){creativeSubmitMessage.textContent="रचना भेजी नहीं जा सकी: "+e.message+" (Firebase Rules प्रकाशित होने की जाँच करें।)";}
      finally{submitCreativityButton.disabled=false;}
    });

    let stopCreativityAdmin = null;
    function beginCreativityAdmin(){
      if(!creativityAdminList||stopCreativityAdmin)return;
      stopCreativityAdmin=db.collection("creativity_submissions").orderBy("createdAt","desc").onSnapshot(snap=>{
        creativityAdminList.innerHTML="";
        if(snap.empty){creativityAdminList.textContent="अभी कोई रचना प्राप्त नहीं हुई है।";return;}
        snap.docs.forEach(d=>creativityAdminList.appendChild(makeCreativityCard({id:d.id,...d.data()},true)));
      },err=>{creativityAdminList.textContent="सूची लोड नहीं हुई: "+err.message;});
    }

    // Birthday cards: public read, admin-only writes.
    const birthdayTodayBox = document.getElementById("birthdayToday");
    const birthdayListBox = document.getElementById("birthdayList");
    const adminBirthdayList = el("adminBirthdayList");

    function birthdayDateParts(value) {
      if (!value) return null;
      const text = String(value).trim();
      let day, month, year;
      let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (match) {
        year = Number(match[1]); month = Number(match[2]); day = Number(match[3]);
      } else {
        match = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
        if (!match) return null;
        day = Number(match[1]); month = Number(match[2]); year = Number(match[3]);
      }
      const check = new Date(year, month - 1, day);
      if (month < 1 || month > 12 || day < 1 || day > 31 ||
          check.getFullYear() !== year || check.getMonth() !== month - 1 ||
          check.getDate() !== day) return null;
      return { month, day };
    }

    function nextBirthdayDate(value, base) {
      const parts = birthdayDateParts(value);
      if (!parts) return null;
      const next = new Date(base.getFullYear(), parts.month - 1, parts.day);
      next.setHours(0,0,0,0);
      if (next < base) next.setFullYear(next.getFullYear() + 1);
      return next;
    }

    function renderBirthdayCards(snapshot) {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayKey = String(today.getMonth()+1).padStart(2,"0") + "-" + String(today.getDate()).padStart(2,"0");
      const valid = items.map(item => {
        const parts = birthdayDateParts(item.birthDate);
        return parts ? { ...item, parts, nextDate: nextBirthdayDate(item.birthDate, today) } : null;
      }).filter(Boolean).sort((a,b) => a.nextDate - b.nextDate);

      const todays = valid.filter(x => String(x.parts.month).padStart(2,"0")+"-"+String(x.parts.day).padStart(2,"0") === todayKey);
      birthdayTodayBox.innerHTML = "";
      if (!todays.length) {
        const empty = document.createElement("p");
        empty.className = "birthday-empty";
        empty.textContent = "आज विद्यालय में किसी का जन्मदिन दर्ज नहीं है। आने वाले जन्मदिन नीचे देखें।";
        birthdayTodayBox.appendChild(empty);
      } else {
        todays.forEach(person => birthdayTodayBox.appendChild(makeBirthdayCard(person, true)));
      }

      birthdayListBox.innerHTML = "";
      const upcoming = valid.filter(x => {
        const days = Math.round((x.nextDate - today) / 86400000);
        return days > 0;
      }).slice(0, 12);
      if (!upcoming.length) {
        birthdayListBox.textContent = "अभी आने वाले जन्मदिन दर्ज नहीं हैं।";
      } else {
        upcoming.forEach(person => birthdayListBox.appendChild(makeBirthdayCard(person, false)));
      }

      if (adminBirthdayList) {
        const birthdayCountLabel = el("adminBirthdayCount");
        if (birthdayCountLabel) birthdayCountLabel.textContent = items.length + " रिकॉर्ड";
        adminBirthdayList.innerHTML = "";
        if (!items.length) adminBirthdayList.textContent = "अभी कोई जन्मदिन दर्ज नहीं है।";
        items.sort((a,b)=>(a.name||"").localeCompare(b.name||"")).forEach(person => {
          const row = document.createElement("div");
          row.className = "birthday-admin-row";
          const label = document.createElement("span");
          label.textContent = (person.role || "") + " — " + (person.name || "") + " (" + (person.birthDate || "") + ")";
          const del = document.createElement("button");
          del.type = "button";
          del.textContent = "हटाएँ";
          del.onclick = async () => {
            if (confirm("क्या " + (person.name || "यह रिकॉर्ड") + " का जन्मदिन रिकॉर्ड हटाएँ?")) {
              try { await db.collection("birthdays").doc(person.id).delete(); }
              catch (error) { alert("रिकॉर्ड नहीं हट सका: " + error.message); }
            }
          };
          row.append(label, del);
          adminBirthdayList.appendChild(row);
        });
      }
    }

    function makeBirthdayCard(person, isToday) {
      const card = document.createElement("article");
      card.className = "birthday-card" + (isToday ? " birthday-card-today" : "");
      const photo = document.createElement("div");
      photo.className = "birthday-photo";
      if (person.photo) {
        const img = document.createElement("img");
        img.src = person.photo;
        img.alt = person.name || "जन्मदिन";
        img.loading = "lazy";
        img.onerror = () => { photo.textContent = "🎂"; };
        photo.appendChild(img);
      } else {
        photo.textContent = person.role === "शिक्षक" ? "👩‍🏫" : "🎓";
      }
      const title = document.createElement("h3");
      title.textContent = person.name || "जन्मदिन";
      const detail = document.createElement("p");
      detail.textContent = (person.role || "विद्यालय परिवार") + (person.detail ? " • " + person.detail : "");
      const date = document.createElement("p");
      date.className = "birthday-date";
      date.textContent = new Date(person.birthDate + "T00:00:00").toLocaleDateString("hi-IN", {day:"numeric",month:"long"});
      const wishes = document.createElement("p");
      wishes.className = "birthday-wishes";
      wishes.textContent = isToday ? "🎉 जन्मदिन की हार्दिक शुभकामनाएँ! आपका दिन खुशियों से भरा हो।" : "आपके आने वाले जन्मदिन के लिए ढेरों शुभकामनाएँ!";
      const actions = document.createElement("div");
      actions.className = "birthday-actions";
      const share = document.createElement("button");
      share.type = "button";
      share.textContent = "WhatsApp शेयर";
      share.onclick = () => {
        const message = "🎂 जन्मदिन की हार्दिक शुभकामनाएँ!\\n" + person.name + "\\n" + (person.role || "") + (person.detail ? " • " + person.detail : "") + "\\nशासकीय उच्चतर माध्यमिक विद्यालय जी-जामगाँव (बालक माध्य.)";
        window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank", "noopener");
      };
      const print = document.createElement("button");
      print.type = "button";
      print.textContent = "कार्ड प्रिंट / PDF";
      print.onclick = () => {
        const w = window.open("", "_blank");
        if (!w) return alert("कृपया इस वेबसाइट के लिए पॉप-अप की अनुमति दें।");
        const safeName = String(person.name || "").replace(/[&<>"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
        w.document.write("<!doctype html><html lang='hi'><meta charset='utf-8'><title>Birthday Card</title><style>body{font-family:Arial,sans-serif;background:#fff7e9;display:grid;place-items:center;min-height:95vh}.card{max-width:650px;margin:25px;padding:45px;text-align:center;border:8px double #d6a83d;border-radius:28px;background:linear-gradient(145deg,#fff,#fff1d6);color:#173b60}.emoji{font-size:58px}.name{font-size:36px;color:#b83270}.school{margin-top:30px;font-weight:bold}</style><div class='card'><div class='emoji'>🎂🎈🎉</div><h1>Happy Birthday!</h1><div class='name'>"+safeName+"</div><h2>"+(person.role || "")+"</h2><p>"+(person.detail || "")+"</p><p>आपका जीवन खुशियों, स्वास्थ्य और सफलता से भरा रहे।</p><div class='school'>शासकीय उच्चतर माध्यमिक विद्यालय जी-जामगाँव (बालक माध्य.)</div></div><script>window.onload=function(){window.print()}<\/script></html>");
        w.document.close();
      };
      actions.append(share, print);
      card.append(photo, title, detail, date, wishes, actions);
      return card;
    }

    // Admin-triggered sync: copy only name, class and month/day into public birthday cards.
    const syncBirthdayButton = el("syncStudentBirthdays");
    if (syncBirthdayButton) {
      syncBirthdayButton.onclick = async () => {
        const message = el("syncBirthdayMessage");
        syncBirthdayButton.disabled = true;
        show(message, "विद्यार्थियों की जन्मतिथि जाँची जा रही है...");
        try {
          // Student data is stored in split public/private collections.
          const [publicSnap, privateSnap, legacySnap] = await Promise.all([
            db.collection("students_public").get(),
            db.collection("students_private").get(),
            db.collection("students").get()
          ]);
          const privateById = new Map(privateSnap.docs.map(doc => [doc.id, doc.data()]));
          const combined = [];
          publicSnap.docs.forEach(doc => {
            const pub = doc.data();
            const priv = privateById.get(doc.id) || {};
            combined.push({ id: doc.id, name: pub.name, className: pub.className, dob: priv.dob });
          });
          // Also include any legacy student records not represented in the split collections.
          legacySnap.docs.forEach(doc => {
            if (!combined.some(item => item.id === doc.id)) {
              combined.push({ id: doc.id, ...doc.data() });
            }
          });
          let count = 0;
          let batch = db.batch();
          let writes = 0;
          for (const student of combined) {
            const parts = birthdayDateParts(student.dob);
            if (!student.name || !parts) continue;
            const birthdayRef = db.collection("birthdays").doc("student_" + student.id);
            batch.set(birthdayRef, {
              role: "विद्यार्थी",
              name: student.name,
              detail: "कक्षा " + (student.className || ""),
              birthDate: "2000-" + String(parts.month).padStart(2, "0") + "-" + String(parts.day).padStart(2, "0"),
              photo: "",
              source: "student_dob",
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            count++;
            writes++;
            if (writes === 450) {
              await batch.commit();
              batch = db.batch();
              writes = 0;
            }
          }
          if (writes) await batch.commit();
          show(message, count + " विद्यार्थियों के Birthday Card अपडेट हो गए। (कुल रिकॉर्ड जाँचे: " + combined.length + ")");
        } catch (error) {
          show(message, "अपडेट नहीं हो सका: " + error.message);
        } finally {
          syncBirthdayButton.disabled = false;
        }
      };
    }

    db.collection("birthdays").onSnapshot(renderBirthdayCards, error => {
      console.error("Birthday list error:", error);
      birthdayListBox.textContent = "जन्मदिन की सूची लोड नहीं हो सकी।";
      birthdayTodayBox.textContent = "जन्मदिन की जानकारी अभी उपलब्ध नहीं है।";
    });

    el("saveBirthday").onclick = async () => {
      const role = el("birthdayRole").value;
      const name = el("birthdayName").value.trim();
      const birthDate = el("birthdayDate").value;
      const detail = el("birthdayDetail").value.trim();
      const photo = el("birthdayPhoto").value.trim();
      if (!name || !birthDate) return show(el("birthdayMessage"), "नाम और जन्मतिथि आवश्यक हैं।");
      if (photo && !/^https:\/\//i.test(photo)) return show(el("birthdayMessage"), "फोटो लिंक https:// से शुरू होना चाहिए।");
      try {
        await db.collection("birthdays").add({
          role, name, detail, birthDate, photo,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: auth.currentUser.uid
        });
        ["birthdayName","birthdayDetail","birthdayDate","birthdayPhoto"].forEach(id => el(id).value = "");
        show(el("birthdayMessage"), "जन्मदिन कार्ड सफलतापूर्वक जोड़ दिया गया।");
      } catch (error) {
        show(el("birthdayMessage"), "सेव नहीं हो सका: " + error.message);
      }
    };


    function renderNotices(snap) {
      if (!noticeList) return;

      noticeList.innerHTML = "";

      if (snap.empty) {
        noticeList.textContent = "अभी कोई नई सूचना उपलब्ध नहीं है।";
        return;
      }

      snap.forEach(doc => {
        const d = doc.data();
        const a = document.createElement("article");
        const t = document.createElement("b");
        const date = document.createElement("time");

        a.className = "notice";
        t.textContent = d.text || "";

        date.textContent = d.createdAt
          ? d.createdAt.toDate().toLocaleDateString("hi-IN")
          : "नई सूचना";

        a.append(date, t);
        if(d.posterDataUrl){a.classList.add("notice-with-poster");const im=document.createElement("img");im.className="notice-poster-image";im.src=d.posterDataUrl;im.alt="सूचना पोस्टर";im.loading="lazy";a.appendChild(im);const actions=document.createElement("div");actions.className="poster-actions";const dl=document.createElement("a");dl.className="poster-download";dl.href=d.posterDataUrl;dl.download="school-notice-poster.jpg";dl.textContent="📥 पोस्टर डाउनलोड करें";const view=document.createElement("a");view.className="poster-view";view.href=d.posterDataUrl;view.target="_blank";view.rel="noopener";view.textContent="🔍 बड़ा देखें";actions.append(dl,view);a.appendChild(actions);}

        if (auth.currentUser?.uid === ADMIN_UID) {
          const b = document.createElement("button");
          b.textContent = "हटाएँ";

          b.onclick = async () => {
            if (confirm("क्या यह सूचना हटाएँ?")) {
              try {
                await db.collection("notices").doc(doc.id).delete();
              } catch (e) {
                alert(e.message);
              }
            }
          };

          a.appendChild(b);
        }

        noticeList.appendChild(a);
      });
    }

    db.collection("notices")
      .orderBy("createdAt", "desc")
      .limit(30)
      .onSnapshot(
        
        renderNotices,
        e => {
          console.error(e);
          if (noticeList) {
            noticeList.textContent = "सूचनाएँ लोड नहीं हो सकीं।";
          }
        }
      );
// UPCOMING EVENTS CALENDAR
const eventCalendar = document.getElementById("eventCalendar");

if (eventCalendar) {
  db.collection("events")
    .orderBy("eventDate", "asc")
    .onSnapshot(snapshot => {
      eventCalendar.innerHTML = "";

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingEvents = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event =>
          event.eventDate &&
          new Date(event.eventDate + "T00:00:00") >= today
        );

      if (upcomingEvents.length === 0) {
        eventCalendar.textContent =
          "अभी कोई आगामी कार्यक्रम उपलब्ध नहीं है।";
        return;
      }

      upcomingEvents.forEach(event => {
        const card = document.createElement("article");
        card.className = "event-card";

        const date = document.createElement("time");
        date.textContent = new Date(
          event.eventDate + "T00:00:00"
        ).toLocaleDateString("hi-IN", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });

        const type = document.createElement("span");
        type.className = "event-type";
        type.textContent = event.type || "कार्यक्रम";

        const title = document.createElement("h3");
        title.textContent = event.title || "";

        const description = document.createElement("p");
        description.textContent = event.description || "";

        card.append(date, type, title, description);
        if(event.posterDataUrl){card.classList.add("event-with-poster");const im=document.createElement("img");im.className="notice-poster-image";im.src=event.posterDataUrl;im.alt=event.title+" पोस्टर";im.loading="lazy";card.appendChild(im);const actions=document.createElement("div");actions.className="poster-actions";const dl=document.createElement("a");dl.className="poster-download";dl.href=event.posterDataUrl;dl.download="school-event-poster.jpg";dl.textContent="📥 पोस्टर डाउनलोड करें";const view=document.createElement("a");view.className="poster-view";view.href=event.posterDataUrl;view.target="_blank";view.rel="noopener";view.textContent="🔍 बड़ा देखें";actions.append(dl,view);card.appendChild(actions);}
        eventCalendar.appendChild(card);
      });
    }, error => {
      console.error("Events loading error:", error);
      eventCalendar.textContent = "कार्यक्रम लोड नहीं हो सके।";
    });
}
    function renderStudents() {
      studentList.innerHTML = "";

      const query = (studentSearch?.value || "").trim().toLocaleLowerCase();

const list = students.filter(s => {
  const classMatch =
    studentFilter.value === "all" ||
    s.className === studentFilter.value;

  const searchMatch =
    !query ||
    String(s.name || "").toLocaleLowerCase().includes(query) ||
    String(s.rollNo || "").toLocaleLowerCase().includes(query);

  return classMatch && searchMatch;
});

      const studentCountLabel = el("studentListCount");
      if (studentCountLabel) studentCountLabel.textContent = list.length + " विद्यार्थी";
      if (!list.length) {
        studentList.textContent =
          "इस कक्षा में विद्यार्थी उपलब्ध नहीं हैं।";
        return;
      }

      const table = document.createElement("table");
      table.style.cssText = "width:100%;border-collapse:collapse";

      const h = document.createElement("tr");

      ["कक्षा", "रोल नं.", "विद्यार्थी", "अभिभावक",
       "जन्मतिथि", "मोबाइल", "कार्यवाही"].forEach(x => {
        const th = document.createElement("th");
        th.textContent = x;
        h.appendChild(th);
      });

      table.appendChild(h);

      list.forEach(s => {
        const tr = document.createElement("tr");

        [s.className, s.rollNo, s.name,
         s.guardianName || "—", s.dob || "—",
         s.mobile || "—"].forEach(v => {
          const td = document.createElement("td");
          td.textContent = v;
          tr.appendChild(td);
        });

        const td = document.createElement("td");
        const edit = document.createElement("button");
        const del = document.createElement("button");

        edit.textContent = "Edit";
        del.textContent = "हटाएँ";
               edit.onclick = async () => {
          const fields = [
            ["name", "विद्यार्थी का नाम", s.name],
            ["className", "कक्षा (6, 7 या 8)", s.className],
            ["rollNo", "रोल नंबर", s.rollNo],
            ["guardianName", "अभिभावक का नाम", s.guardianName || ""],
            ["dob", "जन्मतिथि (YYYY-MM-DD)", s.dob || ""],
            ["address", "पूरा पता", s.address || ""],
            ["mobile", "मोबाइल नंबर", s.mobile || ""],
            ["photoUrl", "विद्यार्थी फोटो लिंक", s.photoUrl || ""]
          ];

          const v = {};

          for (const [k, label, old] of fields) {
            v[k] = prompt(label, old);
            if (v[k] === null) return;
          }

          if (
            !v.name.trim() ||
            !v.rollNo.trim() ||
            !["6", "7", "8"].includes(v.className.trim())
          ) {
            return alert("नाम, सही कक्षा और रोल नंबर आवश्यक हैं।");
          }

          if (
            v.mobile.trim() &&
            !/^[0-9+() -]{8,15}$/.test(v.mobile.trim())
          ) {
            return alert("सही मोबाइल नंबर लिखें।");
          }

          try {
            const updated = {};

            Object.entries(v).forEach(([k, x]) => {
              updated[k] = x.trim();
            });

            await db.collection("students")
              .doc(s.id)
              .update(updated);

            alert("विद्यार्थी की जानकारी अपडेट हो गई।");
          } catch (e) {
            alert("अपडेट नहीं हुआ: " + e.message);
          }
        };

        del.onclick = async () => {
          if (confirm(`क्या ${s.name} का रिकॉर्ड हटाना चाहते हैं?`)) {
            try {
              await db.collection("students").doc(s.id).delete();
              show(studentMessage, "रिकॉर्ड हटा दिया गया।");
            } catch (e) {
              show(studentMessage, e.message);
            }
          }
        };

        const profile = document.createElement("details");
        profile.className = "student-profile-details";
        const profileSummary = document.createElement("summary");
        profileSummary.textContent = "प्रोफाइल देखें";
        profile.appendChild(profileSummary);
        const profileBody = document.createElement("div");
        profileBody.className = "student-profile-body";
        if (s.photoUrl && /^https:\/\//i.test(s.photoUrl)) {
          const photo = document.createElement("img");
          photo.src = s.photoUrl;
          photo.alt = s.name || "विद्यार्थी फोटो";
          photo.loading = "lazy";
          photo.referrerPolicy = "no-referrer";
          photo.className = "student-profile-photo";
          profileBody.appendChild(photo);
        }
        const profileTitle = document.createElement("strong");
        profileTitle.textContent = (s.name || "विद्यार्थी") + " · कक्षा " + s.className + " · रोल नं. " + s.rollNo;
        profileBody.appendChild(profileTitle);
        [["अभिभावक",s.guardianName],["जन्मतिथि",s.dob],["मोबाइल",s.mobile],["पता",s.address]].forEach(([label,value]) => {
          const line = document.createElement("p");
          line.textContent = label + ": " + (value || "—");
          profileBody.appendChild(line);
        });
        profile.appendChild(profileBody);
        td.append(edit, del, profile);
        tr.appendChild(td);
        table.appendChild(tr);
      });

      studentList.appendChild(table);
    }

    function beginStudentFeed() {
      if (stopStudents) stopStudents();

      stopStudents = db.collection("students")
        .orderBy("className")
        .onSnapshot(
          snap => {
            students = snap.docs.map(d => ({
              id: d.id,
              ...d.data()
            }));

            students.sort((a, b) =>
              a.className.localeCompare(b.className) ||
              String(a.rollNo).localeCompare(
                String(b.rollNo),
                undefined,
                { numeric: true }
              )
            );

            renderStudents();
          },
          e => {
            show(
              studentMessage,
              "विद्यार्थी सूची लोड नहीं हुई: " + e.message
            );
          }
        );
    }

    studentFilter.addEventListener("change", renderStudents);

studentSearch?.addEventListener("input", renderStudents);

// Digital Attendance: daily class register and month-wise summary.
const attendanceDateInput = el("attendanceDate");
const attendanceClassInput = el("attendanceClass");
const attendanceRosterBox = el("attendanceRoster");
const attendanceMessage = el("attendanceMessage");
const attendanceSaveButton = el("saveAttendance");
const attendanceMonthInput = el("attendanceMonth");
const attendanceReportBox = el("attendanceReport");
const attendanceReportMessage = el("attendanceReportMessage");
let attendanceRoster = [];

function localDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}
if (attendanceDateInput) attendanceDateInput.value = localDateString(new Date());
if (attendanceMonthInput) attendanceMonthInput.value = localDateString(new Date()).slice(0, 7);

function attendanceDocId(className, date) {
  return className + "_" + date;
}

function renderAttendanceRoster() {
  if (!attendanceRosterBox) return;
  attendanceRosterBox.innerHTML = "";
  if (!attendanceRoster.length) {
    attendanceRosterBox.textContent = "इस कक्षा में विद्यार्थी उपलब्ध नहीं हैं।";
    attendanceSaveButton.disabled = true;
    return;
  }
  const table = document.createElement("table");
  table.style.cssText = "width:100%;min-width:420px;border-collapse:collapse";
  const header = document.createElement("tr");
  ["रोल नंबर", "विद्यार्थी का नाम", "उपस्थिति"].forEach(label => {
    const th = document.createElement("th");
    th.textContent = label;
    th.style.cssText = "padding:9px;border:1px solid #cbd5e1;background:#eef4ff";
    header.appendChild(th);
  });
  table.appendChild(header);
  attendanceRoster.forEach(student => {
    const tr = document.createElement("tr");
    [student.rollNo || "—", student.name || "—"].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      td.style.cssText = "padding:8px;border:1px solid #cbd5e1";
      tr.appendChild(td);
    });
    const td = document.createElement("td");
    td.style.cssText = "padding:6px;border:1px solid #cbd5e1";
    const select = document.createElement("select");
    select.dataset.studentId = student.id;
    select.style.cssText = "min-width:125px;padding:7px";
    [["P", "उपस्थित"], ["A", "अनुपस्थित"]].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
    select.value = student.status || "P";
    td.appendChild(select);
    tr.appendChild(td);
    table.appendChild(tr);
  });
  attendanceRosterBox.appendChild(table);
  attendanceSaveButton.disabled = false;
}

async function loadDailyAttendance() {
  if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
    show(attendanceMessage, "केवल अधिकृत Admin उपस्थिति दर्ज कर सकता है।");
    return;
  }
  const className = attendanceClassInput.value;
  const date = attendanceDateInput.value;
  if (!date) return show(attendanceMessage, "तारीख चुनें।");
  const classStudents = students.filter(student => String(student.className) === className);
  if (!classStudents.length) {
    attendanceRoster = [];
    renderAttendanceRoster();
    return show(attendanceMessage, "इस कक्षा की विद्यार्थी सूची उपलब्ध नहीं है।");
  }
  show(attendanceMessage, "उपस्थिति रिकॉर्ड लोड हो रहा है...");
  attendanceRosterBox.textContent = "लोड हो रहा है...";
  attendanceSaveButton.disabled = true;
  try {
    const snap = await db.collection("attendance").doc(attendanceDocId(className, date)).get();
    const saved = snap.exists ? (snap.data().records || {}) : {};
    attendanceRoster = classStudents.map(student => ({
      id: student.id,
      name: student.name,
      rollNo: student.rollNo,
      status: saved[student.id]?.status || "P"
    }));
    renderAttendanceRoster();
    const present = attendanceRoster.filter(item => item.status === "P").length;
    const absent = attendanceRoster.length - present;
    show(attendanceMessage, date + " | कक्षा " + className + " | कुल " +
      attendanceRoster.length + " | उपस्थित " + present + " | अनुपस्थित " + absent +
      (snap.exists ? " | पहले से सेव रिकॉर्ड लोड हुआ।" : " | नया रिकॉर्ड — कृपया जाँचकर सेव करें।"));
  } catch (error) {
    attendanceRoster = [];
    renderAttendanceRoster();
    show(attendanceMessage, "उपस्थिति लोड नहीं हुई: " + error.message);
  }
}

el("loadAttendance")?.addEventListener("click", loadDailyAttendance);
attendanceClassInput?.addEventListener("change", loadDailyAttendance);
attendanceDateInput?.addEventListener("change", loadDailyAttendance);
el("allPresentAttendance")?.addEventListener("click", () => {
  attendanceRoster.forEach(student => student.status = "P");
  renderAttendanceRoster();
});
el("allAbsentAttendance")?.addEventListener("click", () => {
  attendanceRoster.forEach(student => student.status = "A");
  renderAttendanceRoster();
});

attendanceSaveButton?.addEventListener("click", async () => {
  if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
    return show(attendanceMessage, "केवल अधिकृत Admin रिकॉर्ड सेव कर सकता है।");
  }
  const date = attendanceDateInput.value;
  const className = attendanceClassInput.value;
  if (!date || !attendanceRoster.length) {
    return show(attendanceMessage, "पहले तारीख और विद्यार्थी सूची चुनें।");
  }
  const selects = attendanceRosterBox.querySelectorAll("select[data-student-id]");
  const records = {};
  selects.forEach(select => {
    const student = attendanceRoster.find(item => item.id === select.dataset.studentId);
    if (student) records[student.id] = {
      studentId: student.id,
      name: student.name || "",
      rollNo: String(student.rollNo || ""),
      status: select.value === "A" ? "A" : "P"
    };
  });
  if (Object.keys(records).length !== attendanceRoster.length) {
    return show(attendanceMessage, "सभी विद्यार्थियों की उपस्थिति जाँचें।");
  }
  attendanceSaveButton.disabled = true;
  show(attendanceMessage, "उपस्थिति सेव हो रही है...");
  try {
    await db.collection("attendance").doc(attendanceDocId(className, date)).set({
      date,
      className,
      records,
      totalStudents: attendanceRoster.length,
      presentCount: Object.values(records).filter(item => item.status === "P").length,
      absentCount: Object.values(records).filter(item => item.status === "A").length,
      updatedBy: auth.currentUser.uid,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    attendanceRoster.forEach(student => {
      student.status = records[student.id].status;
    });
    const present = Object.values(records).filter(item => item.status === "P").length;
    show(attendanceMessage, "उपस्थिति सेव हो गई। उपस्थित: " + present +
      " | अनुपस्थित: " + (attendanceRoster.length - present));
  } catch (error) {
    show(attendanceMessage, "सेव नहीं हुआ: " + error.message);
  } finally {
    attendanceSaveButton.disabled = false;
  }
});

async function loadMonthlyAttendance() {
  if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
    return show(attendanceReportMessage, "केवल अधिकृत Admin रिपोर्ट देख सकता है।");
  }
  const month = attendanceMonthInput.value;
  const className = el("attendanceReportClass").value;
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return show(attendanceReportMessage, "माह चुनें।");
  }
  show(attendanceReportMessage, "मासिक रजिस्टर तैयार हो रहा है...");
  attendanceReportBox.innerHTML = "";
  try {
    const snap = await db.collection("attendance")
      .where("date", ">=", month + "-01")
      .where("date", "<=", month + "-31")
      .get();
    const sessions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => String(item.className) === className &&
        typeof item.date === "string" && item.date.startsWith(month))
      .sort((a, b) => a.date.localeCompare(b.date));
    const classStudents = students.filter(student => String(student.className) === className);
    const totalDays = sessions.length;
    const totalPossible = sessions.reduce((sum, item) => sum + Object.keys(item.records || {}).length, 0);
    const totalPresent = sessions.reduce((sum, item) =>
      sum + Object.values(item.records || {}).filter(record => record.status === "P").length, 0);
    const totalAbsent = totalPossible - totalPresent;
    const overallPercent = totalPossible ? totalPresent / totalPossible * 100 : 0;

    const summary = document.createElement("p");
    summary.textContent = "कक्षा " + className + " | " + month +
      " | दर्ज कार्यदिवस: " + totalDays + " | कुल उपस्थितियाँ: " + totalPresent +
      " | अनुपस्थितियाँ: " + totalAbsent + " | औसत उपस्थिति: " + overallPercent.toFixed(2) + "%";
    attendanceReportBox.appendChild(summary);

    const table = document.createElement("table");
    table.style.cssText = "width:100%;min-width:560px;border-collapse:collapse";
    const header = document.createElement("tr");
    ["रोल नं.", "विद्यार्थी", "उपस्थित दिन", "अनुपस्थित दिन", "उपस्थिति %"].forEach(label => {
      const th = document.createElement("th");
      th.textContent = label;
      th.style.cssText = "padding:8px;border:1px solid #cbd5e1;background:#eef4ff";
      header.appendChild(th);
    });
    table.appendChild(header);

    const studentSummaries = classStudents.map(student => {
      let present = 0, absent = 0;
      sessions.forEach(session => {
        const record = session.records?.[student.id];
        if (record?.status === "P") present++;
        else if (record?.status === "A") absent++;
      });
      const markedDays = present + absent;
      return {
        student,
        present,
        absent,
        percent: markedDays ? present / markedDays * 100 : 0
      };
    });
    studentSummaries.sort((a, b) =>
      String(a.student.rollNo || "").localeCompare(String(b.student.rollNo || ""), undefined, {numeric:true})
    );
    studentSummaries.forEach(item => {
      const tr = document.createElement("tr");
      [
        item.student.rollNo || "—",
        item.student.name || "—",
        item.present,
        item.absent,
        item.percent.toFixed(2) + "%"
      ].forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        td.style.cssText = "padding:7px;border:1px solid #cbd5e1;text-align:center";
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    attendanceReportBox.appendChild(table);

    const absentHeading = document.createElement("h4");
    absentHeading.textContent = "अनुपस्थित विद्यार्थियों की तारीखवार सूची";
    attendanceReportBox.appendChild(absentHeading);
    const absentList = document.createElement("div");
    if (!sessions.some(session => Object.values(session.records || {}).some(record => record.status === "A"))) {
      absentList.textContent = "इस माह दर्ज रिकॉर्ड में कोई अनुपस्थित विद्यार्थी नहीं है।";
    } else {
      sessions.forEach(session => {
        const absentNames = Object.values(session.records || {})
          .filter(record => record.status === "A")
          .map(record => (record.rollNo ? record.rollNo + " — " : "") + record.name);
        if (absentNames.length) {
          const line = document.createElement("p");
          line.textContent = session.date + ": " + absentNames.join(", ");
          absentList.appendChild(line);
        }
      });
    }
    attendanceReportBox.appendChild(absentList);

    const printButton = document.createElement("button");
    printButton.type = "button";
    printButton.textContent = "🖨️ मासिक रजिस्टर प्रिंट / PDF";
    printButton.onclick = () => {
      const win = window.open("", "_blank");
      if (!win) return alert("प्रिंट विंडो खोलने के लिए Pop-up अनुमति दें।");
      const reportHtml = attendanceReportBox.innerHTML;
      win.document.write("<!doctype html><html><head><meta charset='UTF-8'><title>मासिक उपस्थिति रजिस्टर</title>" +
        "<style>body{font-family:Arial,sans-serif;padding:18px}h2,p{text-align:center}table{width:100%;border-collapse:collapse}" +
        "th,td{border:1px solid #555;padding:6px;text-align:center;font-size:12px}h3,h4{margin-top:20px}</style></head><body>" +
        "<h2>शासकीय उच्चतर माध्यमिक विद्यालय जी- जामगाँव (बालक माध्य.)</h2>" +
        "<p>वि.ख. कुरुद, जिला धमतरी (छ.ग.)</p><h3>मासिक उपस्थिति रजिस्टर</h3>" +
        reportHtml + "<script>window.onload=function(){window.print()}<\\/script></body></html>");
      win.document.close();
    };
    attendanceReportBox.appendChild(printButton);
    show(attendanceReportMessage, totalDays
      ? "रिपोर्ट तैयार है। " + classStudents.length + " विद्यार्थी और " + totalDays + " दर्ज कार्यदिवस।"
      : "इस माह की उपस्थिति अभी दर्ज नहीं है। विद्यार्थी सूची दिखाई गई है।");
  } catch (error) {
    show(attendanceReportMessage, "रिपोर्ट लोड नहीं हुई: " + error.message);
  }
}
el("loadAttendanceReport")?.addEventListener("click", loadMonthlyAttendance);
el("attendanceReportClass")?.addEventListener("change", loadMonthlyAttendance);
el("attendanceMonth")?.addEventListener("change", loadMonthlyAttendance);


// मुख्य Admin के लिए निजी विद्यार्थी विवरण
let privateStudentRecords = [];

function renderPrivateStudents() {
  const list = el("privateStudentList");
  const search = el("privateStudentSearch");
  const classFilter = el("privateClassFilter");

  if (!list) return;

  list.innerHTML = "";

  const query = (search.value || "").trim().toLowerCase();
  const selectedClass = classFilter.value;

  const filtered = privateStudentRecords.filter(item => {
    const name = (item.name || "").toLowerCase();

    const matchName = name.includes(query);
    const matchClass =
      selectedClass === "all" ||
      item.className === selectedClass;

    return matchName && matchClass;
  });

  if (!filtered.length) {
    list.textContent = "कोई विद्यार्थी नहीं मिला।";
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.style.cssText =
      "border:1px solid #bbb;padding:12px;margin:10px 0;border-radius:8px";

    const heading = document.createElement("h4");
    heading.textContent =
      item.name + " | कक्षा " + item.className +
      " | रोल नं. " + item.rollNo;
    card.appendChild(heading);

    item.fields.forEach(([label, value, sensitive]) => {
      const row = document.createElement("p");
      if (sensitive && value) {
        const labelText = document.createElement("span");
        labelText.textContent = label + ": ";
        const numberText = document.createElement("strong");
        numberText.textContent = "••••••••" + String(value).slice(-4);
        numberText.dataset.fullValue = String(value);
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.textContent = "देखें";
        toggle.style.marginLeft = "8px";
        toggle.onclick = () => {
          const revealed = toggle.dataset.revealed === "yes";
          numberText.textContent = revealed
            ? "••••••••" + String(value).slice(-4)
            : String(value);
          toggle.textContent = revealed ? "देखें" : "छिपाएँ";
          toggle.dataset.revealed = revealed ? "no" : "yes";
        };
        row.append(labelText, numberText, toggle);
      } else if (sensitive) {
        row.textContent = label + ": Excel/Firebase रिकॉर्ड में उपलब्ध नहीं";
      } else {
        row.textContent = label + ": " + (value || "—");
      }
      card.appendChild(row);
    });

    list.appendChild(card);
  });
}

el("privateStudentSearch").addEventListener(
  "input", renderPrivateStudents
);

el("privateClassFilter").addEventListener(
  "change", renderPrivateStudents
);

el("loadPrivateStudents").onclick = async () => {
  const message = el("privateStudentMessage");
  const btn = el("loadPrivateStudents");

  if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
    return show(message, "केवल मुख्य Admin यह जानकारी देख सकता है।");
  }

  btn.disabled = true;
  show(message, "निजी विवरण लोड हो रहे हैं...");

  try {
    const [publicSnap, privateSnap, studentsSnap] = await Promise.all([
      db.collection("students_public").get(),
      db.collection("students_private").get(),
      db.collection("students").get()
    ]);

    const publicMap = {};
    publicSnap.forEach(doc => { publicMap[doc.id] = doc.data(); });
    privateStudentRecords = [];

    privateSnap.forEach(doc => {
      const p = doc.data();
      const s = publicMap[doc.id] || {};
      privateStudentRecords.push({
        name: s.name || "नाम उपलब्ध नहीं",
        className: s.className || "",
        rollNo: s.rollNo || "",
        fields: [
          ["पिता का नाम", p.guardianName], ["माता का नाम", p.motherName],
          ["जाति", p.caste], ["प्रवेश क्रमांक", p.admissionNo],
          ["प्रवेश दिनांक", p.admissionDate], ["जन्मतिथि", p.dob],
          ["मोबाइल", p.mobile], ["ग्राम", p.village],
          ["छात्रवृत्ति", p.scholarship], ["श्रम कार्ड", p.shramCard],
          ["जाति प्रमाण पत्र", p.casteCertificate], ["निवास प्रमाण पत्र", p.domicile],
          ["PEN नंबर", p.penNo], ["APAAR ID", p.apaarId], ["आधार नंबर", p.aadhaarNo, true]
        ]
      });
    });

    if (privateSnap.empty && !studentsSnap.empty) {
      studentsSnap.forEach(doc => {
        const d = doc.data();
        privateStudentRecords.push({
          name: d.name || "नाम उपलब्ध नहीं",
          className: String(d.className || ""),
          rollNo: String(d.rollNo || ""),
          fields: [
            ["पिता/अभिभावक का नाम", d.guardianName],
            ["जन्मतिथि", d.dob], ["मोबाइल", d.mobile], ["पता", d.address],
            ["निजी Excel विवरण", "इस रिकॉर्ड में उपलब्ध नहीं — निजी रिकॉर्ड की जाँच आवश्यक है"]
          ]
        });
      });
    }

    renderPrivateStudents();
    const aadhaarCount = privateSnap.docs.filter(doc => {
      const value = String((doc.data() || {}).aadhaarNo || "").replace(/\D/g, "");
      return value.length === 12;
    }).length;
    const counts = "जाँच: Public " + publicSnap.size +
      " | Private " + privateSnap.size + " | Students " + studentsSnap.size +
      " | आधार सेव " + aadhaarCount + "। ";
    show(message, privateSnap.empty
      ? counts + "निजी Excel रिकॉर्ड नहीं मिले। नीचे सामान्य विद्यार्थी सूची दिखाई गई है।"
      : counts + "कुल " + privateStudentRecords.length + " निजी विद्यार्थी रिकॉर्ड लोड हुए। आधार उपलब्ध रिकॉर्ड: " + aadhaarCount + "।");
  } catch (error) {
    console.error(error);
    show(message, "डेटा पढ़ने में त्रुटि: " + error.message);
  } finally {
    btn.disabled = false;
  }
};



// Excel विद्यार्थी डेटा Preview
let excelStudentData = [];

el("previewExcel").onclick = async () => {
  const file = el("studentExcelFile").files[0];
  const message = el("excelImportMessage");
  const preview = el("excelPreview");
  const confirmBtn = el("confirmExcelImport");

  preview.innerHTML = "";
  confirmBtn.hidden = true;
  excelStudentData = [];

  if (!file) {
    return show(message, "पहले Excel फाइल चुनें।");
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    const classSheets = [
      { name: "class 6th", className: "6" },
      { name: "class 7th", className: "7" },
      { name: "class 8 th", className: "8" }
    ];

    classSheets.forEach(item => {
      const sheet = workbook.Sheets[item.name];

      if (!sheet) return;

      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: ""
      });

      rows.slice(2).forEach(row => {
        const name = String(row[1] || "").trim();
        if (!name) return;

        excelStudentData.push({
          name,
          className: item.className,
          rollNo: String(row[0]).trim(),
          guardianName: String(row[2] || "").trim(),
          motherName: String(row[3] || "").trim(),
          caste: String(row[4] || "").trim(),
          admissionNo: String(row[5] || "").trim(),
          admissionDate: String(row[6] || "").trim(),
          dob: String(row[7] || "").trim(),
          mobile: String(row[9] || "").trim(),
          aadhaarNo: String(row[10] || "").replace(/\s+/g, "").trim(),
          village: String(row[11] || "").trim(),
          scholarship: String(row[12] || "").trim(),
          shramCard: String(row[13] || "").trim(),
          casteCertificate: String(row[14] || "").trim(),
          domicile: String(row[15] || "").trim(),
          penNo: String(row[16] || "").trim(),
          apaarId: String(row[17] || "").trim()
        });
      });
    });

    if (!excelStudentData.length) {
      return show(message, "कोई विद्यार्थी रिकॉर्ड नहीं मिला।");
    }

    const table = document.createElement("table");
    table.style.cssText =
      "width:100%;border-collapse:collapse";

    table.innerHTML =
      "<tr><th>कक्षा</th><th>रोल नं.</th>" +
      "<th>विद्यार्थी का नाम</th><th>आधार स्थिति</th></tr>";

    excelStudentData.forEach(student => {
      const tr = document.createElement("tr");
      const aadhaar = String(student.aadhaarNo || "").replace(/\D/g, "");
      const aadhaarStatus = aadhaar.length === 12
        ? "उपलब्ध (अंतिम 4 अंक: " + aadhaar.slice(-4) + ")"
        : "नहीं मिला / 12 अंक नहीं";
      [student.className, student.rollNo, student.name, aadhaarStatus]
        .forEach(value => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });
      table.appendChild(tr);
    });

    preview.appendChild(table);
confirmBtn.hidden = false;

    const aadhaarReady = excelStudentData.filter(student =>
      /^\d{12}$/.test(String(student.aadhaarNo || "").replace(/\D/g, ""))
    ).length;
    show(
      message,
      "Preview तैयार: " + excelStudentData.length +
      " विद्यार्थी। आधार नंबर (12 अंक) उपलब्ध: " + aadhaarReady +
      "। आधार अनुपलब्ध/अपूर्ण: " + (excelStudentData.length - aadhaarReady) +
      "। कक्षा 9वीं शामिल नहीं है।"
    );

  } catch (error) {
    show(message, "Excel पढ़ने में त्रुटि: " + error.message);
  }
};

// Excel डेटा को सुरक्षित रूप से Firebase में Import करना
el("confirmExcelImport").onclick = async () => {
  const message = el("excelImportMessage");
  const confirmBtn = el("confirmExcelImport");

  if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
    return show(message, "केवल मुख्य Admin Import कर सकता है।");
  }

  if (!excelStudentData.length) {
    return show(message, "पहले Excel Preview करें।");
  }

  const ok = confirm(
    "क्या आप " + excelStudentData.length +
    " विद्यार्थियों का डेटा Firebase में सेव करना चाहते हैं?\n\n" +
    "सार्वजनिक जानकारी और निजी जानकारी अलग-अलग सेव होगी।\n" +
    "आधार नंबर केवल मुख्य Admin के निजी रिकॉर्ड में सेव होगा।"
  );

  if (!ok) return;

  confirmBtn.disabled = true;
  show(message, "डेटा Firebase में सेव हो रहा है...");

  try {
    const existingSnap = await db.collection("students").get();

const existingByKey = new Map();

existingSnap.forEach(doc => {
  const d = doc.data();
  const key = d.className + "|" + String(d.rollNo).trim();
  existingByKey.set(key, doc.id);
});

const batch = db.batch();

    excelStudentData.forEach(student => {
      const safeRoll = String(student.rollNo)
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      const docId =
        "class_" + student.className + "_roll_" + safeRoll;

      // सार्वजनिक जानकारी: केवल नाम, कक्षा और रोल नंबर
      const publicRef = db
        .collection("students_public")
        .doc(docId);

      batch.set(publicRef, {
        name: student.name,
        className: student.className,
        rollNo: student.rollNo,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // निजी जानकारी: केवल Admin के लिए
      const privateRef = db
        .collection("students_private")
        .doc(docId);

      batch.set(privateRef, {
        guardianName: student.guardianName,
        motherName: student.motherName,
        caste: student.caste,
        admissionNo: student.admissionNo,
        admissionDate: student.admissionDate,
        dob: student.dob,
        mobile: student.mobile,
        aadhaarNo: student.aadhaarNo,
        village: student.village,
        scholarship: student.scholarship,
        shramCard: student.shramCard,
        casteCertificate: student.casteCertificate,
        domicile: student.domicile,
        penNo: student.penNo,
        apaarId: student.apaarId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    // Student Management में भी विद्यार्थी सेव करें
const studentKey =
  student.className + "|" + String(student.rollNo).trim();

const studentDocId =
  existingByKey.get(studentKey) || docId;

const studentRef = db.collection("students").doc(studentDocId);

batch.set(studentRef, {
  name: student.name,
  createdBy: firebase.auth().currentUser.uid,
  className: student.className,
  rollNo: student.rollNo,
  guardianName: student.guardianName || "",
  dob: student.dob || "",
  address: student.village || "",
  mobile: student.mobile || "",
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
}, { merge: true });  
    });

    await batch.commit();

    const aadhaarSaved = excelStudentData.filter(student =>
      /^\d{12}$/.test(String(student.aadhaarNo || "").replace(/\D/g, ""))
    ).length;
    show(
      message,
      "सफलता! " + excelStudentData.length +
      " विद्यार्थियों का डेटा Firebase में सेव हुआ। आधार नंबर वाले रिकॉर्ड: " +
      aadhaarSaved + "। निजी विवरण खोलकर 'आधार सेव' संख्या भी जाँचें।"
    );

    confirmBtn.hidden = true;
    confirmBtn.disabled = false;

  } catch (error) {
    console.error("Excel Import Error:", error);
    show(message, "Import में त्रुटि: " + error.message);
    confirmBtn.disabled = false;
  }
};

// शिक्षक प्रबंधन: सूची, जोड़ना, एडिट और डिलीट

const teacherList = el("teacherList");
const teacherMessage = el("teacherMessage");

let teachers = [];

function renderTeachers() {
  teacherList.innerHTML = "";

  if (!teachers.length) {
    teacherList.textContent = "अभी कोई शिक्षक दर्ज नहीं है।";
    return;
  }

  teachers.forEach(t => {
    const box = document.createElement("div");
    box.style.cssText =
      "border:1px solid #ccc;padding:10px;margin:8px 0;border-radius:8px";

    const info = document.createElement("p");
    info.textContent =
      t.name + " | " + (t.post || "—") +
      " | " + (t.subject || "—") +
      " | " + (t.mobile || "—");

    const edit = document.createElement("button");
    edit.textContent = "Edit";

    edit.onclick = async () => {
      const name = prompt("शिक्षक का नाम", t.name);
      if (name === null) return;

      const post = prompt("पद", t.post || "");
      if (post === null) return;

      const subject = prompt("विषय", t.subject || "");
      if (subject === null) return;

      const mobile = prompt("मोबाइल नंबर", t.mobile || "");
      if (mobile === null) return;

      const photo = prompt("फोटो लिंक", t.photo || "");
      if (photo === null) return;

      if (!name.trim()) {
        alert("शिक्षक का नाम आवश्यक है।");
        return;
      }

      try {
        await db.collection("teachers").doc(t.id).update({
          name: name.trim(),
          post: post.trim(),
          subject: subject.trim(),
          mobile: mobile.trim(),
          photo: photo.trim()
        });

        show(teacherMessage, "शिक्षक की जानकारी अपडेट हो गई।");
      } catch (e) {
        show(teacherMessage, "त्रुटि: " + e.message);
      }
    };

    const del = document.createElement("button");
    del.textContent = "हटाएँ";

    del.onclick = async () => {
      if (!confirm("क्या इस शिक्षक का रिकॉर्ड हटाना चाहते हैं?")) return;

      try {
        await db.collection("teachers").doc(t.id).delete();
        show(teacherMessage, "शिक्षक का रिकॉर्ड हटा दिया गया।");
      } catch (e) {
        show(teacherMessage, "त्रुटि: " + e.message);
      }
    };

    box.append(info, edit, del);
    teacherList.appendChild(box);
  });
}

let stopTeachers = null;

function beginTeacherFeed() {
  if (stopTeachers) stopTeachers();

  stopTeachers = db.collection("teachers")
    .orderBy("name")
    .onSnapshot(
      snap => {
        teachers = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        
// Admin की शिक्षक सूची को सार्वजनिक Collection में सुरक्षित रूप से कॉपी करें
const publicBatch = db.batch();

snap.docs.forEach(doc => {
  const t = doc.data();

  publicBatch.set(
    db.collection("teachers_public").doc(doc.id),
    {
      name: t.name || "",
      post: t.post || "",
      subject: t.subject || "",
      photo: t.photo || ""
    },
    { merge: true }
  );
});

publicBatch.commit().catch(error => {
  console.error("Public teacher sync error:", error);
});

        renderTeachers();
      },
      e => show(
        teacherMessage,
        "शिक्षक सूची लोड नहीं हुई: " + e.message
      )
    );
}

el("saveTeacher").onclick = async () => {
  const name = el("teacherName").value.trim();

  if (!name) {
    return show(teacherMessage, "शिक्षक का नाम लिखें।");
  }

  try {
    await db.collection("teachers").add({
      name,
      post: el("teacherPost").value.trim(),
      subject: el("teacherSubject").value.trim(),
      mobile: el("teacherMobile").value.trim(),
      photo: el("teacherPhoto").value.trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser.uid
    });

    [
      "teacherName",
      "teacherPost",
      "teacherSubject",
      "teacherMobile",
      "teacherPhoto"
    ].forEach(id => el(id).value = "");

    show(teacherMessage, "शिक्षक सफलतापूर्वक जोड़ दिया गया।");
  } catch (e) {
    show(teacherMessage, "सेव नहीं हुआ: " + e.message);
  }
};
    // विषय और पूर्णांक पढ़ना
    function parseSubjects() {
      return el("examSubjects").value
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean)
        .map(line => {
          const p = line.split(",").map(x => x.trim());

          const theoryMax = Number(p[1]);
          const practicalMax = Number(p[2] || 0);

          if (
            !p[0] ||
            p.length < 2 ||
            !Number.isFinite(theoryMax) ||
!Number.isFinite(practicalMax) ||
theoryMax < 0 ||
practicalMax < 0 ||
theoryMax + practicalMax <= 0
) {
  throw Error("विषय की पंक्ति ऐसे लिखें: हिंदी,20,5");
}

return {
  name: p[0],
  theoryMax,
  practicalMax
};
});
}

// परीक्षा सूची लोड करना
async function loadExams() {
  if (auth.currentUser?.uid !== ADMIN_UID) return;

  try {
    const snap = await db.collection("exams")
      .orderBy("createdAt", "desc")
      .get();

    exams = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    el("examSelect").innerHTML =
      '<option value="">परीक्षा चुनें</option>';

    exams.forEach(x => {
      const o = document.createElement("option");
      o.value = x.id;
      o.textContent = x.title + " — कक्षा " + x.className;
      el("examSelect").appendChild(o);
    });

  } catch (e) {
    show(el("examMessage"), "परीक्षा सूची नहीं खुली: " + e.message);
  }
}

// नई परीक्षा बनाना
el("createExam").onclick = async () => {
  const title = el("examTitle").value.trim();

  if (!title) {
    return show(el("examMessage"), "परीक्षा का नाम लिखें।");
  }

  let subjects;

  try {
    subjects = parseSubjects();
  } catch (e) {
    return show(el("examMessage"), e.message);
  }

  if (!subjects.length) {
    return show(el("examMessage"), "कम से कम एक विषय जोड़ें।");
  }

  const b = el("createExam");
  b.disabled = true;

  try {
    await db.collection("exams").add({
      title,
      className: el("examClass").value,
      session: "2026-27",
      subjects,
      createdBy: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    el("examTitle").value = "";
    el("examSubjects").value = "";

    show(el("examMessage"), "परीक्षा बन गई।");
    await loadExams();

  } catch (e) {
    show(el("examMessage"), "परीक्षा सेव नहीं हुई: " + e.message);
  } finally {
    b.disabled = false;
  }
};
    el("examSelect").addEventListener("change", async () => {
      const examId = el("examSelect").value;
      const area = el("examMarksArea");

      area.innerHTML = "";

      if (!examId) return;

      const exam = exams.find(x => x.id === examId);
      if (!exam) return;

      const classStudents = students.filter(
        s => s.className === exam.className
      );

      if (!classStudents.length) {
        area.textContent = "इस कक्षा में विद्यार्थी उपलब्ध नहीं हैं।";
        return;
      }

      const heading = document.createElement("h3");
      heading.textContent = exam.title + " — कक्षा " + exam.className;
      area.appendChild(heading);

      const table = document.createElement("table");
      table.style.cssText =
        "width:100%;border-collapse:collapse;min-width:600px";

      const head = document.createElement("tr");

      ["विद्यार्थी", "रोल नंबर", "उपस्थिति", ...exam.subjects.map(s =>
        s.name + " (" + (s.theoryMax + s.practicalMax) + ")"
      )].forEach(x => {
        const th = document.createElement("th");
        th.textContent = x;
        head.appendChild(th);
      });

      table.appendChild(head);

      let savedMarks = {};

      try {
        const snap = await db.collection("exams")
          .doc(examId)
          .collection("marks")
          .get();

        snap.forEach(d => {
          savedMarks[d.id] = d.data();
        });
      } catch (e) {
        area.textContent = "अंक लोड नहीं हुए: " + e.message;
        return;
      }

      classStudents.forEach(student => {
        const tr = document.createElement("tr");

        const name = document.createElement("td");
        name.textContent = student.name;
        tr.appendChild(name);

        const roll = document.createElement("td");
        roll.textContent = student.rollNo;
        tr.appendChild(roll);
const attendance = document.createElement("select");
attendance.innerHTML =
  '<option value="P">उपस्थित (P)</option>' +
  '<option value="A">अनुपस्थित (A)</option>';

attendance.value = savedMarks[student.id]?.attendance || "P";

const attendanceTd = document.createElement("td");
attendanceTd.appendChild(attendance);
tr.appendChild(attendanceTd);
        exam.subjects.forEach((subject, index) => {
          const td = document.createElement("td");

          const old = savedMarks[student.id]?.marks?.[index] || {};

          const theory = document.createElement("input");
          theory.type = "number";
          theory.min = "0";
          theory.max = subject.theoryMax;
          theory.placeholder = "थ्योरी";
          theory.value = old.theory ?? "";
          theory.style.width = "65px";

          const practical = document.createElement("input");
          practical.type = "number";
          practical.min = "0";
          practical.max = subject.practicalMax;
          practical.placeholder = "प्रैक्टिकल";
          practical.value = old.practical ??
            "";
          practical.style.width = "75px";

          td.appendChild(theory);

          if (subject.practicalMax > 0) {
            td.appendChild(practical);
          }

          td.dataset.subjectIndex = index;
          td.appendChild(document.createElement("br"));

          tr.appendChild(td);
        });

        tr.dataset.studentId = student.id;
        table.appendChild(tr);
      });

      const wrapper = document.createElement("div");
      wrapper.style.overflowX = "auto";
      wrapper.appendChild(table);
      area.appendChild(wrapper);

      const saveButton = document.createElement("button");
      saveButton.textContent = "सभी अंक सेव करें";

      saveButton.onclick = async () => {
        saveButton.disabled = true;

        try {
          const batch = db.batch();

          for (const row of table.querySelectorAll("tr[data-student-id]")) {
            const studentId = row.dataset.studentId;
            const attendance = row.querySelector("select").value;
            const marks = [];

            for (const td of row.querySelectorAll("td[data-subject-index]")) {
              const index = Number(td.dataset.subjectIndex);
              const subject = exam.subjects[index];
              const inputs = td.querySelectorAll("input");

              const theory = Number(inputs[0].value || 0);
              const practical = subject.practicalMax > 0
                ? Number(inputs[1].value || 0)
                : 0;

              if (
                theory < 0 ||
                theory > subject.theoryMax ||
                practical < 0 ||
                practical > subject.practicalMax
              ) {
                throw Error("अंक पूर्णांक से अधिक नहीं हो सकते।");
              }

              marks.push({
                theory,
                practical,
                total: theory + practical
              });
            }

            const ref = db.collection("exams")
              .doc(examId)
              .collection("marks")
              .doc(studentId);

            batch.set(ref, {
              studentId,
              attendance,
              marks,
              updatedBy: auth.currentUser.uid,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }

          await batch.commit();
          show(el("examMessage"), "सभी अंक सफलतापूर्वक सेव हो गए।");
          alert("अंक सेव हो गए।");

        } catch (e) {
          alert("अंक सेव नहीं हुए: " + e.message);
        } finally {
          saveButton.disabled = false;
        }
      };

      area.appendChild(saveButton);
         // रिजल्ट और मार्कशीट 
      const resultBtn = document.createElement("button");
      resultBtn.textContent = "रिजल्ट / मार्कशीट देखें";

      resultBtn.onclick = async () => {
        try {
          const snap = await db.collection("exams")
            .doc(examId).collection("marks").get();

          const data = {};
          snap.forEach(d => data[d.id] = d.data());

          const results = classStudents.map(student => {
            const saved = data[student.id] || {};
            let obtained = 0;
            let maximum = 0;

            const rows = exam.subjects.map((sub, i) => {
              const m = saved.marks?.[i] || {};
              const theory = Number(m.theory || 0);
              const practical = Number(m.practical || 0);
              const total = theory + practical;
              const max = sub.theoryMax + sub.practicalMax;

              obtained += total;
              maximum += max;

              return {
                name: sub.name,
                theory,
                practical,
                total,
                max,
                theoryMax: sub.theoryMax,
                practicalMax: sub.practicalMax
              };
            });

            const percent = maximum ? obtained / maximum * 100 : 0;

            const grade = percent >= 91 ? "A+" :
              percent >= 81 ? "A" :
              percent >= 71 ? "B+" :
              percent >= 61 ? "B" :
              percent >= 51 ? "C+" :
              percent >= 41 ? "C" :
              percent >= 33 ? "D" : "E";

            return {
              student, rows, obtained, maximum, percent, grade
            };
          });

          const box = document.createElement("div");
          box.innerHTML = "<h3>कक्षा " + exam.className +
            " — " + exam.title + " का रिजल्ट</h3>";

          const table = document.createElement("table");
          table.style.cssText =
            "width:100%;border-collapse:collapse;min-width:600px";

          table.innerHTML =
            "<tr><th>रोल नं.</th><th>विद्यार्थी</th>" +
            "<th>प्राप्तांक</th><th>पूर्णांक</th>" +
            "<th>प्रतिशत</th><th>ग्रेड</th><th>मार्कशीट</th></tr>";

          results.forEach(r => {
            const tr = document.createElement("tr");

            [
              r.student.rollNo,
              r.student.name,
              r.obtained,
              r.maximum,
              r.percent.toFixed(2) + "%",
              r.grade
            ].forEach(v => {
              const td = document.createElement("td");
              td.textContent = v;
              tr.appendChild(td);
            });

            const td = document.createElement("td");
            const btn = document.createElement("button");
            btn.textContent = "PDF / Print";

            btn.onclick = () => {
              const w = window.open("", "_blank");
              if (!w) {
                alert("Pop-up अनुमति दें।");
                return;
              }

              const subjectRows = r.rows.map(m =>
                "<tr><td>" + m.name + "</td><td>" +
                m.theory + "/" + m.theoryMax +
                "</td><td>" + m.practical + "/" +
                m.practicalMax + "</td><td>" +
                m.total + "/" + m.max + "</td></tr>"
              ).join("");

              w.document.write(
                "<html><head><meta charset='UTF-8'>" +
                "<title>अंकसूची</title>" +
                "<style>body{font-family:Arial;padding:20px}" +
                "h2,p{text-align:center}" +
                "table{width:100%;border-collapse:collapse;margin-top:20px}" +
                "td,th{border:1px solid;padding:8px;text-align:center}" +
                ".sign{margin-top:70px;display:flex;" +
                "justify-content:space-between}</style></head><body>" +

                "<h2>शासकीय उच्चतर माध्यमिक विद्यालय जी- जामगाँव (बालक माध्य.)</h2>" +
                "<p>वि.ख. कुरुद, जिला धमतरी (छ.ग.)</p>" +
                "<h2>अंकसूची सत्र 2026-27</h2>" +
                "<p>परीक्षा: " + exam.title + "</p>" +
                "<p>कक्षा: " + exam.className +
                " | रोल नंबर: " + r.student.rollNo + "</p>" +
                "<p>विद्यार्थी: " + r.student.name + "</p>" +

                "<table><tr><th>विषय</th><th>थ्योरी</th>" +
                "<th>प्रायोगिक</th><th>कुल</th></tr>" +
                subjectRows + "</table>" +

                "<h3>कुल अंक: " + r.obtained + "/" + r.maximum + "</h3>" +
                "<h3>प्रतिशत: " + r.percent.toFixed(2) +
                "% | ग्रेड: " + r.grade + "</h3>" +

                "<div class='sign'><span>कक्षा शिक्षक</span>" +
                "<span>प्रधानपाठक</span></div>" +
                "<script>window.onload=function(){window.print()}<\/script>" +
                "</body></html>"
              );

              w.document.close();
            };

            td.appendChild(btn);
            tr.appendChild(td);
            table.appendChild(tr);
          });

          box.appendChild(table);
          const old = area.querySelector(".resultBox");
          if (old) old.remove();
          box.className = "resultBox";
          area.appendChild(box);

        } catch (e) {
          alert("रिजल्ट त्रुटि: " + e.message);
        }
      };
      // पूरी कक्षा की A4 रिजल्ट शीट
      const classSheetBtn = document.createElement("button");
      classSheetBtn.textContent = "पूरी कक्षा की रिजल्ट शीट (A4)";

      classSheetBtn.onclick = async () => {
        try {
          const snap = await db.collection("exams")
            .doc(examId).collection("marks").get();

          const saved = {};
          snap.forEach(d => saved[d.id] = d.data());

          const results = classStudents.map(student => {
            let obtained = 0, maximum = 0;

            const subjects = exam.subjects.map((sub, i) => {
              const m = saved[student.id]?.marks?.[i] || {};
              const total = Number(m.theory || 0) +
                Number(m.practical || 0);
              const max = sub.theoryMax + sub.practicalMax;
              obtained += total;
              maximum += max;
              return { obtained: total, maximum: max };
            });

            const percent = maximum ? obtained / maximum * 100 : 0;
            const grade = percent >= 91 ? "A+" :
              percent >= 81 ? "A" :
              percent >= 71 ? "B+" :
              percent >= 61 ? "B" :
              percent >= 51 ? "C+" :
              percent >= 41 ? "C" :
              percent >= 33 ? "D" : "E";

            const attendance = saved[student.id]?.attendance || "P";
return { student, subjects, obtained, maximum, percent, grade, attendance };
          });

          results.sort((a, b) =>
  (a.attendance === "A") - (b.attendance === "A") ||
  b.percent - a.percent
);



         let rank = 0;
let last = -1;

results.forEach(r => {
  if (r.attendance === "A") {
    r.rank = "—";
    return;
  }
  if (r.percent !== last) rank++;
  r.rank = rank;
  last = r.percent;
});
          const presentCount = results.filter(r => r.attendance === "P").length;
const absentCount = results.filter(r => r.attendance === "A").length;

const passedCount = results.filter(
  r => r.attendance === "P" && r.percent >= 33
).length;

const failedCount = presentCount - passedCount;

const averagePercent = presentCount
  ? results.filter(r => r.attendance === "P")
      .reduce((sum, r) => sum + r.percent, 0) / presentCount
  : 0;

const topper = results.find(r => r.attendance === "P");

          const w = window.open("", "_blank");
          if (!w) {
            alert("Pop-up की अनुमति दें।");
            return;
          }

          const headers = exam.subjects.map(s =>
  "<th>" + s.name + " प्राप्तांक</th>" +
  "<th>" + s.name + " पूर्णांक</th>"
).join("");

          const body = results.map(r =>
            "<tr><td>" + r.rank + "</td><td>" +
            r.student.rollNo + "</td><td>" +
            r.student.name + "</td><td>" +
(r.attendance === "P" ? "उपस्थित" : "अनुपस्थित") + "</td>" +
            r.subjects.map(x =>
  "<td>" + x.obtained + "</td>" +
  "<td>" + x.maximum + "</td>"
).join("") +
"<td>" + r.obtained + "</td>" +
"<td>" + r.maximum + "</td>" +
"<td>" + r.percent.toFixed(2) +
            "%</td><td>" + r.grade + "</td></tr>"
          ).join("");

          w.document.write(
            "<html><head><meta charset='UTF-8'>" +
            "<title>कक्षा रिजल्ट</title>" +
            "<style>@page{size:A4 landscape;margin:10mm}" +
            "body{font-family:Arial}h2,p{text-align:center}" +
            "table{width:100%;border-collapse:collapse;font-size:10px}" +
            "th,td{border:1px solid;padding:5px;text-align:center}" +
            ".sign{display:flex;justify-content:space-between;margin-top:50px}" +
            "</style></head><body>" +
            "<h2>शासकीय उच्चतर माध्यमिक विद्यालय जी- जामगाँव (बालक माध्य.)</h2>" +
            "<p>वि.ख. कुरुद, जिला धमतरी (छ.ग.)</p>" +
            "<h2>सामूहिक परीक्षा परिणाम 2026-27</h2>" +
            "<p>परीक्षा: " + exam.title + " | कक्षा: " +
            exam.className + "</p>" +
            "<p>कुल विद्यार्थी: " + results.length +
" | उपस्थित: " + presentCount +
" | अनुपस्थित: " + absentCount +
" | उत्तीर्ण: " + passedCount +
" | अनुत्तीर्ण: " + failedCount +
" | औसत प्रतिशत: " + averagePercent.toFixed(2) +
"%</p>" +
(topper
  ? "<p>कक्षा टॉपर: " + topper.student.name +
    " (" + topper.percent.toFixed(2) + "%)</p>"
  : "") +
            "<table><tr><th>रैंक</th><th>रोल नं.</th>" +
            "<th>विद्यार्थी</th><th>उपस्थिति</th>" + headers +
            "<th>कुल प्राप्तांक</th><th>कुल पूर्णांक</th>" +
"<th>प्रतिशत</th><th>ग्रेड</th></tr>" +
            body + "</table>" +
            "<div class='sign'><span>कक्षा शिक्षक</span>" +
            "<span>प्रधानपाठक</span></div>" +
            "<script>window.onload=function(){window.print()}<\\/script>" +
            "</body></html>"
          );

          w.document.close();
        } catch (e) {
          alert("रिजल्ट त्रुटि: " + e.message);
        }
      };

      area.appendChild(classSheetBtn);
      area.appendChild(resultBtn);});

    el("loginBtn").onclick = async () => {
      const email = el("adminEmail").value.trim();
      const password = el("adminPassword").value;

      if (!email || !password) {
        return show(loginMessage, "ईमेल और पासवर्ड भरें।");
      }

      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (e) {
        show(loginMessage, "Login Error: " + e.message);
      }
    };

    el("logoutBtn").onclick = () => auth.signOut();

    el("addNotice").onclick = async () => {
      const text = el("noticeInput").value.trim();
      let posterDataUrl="";
      try{posterDataUrl=await compressPosterFile(el("noticePoster")?.files?.[0]);}catch(e){return show(adminMessage,e.message);}

      if (!text) {
        return show(adminMessage, "सूचना लिखें।");
      }

      try {
        await db.collection("notices").add({
          text, posterDataUrl,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: auth.currentUser.uid
        });

        el("noticeInput").value = ""; if(el("noticePoster"))el("noticePoster").value="";
        show(adminMessage, "सूचना प्रकाशित हो गई।");

      } catch (e) {
        show(adminMessage, "Error: " + e.message);
      }
    };
el("addEvent").onclick = async () => {
  const title = el("eventTitle").value.trim();
  const eventDate = el("eventDate").value;
  const type = el("eventType").value;
  const description = el("eventDescription").value.trim();
  let posterDataUrl="";try{posterDataUrl=await compressPosterFile(el("eventPoster")?.files?.[0]);}catch(e){return show(adminMessage,e.message);}

  if (!title || !eventDate) {
    return show(adminMessage, "कार्यक्रम का नाम और तारीख आवश्यक हैं।");
  }

  try {
    await db.collection("events").add({
      title,
      eventDate,
      type,
      description, posterDataUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser.uid
    });

    el("eventTitle").value = "";
    el("eventDate").value = "";
    el("eventDescription").value = ""; if(el("eventPoster"))el("eventPoster").value="";

    show(adminMessage, "कार्यक्रम सफलतापूर्वक प्रकाशित हो गया।");

  } catch (e) {
    show(adminMessage, "Error: " + e.message);
  }
};
    el("saveStudent").onclick = async () => {
      const name = el("studentName").value.trim();
      const className = el("studentClass").value;
      const rollNo = el("studentRoll").value.trim();

      if (!name || !rollNo) {
        return show(studentMessage, "नाम और रोल नंबर आवश्यक हैं।");
      }

      try {
        await db.collection("students").add({
          name,
          className,
          rollNo,
          guardianName: el("guardianName").value.trim(),
          dob: el("studentDob").value,
          address: el("studentAddress").value.trim(),
          mobile: el("studentMobile").value.trim(),
          photoUrl: el("studentPhotoUrl").value.trim(),
          createdBy: auth.currentUser.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        [
          "studentName",
          "studentRoll",
          "guardianName",
          "studentDob",
          "studentAddress",
          "studentMobile",
          "studentPhotoUrl"
        ].forEach(id => el(id).value = "");

        show(studentMessage, "विद्यार्थी जोड़ दिया गया।");

      } catch (e) {
        show(studentMessage, "Error: " + e.message);
      }
    };

    auth.onAuthStateChanged(async user => {
      if (user && user.uid === ADMIN_UID) {
        loginBox.hidden = true;
        adminTools.hidden = false;
        adminTools.style.setProperty("display", "block", "important");
     beginStudentFeed();
beginTeacherFeed();
beginCreativityAdmin();
loadAdminGallery();
updateAdminDashboardDate();
refreshAdminDashboard();
await loadExams();

      } else {
        if (user) {
          await auth.signOut();
          show(loginMessage, "आपको एडमिन की अनुमति नहीं है।");
        }

        loginBox.hidden = false;
        adminTools.hidden = true;
        adminTools.style.setProperty("display", "none", "important");

        if (stopStudents)
{
  stopStudents();
  stopStudents = null;
}
if (stopTeachers) {
  stopTeachers();
  stopTeachers = null;
}
if (stopCreativityAdmin) { stopCreativityAdmin(); stopCreativityAdmin = null; }
      }
    });

  } catch (e) {
    console.error("School Website Error:", e);

    if (adminBox) {
      adminBox.innerHTML =
        "<p style='color:red'>लोडिंग में त्रुटि: " +
        e.message +
        "</p>";
    }
  }
}


// GitHub images Folder से सभी फोटो अपने-आप लोड करें
async function loadAutoGallery() {
  const box = document.getElementById("autoGallery");
  if (!box) return;

  try {
    const response = await fetch(
      "https://api.github.com/repos/sahusatish40-bit/govt-boys-ms-g-jamgaon/contents/images"
    );

    if (!response.ok) {
      throw new Error("GitHub से फोटो सूची नहीं मिली।");
    }

    const files = await response.json();

    const images = files
      .filter(file =>
        file.type === "file" &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
      )
      .sort((a, b) => b.name.localeCompare(a.name));

    box.innerHTML = "";

    if (images.length === 0) {
      box.textContent = "अभी images Folder में कोई फोटो नहीं है।";
      return;
    }

    images.forEach(file => {
      const card = document.createElement("div");

      const img = document.createElement("img");
      img.src = file.download_url;
      img.alt = file.name;
      img.loading = "lazy";
      img.style.cssText = "width:100%;height:200px;object-fit:cover;border-radius:12px;";

      const caption = document.createElement("p");
      caption.textContent = file.name.replace(/\.[^.]+$/, "");

      card.append(img, caption);
      box.appendChild(card);
    });

  } catch (error) {
    box.textContent = "फोटो लोड नहीं हुईं: " + error.message;
  }
}

loadAutoGallery();

startSchoolWebsite();
