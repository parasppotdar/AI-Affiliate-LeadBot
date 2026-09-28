const sessionId = crypto.randomUUID();

const answers = {};

const messages = document.getElementById("messages");
const questionBox = document.getElementById("questionBox");
const result = document.getElementById("result");
const typing = document.getElementById("typing");

const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const progressPercent = document.getElementById("progressPercent");


/* ================================
   AFFILIATE LINKS
================================ */

const affiliateLinks = {

    starter:
        "https://richind.org/checkout?slug=starter-package&referrer_code=RINDOSUJYPMS",

    intermediate:
        "https://richind.org/checkout?slug=intermediate&referrer_code=RINDOSUJYPMS",

    expert:
        "https://richind.org/checkout?slug=expert&referrer_code=RINDOSUJYPMS",

    master:
        "https://richind.org/checkout?slug=master&referrer_code=RINDOSUJYPMS",

    brahmastra:
        "https://richind.org/checkout?slug=brahmastra&referrer_code=RINDOSUJYPMS",

    premium_pro:
        "https://richind.org/checkout?slug=premium-pro&referrer_code=RINDOSUJYPMS"

};


/* ================================
   QUESTIONS
================================ */

const questions = [

    {
        key: "goal",

        text:
            "Tumcha main goal kay aahe?",

        options: [
            "Skill Learning",
            "Freelancing",
            "Digital Marketing",
            "Content Creation",
            "AI / Technology"
        ]
    },


    {
        key: "skill",

        text:
            "Kontya skill madhye tumhala jast interest aahe?",

        options: [
            "Instagram",
            "Canva",
            "Video Editing",
            "YouTube",
            "Digital Marketing",
            "Freelancing",
            "AI",
            "Other"
        ]
    },


    {
        key: "level",

        text:
            "Tumcha current skill level konta aahe?",

        options: [

            "Beginner",

            "Intermediate"

        ]
    },


    {
        key: "budget",

        text:
            "Tumcha approximate budget kiti aahe?",

        options: [

            "₹300",

            "₹600",

            "₹1,200",

            "₹2,500",

            "₹5,500",

            "₹11,000"

        ]
    },


    {
        key: "priority",

        text:
            "Course madhye tumhala kay jast important aahe?",

        options: [

            "Practical Skills",

            "Freelancing",

            "Marketing Skills",

            "Multiple Skills",

            "AI / Future Skills"

        ]
    }

];


/* ================================
   DELAY
================================ */

function delay(ms) {

    return new Promise(

        resolve => setTimeout(
            resolve,
            ms
        )

    );

}


/* ================================
   TRACKING
================================ */

async function track(
    event,
    payload = {}
) {

    try {

        await fetch(

            "/api/track",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    session_id:
                        sessionId,

                    event:
                        event,

                    payload:
                        payload

                })

            }

        );

    }

    catch(error) {

        console.log(
            "Tracking error:",
            error
        );

    }

}


/* ================================
   BOT MESSAGE
================================ */

function addBotMessage(text) {

    const row =
        document.createElement("div");

    row.className =
        "message-row";

    row.innerHTML = `

        <div class="small-avatar">
            AI
        </div>

        <div class="message bot-message"></div>

    `;


    row.querySelector(
        ".bot-message"
    ).textContent = text;


    messages.appendChild(row);


    row.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

}


/* ================================
   USER MESSAGE
================================ */

function addUserMessage(text) {

    const row =
        document.createElement("div");

    row.className =
        "message-row user-row";


    row.innerHTML = `

        <div class="message user-message"></div>

    `;


    row.querySelector(
        ".user-message"
    ).textContent = text;


    messages.appendChild(row);


    row.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

}


/* ================================
   TYPING
================================ */

async function showTyping(
    duration = 500
) {

    typing.classList.remove(
        "hidden"
    );


    await delay(duration);


    typing.classList.add(
        "hidden"
    );

}


/* ================================
   PROGRESS
================================ */

function updateProgress(step) {

    const percentage =
        Math.round(

            (step /
                questions.length)
            * 100

        );


    progressBar.style.width =
        `${percentage}%`;


    progressPercent.textContent =
        `${percentage}%`;


    if (
        step <
        questions.length
    ) {

        progressLabel.textContent =
            `Question ${step} of ${questions.length}`;

    }

    else {

        progressLabel.textContent =
            "Recommendation ready";

    }

}


/* ================================
   SHOW QUESTION
================================ */

