import { supabase } from '../config/supabase.js';

export async function loadReportsData() {
    try {
        // Total Revenue
        const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'completed');
        const totalRevenue = payments ? payments.reduce((sum, row) => sum + Number(row.amount), 0) : 0;
        document.getElementById('report-total-revenue').textContent = `Rs. ${totalRevenue.toLocaleString()}`;

        // Total Members
        const { count: members } = await supabase.from('members').select('*', { count: 'exact', head: true });
        document.getElementById('report-total-members').textContent = members || 0;

        // Total Check-ins
        const { count: checkins } = await supabase.from('attendance').select('*', { count: 'exact', head: true });
        document.getElementById('report-total-checkins').textContent = checkins || 0;

    } catch (err) {
        console.error("Error loading reports:", err);
    }
}