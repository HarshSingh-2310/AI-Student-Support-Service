// =====================================
// Dashboard Statistics
// =====================================

function loadDashboardStats() {

    const stats = JSON.parse(localStorage.getItem("dashboardStats")) || {

        total: 0,
        summary: 0,
        quiz: 0,
        email: 0,
        planner: 0,
        assignment: 0

    };

    if(document.getElementById("totalRequests"))
        document.getElementById("totalRequests").innerText = stats.total;

    if(document.getElementById("summaryCount"))
        document.getElementById("summaryCount").innerText = stats.summary;

    if(document.getElementById("quizCountStat"))
        document.getElementById("quizCountStat").innerText = stats.quiz;

    if(document.getElementById("emailCount"))
        document.getElementById("emailCount").innerText = stats.email;

    if(document.getElementById("plannerCount"))
        document.getElementById("plannerCount").innerText = stats.planner;

    if(document.getElementById("assignmentCount"))
        document.getElementById("assignmentCount").innerText = stats.assignment;

}

function updateDashboard(moduleName){

    console.log("updateDashboard called:", moduleName);

    const stats = JSON.parse(localStorage.getItem("dashboardStats")) || {
        total:0,
        summary:0,
        quiz:0,
        email:0,
        planner:0,
        assignment:0
    };

    console.log("Before:", stats);

    stats.total++;
    stats[moduleName]++;

    localStorage.setItem("dashboardStats", JSON.stringify(stats));

    console.log("After:", localStorage.getItem("dashboardStats"));
}

loadDashboardStats();



// ===============================
// Notes Summarizer
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const summarizeBtn = document.getElementById("summarize-btn");

    if (summarizeBtn) {

        summarizeBtn.addEventListener("click", async function () {

            const notes = document.getElementById("notesInput").value;

            if (notes.trim() === "") {

                alert("Please enter your notes.");

                return;

            }

            document.getElementById("summary-output").innerHTML = "🤖 Summarizing...";

            const response = await fetch("/summarize", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    notes: notes
                })

            });

            const data = await response.json();

            document.getElementById("summary-output").innerHTML = data.summary;
            updateDashboard("summary");
            loadDashboardStats();
        });

    }

});
// ===============================
// Quiz Generator
// ===============================

const quizBtn = document.getElementById("generateQuizBtn");

if (quizBtn) {

    quizBtn.addEventListener("click", async () => {

        const topic = document.getElementById("quizTopic").value;
        const difficulty = document.getElementById("quizDifficulty").value;
        const count = document.getElementById("quizCount").value;
        
        document.getElementById("quizOutput").innerHTML = "Generating Quiz...";
    
        document.getElementById("showAnswersBtn").style.display = "none";

        const response = await fetch("/generate-quiz", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                topic,
                difficulty,
                count
            })

        });

        const data = await response.json();

        let quizText = data.quiz;

        let answerKey = "";

        const parts = quizText.split(/answer\s*key\s*:?\s*/i);

if(parts.length > 1){

    quizText = parts[0].trim();

    answerKey = parts[1].trim();

}

        document.getElementById("quizOutput").innerHTML = quizText.replace(/\n/g, "<br>");
        updateDashboard("quiz");
        loadDashboardStats();
        const answerBtn = document.getElementById("showAnswersBtn");

        if(answerKey!=""){
    answerBtn.style.display="inline-block";
}

        answerBtn.onclick = function () {

            document.getElementById("quizOutput").innerHTML +=
                "<hr><br>" + answerKey.replace(/\n/g, "<br>");

            answerBtn.style.display = "none";

        };

    });

}
// ===============================
// Email Writer
// ===============================

const emailBtn = document.getElementById("generateEmailBtn");

if (emailBtn) {

    emailBtn.addEventListener("click", async () => {

        const purpose = document.getElementById("emailPurpose").value;
        const recipient = document.getElementById("emailRecipient").value;
        const subject = document.getElementById("emailSubject").value;
        const details = document.getElementById("emailDetails").value;

        const output = document.getElementById("emailOutput");

        if (
            purpose.trim() === "" ||
            recipient.trim() === "" ||
            subject.trim() === "" ||
            details.trim() === ""
        ) {
            output.innerHTML = "⚠️ Please fill in all the fields.";
            return;
        }

        output.innerHTML = "🤖 AI is writing your email...";
        document.getElementById("copyEmailBtn").style.display = "none";

        const response = await fetch("/generate-email", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                purpose,
                recipient,
                subject,
                details
            })

        });

        const data = await response.json();

        output.innerHTML = data.email.replace(/\n/g, "<br>");
        updateDashboard("email");
        loadDashboardStats();
        document.getElementById("copyEmailBtn").style.display = "inline-block";

    });

}
// ===============================
// Copy Email Button
// ===============================

const copyBtn = document.getElementById("copyEmailBtn");

if(copyBtn){

    copyBtn.addEventListener("click", ()=>{

        const emailText = document.getElementById("emailOutput").innerText;

        navigator.clipboard.writeText(emailText);

        copyBtn.innerHTML = "✅ Email Copied!";

        setTimeout(()=>{

            copyBtn.innerHTML = "Copy Email";

        },2000);

    });

}
// ===============================
// Study Planner
// ===============================

