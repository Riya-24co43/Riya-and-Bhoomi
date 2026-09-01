const supabaseUrl = "https://jvyxigccrukxsybckhqx.supabase.co";
const supabaseKey = "sb_publishable_7iBAkOYaHUEfTP1_dTd0PQ__8xWcmXh";

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);


let currentPatientId = null;
let selectedDay = "Monday";


// ======================================
// GET LOGGED-IN CARETAKER
// ======================================

async function getCaretaker() {

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {

        window.location.href = "caretaker_login.html";

        return;
    }

    const userId = userData.user.id;


    // Get caretaker information
    const { data: caretaker, error: caretakerError } =
        await supabaseClient
            .from("caretaker")
            .select("*")
            .eq("id", userId)
            .single();


    if (caretakerError) {

        document.getElementById("message").innerText =
            caretakerError.message;

        return;
    }


    // Get patient using patient code
    const { data: patient, error: patientError } =
        await supabaseClient
            .from("Patients")
            .select("id, name")
            .eq("patient_code", caretaker.patient_code)
            .single();


    if (patientError) {

        document.getElementById("message").innerText =
            "Unable to find connected patient.";

        return;
    }


    currentPatientId = patient.id;

    document.getElementById("patientName").innerText =
        "Patient: " + patient.name;


    // Show Monday initially
    showDay("Monday");
}



// ======================================
// SHOW SELECTED DAY
// ======================================

async function showDay(day) {

    if (!currentPatientId) {
        return;
    }

    selectedDay = day;

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
            "<p>No activities added.</p>";

        return;
    }


    data.forEach(function(item) {

        const activityDiv =
            document.createElement("div");


        activityDiv.innerHTML = `
            <p>
                <strong>${item.time}</strong>
                - ${item.activity}

                <button onclick="editActivity(${item.id}, '${item.time}', '${item.activity}')">
                    Edit
                </button>

                <button onclick="deleteActivity(${item.id})">
                    Delete
                </button>
            </p>
        `;


        activitiesDiv.appendChild(activityDiv);

    });

}



// ======================================
// ADD ACTIVITY
// ======================================

const activityForm =
    document.getElementById("activityForm");


activityForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const time =
        document.getElementById("time").value;

    const activity =
        document.getElementById("activity").value;


    const { error } =
        await supabaseClient
            .from("timetable")
            .insert({

                patient_id: currentPatientId,

                day: selectedDay,

                time: time,

                activity: activity

            });


    if (error) {

        document.getElementById("message").innerText =
            error.message;

        return;
    }


    document.getElementById("message").innerText =
        "Activity added successfully.";


    document.getElementById("time").value = "";
    document.getElementById("activity").value = "";


    showDay(selectedDay);

});



// ======================================
// DELETE ACTIVITY
// ======================================

async function deleteActivity(id) {

    const confirmDelete =
        confirm("Delete this activity?");


    if (!confirmDelete) {
        return;
    }


    const { error } =
        await supabaseClient
            .from("timetable")
            .delete()
            .eq("id", id);


    if (error) {

        document.getElementById("message").innerText =
            error.message;

        return;
    }


    document.getElementById("message").innerText =
        "Activity deleted.";


    showDay(selectedDay);

}



// ======================================
// EDIT ACTIVITY
// ======================================

async function editActivity(id, oldTime, oldActivity) {

    const newTime =
        prompt("Enter new time:", oldTime);


    if (newTime === null) {
        return;
    }


    const newActivity =
        prompt("Enter new activity:", oldActivity);


    if (newActivity === null) {
        return;
    }


    const { error } =
        await supabaseClient
            .from("timetable")
            .update({

                time: newTime,

                activity: newActivity

            })
            .eq("id", id);


    if (error) {

        document.getElementById("message").innerText =
            error.message;

        return;
    }


    document.getElementById("message").innerText =
        "Activity updated.";


    showDay(selectedDay);

}



// ======================================
// START THE PAGE
// ======================================

getCaretaker();