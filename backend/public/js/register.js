async function register() {

    const firstName = document.getElementById("firstname").value;
    const lastName = document.getElementById("lastname").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstName,
                lastName,
                username,
                password,
            }),
        });
        const data = await response.json();
        console.log("Register success:", data);
        alert("Registered successfully!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Registration error:", err);
        alert("Registration failed.");
    }
}