function renderQuestion(index) {

    const question =
        questions[index];


    updateProgress(
        index + 1
    );


    questionBox.innerHTML = `

        <div class="question-title">

            ${question.text}

        </div>


        <div class="options">

            ${question.options
                .map(

                    (option, optionIndex) => `

                    <button
                        class="option"
                        data-index="${optionIndex}"
                    >

                        ${option}

                    </button>

                    `

                )
                .join("")}

        </div>

    `;


    questionBox
        .querySelectorAll(".option")
        .forEach(

            button => {

                button.addEventListener(

                    "click",

                    async () => {

                        const value =
                            question.options[
                                Number(
                                    button.dataset.index
                                )
                            ];


                        if (
                            question.key ===
                            "budget"
                        ) {

                            answers[
                                question.key
                            ] =
                                Number(

                                    value.replace(
                                        /[₹,]/g,
                                        ""
                                    )

                                );

                        }

                        else {

                            answers[
                                question.key
                            ] =
                                value;

                        }


                        /* Disable all */

                        questionBox
                            .querySelectorAll(
                                "button"
                            )
                            .forEach(

                                btn =>
                                    btn.disabled =
                                        true

                            );


                        addUserMessage(
                            value
                        );


                        await track(

                            "question_answered",

                            {

                                key:
                                    question.key,

                                value:
                                    value

                            }

                        );


                        /* ----------------
                           NEXT QUESTION
                        ---------------- */

                        if (

                            index + 1
                            <
                            questions.length

                        ) {

                            await showTyping(
                                450
                            );


                            if (
                                index === 0
                            ) {

                                addBotMessage(

                                    "Got it 👌 Ata tumchi preferred skill baghuya."

                                );

                            }


                            else if (
                                index === 2
                            ) {

                                addBotMessage(

                                    "Perfect. Ata budget ani learning priority check karu."

                                );

                            }


                            await delay(
                                250
                            );


                            renderQuestion(
                                index + 1
                            );


                            return;

                        }


                        /* ----------------
                           FINAL STEP
                        ---------------- */

                        questionBox.innerHTML = `

                            <div class="question-title">

                                Your match is being prepared ✨

                            </div>

                        `;


                        await showTyping(
                            900
                        );


                        try {

                            const response =
                                await fetch(

                                    "/api/recommend",

                                    {

                                        method:
                                            "POST",

                                        headers: {

                                            "Content-Type":
                                                "application/json"

                                        },

                                        body:

                                            JSON.stringify({

                                                session_id:
                                                    sessionId,

                                                goal:
                                                    answers.goal,

                                                skill:
                                                    answers.skill,

                                                level:
                                                    answers.level,

                                                budget:
                                                    answers.budget,

                                                priority:
                                                    answers.priority

                                            })

                                    }

                                );


                            console.log(
                                "Recommendation status:",
                                response.status
                            );


                            if (
                                !response.ok
                            ) {

                                const errorText =
                                    await response.text();

                                console.error(
                                    "API Error:",
                                    errorText
                                );

                                throw new Error(
                                    `API returned ${response.status}`
                                );

                            }


                            const data =
                                await response.json();


                            console.log(
                                "Recommendation:",
                                data
                            );


                            if (
                                !data.package
                            ) {

                                throw new Error(
                                    "Package missing in API response"
                                );

                            }


                            showResult(
                                data.package
                            );


                        }

                        catch(error) {

                            console.error(
                                "Recommendation failed:",
                                error
                            );


                            addBotMessage(

                                "Recommendation load zali nahi. Browser refresh karun punha try kara."

                            );

                        }

                    }

                );

            }

        );

}


/* ================================
   RESULT
================================ */

function showResult(pkg) {

    updateProgress(
        questions.length
    );


    questionBox.innerHTML =
        "";


    result.classList.remove(
        "hidden"
    );


    const affiliateUrl =
        affiliateLinks[pkg.id];


    result.innerHTML = `

        <div class="result-label">

            YOUR SUGGESTED MATCH

        </div>


        <h2>

            ${pkg.name} Package

        </h2>


        <div class="result-price">

            ₹${pkg.price.toLocaleString("en-IN")}

        </div>


        <p class="result-description">

            ${pkg.description}

        </p>


        <div class="match-bar">

            <div class="match-fill"></div>

        </div>


        <div class="match-text">

            Based on the answers you provided

        </div>


        <a

            id="affiliateButton"

            class="cta"

            href="${affiliateUrl || "#"}"

            target="_blank"

            rel="noopener noreferrer"

        >

            View Package

            <span>
                →
            </span>

        </a>


        <button

            id="restartButton"

            class="restart"

        >

            Start Again

        </button>

    `;


    addBotMessage(

        `Done ✨ Tumchya answers nusar ${pkg.name} package relevant match aahe.`

    );


    /* AFFILIATE CLICK */

    document
        .getElementById(
            "affiliateButton"
        )
        .addEventListener(

            "click",

            async () => {

                await track(

                    "affiliate_click",

                    {

                        package:
                            pkg.id

                    }

                );

            }

        );


    /* RESTART */

    document
        .getElementById(
            "restartButton"
        )
        .addEventListener(

            "click",

            () => {

                Object.keys(
                    answers
                )
                .forEach(

                    key =>
                        delete answers[key]

                );


                result.classList.add(
                    "hidden"
                );


                messages.innerHTML = `

                    <div class="message-row">

                        <div class="small-avatar">
                            AI
                        </div>

                        <div class="message bot-message">

                            Fresh start 👋
                            Let's find your match again.

                        </div>

                    </div>

                `;


                updateProgress(
                    1
                );


                renderQuestion(
                    0
                );


                track(
                    "restart"
                );

            }

        );

}


/* ================================
   START
================================ */

updateProgress(
    1
);


renderQuestion(
    0
);


track(
    "chat_started"
);