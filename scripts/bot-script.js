const chatOpenBtn = document.getElementById("chatOpenBtn");
const floatingChatWindow = document.getElementById("floatingChatWindow");
const chatCloseBtn = document.getElementById("chatCloseBtn");
const chatBody = document.getElementById("chatBody");
const chatInputForm = document.getElementById("chatInputForm");
const chatInput = document.getElementById("chatInput");

chatOpenBtn.onclick = () => {
  floatingChatWindow.style.display = "flex";
  chatOpenBtn.style.display = "none";
  setTimeout(() => chatInput.focus(), 200);
};
chatCloseBtn.onclick = () => {
  floatingChatWindow.style.display = "none";
  chatOpenBtn.style.display = "flex";
};

// Chat simulation process
chatInputForm.onsubmit = function (e) {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (!msg) return;
  renderMessage("user", msg);
  setTimeout(() => renderMessage("bot", getBotReply(msg)), 650);
  chatInput.value = "";
};

// Function to align the user and the bot reply
function renderMessage(sender, text) {
  const div = document.createElement("div");
  div.style.marginBottom = "8px";
  if (sender === "user") {
    div.style.textAlign = "right";
    div.innerHTML = `<span style="background:#e6f0ff;padding:7px 14px;border-radius:13px;display:inline-block;">${text}</span>`;
  } else {
    div.style.textAlign = "left";
    div.innerHTML = `<span style="background:#f8f9fa;padding:7px 14px;border-radius:13px;display:inline-block;">${text}</span>`;
  }
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// New Functionality

let botState = {
  step: null,
  phone: null,
  otp: null,
  account: null,
  invoice: null,
  invoices: [],
};

function getBotReply(msg) {
  msg = msg.trim().toLowerCase();

  // GREETING
  if (/^(hi|hello|hey)$/i.test(msg)) {
    return "Hello! How can I assist you today?";
  }

  // ---------------- INVOICE FLOW ----------------
  if (/^invoice$/i.test(msg)) {
    botState.step = "awaitingInvoice";
    return "Please provide client invoice number.";
  }

  if (botState.step === "awaitingInvoice") {
    if (/^\d+$/.test(msg)) {
      botState.invoice = msg;

      // For Cleared
      if (msg === "12345678") {
        botState.step = "awaitingInvoiceCopy";
        return "Invoice 12345678 is cleared. Do you want me to send a copy to the client registered email? (yes/no)";
      }

      // Not Cleared
      if (msg === "87654321") {
        botState.step = null;
        return "Invoice 87654321 is not cleared yet. If cleared raise dispute";
      }

      // Under Dispute
      if (msg === "987654321") {
        botState.step = null;
        return "Invoice 987654321 is under dispute waiting for clearance. Will reflect in few days";
      }

      // Invalid
      return "Invalid Invoice Number";
      // Only valid invoices are 12345678, 87654321, or 987654321.

    } else {
      return "Please enter a valid invoice number.";
    }
  }

  // Invoice Flow
  if (botState.step === "awaitingInvoiceCopy") {
    if (msg === "yes") {
      botState.step = null;
      return "Copy of invoice has been sent to the client registered email.";
    } else if (msg === "no") {
      botState.step = null;
      return "Thank you";
    } else {
      return "Please reply with 'yes' or 'no'.";
    }
  }

  // Account Flow
  if (/account/i.test(msg)) {
    botState.step = "awaitingAccount";
    return "Please enter the 11-digit account number.";
  }

  if (botState.step === "awaitingAccount") {
    if (/^\d{11}$/.test(msg)) {
      botState.account = msg;
      botState.step = "awaitingOtp";
      return "Please enter your access id";
    } else {
      return "Account number must be exactly 11 digits.";
    }
  }

  if (botState.step === "awaitingOtp") {
    if (/^\d{4}$/.test(msg)) {
      botState.otp = msg;

      let accountInfo = "";
      if (botState.account === "11234567890") {
        accountInfo = `Account Details:
Name: Sophia
Account: ${botState.account}
Status: Cleared
Pending Amount: $0
Last Paid: $200 on 10-Sep`;
      } else {
        accountInfo = `Account Details:
Name: David Miller
Account: ${botState.account}
Status: Under Dispute
Pending Amount: $1,250
Last Paid: $1,000 on 01-Sep`;
      }

      botState.step = "awaitingAccountMail";
      return (
        accountInfo +
        "\n\nDo you want me to send a complete summary of account to client ?"
      );
    } else {
      return "Please Re-Check your access ID";
    }
  }

  if (botState.step === "awaitingAccountMail") {
    if (msg === "yes") {
      botState.step = null;
      return "Copy of account details has been sent to client registered email.";
    } else if (msg === "no") {
      botState.step = null;
      return "Thank you";
    } else {
      return "Please reply with 'yes' or 'no'.";
    }
  }

  // Dispute Flow
  if (/raise dispute/i.test(msg)) {
    botState.step = "awaitingDisputeAccount";
    return "Please enter client 11-digit account number.";
  }

  if (botState.step === "awaitingDisputeAccount") {
    if (/^\d{11}$/.test(msg)) {
      botState.account = msg;
      botState.invoices = [
        { id: 1, amount: "$1,000", date: "01-Sep" },
        { id: 2, amount: "$1,250", date: "15-Sep" },
        { id: 3, amount: "$2,500", date: "10-Sep" },
      ];

      let invoiceList = "Recent Invoices:\n";
      botState.invoices.forEach((inv) => {
        invoiceList += `${inv.id}. Amount: ${inv.amount}, Date: ${inv.date}\n`;
      });

      botState.step = "awaitingDisputeSelection";
      return (
        invoiceList +
        "\nPlease select the invoice number you want to dispute (1-" +
        botState.invoices.length +
        ")."
      );
    } else {
      return "Account number must be exactly 11 digits. Please try again.";
    }
  }

  if (botState.step === "awaitingDisputeSelection") {
    const choice = parseInt(msg);
    if (!isNaN(choice) && choice >= 1 && choice <= botState.invoices.length) {
      const selected = botState.invoices.find((inv) => inv.id === choice);
      botState.step = null;
      return `Dispute raised successfully for Invoice ${choice} (Amount: ${selected.amount}, Date: ${selected.date}). Our executive will reach out to you shortly.`;
    } else {
      return (
        "Invalid selection. Please enter a number between 1 and " +
        botState.invoices.length +
        "."
      );
    }
  }
  // If Nothing
  return "I can help with 'invoice', 'account', or 'raise dispute'. Please type one of these.";
}
