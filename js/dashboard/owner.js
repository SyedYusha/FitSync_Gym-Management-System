import { supabase } from '../config/supabase.js';

// 1. Get total members count
async function getMembersCount() {
    const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
}

// 2. Get recent members with their profile names
async function getRecentMembers(limit = 5) {
    const { data, error } = await supabase
        .from('members')
        .select(`
            id,
            phone,
            status,
            join_date,
            profiles (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

// Helper: Get initials for avatar (e.g., "Sarah Johnson" -> "SJ")
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Helper: Format date nicely
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
    });
}

export async function loadDashboardData() {
    try {
        // A. Load Total Members Count
        const count = await getMembersCount();
        document.getElementById('stat-members').textContent = count;

        // B. Load Recent Members Table
        const members = await getRecentMembers(5);
        const tbody = document.getElementById('recentMembersTableBody');
        tbody.innerHTML = ''; // Clear any old data

        if (members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 1.5rem; color: var(--text-secondary);">No members found. Add your first member!</td></tr>';
            return;
        }

        // C. Render each member row
        members.forEach(member => {
            const name = member.profiles?.full_name || 'Unknown Member';
            const initials = getInitials(name);
            const statusClass = member.status === 'active' ? 'badge-success' : 'badge-danger';

            const row = `
                <tr>
                    <td><div class="table-avatar">${initials}</div></td>
                    <td><strong>${name}</strong></td>
                    <td>${member.phone || 'N/A'}</td>
                    <td><span class="badge ${statusClass}">${member.status}</span></td>
                    <td>${formatDate(member.join_date)}</td>
                    <td><button class="action-dots"><i data-lucide="more-horizontal"></i></button></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        // D. Re-initialize Lucide icons for the newly added rows
        if (window.lucide) window.lucide.createIcons();

    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}