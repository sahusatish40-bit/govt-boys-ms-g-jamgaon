// School Sathi - Aggregate Dashboard + Student Result Search
(function () {
  const results = {
    "July 2026": [
      {c:6,p:63.47,n:10},{c:7,p:54.05,n:13},{c:8,p:54.61,n:11}
    ],
    "August 2026": [
      {c:6,p:64.13,n:10},{c:7,p:59.21,n:13},{c:8,p:68.06,n:11}
    ],
    "Quarterly September 2026": [
      {c:6,p:58.53,n:10},{c:7,p:51.99,n:13},{c:8,p:68.15,n:11}
    ],
    "October 2026": [
      {c:6,p:73.47,n:10},{c:7,p:59.45,n:13},{c:8,p:70.00,n:11}
    ]
  };

  function initResultDashboard() {
    const output = document.getElementById("resultOutput");
    if (!output) return;

    output.innerHTML = `
      <div style="margin-top:25px;text-align:left">
        <h3>विद्यार्थी का परीक्षा परिणाम</h3>
        <label for="resultExam">परीक्षा चुनें</label>
        <select id="resultExam" style="width:100%;padding:12px;margin:8px 0">
          <option value="">परीक्षा चुनें</option>
          <option>July 2026</option>
          <option>August 2026</option>
          <option>Quarterly September 2026</option>
          <option>October 2026</option>
        </select>
        <button type="button" id="findStudentResult" style="padding:12px 18px;margin:8px 0">परिणाम देखें</button>
        <div id="personalResultOutput"></div>
        <hr style="margin:25px 0">
        <h3>विद्यालय का सामूहिक परीक्षा परिणाम 2026–27</h3>
        <label for="aggregateExam">परीक्षा चुनें</label>
        <select id="aggregateExam" style="width:100%;padding:12px;margin:10px 0">
          ${Object.keys(results).map(x => `<option>${x}</option>`).join("")}
        </select>
        <div id="aggregateTable"></div>
        <hr style="margin:25px 0">
        <h3>चारों परीक्षाओं की तुलनात्मक प्रगति</h3>
        <p style="font-size:13px">कक्षा-वार औसत प्रतिशत</p>
        <div id="progressChart"></div>
        <p style="font-size:13px;margin-top:12px">
          कक्षा 7 में 13 विद्यार्थी उपस्थित और 2 अनुपस्थित थे।
          जुलाई में 2 विषयों के अंक दर्ज नहीं हैं।
          यह सामूहिक रिपोर्ट है।
        </p>
      </div>`;

    const dobInput = document.getElementById("resultDob");
    if (dobInput) {
      const dobLabel = dobInput.previousElementSibling;
      if (dobLabel && dobLabel.tagName === "LABEL") dobLabel.remove();
      dobInput.remove();
    }
    const classInput = document.getElementById("resultClass");
    const rollInput = document.getElementById("resultRoll");
    const findButton = document.getElementById("findStudentResult");
    const examInput = document.getElementById("resultExam");
    const personalOutput = document.getElementById("personalResultOutput");

    function findResult() {
      const cls = (classInput?.value || "").trim();
      const roll = (rollInput?.value || "").trim();
      const exam = examInput.value;
      if (!cls || !roll || !exam) {
        personalOutput.innerHTML = '<p style="color:#b45309">कृपया कक्षा, रोल नंबर और परीक्षा चुनें।</p>';
        return;
      }
      const student = window.STUDENT_RESULTS && window.STUDENT_RESULTS[cls + "-" + roll];
      if (!student) {
        personalOutput.innerHTML = '<p style="color:#b91c1c">इस कक्षा और रोल नंबर का रिकॉर्ड नहीं मिला।</p>';
        return;
      }
      const marks = student.exams[exam];
      if (!marks || !marks.length) {
        personalOutput.innerHTML = '<p>इस परीक्षा का परिणाम उपलब्ध नहीं है।</p>';
        return;
      }
      const obtained = marks.reduce((s, x) => s + (Number(x.total) || 0), 0);
      const maximum = marks.reduce((s, x) => s + (Number(x.theoryMax)||0) + (Number(x.practicalMax)||0), 0);
      const percent = maximum ? (obtained / maximum * 100).toFixed(2) : "—";
      
      const overallGrade =
        percent >= 91 ? "A+" :
        percent >= 81 ? "A" :
        percent >= 71 ? "B+" :
        percent >= 61 ? "B" :
        percent >= 51 ? "C+" :
        percent >= 41 ? "C" :
        percent >= 33 ? "D" : "E";

      const examProgress = Object.entries(student.exams || {}).map(([examName, examMarks]) => {
        const validMarks = Array.isArray(examMarks) ? examMarks : [];
        const progressObtained = validMarks.reduce((sum, item) => {
          const total = item.total ?? (Number(item.theory || 0) + Number(item.practical || 0));
          return sum + (Number(total) || 0);
        }, 0);
        const progressMaximum = validMarks.reduce((sum, item) =>
          sum + (Number(item.theoryMax) || 0) + (Number(item.practicalMax) || 0), 0);
        const progressPercent = progressMaximum ? progressObtained / progressMaximum * 100 : 0;
        const progressGrade =
          progressPercent >= 91 ? "A+" :
          progressPercent >= 81 ? "A" :
          progressPercent >= 71 ? "B+" :
          progressPercent >= 61 ? "B" :
          progressPercent >= 51 ? "C+" :
          progressPercent >= 41 ? "C" :
          progressPercent >= 33 ? "D" : "E";
        return { examName, progressObtained, progressMaximum, progressPercent, progressGrade };
      }).filter(item => item.progressMaximum > 0);

      personalOutput.innerHTML = `
        <div class="report-card" style="position:relative;overflow:hidden;background:#fff;color:#172554;border:5px double #234f78;padding:18px;margin:15px 0;border-radius:2px;font-family:Arial,sans-serif"><div aria-hidden="true" style="position:absolute;z-index:0;top:43%;left:50%;transform:translate(-50%,-50%) rotate(-28deg);font-size:27px;font-weight:900;white-space:nowrap;color:rgba(30,70,110,.07);pointer-events:none">Govt. H.S.S. G-JAMGAON (Boys MS)</div><div style="position:relative;z-index:1">
          
          <div style="text-align:center;border-bottom:2px solid #24558a;padding-bottom:12px">
            <img src="https://raw.githubusercontent.com/sahusatish40-bit/govt-boys-ms-g-jamgaon/main/images/School_Mono.jpg?raw=1" alt="विद्यालय का मूल मोनोग्राम एवं स्लोगन" loading="eager" decoding="sync" onerror="this.onerror=null;this.src='https://sahusatish40-bit.github.io/govt-boys-ms-g-jamgaon/images/School_Mono.jpg?refresh=2';" style="display:block;width:92px;height:92px;object-fit:contain;margin:0 auto 8px">
            <h2 style="margin:5px 0;font-size:21px">शासकीय उच्चतर माध्यमिक विद्यालय</h2>
            <h2 style="margin:5px 0;font-size:21px">जी- जामगाँव (बालक माध्य.)</h2>
            <p style="margin:5px 0;font-size:13px">वि.ख. कुरुद, जिला धमतरी (छ.ग.)</p>
            <div style="display:inline-block;margin:12px auto 4px;padding:6px 26px;border-top:2px solid #234f78;border-bottom:2px solid #234f78;color:#174a80;font-weight:900;letter-spacing:.5px">विद्यार्थी अंकसूची / MARKSHEET</div>
            <b>सत्र 2026–27</b>
          </div>

          <div style="margin:16px 0;line-height:2">
            <b>विद्यार्थी का नाम:</b> ${student.name}<br>
            <b>कक्षा:</b> ${student.class}वीं
            &nbsp;&nbsp; <b>रोल नंबर:</b> ${student.roll}<br>
            <b>परीक्षा:</b> ${exam}
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:12px;border:2px solid #234f78">
            <tr style="background:#e5efff;color:#123d59">
              <th style="border:1px solid #555;padding:8px">विषय</th>
              <th style="border:1px solid #555;padding:8px">लिखित</th>
              <th style="border:1px solid #555;padding:8px">प्रायोगिक</th>
              <th style="border:1px solid #555;padding:8px">कुल</th>
              <th style="border:1px solid #555;padding:8px">ग्रेड</th>
            </tr>
            ${marks.map(m => `
              <tr>
                <td style="border:1px solid #555;padding:8px">${m.subject}</td>
                <td style="border:1px solid #555;padding:8px;text-align:center">${m.theory ?? "—"}/${m.theoryMax ?? "—"}</td>
                <td style="border:1px solid #555;padding:8px;text-align:center">${m.practical ?? "—"}/${m.practicalMax ?? "—"}</td>
                <td style="border:1px solid #555;padding:8px;text-align:center">${m.total ?? "—"}</td>
                <td style="border:1px solid #555;padding:8px;text-align:center">${m.grade || "—"}</td>
              </tr>
            `).join("")}
          </table>

          <div style="margin-top:14px;padding:12px;background:#f1f6fb;border:1px solid #9bb2c9;line-height:1.8">
            <b>कुल प्राप्तांक:</b> ${obtained} / ${maximum}<br>
            <b>प्राप्त प्रतिशत:</b> ${percent}%<br>
            <b>समग्र ग्रेड:</b> ${overallGrade}
          </div>

          <div style="margin-top:18px;padding:12px;border:1px solid #cbd5e1;border-radius:8px">
            <h3 style="margin:0 0 10px;color:#174a80;font-size:16px">परीक्षा-वार प्रगति तुलना</h3>
            <p style="font-size:11px;margin:0 0 10px;color:#475569">विद्यार्थी के उपलब्ध परीक्षा रिकॉर्ड के आधार पर</p>
            <div style="overflow-x:auto">
              <table style="width:100%;border-collapse:collapse;font-size:11px">
                <tr style="background:#e5efff">
                  <th style="border:1px solid #94a3b8;padding:6px">परीक्षा</th>
                  <th style="border:1px solid #94a3b8;padding:6px">प्राप्तांक</th>
                  <th style="border:1px solid #94a3b8;padding:6px">प्रतिशत</th>
                  <th style="border:1px solid #94a3b8;padding:6px">ग्रेड</th>
                </tr>
                ${examProgress.map(item => `
                  <tr>
                    <td style="border:1px solid #cbd5e1;padding:6px">${item.examName}</td>
                    <td style="border:1px solid #cbd5e1;padding:6px;text-align:center">${item.progressObtained}/${item.progressMaximum}</td>
                    <td style="border:1px solid #cbd5e1;padding:6px;text-align:center">
                      ${item.progressPercent.toFixed(2)}%
                      <div style="height:6px;background:#e2e8f0;border-radius:5px;margin-top:4px;overflow:hidden">
                        <div style="height:6px;width:${Math.max(0,Math.min(100,item.progressPercent))}%;background:#2878d0"></div>
                      </div>
                    </td>
                    <td style="border:1px solid #cbd5e1;padding:6px;text-align:center">${item.progressGrade}</td>
                  </tr>
                `).join("")}
              </table>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;gap:15px;margin-top:65px;text-align:center;font-size:12px">
            <div style="width:45%;border-top:1px solid #333;padding-top:8px">
              कक्षा शिक्षक के हस्ताक्षर
            </div>
            <div style="width:45%;border-top:1px solid #333;padding-top:8px">
              प्रधानपाठक के हस्ताक्षर
            </div>
          </div>

          <p style="text-align:center;margin-top:20px;font-size:11px">
            परिणाम की पुष्टि विद्यालय अभिलेख से करें।
          </p>

          <div class="no-print" style="text-align:center;margin-top:20px">
            <button type="button" onclick="window.printStudentMarksheet()"
              style="padding:12px 18px;background:#167a45;color:white;border:0;border-radius:6px">
              मार्कशीट PDF डाउनलोड / प्रिंट करें
            </button>
          </div>
        </div></div>`;

    }

    findButton.addEventListener("click", findResult);
    rollInput?.addEventListener("keydown", e => { if (e.key === "Enter") findResult(); });

    const select = document.getElementById("aggregateExam");
    function showResult() {
      const rows = results[select.value];
      document.getElementById("aggregateTable").innerHTML = `
        <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">
          <tr><th style="border:1px solid #ccc;padding:10px">कक्षा</th><th style="border:1px solid #ccc;padding:10px">औसत प्रतिशत</th><th style="border:1px solid #ccc;padding:10px">विद्यार्थी</th></tr>
          ${rows.map(r => `<tr>
            <td style="border:1px solid #ccc;padding:10px;text-align:center">कक्षा ${r.c}</td>
            <td style="border:1px solid #ccc;padding:10px;text-align:center;font-weight:bold">${r.p.toFixed(2)}%</td>
            <td style="border:1px solid #ccc;padding:10px;text-align:center">${r.n}</td>
          </tr>`).join("")}
        </table></div>`;
    }
    const chart = document.getElementById("progressChart");
    const colors = {6:"#2878d0",7:"#e39b27",8:"#299b68"};
    chart.innerHTML = Object.entries(results).map(([exam, rows]) => `
      <div style="margin:18px 0"><b>${exam}</b>
        ${rows.map(r => `<div style="margin:10px 0">
          <div style="display:flex;justify-content:space-between;font-size:13px"><span>कक्षा ${r.c}</span><b>${r.p.toFixed(2)}%</b></div>
          <div style="height:13px;background:#e8e8e8;border-radius:8px;overflow:hidden">
            <div style="height:13px;width:${r.p}%;background:${colors[r.c]};border-radius:8px"></div>
          </div></div>`).join("")}
      </div>`).join("");
    select.addEventListener("change", showResult);
    showResult();
  }
window.printStudentMarksheet = function () {
  const card = document.querySelector("#personalResultOutput .report-card");
  if (!card) { alert("पहले विद्यार्थी की अंकसूची खोलें।"); return; }
  const clone = card.cloneNode(true);
  clone.querySelectorAll("button,.no-print").forEach(el => el.remove());
  const win = window.open("", "_blank");
  if (!win) { alert("प्रिंट विंडो नहीं खुल सकी। कृपया इस साइट के लिए pop-up अनुमति दें।"); return; }
  let printed = false;
  const doPrint = () => {
    if (printed) return;
    printed = true;
    win.focus();
    win.print();
  };
  win.document.open();
  win.document.write(`<!doctype html><html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>विद्यार्थी अंकसूची</title><style>
    @page{size:A4 portrait;margin:7mm}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{margin:0;padding:0;font-family:Arial,sans-serif;background:#fff;color:#172554}
    .report-card{position:relative!important;overflow:hidden!important;width:100%!important;margin:0!important;padding:8px!important;border:2px double #24558a!important;border-radius:0!important;font-size:10px!important;break-inside:avoid}
    .report-card>div[aria-hidden="true"]{z-index:0!important;color:rgba(30,70,110,.07)!important}
    .report-card>div[style*="position:relative"]{position:relative!important;z-index:1!important}
    .report-card img{width:52px!important;height:52px!important;margin-bottom:3px!important}
    .report-card h2{font-size:15px!important;margin:2px 0!important}
    .report-card h3{font-size:12px!important;margin:4px 0!important}
    .report-card table{width:100%;font-size:9px!important;border-collapse:collapse}
    .report-card th,.report-card td{padding:3px!important}
    .report-card [style*="margin-top:65px"]{margin-top:18px!important}
    .report-card [style*="margin:16px 0"]{margin:5px 0!important;line-height:1.45!important}
    .report-card [style*="margin-top:18px"]{margin-top:5px!important;padding:5px!important;line-height:1.4!important}
    .report-card>div[style*="border:1px solid"]{display:none!important}
    .report-card p{margin:4px 0!important}
  </style></head><body>${clone.outerHTML}</body></html>`);
  win.onload = doPrint;
  win.document.close();
  setTimeout(doPrint, 1200);
};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initResultDashboard);
  else initResultDashboard();
})();
