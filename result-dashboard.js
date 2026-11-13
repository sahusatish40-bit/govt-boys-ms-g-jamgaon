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

      personalOutput.innerHTML = `
        <div class="report-card" style="background:#fff;color:#172554;border:3px double #24558a;padding:22px;margin:15px 0;border-radius:8px;font-family:Arial,sans-serif">
          
          <div style="text-align:center;border-bottom:2px solid #24558a;padding-bottom:12px">
            <h2 style="margin:5px 0;font-size:21px">शासकीय उच्चतर माध्यमिक विद्यालय</h2>
            <h2 style="margin:5px 0;font-size:21px">जी- जामगाँव (बालक माध्य.)</h2>
            <p style="margin:5px 0;font-size:13px">वि.ख. कुरुद, जिला धमतरी (छ.ग.)</p>
            <h3 style="margin:12px 0 4px;color:#174a80">परीक्षा प्रगति पत्रक</h3>
            <b>सत्र 2026–27</b>
          </div>

          <div style="margin:16px 0;line-height:2">
            <b>विद्यार्थी का नाम:</b> ${student.name}<br>
            <b>कक्षा:</b> ${student.class}वीं
            &nbsp;&nbsp; <b>रोल नंबर:</b> ${student.roll}<br>
            <b>परीक्षा:</b> ${exam}
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <tr style="background:#e5efff">
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

          <div style="margin-top:18px;padding:12px;background:#eef5ff;line-height:2">
            <b>कुल प्राप्तांक:</b> ${obtained} / ${maximum}<br>
            <b>प्राप्त प्रतिशत:</b> ${percent}%<br>
            <b>समग्र ग्रेड:</b> ${overallGrade}
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
        </div>`;

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
  const style = document.createElement("style");
  style.id = "printMarksheetStyle";
  style.innerHTML = `
    @media print {
      body * { visibility: hidden !important; }
      #personalResultOutput,
      #personalResultOutput * {
        visibility: visible !important;
      }
      #personalResultOutput {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 15px;
        box-sizing: border-box;
      }
      #personalResultOutput button {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
  window.print();
  setTimeout(() => style.remove(), 1000);
};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initResultDashboard);
  else initResultDashboard();
})();
