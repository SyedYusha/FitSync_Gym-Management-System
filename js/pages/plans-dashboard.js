import { supabase } from "../config/supabase.js";

export async function loadPlansData() {
  try {
    const { data: plans, error } = await supabase
      .from("plans")
      .select("*")
      .order("created_at", { ascending: false });

    const tbody = document.getElementById("plansTableBody");
    tbody.innerHTML = "";

    if (error || !plans || plans.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center; padding: 1.5rem; color: var(--text-secondary);">No plans found.</td></tr>';
      return;
    }

    plans.forEach((plan) => {
      const statusBadge = plan.is_active
        ? '<span class="badge badge-success">Active</span>'
        : '<span class="badge badge-danger">Inactive</span>';

      // Notice the data-id attributes on the buttons!
      const row = `
                <tr>
                    <td><strong>${plan.name}</strong><br><small style="color: var(--text-secondary);">${plan.description || ""}</small></td>
                    <td>${plan.duration_months} Month(s)</td>
                    <td>Rs. ${Number(plan.price).toLocaleString()}</td>
                    <td>${statusBadge}</td>
                    <td style="display: flex; gap: 10px;">
                        <button class="action-dots edit-plan-btn" data-id="${plan.id}" title="Edit"><i data-lucide="edit-2"></i></button>
                        <button class="action-dots delete-plan-btn" data-id="${plan.id}" title="Delete" style="color: var(--clr-error);"><i data-lucide="trash-2"></i></button>
                    </td>
                </tr>
            `;
      tbody.innerHTML += row;
    });

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Error loading plans:", err);
  }
}

// --- DELETE FUNCTION ---
export async function deletePlan(id) {
  if (!confirm("Are you sure you want to delete this plan?")) return;

  try {
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) throw error;
    await loadPlansData(); // Refresh table
  } catch (err) {
    alert("Error deleting plan: " + err.message);
  }
}

// --- EDIT FUNCTION (Fills the modal with existing data) ---
export function openEditModal(plan) {
  document.getElementById("editPlanId").value = plan.id;
  document.getElementById("planName").value = plan.name;
  document.getElementById("planDesc").value = plan.description || "";
  document.getElementById("planDuration").value = plan.duration_months;
  document.getElementById("planPrice").value = plan.price;

  // Change modal title to indicate editing
  document.querySelector("#addPlanModal .card-title").textContent = "Edit Plan";
}

// --- RESET MODAL (For when closing or clicking "Add New") ---
export function resetPlanModal() {
  document.getElementById("editPlanId").value = "";
  document.getElementById("addPlanForm").reset();
  document.querySelector("#addPlanModal .card-title").textContent =
    "Add New Plan";
}
