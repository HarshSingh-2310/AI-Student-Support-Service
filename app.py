from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
from datetime import datetime
import os

# Load API Key
load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY")
)

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/chat")
def chat():
    return render_template("chatbot.html")

@app.route("/summary")
def summary():
    return render_template("summary.html")

@app.route("/quiz")
def quiz():
    return render_template("quiz.html")


@app.route("/planner")
def planner():
    return render_template("planner.html")


@app.route("/email")
def email():
    return render_template("email.html")


@app.route("/assignment")
def assignment():
    return render_template("assignment.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/ask", methods=["POST"])
def ask():

    user_message = request.json.get("message")

    try:

        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=f"""
You are an AI Student Support Assistant.

Rules:
- Answer in simple English.
- Keep answers concise.
- Use bullet points whenever possible.
- If explaining a programming concept, include one simple example.
- Help students with studies, coding, assignments, notes, quizzes and study plans.

Student Question:
{user_message}
"""
        )

        return jsonify({
            "reply": response.text
        })

    except Exception as e:

        error = str(e)

        if "429" in error:

            reply = "⚠️ AI service is busy or the free usage limit has been reached. Please wait a little and try again."

        elif "503" in error:

            reply = "⚠️ The AI service is temporarily unavailable. Please try again in a few moments."

        else:

            reply = "⚠️ An unexpected error occurred. Please try again."

        return jsonify({
        "reply": reply
        })
@app.route("/summarize", methods=["POST"])
def summarize():

    notes = request.json.get("notes")

    try:

        prompt = f"""
Summarize the following notes in simple student-friendly language.
Keep the summary short and easy to understand.

Notes:
{notes}
"""

        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=prompt
        )

        return jsonify({
            "summary": response.text
        })

    except Exception as e:

        return jsonify({
            "summary": str(e)
        })  
@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():

    data = request.json

    topic = data.get("topic")
    difficulty = data.get("difficulty")
    count = data.get("count")

    try:

        prompt = f"""
You are an AI Quiz Generator.

Generate EXACTLY {count} multiple-choice questions.

Topic: {topic}

Difficulty: {difficulty}

Rules:

1. Generate exactly {count} questions.

2. Number every question.

3. Every question must have exactly four options:
A)
B)
C)
D)

4. Do NOT reveal answers after each question.

5.After the quiz write EXACTLY this heading:

ANSWER KEY

6.Then list the answers like:

1. C
2. B
3. A
...

7. Do not explain answers.

8. Do not write introduction or conclusion.

9. Output should look neat.
"""

        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=prompt
        )

        return jsonify({
            "quiz": response.text
        })

    except Exception as e:

        return jsonify({
            "quiz": str(e)
        })  
@app.route("/generate-email", methods=["POST"])
def generate_email():

    data = request.json

    purpose = data.get("purpose")
    recipient = data.get("recipient")
    subject = data.get("subject")
    details = data.get("details")

    try:

        prompt = f"""
You are an AI Email Writer.

Write a professional email.

Purpose: {purpose}

Recipient: {recipient}

Subject: {subject}

Details:
{details}

Keep the email formal and concise.
"""

        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=prompt
        )

        return jsonify({
            "email": response.text
        })

    except Exception as e:

        return jsonify({
            "email": str(e)
        })  
@app.route("/generate-planner", methods=["POST"])
def generate_planner():

    data = request.json

    subjects = data.get("subjects")
    start_date = data.get("startDate")
    exam_date = data.get("examDate")
    hours = data.get("hours")
    level = data.get("level")
    start = datetime.strptime(start_date, "%Y-%m-%d")
    exam = datetime.strptime(exam_date, "%Y-%m-%d")
    days = (exam - start).days + 1
    if days <= 0:

        return jsonify({
            "planner":"⚠️ Exam date must be after the start date."
    })
    if days <= 14:
        plan_type = "daily"

    elif days <= 45:
        plan_type = "weekly"

    else:
        plan_type = "phase"    

    try:

        prompt = f"""
You are an AI Study Planner.

Study starts on:
{start_date}

Exam Date:
{exam_date}

Available Days:
{days}

Subjects:
{subjects}

Study Hours Per Day:
{hours}

Difficulty:
{level}

Plan Type:
{plan_type}

RULES:

If Plan Type is "daily":
- Create a plan for EVERY day.
- Mention what to study each day.
- Keep the last day only for revision.

If Plan Type is "weekly":
- Divide the plan into weeks.
- Mention goals for each week.
- Make only the FINAL WEEK day-wise.

If Plan Type is "phase":
- Divide the preparation into 3 phases:
    Phase 1
    Phase 2
    Phase 3

- Only make the LAST 14 DAYS day-wise.

General Rules:

• Divide subjects equally.
• Include revision.
• Include practice.
• No introduction.
• No conclusion.
• Output should be neat and readable.
"""

        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=prompt
        )

        return jsonify({
            "planner": response.text
        })

    except Exception as e:

        return jsonify({
            "planner": str(e)
        })  
@app.route("/generate-assignment", methods=["POST"])
def generate_assignment():

    data = request.json

    topic = data.get("topic")
    subject = data.get("subject")
    assignment_type = data.get("type")
    words = data.get("words")
    level = data.get("level")

    try:

        prompt = f"""
You are an AI Assignment Helper.

Create a {assignment_type} assignment.

Topic:
{topic}

Subject:
{subject}

Education Level:
{level}

Word Limit:
{words} words

Rules:

1. Create a proper title.

2. Write a short introduction.

3. Divide the assignment into meaningful headings.

4. Use bullet points wherever suitable.

5. Keep the language simple and student-friendly.

6. Stay close to the requested word limit.

7. Finish with a short conclusion.

8. Do not include any AI disclaimer.

9. Format the assignment neatly.
"""

        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=prompt
        )

        return jsonify({
            "assignment": response.text
        })

    except Exception as e:

        return jsonify({
            "assignment": str(e)
        })  
@app.route("/feedback", methods=["POST"])
def feedback():

    print("Feedback Route Loaded")
    data = request.json

    with open("feedback.txt","a",encoding="utf-8") as f:

        f.write(f"""
Name : {data['name']}
Email : {data['email']}
Subject : {data['subject']}
Message :
{data['message']}

----------------------------------------
""")

    return jsonify({"message":"✅ Thank you! Your feedback has been submitted."})              
if __name__ == "__main__":
    app.run(debug=True)