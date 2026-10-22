(async function () {
    "use strict";

    const supabaseClient = window.novaSupabase;

    // Check if user explicitly wants to be logged in
    const isExplicitLogout = localStorage.getItem("novaExplicitLogout") === "true";

    const setGuestUser = () => {
        window.novaUser = {
            id: "guest_" + (localStorage.getItem("novaGuestId") || Math.random().toString(36).substring(2, 9)),
            email: "guest@nova.ai",
            isGuest: true,
            user_metadata: {
                name: localStorage.getItem("novaUserName") || "ضيف Nova"
            }
        };
        if (!localStorage.getItem("novaGuestId")) {
            localStorage.setItem("novaGuestId", window.novaUser.id);
        }
        console.log("Nova: Running in Guest / Local mode ✅");
    };

    if (!supabaseClient || !supabaseClient.auth) {
        setGuestUser();
        return;
    }

    try {
        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.warn("Nova Auth Session Notice:", error.message);
            setGuestUser();
            return;
        }

        if (!session || !session.user) {
            if (isExplicitLogout) {
                // If user deliberately logged out, keep them on login page if requested
                localStorage.removeItem("novaExplicitLogout");
                if (!window.location.pathname.endsWith("login.html")) {
                    window.location.replace("login.html");
                    return;
                }
            }
            setGuestUser();
            return;
        }

        // Active user session
        window.novaUser = session.user;
        localStorage.removeItem("novaExplicitLogout");
        console.log("Nova: User authenticated:", session.user.email);

        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange((event, newSession) => {
            if (event === "SIGNED_OUT" || !newSession) {
                setGuestUser();
                return;
            }

            if (newSession.user) {
                window.novaUser = newSession.user;
            }
        });

    } catch (error) {
        console.warn("Nova Auth Guard Notice:", error);
        setGuestUser();
    }
})();
