document.addEventListener("DOMContentLoaded", function () {
  const userData = {
    "David": {
      remarks: [
        {
          date: "05 Sept 2025",
          duration: "4 min 10 sec",
          summary: "Outstanding loan payment pending. Customer will clear next week.Date confirmed. Customer said he will make the payment before 12 Sept 2025",
          conversation: [
            { speaker: "User", text: "My bank accout is locked due to multiple attempt on wrong passowrd" },
            { speaker: "Agent", text: "No worries, By when can we expect the payment to be made" },
            { speaker: "User", text: "Yes, I can make the payment by 15 days" },
            { speaker: "Agent", text: "I am aware about the problem but it is advaisable to make the payment at the earliest, could you make the payment by 12 Sept 2025" },
            { speaker: "Agent", text: "Sure, I will try to make the payment on or before 12 Sept 2025" },
            { speaker: "Agent", text: "Thank you David, Please pay at the earliest to avoid additional charges." },
          ]
        },
        {
          date: "13 Sept 2025",
          duration: "3 min 42 sec",
          summary: "Customer acknowledged outstanding loan. Cleared the payment, transaction updated to database",
          conversation: [
            { speaker: "Agent", text: "I am calling you to followup on the pending loan which was promised to be paid by 12 Sept 2025, May i know what is the status of the payment" },
            { speaker: "User", text: "Yes, I have made my payment and cleared the due" },
            { speaker: "Agent", text: "Please pay at the earliest to avoid additional charges." },
            { speaker: "Agent", text: "Could you please provied the payment details such as transaction details and mode of payment" },
            { speaker: "User", text: "Yes, Transaction Id would be 001156 and mode of payment will be Card" },
            { speaker: "Agent", text: "Thats great david, Let me check the data my records" },
            { speaker: "User", text: "Yes, thanks!" },
            { speaker: "Agent", text: "David the clearence is recived into our system and the data is updated, Thank you" }
          ]
        }
      ]
    },
    // Add other users similarly
        "Sophia Anderson": {
      remarks: [
        {
          date: "05 Sept 2025",
          duration: "4 min 10 sec",
          summary: "Dispute Resolved, and cleared the loan transaction id 001123.",
          conversation: [
            {speaker : "The user had a dispute of $300 Invoice Number INV00432110", text : ""},
            { speaker: "User", text: "Yes, I have cleared my outstanding payment" },
            { speaker: "Agent", text: "Could you please provied the payment details such as transaction details and mode of payment" },
            { speaker: "User", text: "Yes, Transaction Id would be 001123 and mode of payment will be cheque" },
            { speaker: "Agent", text: "Thats great Sophia, Let me check the data my records" },
            { speaker: "User", text: "Yes, thanks!" },
            { speaker: "Agent", text: "Spohia the clearence is recived into our system and the data is updated, Thank you" }
          ]
        },
        // {
        //   date: "08 Sept 2025",
        //   duration: "6 min 42 sec",
        //   summary: "Customer acknowledged outstanding loan. Reminder sent.",
        //   conversation: [
        //     { speaker: "Agent", text: "Following up on your loan." },
        //     { speaker: "User", text: "Yes, I am aware, will pay soon." },
        //     { speaker: "Agent", text: "Reminder sent to customer." }
        //   ]
        // }
      ]
    },

    // Adding another user 
    "ANNA": {
      remarks: [
        {
          date: "05 Sept 2025",
          duration: "4 min 10 sec",
          summary: "Outstanding loan payment pending. Customer Raised Disputes, Awaiting Payment",
          conversation: [
            { speaker: "User", text: "My card has been charged $200 for $180" },
            { speaker: "Agent", text: "I'm sorry to hear that have you raised a dispute ticket before, or do you want me to raise a ticket for dispute" },
            { speaker: "User", text: "No, I havent raised a dispute ticket, will you do that for me" },
            { speaker: "Agent", text: "Absolutely ANNA, I have succesfully raised a ticket our executive will reachout to you on this" },
            { speaker: "Agent", text: "Once the Dispute is resolved please make the payment immediately to avoid unnecessary charges on your account" }
          ]
        },
        {
          date: "08 Sept 2025",
          duration: "6 min 42 sec",
          summary: "Customer said he would clear loan by 20 August 2025, User Failed to pickcall",
          conversation: [
            { speaker: "Agent", text: "User Failed to Pickcall" },
            // { speaker: "User", text: "Yes, I am aware, will pay soon." },
            // { speaker: "Agent", text: "Please pay the loan amount within 3-4 days to avoid additional charges" }
          ]
        }
      ]
    }
  };

  const highlightWords = ["sent to customer", "outstanding", "loan", "bill", "warning", 
    "success", "due", "reminder","20, Aug 2025","cleared", "20 August 2025","Transaction Id", "001123","001156","Card","Cleared", "the", "payment",
  "Disputes", "Failed to pickcall", " Awaiting Payment", "12 Sept 2025"];

  function highlightText(text) {
    const regex = new RegExp(`\\b(${highlightWords.join("|")})\\b`, "gi");
    return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
  }

  // ================== Transcript Modal ==================
  document.getElementById("transcriptModal").addEventListener("show.bs.modal", function (event) {
    const userName = event.relatedTarget.getAttribute("data-user-name");
    const user = userData[userName];
    const latest = user?.remarks?.slice(-1)[0];

    const modalBody = this.querySelector(".modal-body");
    modalBody.innerHTML = "";

    if (latest?.conversation?.length) {
      latest.conversation.forEach(msg => {
        const div = document.createElement("div");
        div.className = msg.speaker === "Agent" ? "agent-msg mb-2" : "user-msg mb-2";
        div.innerHTML = `<strong>${msg.speaker}:</strong> ${msg.text}`;
        modalBody.appendChild(div);
      });
    } else {
      modalBody.innerHTML = `<p>No conversation available.</p>`;
    }

    // this.querySelector(".modal-title").textContent = "01/08/2025 Conversation " + userName;
    this.querySelector(".modal-title").textContent = "Most Recent Conversation ";
  });

  // ================== Additional Remark Modal ==================
  document.getElementById("reportIssueModal").addEventListener("show.bs.modal", function (event) {
    const userName = event.relatedTarget.getAttribute("data-user-name");
    const user = userData[userName];
    const modalBody = this.querySelector(".modal-body");

    this.querySelector(".modal-title").textContent = "Remarks for " + userName;
    modalBody.innerHTML = "";

    if (user?.remarks?.length) {
      user.remarks.forEach((remark, idx) => {
        const remarkBlock = document.createElement("div");
        remarkBlock.className = "remark-block mb-3 p-2 border rounded";

        // Call header
        const callHeader = document.createElement("p");
        callHeader.innerHTML = `<strong>Call #${idx + 1} - ${remark.date}</strong>`;

        // Summary (clickable)
        const summaryDiv = document.createElement("div");
        summaryDiv.className = "summary-text mb-2 text-primary";
        summaryDiv.style.cursor = "pointer";
        summaryDiv.innerHTML = highlightText(remark.summary);

        // Conversation details (hidden by default)
        const convoDiv = document.createElement("div");
        convoDiv.className = "conversation-details mt-2";
        convoDiv.style.display = "none";

        if (remark.conversation?.length) {
          remark.conversation.forEach(msg => {
            const div = document.createElement("div");
            div.className = msg.speaker === "Agent" ? "agent-msg mb-2" : "user-msg mb-2";
            div.innerHTML = `<strong>${msg.speaker}:</strong> ${msg.text}`;
            convoDiv.appendChild(div);
          });
        } else {
          convoDiv.innerHTML = "<p>No conversation available.</p>";
        }

        // Toggle on click
        summaryDiv.addEventListener("click", () => {
          convoDiv.style.display = convoDiv.style.display === "none" ? "block" : "none";
        });

        remarkBlock.appendChild(callHeader);
        remarkBlock.appendChild(summaryDiv);
        remarkBlock.appendChild(convoDiv);
        modalBody.appendChild(remarkBlock);
      });
    } else {
      modalBody.innerHTML = `<p>No remarks available for ${userName}.</p>`;
    }
  });
});
