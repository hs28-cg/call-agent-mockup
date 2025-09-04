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
        statusHTML = `<div class="mt-2 status-field"><strong class="text-warning">Status: Generating User Context</strong></div>`;
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
    speakBtn.textContent = "Context Generation in Progress...";

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
{ 
  sender: "bot", 
  text: `Call Agent : You are calling, ${userName}, Act as Tom from Capgemini. You are reaching out regarding an unpaid invoice of $${amount} for "${reason}" that was due on August 01, 2025. Act as a professional collections agent responsible for contacting customers regarding overdue payments. Your goal is to recover outstanding dues while maintaining a respectful, empathetic, and solution-oriented approach. Use a courteous, calm, and confident tone. Be empathetic but firm, solution-focused, and non-confrontational. Always verify the customer's identity before discussing account details. Use clear, polite language and avoid aggressive phrasing. Listen actively and acknowledge the customer’s situation. Offer flexible solutions when possible, such as payment plans. Avoid threats or ultimatums; instead, emphasize resolution and cooperation. Maintain confidentiality and professionalism at all times. Begin calls with: "Hello", State the reason clearly: "I'm reaching out to discuss a pending balance that appears to be overdue. I’d like to help you resolve this today." Close with: "Thank you for your time, and I appreciate your cooperation. If you have any questions or need support, feel free to reach out."
` 
},
{ 
  sender: "bot", 
  text: "Sending.. Context to Caller Agent" 
}

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
    speakBtn.textContent = "Generate for next user";
  }
});
