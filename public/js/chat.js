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
    const message = messageInput.value.trim();
    if (message === "")
        return;
    const receiverId = getReceiverIdSomehow();
    socket.emit("sendMessage", { senderId: userId, receiverId, content: message, type: "text" });
    const li = document.createElement("li");
    li.textContent = message;
    li.classList.add("msg-you");
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
    li.classList.add("msg-them");
    console.log("received:", message);
    console.log(message.type);
    if (message.type === "image" || message.content.startsWith("/uploads/")) {
        const img = document.createElement("img");
        img.src = message.content;
        img.alt = "image message";
        img.style.maxWidth = "200px";
        img.style.borderRadius = "10px";
        li.appendChild(img);
        console.log("image send")
    } else {
        console.log("text send")
        li.textContent = message.content;
    }
    document.getElementById("messages").appendChild(li);
    moveUserToTop(message.sender)
});


async function populateReceiverSelect() {
    try {
        const response = await fetch("/api/chat/users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
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
        console.log(messages);

        displayMessages(messages);
    } catch (error) {
        console.error("Error loading conversation:", error);
    }
}

function displayMessages(messages) {
    const messagesList = document.getElementById("messages");
    messagesList.innerHTML = ""; // Clear previous messages
    console.log(messages);
    messages.forEach((message) => {
        const li = document.createElement("li");
        li.className = message.sender === userId ? "msg-you" : "msg-them";
        if (message.type === 'image') {
            const img = document.createElement('img')
            img.src = message.content;
            img.alt = "Image";
            img.style.maxWidth = "200px";
            img.style.borderRadius = "10px";
            li.appendChild(img);
        }
        else {
            // li.innerHTML = `<span>${message.sender === userId ? 'You' : 'Them'}: ${message.content}</span>`;
            li.innerHTML = message.content
        }
        messagesList.appendChild(li);

    });
}

function moveUserToTop(userId) {
    const userElement = document.querySelector(`#message-list p[data-user-id="${userId}"]`);
    const messageList = document.getElementById("message-list");
    console.log(userElement)
    if (userElement && messageList) {
        messageList.insertBefore(userElement, messageList.firstChild);
    }
}


const uploadImgBtn = document.getElementById("uploadImgBtn");
const imageInput = document.getElementById("imageInput")

uploadImgBtn.addEventListener("click", () => {
    imageInput.click();
})

imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0]
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem('token')
    const senderId = userId;
    const receiverId = getReceiverIdSomehow();

    formData.append("senderId", senderId)
    formData.append("receiverId", receiverId)

    try {
        const response = await fetch('/api/chat/uploadImage', {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })

        const result = await response.json();
        if (response.ok) {
            console.log("image uploaded ", result)

            socket.emit("sendMessage", {
                senderId,
                receiverId,
                content: result.imageUrl,
                type: "image"
            })

            const li = document.createElement("li");
            li.classList.add("msg-you");
            if (result.message === "Image uploaded successfully" || result.imageUrl.startsWith("/uploads/")) {
                const img = document.createElement("img");
                img.src = result.imageUrl;
                img.alt = "image message";
                img.style.maxWidth = "200px";
                img.style.borderRadius = "10px";
                li.appendChild(img);
                console.log("image send")
                document.getElementById("messages").appendChild(li);
            } else {
                console.log("text send")
                li.textContent = "";
            }
        } else {
            console.error("Upload error:", result.message);
        }
    } catch (err) {
        console.error("Error uploading image:", err);
    }
    imageInput.value = "";
})

const uploadFileBtn = document.getElementById("uploadFileBtn")
const fileInput = document.getElementById("fileInput");

uploadFileBtn.addEventListener("click", () => {
    fileInput.click();
})

fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        alert("file too big! keep under 10MB")
        return;
    }
    const receiverId = getReceiverIdSomehow();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("senderId", userId);
    formData.append("receiverId", receiverId);

    try {
        const response = await fetch('api/chat/uploadFile', {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        })
        const data = await response.json();
        if (response.ok) {
            socket.emit("sendMessage",{
                userId,
                receiverId,
                content: result.imageUrl,
                type: "file"
            })
        }
    } catch (err) {

    }
})



window.addEventListener("DOMContentLoaded", populateReceiverSelect);
