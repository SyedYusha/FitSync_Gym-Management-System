import { supabase } from '../config/supabase.js';

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// 1. Load and Render Members
export async function loadMembersData(searchTerm = '') {
    try {
        let query = supabase.from('members').select(`id, phone, status, join_date, profiles (full_name)`);

        if (searchTerm) {
            query = query.or(`phone.ilike.%${searchTerm}%, profiles.full_name.ilike.%${searchTerm}%`);
        }

        const { data: members, error } = await query.order('created_at', { ascending: false });
        const tbody = document.getElementById('membersTableBody');
        tbody.innerHTML = ''; // Clear table

        if (error || !members || members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 1.5rem; color: var(--text-secondary);">No members found.</td></tr>';
            return;
        }

        members.forEach(member => {
            const name = member.profiles?.full_name || 'Unknown';
            const initials = getInitials(name);
            const statusClass = member.status === 'active' ? 'badge-success' : 'badge-danger';

            const row = `
                <tr>
                    <td><div class="table-avatar">${initials}</div></td>
                    <td><strong>${name}</strong></td>
                    <td>${member.phone || 'N/A'}</td>
                    <td><span class="badge ${statusClass}">${member.status}</span></td>
                    <td>${formatDate(member.join_date)}</td>
                    <td>
                        <button class="action-dots delete-member-btn" data-id="${member.id}" title="Delete" style="color: var(--clr-error);">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        if (window.lucide) window.lucide.createIcons();

    } catch (err) {
        console.error("Error loading members:", err);
    }
}

// 2. The Delete Function (with strict error logging)
// 2. The Delete Function (Calls Edge Function to wipe Auth + DB)
export async function deleteMember(memberId) {
    if (!confirm('Are you sure? This will permanently delete the member and their login account.')) return;

    console.log("Attempting to delete member ID:", memberId);

    try {
        // 1. First, find the Auth User ID (profile_id) for this member
        const { data: member, error: fetchError } = await supabase
            .from('members')
            .select('profile_id')
            .eq('id', memberId)
            .single();

        if (fetchError || !member) throw new Error("Could not find member details");

        // 2. Call the Edge Function to delete everything securely
        const { data, error } = await supabase.functions.invoke("delete-member", {
            body: { userId: member.profile_id }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        console.log("Member and Auth user deleted successfully from DB!");
        await loadMembersData(); // Refresh the table

    } catch (err) {
        console.error("Error deleting member:", err);
        alert('Error deleting member: ' + err.message);
    }
}

// 3. TRUE EVENT DELEGATION (Attach this ONCE to the parent table body)
// This ensures the delete button ALWAYS works, even after the table refreshes.
export function attachDeleteListeners() {
    const tbody = document.getElementById('membersTableBody');
    if (!tbody) return;

    tbody.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-member-btn');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            if (id) {
                await deleteMember(id);
            }
        }
    });
}