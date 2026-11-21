import { supabase } from '../config/supabase.js';

// 1. Populate the Member Dropdown
export async function loadMembersDropdown() {
    try {
        const { data: members, error } = await supabase
            .from('members')
            .select('id, profiles (full_name)')
            .eq('status', 'active') // Only show active members
            .order('profiles(full_name)', { ascending: true });

        const select = document.getElementById('attendanceMemberId');
        if (error || !members || members.length === 0) {
            select.innerHTML = '<option value="">No active members found</option>';
            return;
        }

        select.innerHTML = '<option value="">-- Select a Member --</option>';
        members.forEach(m => {
            const name = m.profiles?.full_name || 'Unknown';
            select.innerHTML += `<option value="${m.id}">${name}</option>`;
        });
    } catch (err) {
        console.error("Error loading members:", err);
    }
}

// 2. Mark Check-In (Inserts into DB)
export async function markCheckIn(memberId) {
    const { error } = await supabase.from('attendance').insert({
        member_id: memberId
        // check_in_time defaults to NOW() automatically in the DB
    });
    if (error) throw error;
}

// 3. Load Today's Attendance Log
export async function loadTodaysAttendance() {
    try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        const { data: records, error } = await supabase
            .from('attendance')
            .select(`
                id, check_in_time,
                members (
                    profiles (full_name)
                )
            `)
            .gte('check_in_time', today) // Filter for today only
            .order('check_in_time', { ascending: false });

        const tbody = document.getElementById('attendanceTableBody');
        const badge = document.getElementById('todayCountBadge');
        tbody.innerHTML = '';

        if (error || !records || records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 1.5rem; color: var(--text-secondary);">No check-ins recorded today.</td></tr>';
            badge.textContent = '0 Check-ins';
            return;
        }

        badge.textContent = `${records.length} Check-in${records.length > 1 ? 's' : ''}`;

        records.forEach(record => {
            const name = record.members?.profiles?.full_name || 'Unknown Member';
            const time = new Date(record.check_in_time).toLocaleTimeString('en-US', { 
                hour: '2-digit', minute: '2-digit' 
            });

            const row = `
                <tr>
                    <td><strong>${name}</strong></td>
                    <td>${time}</td>
                    <td><span class="badge badge-success">Present</span></td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (err) {
        console.error("Error loading attendance:", err);
    }
}