import { supabase } from '../config/supabase.js';

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// 1. Populate the "Select Member" dropdown in the modal
export async function loadMembersDropdown() {
    try {
        const { data: members, error } = await supabase
            .from('members')
            .select('id, profiles (full_name)')
            .order('created_at', { ascending: false });

        const select = document.getElementById('paymentMemberId');
        if (error || !members || members.length === 0) {
            select.innerHTML = '<option value="">No members found</option>';
            return;
        }

        select.innerHTML = '<option value="">-- Select a Member --</option>';
        members.forEach(m => {
            const name = m.profiles?.full_name || 'Unknown';
            select.innerHTML += `<option value="${m.id}">${name}</option>`;
        });
    } catch (err) {
        console.error("Error loading members for dropdown:", err);
    }
}

// 2. Load and render the payments table
export async function loadPaymentsData() {
    try {
        const { data: payments, error } = await supabase
            .from('payments')
            .select(`
                id, amount, payment_method, status, payment_date,
                members (
                    profiles (full_name)
                )
            `)
            .order('payment_date', { ascending: false });

        const tbody = document.getElementById('paymentsTableBody');
        tbody.innerHTML = '';

        if (error || !payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 1.5rem; color: var(--text-secondary);">No payments recorded yet.</td></tr>';
            return;
        }

        payments.forEach(p => {
            const memberName = p.members?.profiles?.full_name || 'Unknown Member';
            
            let statusBadge = '<span class="badge badge-success">Completed</span>';
            if (p.status === 'pending') statusBadge = '<span class="badge badge-warning">Pending</span>';
            if (p.status === 'failed') statusBadge = '<span class="badge badge-danger">Failed</span>';

            const row = `
                <tr>
                    <td><strong>${memberName}</strong></td>
                    <td>Rs. ${Number(p.amount).toLocaleString()}</td>
                    <td style="text-transform: capitalize;">${p.payment_method.replace('_', ' ')}</td>
                    <td>${statusBadge}</td>
                    <td>${formatDate(p.payment_date)}</td>
                    <td><button class="action-dots delete-payment-btn" data-id="${p.id}" style="color: var(--clr-error);"><i data-lucide="trash-2"></i></button></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        if (window.lucide) window.lucide.createIcons();

        // Attach delete listeners
        tbody.querySelectorAll('.delete-payment-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if(confirm('Delete this payment record?')) {
                    await supabase.from('payments').delete().eq('id', btn.dataset.id);
                    await loadPaymentsData();
                }
            });
        });

    } catch (err) {
        console.error("Error loading payments:", err);
    }
}