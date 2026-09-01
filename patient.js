const supabaseUrl = "https://jvyxigccrukxsybckhqx.supabase.co";
const supabaseKey = "sb_publishable_7iBAkOYaHUEfTP1_dTd0PQ__8xWcmXh";

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);


// =============================
// PATIENT REGISTRATION
// =============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const username = document.getElementById("username").value;
        const age = document.getElementById("age").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const language = document.getElementById("language").value;


        // Create account in Supabase Authentication
        const { data: authData, error: authError } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password
            });


        if (authError) {

            document.getElementById("message").innerText =
                authError.message;

            return;
        }


        // Generate unique patient code
        const patientCode =
            "PAT-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();


        // Store patient information in patients table
        const { error: databaseError } =
            await supabaseClient
                .from("patients")
                .insert({

                    id: authData.user.id,

                    name: name,

                    username: username,

                    age: age,

                    email_id: email,

                    patient_code: patientCode,

                    language: language
                });


        if (databaseError) {

            document.getElementById("message").innerText =
                databaseError.message;

            return;
        }


        document.getElementById("message").innerText =
            "Registration successful! Your Patient Code is: "
            + patientCode;

    });
}



// =============================
// PATIENT LOGIN
// =============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;


        // Login using Supabase Authentication
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            document.getElementById("message").innerText =
                "Login failed: " + error.message;

            return;
        }


        document.getElementById("message").innerText =
            "Login successful!";

        // Later:
        // window.location.href = "patient_dashboard.html";

    });
}