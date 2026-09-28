const sessionId = crypto.randomUUID();

const questions = [
  {
    key: "goal",
    text: "Tumcha main goal kay aahe?",
    options: ["Skill learning", "Freelancing", "Digital Marketing", "Content Creation", "AI / Technology"]
  },
  {
    key: "skill",
    text: "Kontya skill madhye jast interest aahe?",
    options: ["Instagram", "Canva", "Video Editing", "YouTube", "Digital Marketing", "Freelancing", "AI", "Other"]
  },
  {
    key: "level",
    text: "Tumcha current level?",
    options: ["Beginner", "Intermediate"]
  },
  {
    key: "budget",
    text: "Tumcha budget roughly kiti aahe?",
    options: ["₹300", "₹600", "₹1,200", "₹2,500", "₹5,500", "₹11,000"]
  },
  {
    key: "priority",
    text: "Course madhye tumhala kay jast important aahe?",
    options: ["Practical skills", "Freelancing", "Marketing skills", "Multiple skills", "AI / Future skills"]
  }
];

const answers = {};
const messages = document.getElementById("messages");
const questionBox = document.getElementById("questionBox");
const result = document.getElementById("result");
const typing = document.getElementById("typing");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const progressPct = document.getElementById("progressPct");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addBot(text) {
  const row = document.createElement("div");
  row.className = "msg-row bot-row";
  row.innerHTML = `<div class="avatar-small">AI</div><div class="msg bot-bubble"></div>`;
  row.querySelector(".bot-bubble").textContent = text;
  messages.appendChild(row);
  row.scrollIntoView({behavior:"smooth", block:"nearest"});
}

function addUser(text) {
  const row = document.createElement("div");
  row.className = "msg-row user-row";
  row.innerHTML = `<div class="msg user-bubble"></div>`;
  row.querySelector(".user-bubble").textContent = text;
  messages.appendChild(row);
  row.scrollIntoView({behavior:"smooth", block:"nearest"});
}

async function track(event, payload = {}) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({session_id: sessionId, event, payload})
    });
  } catch (err) {
    console.warn("Tracking unavailable:", err);
  }
}

function setProgress(step) {
  const pct = Math.round((step / questions.length) * 100);
  progressBar.style.width = `${pct}%`;
  progressLabel.textContent = step < questions.length
    ? `Question ${step} of ${questions.length}`
    : "Recommendation ready";
  progressPct.textContent = `${pct}%`;
}

async function showTyping(duration = 520) {
  typing.classList.remove("hidden");
  await sleep(duration);
  typing.classList.add("hidden");
}

async function renderQuestion(i) {
  const q = questions[i];
  setProgress(i + 1);

  questionBox.innerHTML = `
    <div class="question-title">${q.text}</div>
    <div class="options">
      ${q.options.map((o, idx) => `
        <button class="option" data-index="${idx}">
          ${o}
        </button>
      `).join("")}
    </div>
  `;

  questionBox.querySelectorAll(".option").forEach(btn => {
    btn.addEventListener("click", async () => {
      const value = q.options[Number(btn.dataset.index)];
      const storedValue = q.key === "budget" ? Number(value.replace(/[₹,]/g, "")) : value;
      answers[q.key] = storedValue;

      questionBox.querySelectorAll("button").forEach(b => b.disabled = true);
      addUser(value);

      await track("question_answered", {key:q.key, value});

      if (i + 1 < questions.length) {
        await showTyping(430);
        if (i === 0) {
          addBot("Got it 👌 Ata tumchi preferred skill baghuya.");
          await sleep(220);
        } else if (i === 2) {
          addBot("Perfect. Ata budget and learning priority check karu.");
          await sleep(220);
        }
        renderQuestion(i + 1);
      } else {
        questionBox.innerHTML = `
          <div class="question-title">Your match is being prepared…</div>
        `;
        await showTyping(850);
        try {
          const res = await fetch("/api/recommend", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({...answers, session_id: sessionId})
          });
          const data = await res.json();
          showResult(data.package);
        } catch (err) {
          addBot("Recommendation load zali nahi. Please refresh and try again.");
          console.error(err);
        }
      }
    });
  });
}

function showResult(pkg) {
  setProgress(questions.length);
  questionBox.innerHTML = "";
  result.classList.remove("hidden");

  // IMPORTANT: Replace "#" with the exact affiliate URL from your dashboard.
  const affiliateUrl = "#";

  result.innerHTML = `
    <div class="result-kicker">Your suggested match</div>
    <h2>${pkg.name} Package</h2>
    <div class="result-price">₹${pkg.price.toLocaleString("en-IN")}</div>
    <p class="result-desc">${pkg.description}</p>

    <div class="match-bar"><div class="match-fill"></div></div>
    <div class="match-text">Based on the answers you provided</div>

    <a id="cta" class="cta" href="${affiliateUrl}" target="_blank" rel="noopener noreferrer">
      View Package <span>→</span>
    </a>

    <button id="restart" class="restart">Start again</button>
  `;

  addBot(`Done ✨ Tumchya answers nusar ${pkg.name} package relevant match aahe.`);

  document.getElementById("cta").addEventListener("click", async () => {
    await track("affiliate_click", {package: pkg.id});
  });

  document.getElementById("restart").addEventListener("click", () => {
    Object.keys(answers).forEach(k => delete answers[k]);
    result.classList.add("hidden");
    messages.innerHTML = `
      <div class="msg-row bot-row">
        <div class="avatar-small">AI</div>
        <div class="msg bot-bubble">Fresh start 👋 Let’s find your match again.</div>
      </div>
    `;
    setProgress(1);
    renderQuestion(0);
    track("restart");
    window.scrollTo({top:0, behavior:"smooth"});
  });
}

setProgress(1);
renderQuestion(0);
track("chat_started");
