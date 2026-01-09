import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" }
});

/* ================= AUTH ================= */

export const signupUser = async (payload) => {
  const res = await API.post("/auth/signup", payload);
  return res.data;
};

export const loginUser = async (payload) => {
  const res = await API.post("/auth/login", payload);
  return res.data;
};

/* ================= PLAN ================= */

// ✅ PERMANENT 422 FIX
export const generateFitnessPlan = async (form, email) => {
  try {
    const cleanPayload = {
      email: email,
      age: Number(form.age),
      gender: form.gender,
      height: Number(form.height),
      weight: Number(form.weight),
      fitness_level: form.fitness_level,
      diet_type: form.diet_type,
      goal: form.goal || "",
      pregnant: Boolean(form.pregnant),
      pregnancy_month: form.pregnant
        ? Number(form.pregnancy_month)
        : undefined
    };

    const res = await API.post("/plan/generate", cleanPayload);
    return res.data;

  } catch (err) {
    console.error("PLAN GENERATION ERROR DETAIL:", err.response?.data?.detail);
    throw err;
  }
};

// ✅ 404 SAFE (NO CONSOLE SPAM)
export const getSavedFitnessPlan = async (email) => {
  try {
    const res = await API.get(`/plan/saved/${email}`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      return null; // no saved plan yet
    }
    throw err;
  }
};

export const saveFitnessPlan = async (email, plan) => {
  const res = await API.post("/plan/save", { email, plan });
  return res.data;
};
