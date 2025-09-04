document.addEventListener("DOMContentLoaded", function () {
  let accountData = [];

  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const userListContainer = document.getElementById("user-list-container");
  const speakBtn = document.getElementById("speak-btn");
  const transcriptionBox = document.getElementById("transcription-box");

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
  speakBtn.addEventListener("click", startAnimatedConversation);

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), {
        type: "array",
      });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      displayAccounts(jsonData);
    };
    reader.readAsArrayBuffer(file);
  }

  function displayAccounts(accounts) {
    accountData = accounts;
    userListContainer.innerHTML = "";
    if (accounts.length === 0) {
      userListContainer.innerHTML = '<p class="text-muted">No data found.</p>';
      return;
    }
    dropZone.style.display = "none";

    accounts.forEach((account, index) => {
      const card = document.createElement("div");
      card.className = "card account-card";
      card.setAttribute("data-name", account.Name || "N/A"); // For Name
      card.setAttribute("data-phone", account.Phone || "N/A"); // For Phone
      card.setAttribute("data-reason", account.Reason || "N/A"); // For Reason
      card.setAttribute("data-amount", account.Invoice_Amount || 0); // For Amount
      //   <p class="mb-1"><strong>Due Date:</strong> ${formattedDue}</p>

      card.setAttribute("data-date", account.Formatted_Due || "N/A");

      card.setAttribute(
        "data-date",
        new Date(account.Due).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );

      let statusHTML = "";
      if (index === 0)
        statusHTML = `<div class="mt-2 status-field"><strong class="text-warning">Status: In Progress</strong></div>`;
      else
        statusHTML = `<div class="mt-2 status-field"><strong class="text-muted">Status: Pending</strong></div>`;

      const dueRaw = account.Due || "";
      const formattedDue = dueRaw
        ? dayjs(dueRaw, "DD-MMM-YY").format("MMMM D, YYYY")
        : "N/A";

      card.innerHTML = `
            <h5 class="fw-bold">${account.Name || "N/A"}</h5>
            <p class="mb-1"><strong>Phone:</strong> ${
              account.Phone || "N/A"
            }</p>
            <p class="mb-1"><strong>Reason:</strong> ${
              account.Reason || "N/A"
            }</p>
            <p class="mb-1"><strong>Due Amount:</strong> $${(
              account.Invoice_Amount || 0
            ).toFixed(2)}</p>


            ${statusHTML}
          `;
      userListContainer.appendChild(card);
    });
  }

  async function startAnimatedConversation() {
    transcriptionBox.innerHTML = "";
    speakBtn.disabled = true;
    speakBtn.textContent = "Conversation in Progress...";

    const userCards = document.querySelectorAll(".account-card");
    const currentCard = Array.from(userCards).find((card) =>
      card
        .querySelector(".status-field strong")
        .textContent.includes("In Progress")
    );

    // Taking the variable-name

    const userName = currentCard?.dataset.name || "the user";
    const phone = currentCard?.dataset.phone || "N/A";
    const reason = currentCard?.dataset.reason || "N/A";
    const amount = parseFloat(currentCard?.dataset.amount || 0).toFixed(2);

    const invoiceDate = currentCard?.dataset.date || "N/A";

    // const Amount = currentCard ?.dataset.Invoice_Amount : 'the user';

    const messages = [
      { sender: "user", text: `${userName} : Hello who's this?` },
      {
        sender: "bot",
        text: `Call Agent : Hello, ${userName}, this is Tom from Capgemini. I hope you're doing well. I'm reaching out regarding an unpaid invoice of $${amount} for "${reason}" that was due on August 01, 2025. Could you please confirm the payment status?`,
      },
      { sender: "user", text: `User : I made the payment already.` },
      {
        sender: "bot",
        text: `Call Agent : Thank you for letting me know, ${userName}. Could you please provide the payment confirmation or transaction details so we can verify and update our records? Thanks for your help!`,
      },
      { sender: "user", text: "User : Sure, I will share it via mail" },
      {
        sender: "bot",
        text: `Call Agent : Got it, ${userName}. I'll check our email records for the payment confirmation. If we need any more information, I'll be in touch. Thanks for your patience and for handling this!`,
      },
      { sender: "user", text: "User : Sure, please check and let me Know" },
      {
        sender: "bot",
        text: `Call Agent : I'll review our email records and confirm the payment for you, ${userName}. Thank you for your patience. If everything checks out, I'll update you as soon as possible. Have a great day!`,
      },
      { sender: "user", text: "User : Sure. Thank you" },
      { sender: "bot", text: "Call Agent : Thank you for your time. Goodbye!" },
    ];

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const message of messages) {
      const messageContainer = document.createElement("div");
      messageContainer.className = `message-container ${message.sender}-container`;

      const messageBubble = document.createElement("div");
      messageBubble.className = "message";
      messageBubble.textContent = message.text;

      messageContainer.appendChild(messageBubble);
      transcriptionBox.appendChild(messageContainer);
      transcriptionBox.scrollTop = transcriptionBox.scrollHeight;

      await wait(3400);
    }

    // ✅ Correct status update
    if (currentCard) {
      const statusField = currentCard.querySelector(".status-field strong");
      statusField.className = "status-success";
      statusField.textContent = "Status: Success";

      const nextCard = currentCard.nextElementSibling;
      if (nextCard) {
        await wait(1500);
        const nextStatusField = nextCard.querySelector(".status-field strong");
        nextStatusField.className = "text-warning";
        nextStatusField.textContent = "Status: In Progress";
      }
    }

    speakBtn.disabled = false;
    speakBtn.textContent = "Speak to the User";
  }
});
