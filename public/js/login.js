async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch('/api/auth/login', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password })
  })

  const data = await res.json();
  console.log(data)
  if (res.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    window.location.href = "chat.html";
  }
  else {
    alert(data.message || "Login failed");
  }
}