/* =========================================================================
   1. SUPABASE CONNECTION (COMMENTED OUT FOR LOCAL PREVIEW TESTING)
   ========================================================================= */
/*
const supabaseUrl = "https://jvyxigccrukxsybckhqx.supabase.co";
const supabaseKey = "sb_publishable_7iBAkOYaHUEfTP1_dTd0PQ__8xWcmXh";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
*/

/* =========================================================================
   2. MOCK DATA FOR LOCAL TEMPORARY TESTING (NO icon_class COLUMN)
   ========================================================================= */
const mockTasks = [
  {
    id: 1,
    title: "Take morning medicine",
    subtitle: "With breakfast",
    is_completed: false
  },
  {
    id: 2,
    title: "Drink a glass of water",
    subtitle: "Stay hydrated",
    is_completed: false
  },
  {
    id: 3,
    title: "Afternoon walk",
    subtitle: "15 minutes in the garden",
    is_completed: false
  }
];

document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");

  // Back / Logout Action
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      window.location.href = "patient_dashboard.html";
    });
  }

  // Load local preview data
  loadLocalChecklist();

  // Uncomment when ready for real Supabase data:
  // fetchSupabaseChecklist();
});

/* =========================================================================
   3. ICON HELPER FUNCTION (NO DATABASE COLUMN NEEDED)
   ========================================================================= */
function getTaskIcon(title) {
  const lowerTitle = (title || "").toLowerCase();

  if (lowerTitle.includes("medicine") || lowerTitle.includes("pill")) {
    return "fa-prescription-bottle-medical";
  }
  if (lowerTitle.includes("water") || lowerTitle.includes("drink")) {
    return "fa-droplet";
  }
  if (lowerTitle.includes("walk") || lowerTitle.includes("exercise")) {
    return "fa-person-walking";
  }
  
  // Default fallback icon for any other task
  return "fa-calendar-check";
}

/* =========================================================================
   4. LOCAL PREVIEW LOGIC
   ========================================================================= */
function loadLocalChecklist() {
  const container = document.getElementById("checklistContainer");
  container.innerHTML = "";

  mockTasks.forEach((task) => {
    const card = createChecklistCard(task, async (newStatus) => {
      task.is_completed = newStatus;
      console.log(`[Preview Mode] Task "${task.title}" state:`, newStatus);
    });

    container.appendChild(card);
  });
}

/* =========================================================================
   5. CARD GENERATOR HELPER FUNCTION
   ========================================================================= */
function createChecklistCard(task, onToggleCallback) {
  const card = document.createElement("div");
  card.className = `checklist-card ${task.is_completed ? "completed" : ""}`;

  // Automatically derive icon from task title
  const iconClass = getTaskIcon(task.title);

  card.innerHTML = `
    <div class="square-checkbox">
      ${task.is_completed ? '<i class="fas fa-check"></i>' : ""}
    </div>
    <div class="task-content">
      <div class="task-title">${task.title}</div>
      <div class="task-subtitle">${task.subtitle || ""}</div>
    </div>
    <div class="task-side-icon">
      <i class="fas ${iconClass}"></i>
    </div>
  `;

  // Toggle click listener
  card.addEventListener("click", function () {
    const isNowCompleted = !card.classList.contains("completed");

    // Immediate visual update
    card.classList.toggle("completed", isNowCompleted);
    const checkboxEl = card.querySelector(".square-checkbox");
    checkboxEl.innerHTML = isNowCompleted ? '<i class="fas fa-check"></i>' : "";

    // Trigger state change handler
    onToggleCallback(isNowCompleted);
  });

  return card;
}

/* =========================================================================
   6. REAL SUPABASE FETCH & SYNC (UNCOMMENT WHEN DATABASE IS READY)
   ========================================================================= */
/*
async function fetchSupabaseChecklist() {
  const container = document.getElementById("checklistContainer");
  container.innerHTML = "<p style='text-align:center; color:#64748b;'>Loading checklist...</p>";

  const patientCode = localStorage.getItem("patient_code") || "PATIENT123";

  // Fetch tasks matching patient_code
  const { data: tasks, error } = await supabaseClient
    .from("Patient_Checklist")
    .select("id, patient_code, title, subtitle, is_completed")
    .eq("patient_code", patientCode)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching checklist:", error);
    container.innerHTML = "<p style='color:red; text-align:center;'>Failed to load tasks.</p>";
    return;
  }

  if (!tasks || tasks.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:#64748b;'>No tasks scheduled for today.</p>";
    return;
  }

  container.innerHTML = "";

  tasks.forEach((task) => {
    const card = createChecklistCard(task, async (newStatus) => {
      // Live update in Supabase
      const { error: updateError } = await supabaseClient
        .from("Patient_Checklist")
        .update({ is_completed: newStatus })
        .eq("id", task.id);

      if (updateError) {
        console.error("Failed to update status in Supabase:", updateError);
      }
    });

    container.appendChild(card);
  });
}
*/