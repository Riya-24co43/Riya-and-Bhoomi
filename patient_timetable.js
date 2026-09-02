const supabaseUrl = "https://jvyxigccrukxsybckhqx.supabase.co";
const supabaseKey = "sb_publishable_7iBAkOYaHUEfTP1_dTd0PQ__8xWcmXh";

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

let currentPatientId = null;
let currentSelectedDay = "Monday";

document.addEventListener("DOMContentLoaded", async function () {
  const backBtn = document.getElementById("backBtn");
  const newTaskBtn = document.getElementById("newTaskBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  const taskForm = document.getElementById("taskForm");

  if (backBtn) {
    backBtn.addEventListener("click", () => window.history.back());
  }

  if (newTaskBtn) {
    newTaskBtn.addEventListener("click", () => openTaskModal());
  }

  if (cancelModalBtn) {
    cancelModalBtn.addEventListener("click", closeTaskModal);
  }

  if (taskForm) {
    taskForm.addEventListener("submit", handleFormSubmit);
  }

  await initializePatient();
});

// Get patient details from Supabase auth or fallback storage
async function initializePatient() {
  const { data: userData } = await supabaseClient.auth.getUser();

  if (userData && userData.user) {
    const { data: patient } = await supabaseClient
      .from("Patients")
      .select("id")
      .eq("auth_id", userData.user.id)
      .single();

    if (patient) {
      currentPatientId = patient.id;
    }
  }

  if (!currentPatientId) {
    currentPatientId = localStorage.getItem("patient_id") || 1;
  }

  fetchTimetable();
}

// Fetch activities matching Supabase schema: id, patient_id, day, time, activity
async function fetchTimetable() {
  const scheduleList = document.getElementById("scheduleList");
  if (!scheduleList) return;

  scheduleList.innerHTML = `<div class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading schedule...</div>`;

  const { data: tasks, error } = await supabaseClient
    .from("timetable")
    .select("id, patient_id, day, time, activity")
    .eq("patient_id", currentPatientId)
    .order("time", { ascending: true });

  if (error) {
    console.error("Error loading timetable:", error);
    scheduleList.innerHTML = `<div class="empty-text">Failed to load schedule.</div>`;
    return;
  }

  if (!tasks || tasks.length === 0) {
    scheduleList.innerHTML = `<div class="empty-text">No activities scheduled. Click "+ New Task" to add one!</div>`;
    return;
  }

  scheduleList.innerHTML = "";

  tasks.forEach((item, index) => {
    // Format 24hr Postgres time string (e.g., "14:30:00") to 12hr display format
    const timeParts = formatPostgresTime(item.time);

    const isTealBadge = index === 0;
    const hasLeftBorder = index === 1;

    const card = document.createElement("div");
    card.className = `schedule-card ${hasLeftBorder ? 'accent-border' : ''}`;

    card.innerHTML = `
      <div class="time-badge ${isTealBadge ? 'teal' : 'grey'}">
        <span class="time-val">${timeParts.val}</span>
        <span class="time-ampm">${timeParts.ampm}</span>
      </div>
      <div class="task-info">
        <div class="task-heading">${item.activity}</div>
      </div>
      <button class="action-icon edit-pencil" title="Edit Task">
        <i class="fas fa-pencil"></i>
      </button>
    `;

    const editBtn = card.querySelector(".edit-pencil");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openTaskModal(item);
      });
    }

    scheduleList.appendChild(card);
  });
}

// Converts standard Postgres `time` type (HH:MM:SS) to UI display { val: "2:30", ampm: "PM" }
function formatPostgresTime(timeStr) {
  if (!timeStr) return { val: "--", ampm: "" };
  
  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  return {
    val: `${hours}:${minutesStr}`,
    ampm: ampm
  };
}

function openTaskModal(task = null) {
  const modal = document.getElementById("taskModal");
  const modalTitle = document.getElementById("modalTitle");

  if (task) {
    modalTitle.innerText = "Edit Task";
    document.getElementById("taskId").value = task.id;
    document.getElementById("taskDay").value = task.day || "Monday";
    
    // Ensure standard HH:MM format for HTML time input
    const formattedTime = task.time ? task.time.substring(0, 5) : "";
    document.getElementById("taskTime").value = formattedTime;
    
    document.getElementById("taskActivity").value = task.activity || "";
  } else {
    modalTitle.innerText = "Add New Task";
    document.getElementById("taskId").value = "";
    document.getElementById("taskDay").value = "Monday";
    document.getElementById("taskTime").value = "";
    document.getElementById("taskActivity").value = "";
  }

  modal.style.display = "flex";
}

function closeTaskModal() {
  document.getElementById("taskModal").style.display = "none";
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("taskId").value;
  const day = document.getElementById("taskDay").value;
  const time = document.getElementById("taskTime").value; // Returns "HH:MM"
  const activity = document.getElementById("taskActivity").value;

  const payload = {
    patient_id: currentPatientId,
    day: day,
    time: time,
    activity: activity
  };

  if (id) {
    await supabaseClient
      .from("timetable")
      .update(payload)
      .eq("id", id);
  } else {
    await supabaseClient
      .from("timetable")
      .insert([payload]);
  }

  closeTaskModal();
  fetchTimetable();
}