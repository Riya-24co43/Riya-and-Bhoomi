const supabaseUrl = "https://jvyxigccrukxsybckhqx.supabase.co";
const supabaseKey = "sb_publishable_7iBAkOYaHUEfTP1_dTd0PQ__8xWcmXh";
const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);


// =============================
// CARETAKER REGISTRATION
// =============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const relation = document.getElementById("relation").value;
        const patientCode = document.getElementById("patient_code").value;


        // Check whether patient code exists
        const { data: patient, error: patientError } =
            await supabaseClient
                .from("patients")
                .select("id")
                .eq("patient_code", patientCode)
                .single();


        if (patientError || !patient) {

            document.getElementById("message").innerText =
                "Invalid Patient Code.";

            return;
        }


        // Create caretaker account in Supabase Authentication
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


        // Store caretaker information
        const { error: databaseError } =
            await supabaseClient
                .from("caregivers")
                .insert({

                    id: authData.user.id,

                    name: name,

                    username: username,

                    email_id: email,

                    relation: relation,

                    patient_code: patientCode

                });


        if (databaseError) {

            document.getElementById("message").innerText =
                databaseError.message;

            return;
        }


        document.getElementById("message").innerText =
            "Caretaker registration successful!";

    });
}



// =============================
// CARETAKER LOGIN
// =============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;


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

        // Later we will open the caretaker dashboard
        // window.location.href = "caretaker_dashboard.html";

    });
}