import { Database } from '@/src/types/database.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


export async function resetUserPassword(email: string) {
  const supabase = createClientComponentClient<Database>();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error };
  }
}