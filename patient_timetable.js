const supabaseUrl = "https://jvyxigccrukxsybckhqx.supabase.co";
const supabaseKey = "sb_publishable_7iBAkOYaHUEfTP1_dTd0PQ__8xWcmXh";

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);


let currentPatientId = null;


// ======================================
// GET LOGGED-IN PATIENT
// ======================================

async function getPatient() {

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();


    if (userError || !userData.user) {

        window.location.href = "patient_login.html";

        return;
    }


    const userId = userData.user.id;


    // Find patient
    const { data: patient, error: patientError } =
        await supabaseClient
            .from("Patients")
            .select("id, name")
            .eq("id", userId)
            .single();


    if (patientError) {

        document.getElementById("message").innerText =
            "Unable to find patient.";

        return;
    }


    currentPatientId = patient.id;


    // Show Monday initially
    showDay("Monday");

}



// ======================================
// SHOW ACTIVITIES
// ======================================

async function showDay(day) {

    if (!currentPatientId) {
        return;
    }


    document.getElementById("selectedDay").innerText =
        day;


    const { data, error } =
        await supabaseClient
            .from("timetable")
            .select("*")
            .eq("patient_id", currentPatientId)
            .eq("day", day)
            .order("time");


    if (error) {

        document.getElementById("activities").innerText =
            error.message;

        return;
    }


    const activitiesDiv =
        document.getElementById("activities");


    activitiesDiv.innerHTML = "";


    if (data.length === 0) {

        activitiesDiv.innerHTML =
            "<p>No activities scheduled.</p>";

        return;
    }


    data.forEach(function(item) {

        const activityDiv =
            document.createElement("div");


        activityDiv.innerHTML = `
            <p>
                <strong>${item.time}</strong>
                - ${item.activity}
            </p>
        `;


        activitiesDiv.appendChild(activityDiv);

    });

}



// Start page
getPatient();