const plannerBtn = document.getElementById("generatePlannerBtn");

if (plannerBtn) {

    plannerBtn.addEventListener("click", async () => {

        const subjects = document.getElementById("plannerSubjects").value;
        const startDate = document.getElementById("plannerStartDate").value;
        const examDate = document.getElementById("plannerDate").value;
        const hours = document.getElementById("plannerHours").value;
        const level = document.getElementById("plannerLevel").value;

        const output = document.getElementById("plannerOutput");

        if (
            subjects.trim() === "" ||
            examDate === "" ||
            hours === ""
        ) {
            output.innerHTML = "⚠️ Please fill in all the fields.";
            return;
        }

        plannerBtn.innerHTML = "⏳ Generating...";
        plannerBtn.disabled = true;
        output.innerHTML = "🤖 Creating your personalized study plan...";
        document.getElementById("copyPlannerBtn").style.display = "none";

        const response = await fetch("/generate-planner", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                subjects,
                startDate,
                examDate,
                hours,
                level
            })

        });

        const data = await response.json();

        output.innerHTML = data.planner.replace(/\n/g, "<br>");
        updateDashboard("planner");
        loadDashboardStats();
        plannerBtn.innerHTML = "Generate Study Plan";
        plannerBtn.disabled = false;
        document.getElementById("plannerOutput").scrollIntoView({
    behavior: "smooth"
});
        document.getElementById("copyPlannerBtn").style.display = "inline-block";

    });

}
// ===============================
// Copy Study Plan
// ===============================

const copyPlannerBtn = document.getElementById("copyPlannerBtn");

if (copyPlannerBtn) {

    copyPlannerBtn.addEventListener("click", () => {

        const plannerText = document.getElementById("plannerOutput").innerText;

        navigator.clipboard.writeText(plannerText);

        copyPlannerBtn.innerHTML = "✅ Study Plan Copied!";

        setTimeout(() => {

            copyPlannerBtn.innerHTML = "📋 Copy Study Plan";

        }, 2000);

    });

}
// ===============================
// Assignment Helper
// ===============================

const assignmentBtn = document.getElementById("generateAssignmentBtn");

if (assignmentBtn) {

    assignmentBtn.addEventListener("click", async () => {

        const topic = document.getElementById("assignmentTopic").value;
        const subject = document.getElementById("assignmentSubject").value;
        const type = document.getElementById("assignmentType").value;
        const words = document.getElementById("assignmentWords").value;
        const level = document.getElementById("assignmentLevel").value;

        const output = document.getElementById("assignmentOutput");

        if (
            topic.trim() === "" ||
            subject.trim() === ""
        ) {
            output.innerHTML = "⚠️ Please fill in all the fields.";
            return;
        }

        assignmentBtn.innerHTML = "⏳ Generating...";
        assignmentBtn.disabled = true;

        output.innerHTML = "🤖 Preparing your assignment...<br>";

        document.getElementById("copyAssignmentBtn").style.display = "none";

        const response = await fetch("/generate-assignment", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                topic,
                subject,
                type,
                words,
                level
            })

        });

        const data = await response.json();

        output.innerHTML = data.assignment.replace(/\n/g, "<br>");
        updateDashboard("assignment");
        loadDashboardStats();
        assignmentBtn.innerHTML = "Generate Assignment";
        assignmentBtn.disabled = false;

        document.getElementById("copyAssignmentBtn").style.display = "inline-block";

        document.getElementById("assignmentOutput").scrollIntoView({
            behavior: "smooth"
        });

    });

}
// ===============================
// Copy Assignment
// ===============================

const copyAssignmentBtn = document.getElementById("copyAssignmentBtn");

if (copyAssignmentBtn) {

    copyAssignmentBtn.addEventListener("click", () => {

        const assignmentText = document.getElementById("assignmentOutput").innerText;

        navigator.clipboard.writeText(assignmentText);

        copyAssignmentBtn.innerHTML = "✅ Assignment Copied!";

        setTimeout(() => {

            copyAssignmentBtn.innerHTML = "📋 Copy Assignment";

        }, 2000);

    });

}
// ======================================
// Feedback Form
// ======================================

const feedbackForm = document.getElementById("feedbackForm");

if(feedbackForm){

feedbackForm.addEventListener("submit", async function(e){

e.preventDefault();

const response = await fetch("/feedback",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

name:document.getElementById("feedbackName").value,

email:document.getElementById("feedbackEmail").value,

subject:document.getElementById("feedbackSubject").value,

message:document.getElementById("feedbackMessage").value

})

});

const data = await response.json();

const feedbackStatus = document.getElementById("feedbackStatus");

feedbackStatus.innerHTML = data.message;

feedbackStatus.style.opacity = "1";

feedbackForm.reset();

// Hide message after 4 seconds
setTimeout(() => {

    feedbackStatus.style.opacity = "0";

}, 3500);

setTimeout(() => {

    feedbackStatus.innerHTML = "";

}, 4000);


});

}