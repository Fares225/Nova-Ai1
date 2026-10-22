"use strict";

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");
const guestBtn = document.getElementById("guestBtn");

function showMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.className = "message show " + type;
}

if (guestBtn) {
    guestBtn.addEventListener("click", function () {
        localStorage.setItem("novaGuestMode", "true");
        window.location.href = "index.html";
    });
}

loginForm?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        showMessage("اكتب البريد الإلكتروني وكلمة المرور.", "error");
        return;
    }

    if (!window.novaSupabase || !window.novaSupabase.auth) {
        showMessage("جاري الدخول في وضع الضيف (Supabase غير متوفر)...", "success");
        localStorage.setItem("novaGuestMode", "true");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 600);
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "جاري تسجيل الدخول...";

    try {
        const { data, error } = await window.novaSupabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw error;
        }

        showMessage("تم تسجيل الدخول بنجاح ✅ جاري التحويل...", "success");

        // Safely fetch profile role if possible, but never crash login
        try {
            const { data: profile } = await window.novaSupabase
                .from("profiles")
                .select("role, name")
                .eq("id", data.user.id)
                .maybeSingle();

            if (profile?.name) {
                localStorage.setItem("novaUserName", profile.name);
            }
        } catch (profileError) {
            console.warn("Profile fetch optional:", profileError);
        }

        localStorage.removeItem("novaExplicitLogout");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);

    } catch (error) {
        console.error("Nova Login Error:", error);

        let errorText = error.message || "حدث خطأ أثناء تسجيل الدخول.";
        if (errorText.toLowerCase().includes("invalid login credentials")) {
            errorText = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        }

        showMessage(errorText, "error");
        loginBtn.disabled = false;
        loginBtn.textContent = "تسجيل الدخول";
    }
});
