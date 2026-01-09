import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  generateFitnessPlan,
  getSavedFitnessPlan
} from "../services/api";
import "./Planner.css";

export default function Planner() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const [form, setForm] = useState({
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    fitness_level: "Beginner",
    diet_type: "Veg",
    goal: "",
    pregnant: false,
    pregnancy_month: ""
  });

  const [savedPlan, setSavedPlan] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔐 Block access if not logged in
  useEffect(() => {
    if (!userEmail) {
      navigate("/");
      return;
    }

    getSavedFitnessPlan(userEmail)
      .then((res) => {
        if (res) {
          setSavedPlan(res);
        }
      })
      .catch(() => {});
  }, [userEmail, navigate]);

  // ✅ FRONTEND VALIDATION (PREVENTS 422)
  const validate = () => {
    if (!form.age || !form.height || !form.weight) {
      alert("Please fill all required fields");
      return false;
    }

    if (Number(form.age) < 8) {
      alert("Age must be 8 or above");
      return false;
    }

    if (form.pregnant && !form.pregnancy_month) {
      alert("Please select pregnancy month");
      return false;
    }

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneratedPlan(null);

    try {
      const data = await generateFitnessPlan(
        {
          ...form,
          age: Number(form.age),
          height: Number(form.height),
          weight: Number(form.weight),
          pregnancy_month:
            form.pregnant && form.pregnancy_month
              ? Number(form.pregnancy_month)
              : null
        },
        userEmail
      );

      setGeneratedPlan(data);
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Plan generation failed. Check your inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmAndSave = async () => {
    setSavedPlan(generatedPlan);
    setGeneratedPlan(null);
    alert("Plan confirmed and saved!");
  };

  const logout = () => {
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const planToDisplay = savedPlan || generatedPlan;

  return (
    <div className="planner-page">
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>

      <h1>Personalized Fitness Planner</h1>

      {/* SHOW FORM ONLY IF NO SAVED PLAN */}
      {!savedPlan && (
        <form className="planner-form" onSubmit={submit}>
          <input
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option>Male</option>
            <option>Female</option>
          </select>

          {form.gender === "Female" && (
            <select
              value={form.pregnant ? "yes" : "no"}
              onChange={(e) =>
                setForm({ ...form, pregnant: e.target.value === "yes" })
              }
            >
              <option value="no">Not Pregnant</option>
              <option value="yes">Pregnant</option>
            </select>
          )}

          {form.pregnant && (
            <select
              value={form.pregnancy_month}
              onChange={(e) =>
                setForm({ ...form, pregnancy_month: e.target.value })
              }
            >
              <option value="">Select Month</option>
              {[...Array(9)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Month {i + 1}
                </option>
              ))}
            </select>
          )}

          <input
            placeholder="Height (cm)"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
          />

          <input
            placeholder="Weight (kg)"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />

          <select
            value={form.fitness_level}
            onChange={(e) =>
              setForm({ ...form, fitness_level: e.target.value })
            }
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <select
            value={form.diet_type}
            onChange={(e) =>
              setForm({ ...form, diet_type: e.target.value })
            }
          >
            <option>Veg</option>
            <option>Non-Veg</option>
          </select>

          <button disabled={loading}>
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        </form>
      )}

      {/* DISPLAY PLAN */}
      {planToDisplay && (
        <>
          <p className="summary">{planToDisplay.summary}</p>

          {/* DIET PLAN */}
          {planToDisplay.diet_plan && planToDisplay.diet_plan.length > 0 && (
            <div className="diet-section">
              <h2>Diet Plan</h2>
              <div className="diet-items">
                {planToDisplay.diet_plan.map((meal, idx) => (
                  <div key={idx} className="meal-card">
                    <h3>{meal.meal}</h3>
                    <p><strong>Items:</strong> {meal.items}</p>
                    <p><strong>Quantity:</strong> {meal.quantity}</p>
                    {meal.calories && <p><strong>Calories:</strong> {meal.calories}</p>}
                    {meal.protein && <p><strong>Protein:</strong> {meal.protein}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WORKOUT SCHEDULE */}
          {planToDisplay.schedule && (
            <div className="workout-section">
              <h2>Workout Schedule</h2>
              {Object.entries(planToDisplay.schedule).map(([week, days]) => (
                <div key={week} className="week-plan">
                  <h3>{week}</h3>
                  <div className="days-grid">
                    {Object.entries(days).map(([day, workout]) => (
                      <div key={day} className="day-card">
                        <h4>{day}</h4>
                        <p>{workout}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EXERCISES */}
          {planToDisplay.exercises && planToDisplay.exercises.length > 0 && (
            <div className="exercises-section">
              <h2>Exercises</h2>
              <div className="exercise-items">
                {planToDisplay.exercises.map((exercise, idx) => (
                  <div key={idx} className="exercise-card">
                    <h3>{exercise.name}</h3>
                    <p><strong>Duration/Reps:</strong> {exercise.time_or_reps}</p>
                    {exercise.youtube_query && (
                      <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtube_query)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="youtube-link"
                      >
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!savedPlan && generatedPlan && (
            <div className="confirm-wrapper">
              <button className="confirm-btn" onClick={confirmAndSave}>
                Confirm & Save Plan
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
