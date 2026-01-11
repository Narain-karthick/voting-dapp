// ===============================
// SUPABASE CONFIG
// ===============================
const SUPABASE_URL = "https://ubffamvhdijqzlmpbzmm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_F75moWkvnYsVF3lbT_MnWw_Jaliklye";

// create client ONLY ONCE
const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let role = "admin";

// ===============================
// WAIT FOR DOM TO LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // ROLE BUTTONS
  document.getElementById("adminBtn").addEventListener("click", () => {
    role = "admin";
    document.getElementById("adminBtn").classList.add("active");
    document.getElementById("voterBtn").classList.remove("active");
  });

  document.getElementById("voterBtn").addEventListener("click", () => {
    role = "voter";
    document.getElementById("voterBtn").classList.add("active");
    document.getElementById("adminBtn").classList.remove("active");
  });

  // LOGIN BUTTON
  document.getElementById("loginBtn").addEventListener("click", login);
});

// ===============================
// LOGIN FUNCTION
// ===============================
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  // -------- ADMIN LOGIN --------
  if (role === "admin") {
    const { data, error } = await db
      .from("admins")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    console.log("Admin login:", data, error);

    if (error || !data) {
      alert("Invalid admin credentials");
      return;
    }

    window.location.href = "admin/admin.html";
  }

  // -------- VOTER LOGIN --------
  if (role === "voter") {
    const { data, error } = await db
      .from("voters")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    console.log("Voter login:", data, error);

    if (error || !data) {
      alert("Invalid voter credentials");
      return;
    }

    window.location.href = "voter/voter.html";
  }
}
