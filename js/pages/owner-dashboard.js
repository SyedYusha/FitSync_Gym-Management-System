import { supabase } from "../config/supabase.js";

function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function loadDashboardData() {
  try {
    // 1. Total Members
    const { count: memberCount } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });
    document.getElementById("stat-members").textContent = memberCount || 0;

        // 2. Active Plans (Count memberships with status 'active')
        const { count: activePlans } = await supabase
            .from('memberships')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
        document.getElementById('stat-plans').textContent = activePlans || 0;

        // 3. Expiring Soon (Active memberships ending in the next 30 days)
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];

        const { count: expiring } = await supabase
            .from('memberships')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .gte('end_date', today)
            .lte('end_date', nextMonthStr);
        document.getElementById('stat-expiring').textContent = expiring || 0;

    // 4. Monthly Revenue (Sum of completed payments this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const { data: revenueData } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "completed")
      .gte("payment_date", startOfMonth.toISOString());

    const totalRevenue = revenueData
      ? revenueData.reduce((sum, row) => sum + Number(row.amount), 0)
      : 0;
    document.getElementById("stat-revenue").textContent =
      `$${totalRevenue.toLocaleString()}`;

    // 5. Recent Members Table
    const { data: members, error } = await supabase
      .from("members")
      .select(`id, phone, status, join_date, profiles (full_name)`)
      .order("created_at", { ascending: false })
      .limit(5);

    const tbody = document.getElementById("recentMembersTableBody");
    tbody.innerHTML = "";

    if (error || !members || members.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center; padding: 1.5rem; color: var(--text-secondary);">No members found.</td></tr>';
      return;
    }

    members.forEach((member) => {
      const name = member.profiles?.full_name || "Unknown";
      const initials = getInitials(name);
      const statusClass =
        member.status === "active" ? "badge-success" : "badge-danger";

      tbody.innerHTML += `
                <tr>
                    <td><div class="table-avatar">${initials}</div></td>
                    <td><strong>${name}</strong></td>
                    <td>${member.phone || "N/A"}</td>
                    <td><span class="badge ${statusClass}">${member.status}</span></td>
                    <td>${formatDate(member.join_date)}</td>
                    <td><button class="action-dots"><i data-lucide="more-horizontal"></i></button></td>
                </tr>`;
    });

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

// --- REVENUE CHART FUNCTION ---
export async function loadRevenueChart() {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("amount, payment_date")
      .eq("status", "completed");

    if (error) {
      console.error("Chart fetch error:", error);
      return;
    }

    console.log("Payments found:", payments.length, payments); // ← DEBUG

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const totals = new Array(12).fill(0);
    (payments || []).forEach((p) => {
      totals[new Date(p.payment_date).getMonth()] += Number(p.amount);
    });

    const max = Math.max(...totals, 1);
    const current = new Date().getMonth();

    const container = document.getElementById("revenueChartBars");
    if (!container) return;
    container.innerHTML = "";

    for (let i = 5; i >= 0; i--) {
      let idx = current - i;
      if (idx < 0) idx += 12;
      const val = totals[idx];
      const pct = Math.max((val / max) * 100, 2); // min 2% so bar is visible

      // Update Y-axis labels dynamically
      const axis = document.querySelector(".chart-y-axis");
      if (axis) {
        const step = Math.ceil(max / 3 / 1000) * 1000; // round to nice thousands
        axis.innerHTML = `
                <span>Rs. ${((step * 3) / 1000).toFixed(0)}k</span>
                <span>Rs. ${((step * 2) / 1000).toFixed(0)}k</span>
                <span>Rs. ${(step / 1000).toFixed(0)}k</span>
                <span>Rs. 0</span>`;
      }
      container.innerHTML += `
                <div class="chart-bar-group">
                    <div class="chart-bar" style="height:${pct}%" title="Rs. ${val.toLocaleString()}"></div>
                    <span class="chart-label">${monthNames[idx]}</span>
                </div>`;
    }
  } catch (err) {
    console.error("Chart error:", err);
  }
}
