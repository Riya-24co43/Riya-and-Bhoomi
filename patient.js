// Supabase Setup
const supabaseUrl = "https://jvyxigccrukxsybckhqx.supabase.co";
const supabaseKey = "sb_publishable_7iBAkOYaHUEfTP1_dTd0PQ__8xWcmXh";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const messageEl = document.getElementById("message");

  // ==========================================
  // 1. PATIENT REGISTRATION LOGIC
  // ==========================================
  if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      messageEl.innerText = "Processing registration...";

      const name = document.getElementById("name").value;
      const username = document.getElementById("username").value;
      const age = document.getElementById("age").value;
      const language = document.getElementById("language").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Create Patient Auth Account
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: email,
        password: password
      });

      if (authError) {
        messageEl.innerText = authError.message;
        return;
      }

      // Generate Unique Patient Code
      const patientCode = "PAT-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Store in Patients Table
      const { error: databaseError } = await supabaseClient
        .from("Patients")
        .insert({
          auth_id: authData.user.id,
          name: name,
          username: username,
          age: age ? parseInt(age, 10) : null,
          email_id: email,
          patient_code: patientCode,
          language: language
        });

      if (databaseError) {
        messageEl.innerText = databaseError.message;
        return;
      }

      // Display Success Message & Redirect
      messageEl.innerText = "Registration successful! Your Code is: " + patientCode + ". Redirecting...";

      setTimeout(() => {
        window.location.href = "patient_dashboard.html";
      }, 2000);
    });
  }

  // ==========================================
  // 2. PATIENT LOGIN LOGIC
  // ==========================================
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      messageEl.innerText = "Logging in...";

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Authenticate User with Supabase
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        messageEl.innerText = error.message;
        return;
      }

      // Login Successful -> Redirect to Patient Dashboard
      messageEl.innerText = "Login successful! Redirecting...";

      setTimeout(() => {
        window.location.href = "patient_dashboard.html";
      }, 1000);
    });
  }
});