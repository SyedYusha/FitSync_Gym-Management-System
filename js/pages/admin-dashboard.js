import { supabase } from '../config/supabase.js';

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// --- EDIT MEMBER FUNCTION ---
export async function saveMemberEdit(id, name, phone, status, joinDate) {
    // 1. Update members table
    const { error: memError } = await supabase.from('members').update({ phone, status, join_date: joinDate }).eq('id', id);
    if (memError) throw memError;

    // 2. Get profile_id to update name
    const { data: member } = await supabase.from('members').select('profile_id').eq('id', id).single();
    if (member?.profile_id) {
        const { error: profError } = await supabase.from('profiles').update({ full_name: name }).eq('id', member.profile_id);
        if (profError) throw profError;
    }
}

// --- DELETE MEMBER FUNCTION ---
export async function deleteMember(id) {
    if(!confirm('Delete this member?')) return;
    try {
        // For MVP speed, just delete from members table. 
        // For full auth deletion, call the 'delete-member' edge function like in members.js
        const { error } = await supabase.from('members').delete().eq('id', id);
        if (error) throw error;
        await loadAdminDashboard();
    } catch(err) { alert('Error: ' + err.message); }
}

export async function loadAdminDashboard() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const startOfMonth = new Date(); startOfMonth.setDate(1);
        
        // 1. Stats
        const { data: todayPayments } = await supabase.from('payments').select('amount').eq('status', 'completed').gte('payment_date', today);
        const { data: monthPayments } = await supabase.from('payments').select('amount').eq('status', 'completed').gte('payment_date', startOfMonth.toISOString());
        const { count: activeMembers } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active');

        const todayTotal = todayPayments ? todayPayments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
        const monthTotal = monthPayments ? monthPayments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;

        document.getElementById('stat-today-col').textContent = `Rs. ${todayTotal.toLocaleString()}`;
        document.getElementById('stat-month-col').textContent = `Rs. ${monthTotal.toLocaleString()}`;
        document.getElementById('stat-active-mem').textContent = activeMembers || 0;
        document.getElementById('stat-trainers-in').textContent = '0'; // Will update below

        // 2. Members Table & Dropdowns
        const { data: members } = await supabase.from('members').select(`id, phone, status, join_date, profiles (full_name)`).order('created_at', { ascending: false });
        const memTbody = document.getElementById('adminMembersTableBody');
        memTbody.innerHTML = '';
        const memSelect = document.getElementById('attendanceMemberSelect');
        const paySelect = document.getElementById('paymentMemberSelect');
        memSelect.innerHTML = '<option value="">Select Member</option>';
        paySelect.innerHTML = '<option value="">Select Member</option>';

        if (members && members.length > 0) {
            members.forEach(m => {
                const name = m.profiles?.full_name || 'Unknown';
                const statusClass = m.status === 'active' ? 'badge-success' : 'badge-danger';
                
                memTbody.innerHTML += `
                    <tr>
                        <td><strong>${name}</strong></td>
                        <td>${m.phone || 'N/A'}</td>
                        <td><span class="badge ${statusClass}">${m.status}</span></td>
                        <td>${formatDate(m.join_date)}</td>
                        <td>
                            <button class="action-dots edit-member-btn" data-id="${m.id}" data-name="${name}" data-phone="${m.phone}" data-status="${m.status}" data-date="${m.join_date}" title="Edit"><i data-lucide="edit-2"></i></button>
                            <button class="action-dots delete-member-btn" data-id="${m.id}" style="color: var(--clr-error);" title="Delete"><i data-lucide="trash-2"></i></button>
                        </td>
                    </tr>`;
                
                const option = `<option value="${m.id}">${name}</option>`;
                memSelect.innerHTML += option;
                paySelect.innerHTML += option;
            });

            // Edit Listeners
            memTbody.querySelectorAll('.edit-member-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.getElementById('editMemberId').value = btn.dataset.id;
                    document.getElementById('newMemberName').value = btn.dataset.name;
                    document.getElementById('newMemberPhone').value = btn.dataset.phone;
                    document.getElementById('newMemberStatus').value = btn.dataset.status;
                    document.getElementById('newMemberJoinDate').value = btn.dataset.date;
                    document.getElementById('modalTitle').textContent = 'Edit Member';
                    document.getElementById('emailGroup').style.display = 'none'; // Hide email when editing
                    document.getElementById('addMemberModal').style.display = 'flex';
                    lucide.createIcons();
                });
            });

            // Delete Listeners
            memTbody.querySelectorAll('.delete-member-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteMember(btn.dataset.id));
            });
        } else {
            memTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No members found.</td></tr>';
        }

              // 3. Attendance (With Approval Actions)
        const { data: attendance } = await supabase.from('attendance').select(`id, check_in_time, status, members ( profiles (full_name) )`).gte('check_in_time', today).order('check_in_time', { ascending: false });
        const attTbody = document.getElementById('adminAttendanceTableBody');
        attTbody.innerHTML = '';
        
        if (attendance && attendance.length > 0) {
            attendance.forEach(a => {
                const name = a.members?.profiles?.full_name || 'Unknown';
                const statusClass = a.status === 'approved' ? 'badge-success' : a.status === 'pending' ? 'badge-warning' : 'badge-danger';
                
                // Only show Approve button if status is pending
                const actionBtn = a.status === 'pending' 
                    ? `<button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.8rem;" onclick="approveAttendance('${a.id}')">Approve</button>` 
                    : '<span style="color:var(--text-secondary); font-size:0.8rem;">Completed</span>';

                attTbody.innerHTML += `<tr><td><strong>${name}</strong></td><td>${formatTime(a.check_in_time)}</td><td><span class="badge ${statusClass}">${a.status}</span></td><td>${actionBtn}</td></tr>`;
            });
        } else {
            attTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No activity today.</td></tr>';
        }
        // 4. Payments
        const { data: payments } = await supabase.from('payments').select(`amount, payment_method, payment_date, members ( profiles (full_name) )`).order('payment_date', { ascending: false }).limit(5);
        const payTbody = document.getElementById('adminPaymentsTableBody');
        payTbody.innerHTML = '';
        if (payments && payments.length > 0) {
            payments.forEach(p => {
                const name = p.members?.profiles?.full_name || 'Unknown';
                payTbody.innerHTML += `<tr><td><strong>${name}</strong></td><td>Rs. ${Number(p.amount).toLocaleString()}</td><td style="text-transform:capitalize;">${p.payment_method}</td><td>${formatDate(p.payment_date)}</td></tr>`;
            });
        } else {
            payTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No recent payments.</td></tr>';
        }

        // 5. REAL TRAINERS DATA
        const { data: trainers } = await supabase.from('trainers').select(`id, profiles (full_name)`);
        const trainTbody = document.getElementById('adminTrainersTableBody');
        trainTbody.innerHTML = '';
        if (trainers && trainers.length > 0) {
            document.getElementById('stat-trainers-in').textContent = trainers.length;
            trainers.forEach(t => {
                const name = t.profiles?.full_name || 'Unknown Trainer';
                trainTbody.innerHTML += `<tr><td><strong>${name}</strong></td><td>Assigned Members</td><td><span class="badge badge-success">Active</span></td></tr>`;
            });
        } else {
            trainTbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No trainers added yet.</td></tr>';
        }

        // 6. REAL EXPENSES DATA
        const { data: expenses } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
        const expTbody = document.getElementById('adminExpensesTableBody');
        expTbody.innerHTML = '';
        if (expenses && expenses.length > 0) {
            expenses.forEach(ex => {
                const statusClass = ex.status === 'paid' ? 'badge-success' : 'badge-warning';
                expTbody.innerHTML += `<tr><td>${ex.title}</td><td>Rs. ${Number(ex.amount).toLocaleString()}</td><td>${formatDate(ex.expense_date)}</td><td><span class="badge ${statusClass}">${ex.status}</span></td></tr>`;
            });
        } else {
            expTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No expenses recorded.</td></tr>';
        }

        if (window.lucide) window.lucide.createIcons();

    } catch (err) {
        console.error("Admin Dashboard Error:", err);
    }
}
// Make it globally available for the inline onclick handler
window.approveAttendance = async (id) => {
    const { error } = await supabase.from('attendance').update({ status: 'approved' }).eq('id', id);
    if (error) alert('Error approving: ' + error.message);
    else await loadAdminDashboard(); // Refresh table
};