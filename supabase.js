const SUPABASE_URL =
    "https://zywftdjsqvaarzmcsuxj.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_7iBzDFRA21wVb3R29C_K5w_jxVhVkHO";

let supabaseClient = null;

try {
    if (window.supabase && typeof window.supabase.createClient === "function") {
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );
    } else {
        console.warn("Nova: window.supabase is not available, running in offline/guest mode.");
    }
} catch (err) {
    console.warn("Nova Supabase client init warning:", err);
}

window.novaSupabase = supabaseClient;

window.novaGetAuthHeaders = async function () {
    try {
        const client = window.novaSupabase;

        if (!client || !client.auth) {
            return {};
        }

        const { data } =
            await client.auth.getSession();

        const token =
            data?.session?.access_token;

        if (!token) {
            return {};
        }

        return {
            Authorization:
                `Bearer ${token}`
        };

    } catch (error) {
        console.warn(
            "Nova Auth Header Notice:",
            error
        );

        return {};
    }
};
