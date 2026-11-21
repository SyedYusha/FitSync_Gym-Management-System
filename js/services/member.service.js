import { supabase } from '../config/supabase.js';

// 1. Get the total count of members
export async function getMembersCount() {
    const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
}

// 2. Get recent members with their profile names
export async function getRecentMembers(limit = 5) {
    // We use a "join" here: members.profiles(full_name)
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