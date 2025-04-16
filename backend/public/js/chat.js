const socket = io();
const form = document.getElementById('form');
const token = localStorage.getItem("token");
const headingName = document.getElementById("name");

if (!token) {
    window.location.href("index.html")
}
const userData = parseJwt(token);
const userId = userData.id;

socket.emit("join", userId);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageInput = document.getElementById("input");
    const message = messageInput.value;
    const receiverId = getReceiverIdSomehow();
    socket.emit("sendMessage", { senderId: userId, receiverId, content: message });
    const li = document.createElement("li");
    li.textContent = message;
    li.style.textAlign = "right";
    document.getElementById("messages").appendChild(li);
    messageInput.value = "";
});


function getReceiverIdSomehow() {
    // const selectElem = document.getElementById("receiverSelect");
    const selectElem = document.querySelector("#message-list p.selected");
    if (selectElem) {
        const selectedUserId = selectElem.dataset.userId;
        if (selectedUserId === "") {
            alert("Please select a recipient.");
            return null;
        }
        return selectedUserId;
    }
    // Optionally, you could fallback to a default recipient if needed.
    return null;
}


function parseJwt(token) {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

socket.on("receiveMessage", (message) => {
    const li = document.createElement("li");
    li.textContent = message.content;
    li.style.textAlign = "left";
    document.getElementById("messages").appendChild(li);
});


async function populateReceiverSelect() {
    try {
        const response = await fetch("/api/chat/users");
        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }
        const users = await response.json();
        const messageList = document.getElementById("message-list");
        const containerRight = document.querySelector(".container-right");
        const headingName = document.getElementById("name");

        users.forEach((user) => {
            const p = document.createElement("p");
            p.dataset.userId = user._id;
            p.textContent = user.username;
            p.classList.add("user-item");

            p.addEventListener("click", () => {
                // Remove previous selection
                document.querySelectorAll("#message-list p").forEach((ele) =>
                    ele.classList.remove("selected")
                );
                p.classList.add("selected");

                // Show the chat container
                containerRight.classList.remove("hidden");

                // Update heading
                headingName.textContent = user.username;

                // Load messages
                const receiverId = p.dataset.userId;
                if (receiverId) {
                    loadConversation(receiverId);
                }
            });

            messageList.appendChild(p);
        });
    } catch (error) {
        console.error("Error populating users:", error);
    }
}



async function loadConversation(receiverId) {
    try {
        const token = localStorage.getItem("token");
        // Assume you have a function to decode the token and get the current user data if needed.
        const response = await fetch(`/api/chat/conversation?userId=${userId}&receiverId=${receiverId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch conversation history");
        }

        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error("Error loading conversation:", error);
    }
}

function displayMessages(messages) {
    const messagesList = document.getElementById("messages");
    messagesList.innerHTML = ""; // Clear previous messages

    messages.forEach((message) => {
        // const li = document.createElement("li");
        // li.textContent = `${message.sender === userId ? 'You' : 'Them'}: ${message.content}`;
        // messagesList.appendChild(li);
        const li = document.createElement("li");
        li.className = message.sender === userId ? "msg-you" : "msg-them";
        li.innerHTML = `<span>${message.sender === userId ? 'You' : 'Them'}: ${message.content}</span>`;
        messagesList.appendChild(li);

    });
}

window.addEventListener("DOMContentLoaded", populateReceiverSelect);
