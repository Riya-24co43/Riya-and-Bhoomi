// Supabase Setup
const supabaseUrl = "https://jvyxigccrukxsybckhqx.supabase.co";
const supabaseKey = "sb_publishable_7iBAkOYaHUEfTP1_dTd0PQ__8xWcmXh";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const messageEl = document.getElementById("message");

  // =============================
  // CARETAKER REGISTRATION
  // =============================
  if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (messageEl) messageEl.innerText = "Processing registration...";

      const name = document.getElementById("name").value;
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const relation = document.getElementById("relation").value;
      const patientCode = document.getElementById("patient_code").value;

      // 1. Check whether patient code exists in Patients table
      const { data: patient, error: patientError } = await supabaseClient
        .from("Patients")
        .select("id")
        .eq("patient_code", patientCode)
        .single();

      if (patientError || !patient) {
        if (messageEl) messageEl.innerText = "Invalid Patient Code.";
        return;
      }

      // 2. Create caretaker account in Supabase Authentication
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: email,
        password: password
      });

      if (authError) {
        if (messageEl) messageEl.innerText = authError.message;
        return;
      }

      // 3. Store caretaker information
      const { error: databaseError } = await supabaseClient
        .from("Caretaker")
        .insert({
          auth_id: authData.user.id,
          name: name,
          username: username,
          email_id: email,
          relation: relation,
          patient_code: patientCode
        });

      if (databaseError) {
        if (messageEl) messageEl.innerText = databaseError.message;
        return;
      }

      if (messageEl) messageEl.innerText = "Caretaker registration successful! Redirecting...";

      // 4. Redirect to caretaker dashboard after success
      setTimeout(() => {
        window.location.href = "caretaker_dashboard.html";
      }, 1500);
    });
  }

  // =============================
  // CARETAKER LOGIN
  // =============================
  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (messageEl) messageEl.innerText = "Logging in...";

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // 1. Login using Supabase Authentication
      const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        if (messageEl) messageEl.innerText = "Login failed: " + error.message;
        return;
      }

      // 2. Fetch caretaker profile using auth_id
      const { data: caretakerProfile, error: profileError } = await supabaseClient
        .from("Caretaker")
        .select("*")
        .eq("auth_id", authData.user.id)
        .single();

      if (profileError) {
        if (messageEl) messageEl.innerText = "Error loading profile: " + profileError.message;
        return;
      }

      // 3. Fetch linked patient's numeric primary key ID using patient_code
      const { data: linkedPatient, error: patientFetchError } = await supabaseClient
        .from("Patients")
        .select("id")
        .eq("patient_code", caretakerProfile.patient_code)
        .single();

      if (!patientFetchError && linkedPatient) {
        localStorage.setItem("linked_patient_id", linkedPatient.id);
      }

      // 4. Save caretaker details in local storage
      localStorage.setItem("caretaker_id", caretakerProfile.id);
      localStorage.setItem("patient_code", caretakerProfile.patient_code);
      localStorage.setItem("caretaker_name", caretakerProfile.name);

      if (messageEl) messageEl.innerText = "Login successful! Redirecting...";

      // 5. Redirect to caretaker dashboard
      setTimeout(() => {
        window.location.href = "caretaker_dashboard.html";
      }, 1000);
    });
  }
});