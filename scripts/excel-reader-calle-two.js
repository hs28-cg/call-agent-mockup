//This for call script two
document.addEventListener("DOMContentLoaded", function () {
  let accountData = [];
  let currentIndex = 0;
  let currentSession = null;

  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const userListContainer = document.getElementById("user-list-container");
  const speakBtn = document.getElementById("speak-btn");

  // Addding the Credentials here 


  // End it here

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
  speakBtn.addEventListener("click", handleCallButton);

  // ===============================
  // Read Excel and display accounts
  // ===============================
  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const normalized = jsonData.map((row) => {
        const cleanRow = {};
        Object.keys(row).forEach((key) => {
          cleanRow[key.trim().replace(/\s+/g, "_")] = row[key];
        });
        return cleanRow;
      });

      displayAccounts(normalized);
    };
    reader.readAsArrayBuffer(file);
  }

  function displayAccounts(accounts) {
    accountData = accounts;
    currentIndex = 0;
    userListContainer.innerHTML = "";

    if (accounts.length === 0) {
      userListContainer.innerHTML = '<p class="text-muted">No data found.</p>';
      return;
    }

    dropZone.style.display = "none";

    accounts.forEach((account, index) => {
      const card = document.createElement("div");
      card.className = "card account-card";

      // Attach account and transcript data
      card.account = account;
      card.conversationLog = []; // Array to store conversation messages
      card.callStartTime = null;
      card.callEndTime = null;

      const dueRaw = account.Duedate || "";
      let formattedDue = "N/A";
      if (dueRaw) {
        if (!isNaN(dueRaw)) formattedDue = dayjs(new Date(1900, 0, dueRaw - 1)).format("MMMM D, YYYY");
        else if (dayjs(dueRaw, "DD-MM-YY", true).isValid()) formattedDue = dayjs(dueRaw, "DD-MM-YY").format("MMMM D, YYYY");
        else if (dayjs(dueRaw, "DD-MMM-YY", true).isValid()) formattedDue = dayjs(dueRaw, "DD-MMM-YY").format("MMMM D, YYYY");
        else if (dayjs(dueRaw).isValid()) formattedDue = dayjs(dueRaw).format("MMMM D, YYYY");
      }

      card.formattedDue = formattedDue;
      // After computing formattedDue
      card.account = account;           // store full account object
      card.formattedDue = formattedDue; // formatted due date
      card.invoiceNumbers = account.Invoice_Numbers || "N/A";  // store invoice numbers
      card.totalInvoices = account.Total_Invoices || 0;        // store total invoices

      card.setAttribute("data-name", account.Name || "N/A");
      card.setAttribute("data-phone", account.Phone || "N/A");
      card.setAttribute("data-email", account.Email || "N/A");
      card.setAttribute("data-due", formattedDue);
      card.setAttribute("data-aging", account.Aging || "N/A");
      card.setAttribute("data-invoice_numbers", account.Invoice_Numbers || "N/A");
      card.setAttribute("data-invoice_amount", account.Invoice_Amount || 0);
      card.setAttribute("data-total_invoices", account.Total_Invoices || 0);
      card.setAttribute("data-credit_memos", account.Credit_Memos || 0);
      card.setAttribute("data-overpayments", account.Overpayments || 0);
      card.setAttribute("data-shortpayments", account.Shortpayments || 0);
      card.setAttribute("data-credits", account.Credits || 0);
      card.setAttribute("data-disputes", account.Disputes || 0);
      card.setAttribute("data-notes", account.Notes || " ");

      const statusHTML = index === 0
        ? `<div class="mt-2 status-field"><strong class="text-warning">Status: In Progress</strong></div>`
        : `<div class="mt-2 status-field"><strong class="text-muted">Status: Pending</strong></div>`;

      card.innerHTML = `
        <h6 class="fw-bold mb-1">${account.Name || "N/A"}</h6>
        <p class="mb-1"><strong>Phone:</strong> ${account.Phone || "N/A"}</p>
        <p class="mb-1"><strong>Email:</strong> ${account.Email || "N/A"}</p>
        <p class="mb-1"><strong>Due Date:</strong> ${formattedDue}</p>
        <p class="mb-1"><strong>Aging:</strong> ${account.Aging || "N/A"}</p>
        <p class="mb-1"><strong>Invoice Numbers:</strong> ${account.Invoice_Numbers || "N/A"}</p>
        <p class="mb-1"><strong>Total Due Amount:</strong> ${account.Invoice_Amount || 0}</p>
        <p class="mb-1"><strong>Total Invoices:</strong> ${account.Total_Invoices || 0}</p>
        <p class="mb-1"><strong>Credit Memos:</strong> ${account.Credit_Memos || 0}</p>
        <p class="mb-1"><strong>Overpayments:</strong> ${account.Overpayments || 0}</p>
        <p class="mb-1"><strong>Shortpayments:</strong> ${account.Shortpayments || 0}</p>
        <p class="mb-1"><strong>Credits:</strong> ${account.Credits || 0}</p>
        <p class="mb-1"><strong>Disputes:</strong> ${account.Disputes || 0}</p>
        <p class="mb-1"><strong>Notes:</strong> ${account.Notes || " "}</p>
        ${statusHTML}`;

      userListContainer.appendChild(card);
    });

    speakBtn.innerText = "Start Call";
    speakBtn.dataset.state = "idle";
  }

  // ===============================
  // Add message to conversation log
  // ===============================
  function addToConversationLog(card, role, content) {
    if (!content || content.trim() === '') return;
    
    const timestamp = new Date().toLocaleString();
    const speaker = role === 'user' ? 'User' : 'Agent (Tom)';
    
    card.conversationLog.push({
      timestamp: timestamp,
      speaker: speaker,
      message: content.trim()
    });
    
    console.log(`📝 Added to log: ${speaker}: ${content.trim()}`);
  }

  // ===============================
  // Format transcript for download
  // ===============================
  function formatTranscript(card) {
    const acc = card.account;
    const formattedDue = card.formattedDue || "N/A"
    const callDuration = card.callEndTime && card.callStartTime 
      ? Math.round((card.callEndTime - card.callStartTime) / 1000) 
      : 0;

    let transcript = `CALL TRANSCRIPT
=====================================
Customer: ${acc.Name || "N/A"}
Phone: ${acc.Phone || "N/A"}
Email: ${acc.Email || "N/A"}
Due Amount: $${acc.Invoice_Amount || 0}
Due Date: ${formattedDue|| "N/A"}
Call Start: ${card.callStartTime ? new Date(card.callStartTime).toLocaleString() : "N/A"}
Call End: ${card.callEndTime ? new Date(card.callEndTime).toLocaleString() : "N/A"}
Call Duration: ${callDuration} seconds
=====================================

CONVERSATION:
`;

    if (card.conversationLog.length === 0) {
      transcript += "\nNo conversation recorded.\n";
    } else {
      card.conversationLog.forEach((entry, index) => {
        transcript += `\n[${entry.timestamp}] ${entry.speaker}:\n${entry.message}\n`;
        if (index < card.conversationLog.length - 1) {
          transcript += "\n" + "-".repeat(50) + "\n";
        }
      });
    }

    transcript += "\n\n=====================================\nEND OF TRANSCRIPT\n";
    return transcript;
  }

  // ===============================
  // Save user details report
  // ===============================
  function saveUserDetails(card) {
    const acc = card.account;
    const formattedDue = card.formattedDue || "N/A"
    const userDetails = `CALL REPORT
=====================================
Name: ${acc.Name || "N/A"}
Phone: ${acc.Phone || "N/A"}
Email: ${acc.Email || "N/A"}
Invoice Numbers: ${acc.Invoice_Numbers || "N/A"}
Total Due Amount: $${acc.Invoice_Amount || 0}
Due Date: ${formattedDue || "N/A"}
Aging: ${acc.Aging || "N/A"}
Call Date: ${new Date().toLocaleString()}
Status: Call Completed
=====================================

ADDITIONAL DETAILS:
Total Invoices: ${acc.Total_Invoices || 0}
Credit Memos: ${acc.Credit_Memos || 0}
Overpayments: ${acc.Overpayments || 0}
Shortpayments: ${acc.Shortpayments || 0}
Credits: ${acc.Credits || 0}
Disputes: ${acc.Disputes || 0}
Notes: ${acc.Notes || "None"}
`;

    downloadFile(userDetails, `Call_Report_${acc.Name || "Unknown"}_${Date.now()}.txt`);
  }

  // ===============================
  // Download file utility
  // ===============================
  function downloadFile(content, filename) {
    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`📄 Downloaded: ${filename}`);
    } catch (error) {
      console.error("❌ Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  }

  // ===============================
  // Start WebRTC session
  // ===============================
  async function startSession(card, instructions) {
    try {
      console.log("🚀 Starting WebRTC session...");
      
      // Reset conversation log for new call
      card.conversationLog = [];
      card.callStartTime = Date.now();
      card.callEndTime = null;

      // Create session key
      const response = await fetch(SESSIONS_URL, {
        method: "POST",
        headers: { "api-key": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ model: DEPLOYMENT, voice: VOICE }),
      });
      
      if (!response.ok) {
        throw new Error(`Session creation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const ephemeralKey = data.client_secret?.value;
      if (!ephemeralKey) {
        throw new Error("Ephemeral key missing from session response");
      }

      console.log("✅ Session created successfully");

      // Capture microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      peerConnection.addTrack(stream.getAudioTracks()[0], stream);
      peerConnection.ontrack = (event) => {
         audioElement.srcObject = event.streams[0];
         audioElement.playbackRate = 0.7; // <— slower playback (0.5 = half speed, 1 = normal
        };
      
      const dataChannel = peerConnection.createDataChannel("realtime-channel", {
        ordered: true
      });

      // Audio element for playback
      let audioElement = document.getElementById("call-audio");
      if (!audioElement) {
        audioElement = document.createElement("audio");
        audioElement.id = "call-audio";
        audioElement.autoplay = true;
        audioElement.controls = false;
        audioElement.style.display = "none";
        document.body.appendChild(audioElement);
      }

      peerConnection.ontrack = (event) => {
        console.log("🎵 Audio track received");
        audioElement.srcObject = event.streams[0];
      };

      let sessionConfigured = false;

      // Handle data channel events
      dataChannel.addEventListener("open", () => {
        console.log("📡 Data channel opened");
        // Configure session with instructions
        const sessionUpdate = {
          type: "session.update",
          session: {
            instructions: instructions,
            input_audio_transcription: { model: "whisper-1" },
            turn_detection: { type: "server_vad" },
          }
        };
        dataChannel.send(JSON.stringify(sessionUpdate));
        sessionConfigured = true;
      });

      dataChannel.addEventListener("error", (error) => {
        console.error("❌ Data channel error:", error);
      });

      // Capture conversation messages
      dataChannel.addEventListener("message", (event) => {
        try {
          const realtimeEvent = JSON.parse(event.data);
          console.log("📨 Received event:", realtimeEvent.type);

          // Handle different event types for conversation capture
          switch (realtimeEvent.type) {
            case "conversation.item.input_audio_transcription.completed":
              // User speech transcription
              if (realtimeEvent.transcript && realtimeEvent.transcript.trim()) {
                addToConversationLog(card, 'user', realtimeEvent.transcript);
              }
              break;

            case "response.audio_transcript.done":
              // Assistant speech transcription
              if (realtimeEvent.transcript && realtimeEvent.transcript.trim()) {
                addToConversationLog(card, 'assistant', realtimeEvent.transcript);
              }
              break;

            case "conversation.item.created":
              // Fallback for message capture
              if (realtimeEvent.item?.type === "message" && realtimeEvent.item.message) {
                const role = realtimeEvent.item.message.role;
                const content = realtimeEvent.item.message.content?.[0];
                
                if (content?.type === "input_text" || content?.type === "text") {
                  const text = content.text || content.input_text;
                  if (text && text.trim() && text.trim() !== instructions.trim()) {
                    addToConversationLog(card, role, text);
                  }
                }
              }
              break;

            case "session.updated":
              console.log("✅ Session configured with instructions");
              break;

            case "error":
              console.error("❌ WebRTC Error:", realtimeEvent.error);
              break;

            default:
              // Log other events for debugging
              if (realtimeEvent.type.includes("conversation") || realtimeEvent.type.includes("response")) {
                console.log("🔍 Other conversation event:", realtimeEvent.type, realtimeEvent);
              }
              break;
          }
        } catch (error) {
          console.error("❌ Error parsing WebRTC message:", error);
        }
      });

      // WebRTC offer/answer exchange
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      console.log("📤 Sending WebRTC offer...");
      const sdpResponse = await fetch(`${WEBRTC_URL}?model=${DEPLOYMENT}`, {
        method: "POST",
        body: offer.sdp,
        headers: { 
          Authorization: `Bearer ${ephemeralKey}`, 
          "Content-Type": "application/sdp" 
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`WebRTC connection failed: ${sdpResponse.status} ${sdpResponse.statusText}`);
      }

      const answerSdp = await sdpResponse.text();
      const answer = { type: "answer", sdp: answerSdp };
      await peerConnection.setRemoteDescription(answer);

      console.log("✅ WebRTC session established");

      return { 
        peerConnection, 
        dataChannel, 
        audioElement, 
        stream,
        sessionConfigured: () => sessionConfigured
      };

    } catch (err) {
      console.error("❌ Error starting session:", err);
      alert(`Failed to start call: ${err.message}`);
      return null;
    }
  }

  // ===============================
  // Stop WebRTC session
  // ===============================
  function stopSession(session) {
    if (!session) return;
    
    console.log("🛑 Stopping WebRTC session...");
    
    try {
      // Stop all audio tracks
      if (session.stream) {
        session.stream.getTracks().forEach(track => {
          track.stop();
          console.log("🎤 Audio track stopped");
        });
      }

      // Close data channel
      if (session.dataChannel && session.dataChannel.readyState === 'open') {
        session.dataChannel.close();
        console.log("📡 Data channel closed");
      }

      // Close peer connection
      if (session.peerConnection && session.peerConnection.connectionState !== 'closed') {
        session.peerConnection.close();
        console.log("🔌 Peer connection closed");
      }

      // Clean up audio element
      if (session.audioElement) {
        session.audioElement.srcObject = null;
        if (session.audioElement.parentNode) {
          session.audioElement.parentNode.removeChild(session.audioElement);
        }
        console.log("🎵 Audio element cleaned up");
      }

      console.log("✅ Session stopped successfully");
    } catch (error) {
      console.error("❌ Error stopping session:", error);
    }
  }

  // ===============================
  // Handle call button clicks
  // ===============================
  async function handleCallButton() {
    const cards = userListContainer.querySelectorAll(".account-card");
    
    if (cards.length === 0 || currentIndex >= cards.length) {
      alert("No more accounts to call.");
      return;
    }

    const currentCard = cards[currentIndex];
    const state = speakBtn.dataset.state;

    if (state === "idle") {
      await startCall(currentCard);
    } else if (state === "in-call") {
      await endCall(currentCard);
    }
  }

  // ===============================
  // Start call for current user
  // ===============================
  async function startCall(currentCard) {
    const acc = currentCard.account;
    

    if (!acc) {
      console.error("Account data missing for current card");
      alert("Error: Account data missing. Please check Excel file.");
      return;
    }

    const name = acc.Name || "N/A";
    const invoiceAmount = acc.Invoice_Amount || 0;
    const invoiceNumbers = acc.Invoice_Numbers || "N/A";
    const totalInvoices = acc.Total_Invoices || 0;
    const formattedDue = currentCard.formattedDue || "N/A"
    const notes = currentCard.account.Notes || ""

    // Update status to In Call
    const statusField = currentCard.querySelector(".status-field strong");
    if (statusField) {
      statusField.classList.remove("text-muted", "text-success", "text-warning");
      statusField.classList.add("text-primary");
      statusField.innerText = "Status: In Call";
    }

    // Create call instructions for AI
      const callPrompt = `
You are Tom, an AR Collections Agent from Capgemini.

⚠️ IMPORTANT INSTRUCTIONS:
- Wait for the customer to speak first; do NOT initiate the conversation.
- Only respond based on the provided customer information.
- Follow all steps in order (1 → 8), and do NOT skip any mandatory confirmations.
- Never hallucinate or assume information.
- Focus on obtaining a clear payment commitment and stay professional.

Customer Information:
- Name: ${name}
- Original Due Date: ${formattedDue}
- Outstanding Balance: ${invoiceAmount}
- Invoice Numbers: ${invoiceNumbers}
- Total Invoices: ${totalInvoices}
- Notes : ${notes}
 
${notes}


1. Identity Confirmation
   - Ask: "Hello, may I speak with ${name}?"
   - If not the correct person → Say: "Thank you for your time. Have a good day!" → End call.
   - If correct → Continue.

2. State Reason for Follow-Up
   - "This is a second remainder call about the pending payment of the ${invoiceAmount} that ${notes}. I am calling to confirm whether the payment has been made."
   - Only provide invoice details if the customer explicitly requests them.?"
**3. Payment Scenarios**

**Scenario 1 — Payment Completed**
- Ask: "Has this payment been made?"
- If YES → Request only transaction details (date, method, reference number).
- Confirm the details once and document them.
- Proceed to Step 5 (Contact Verification) and Step 7 (Final Summary).

**Scenario 2 — Payment Pending due to Personal or Financial Constraints**
- If NO → Ask: "Could you please share the reason for the delay?"
- If the reason is personal or financial → Express understanding: "Thank you for sharing, I understand your situation."
- Request a specific payment date and encourage settlement within 3–4 days.
- If the customer provides a vague timeline (e.g., "in a week," "in 10 days," "in 2–3 weeks"):
    - Internally calculate the **approximate date** based on the customer’s response.
  Negotiate to secure payment within 3–4 days if feasible.
    - Confirm the customer’s agreed date: "Just to confirm, that would be around [customer mentioned date], correct?"
    - Kindly be advised that failure to remit the payment by the agreed date may result in escalation and initiation of formal collection proceedings
- Proceed to step5 (Contact Verification) and Step 7 (Final Summary)

**Scenario 3 — Payment Pending due to Invoice Dispute**
- If NO → Ask: "Could you please explain the reason for the dispute?"
- Request any supporting documentation if required.
- Encourage partial payment within 3–4 days.
- If a vague timeline is provided:
    - Internally calculate the **approximate date** based on the customer’s response.
  Negotiate partial payment within 3–4 days if feasible.
    - Confirm the customer’s agreed date: "Just to confirm, that would be around [customer mentioned date], correct?"
    - Kindly be advised that failure to remit the payment by the agreed date may result in escalation and initiation of formal collection proceedings
- Proceed to Step 5 and Step 7.

**5. Mandatory Contact Verification**
- Ask: "Could you please confirm your current phone number and email address?"
- Ask: "Do you have an alternate contact we may reach if required?"
- If declined → Politely request once more. If still declined → Acknowledge: "Understood, your current contact details will remain on file."

**6. Context Cross-Verification**
- Reiterate agreement: "To confirm, the outstanding balance of ${invoiceAmount} remains unresolved, and we agreed on [final outcome]. Is that correct?"

**7. Mandatory Final Summary**
- Provide a concise summary of the call:
   - Identity confirmation
   - Outstanding balance and (if requested) invoice details
   - Customer’s response (paid / not paid with reason / dispute / installment / refusal)
   - Final agreed outcome (payment today / PTP date / partial payment / dispute logged / refusal noted)
   - Verified contact details (confirmed/updated/unchanged)
- Example:
  "To summarize, we confirmed your identity as ${name}. You currently have ${totalInvoices} pending invoice(s), invoice numbers ${invoiceNumbers}, totaling ${invoiceAmount}, originally due on ${formattedDue}. You indicated [customer response], and we agreed on [final outcome]. Your contact details are [confirmed/updated/unchanged]. Please ensure payment or resolution as discussed to prevent further collection actions."

---

### Final Compliance Rules
- Do not skip or alter any step.
- Do not conclude the call before completing Step 5 and Step 7.
- Confirm invoices, payment reasons, PTP dates, and customer responses exactly once.
- Only mention invoice numbers if requested by the customer.
- If payment is confirmed as “YES,” request only transaction details.
- Continue the conversation until a definitive outcome is achieved.
`;

    console.log("📞 Starting call for:", name);
    
    // Start WebRTC session
    currentSession = await startSession(currentCard, callPrompt);
    
    if (!currentSession) {
      // Reset status if session failed
      if (statusField) {
        statusField.classList.remove("text-primary");
        statusField.classList.add("text-warning");
        statusField.innerText = "Status: In Progress";
      }
      return;
    }

    // Update UI for active call
    speakBtn.innerText = "End Call";
    speakBtn.dataset.state = "in-call";
    speakBtn.classList.remove("btn-primary");
    speakBtn.classList.add("btn-danger");

    console.log("✅ Call started successfully");
  }

  // ===============================
  // End call and save files
  // ===============================
  async function endCall(currentCard) {
    const acc = currentCard.account;
    const name = acc.Name || "Unknown";

    console.log("📞 Ending call for:", name);

    // Mark call end time
    currentCard.callEndTime = Date.now();

    // Stop the WebRTC session
    if (currentSession) {
      stopSession(currentSession);
      currentSession = null;
    }

    // Update status to Success
    const statusField = currentCard.querySelector(".status-field strong");
    if (statusField) {
      statusField.classList.remove("text-primary");
      statusField.classList.add("text-success");
      statusField.innerText = "Status: Success";
    }

    // Save user details report
    console.log("💾 Saving user details report...");
    saveUserDetails(currentCard);

    // Download transcript
    console.log("📄 Preparing transcript download...");
    const transcript = formatTranscript(currentCard);
    
    if (currentCard.conversationLog.length > 0) {
      downloadFile(transcript, `Call_Transcript_${name}_${Date.now()}.txt`);
      console.log(`✅ Transcript downloaded for ${name}`);
    } else {
      console.warn("⚠️ No conversation recorded for transcript");
      downloadFile(transcript, `Call_Transcript_${name}_NO_CONVERSATION_${Date.now()}.txt`);
    }

    // Move to next user
    currentIndex++;
    const cards = userListContainer.querySelectorAll(".account-card");
    
    if (currentIndex < cards.length) {
      const nextCard = cards[currentIndex];
      const nextStatus = nextCard.querySelector(".status-field strong");
      if (nextStatus) {
        nextStatus.classList.remove("text-muted");
        nextStatus.classList.add("text-warning");
        nextStatus.innerText = "Status: In Progress";
      }
    }

    // Reset button state
    speakBtn.innerText = currentIndex < cards.length ? "Start Call" : "All Calls Complete";
    speakBtn.dataset.state = "idle";
    speakBtn.classList.remove("btn-danger");
    speakBtn.classList.add("btn-primary");

    if (currentIndex >= cards.length) {
      speakBtn.disabled = true;
      console.log("🎉 All calls completed!");
    }

    console.log("✅ Call ended successfully");
  }
});