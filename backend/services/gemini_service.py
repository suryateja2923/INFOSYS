import google.generativeai as genai
import json

genai.configure(api_key="AIzaSyC1X-sF03DTSahNkJu5apjLVtzw0_aF4tg")

model = genai.GenerativeModel("models/gemini-2.5-flash")

def generate_plan_with_gemini(user):
    prompt = f"""
You are a certified human fitness trainer and nutritionist.

Analyze this user carefully and behave like a real gym trainer.

USER DETAILS:
Age: {user["age"]}
Gender: {user["gender"]}
Height: {user["height"]} cm
Weight: {user["weight"]} kg
Fitness Level: {user["fitness_level"]}
Diet Type: {user["diet_type"]}
Goal: {user.get("goal")}
Pregnant: {user.get("pregnant")}
Pregnancy Month: {user.get("pregnancy_month")}

RULES (STRICT):
- If age < 8: return an error message only.
- If pregnant:
  - Ignore goals
  - No calorie numbers
  - No weight loss or muscle gain
  - Only prenatal-safe workouts
- Decide TOTAL NUMBER OF WEEKS dynamically.
- DO NOT assume weeks based on fitness level.
- Create progressive weekly plans.
- Keep workout cells SHORT: "Exercise – time/reps"
- Diet must match diet type (veg/non-veg).

OUTPUT FORMAT (JSON ONLY):
{{
  "summary": "...",
  "total_weeks": number,
  "schedule": {{
    "Week 1": {{
      "Mon": "...",
      "Tue": "...",
      "Wed": "...",
      "Thu": "...",
      "Fri": "...",
      "Sat": "...",
      "Sun": "..."
    }}
  }},
  "diet_plan": [
    {{
      "meal": "Breakfast",
      "items": "...",
      "quantity": "...",
      "calories": "...",
      "protein": "..."
    }}
  ],
  "exercises": [
    {{
      "name": "...",
      "time_or_reps": "...",
      "youtube_query": "..."
    }}
  ]
}}
"""

    response = model.generate_content(prompt)
    text = response.text.strip()

    # SAFETY: extract JSON only
    json_start = text.find("{")
    json_end = text.rfind("}") + 1

    return json.loads(text[json_start:json_end])
