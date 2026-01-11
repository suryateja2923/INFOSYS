import os
import openai
import json

# Load API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
  raise RuntimeError("OPENAI_API_KEY environment variable not set")

openai.api_key = OPENAI_API_KEY


def generate_ai_plan(data: dict) -> dict:
    """
    Fully dynamic AI-generated fitness + diet plan.
    """

    # 🚫 AGE BLOCK
    if data["age"] < 8:
        return {
            "summary": "Fitness plans are not generated for children under 8 years.",
            "schedule": {},
            "exercises": [],
            "diet_plan": []
        }

    # 🤰 PREGNANCY RULES
    pregnancy_rules = ""
    if data.get("pregnant"):
        pregnancy_rules = f"""
        User is pregnant (month {data.get('pregnancy_month')}).
        - NO weight loss, muscle gain or flexibility goals
        - ONLY safe prenatal workouts
        - NO diet plan output
        """

    prompt = f"""
You are a professional gym trainer and nutritionist.

Generate a FULLY DYNAMIC 6-MONTH (24 weeks) fitness plan.

User details:
Age: {data['age']}
Gender: {data['gender']}
Height: {data['height']} cm
Weight: {data['weight']} kg
Goal: {data.get('goal')}
Fitness Level: {data['level']}
Diet Type: {data.get('diet_type')}
{pregnancy_rules}

RULES:
1. Output MUST be valid JSON only.
2. Workout schedule must be WEEK-WISE (Week 1 to Week 24).
3. Each workout cell must include workout type AND duration or reps.
   Example: "Strength (30 min)", "Squats (3x12)"
4. Diet plan must be DYNAMIC with:
   Meal | Food Items | Quantity | Calories | Protein
5. If pregnant = true → DO NOT return diet_plan.
6. If age > 45 → lighter workouts.
7. No markdown, no explanations.

JSON FORMAT:
{{
  "summary": "...",
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
  "exercises": [
    {{
      "name": "...",
      "description": "...",
      "video_query": "..."
    }}
  ],
  "diet_plan": [
    {{
      "meal": "Breakfast",
      "food": "...",
      "quantity": "...",
      "calories": "...",
      "protein": "..."
    }}
  ]
}}
"""

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4
    )

    raw = response["choices"][0]["message"]["content"]

    # 🔍 DEBUG SAFETY
    print("AI RAW RESPONSE:\n", raw)

    return json.loads(raw)
