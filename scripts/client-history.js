// document.addEventListener("DOMContentLoaded", function () {
//   const historyModal = document.getElementById("historyModal");
//   historyModal.addEventListener("show.bs.modal", function (event) {
//     const button = event.relatedTarget;
//     const clientName = button.getAttribute("data-client-name");
//     const modalTitle = historyModal.querySelector(".modal-title");
//     modalTitle.textContent = "Full History for " + clientName;
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
  const clientHistoryData = {
    MAX: [
      { date: "2025-08-19", type: "Payment", amount: "$1250.00", status: "Success", notes: "Partial payment received." },
      { date: "2025-08-15", type: "Reminder Call", amount: "N/A", status: "Not Received", notes: "No answer, left voicemail." },
      { date: "2025-08-10", type: "Reminder Call", amount: "N/A", status: "Success", notes: "Scheduled a payment plan." },
      { date: "2025-08-12", type: "Reminder Call", amount: "N/A", status: "Not Recevied", notes: "Phone Disconnected." },
      { date: "2025-08-14", type: "Reminder Call", amount: "N/A", status: "Not Recevied", notes: "Phone Disconnected." },
    ],
    LISA: [
      { date: "2025-08-18", type: "Payment", amount: "$200.00", status: "Success", notes: "Full payment received." },
      { date: "2025-08-12", type: "Customer Feedback / Inquery", amount: "N/A", status: "Success", notes: "Customer asked for bill breakdown." }
    ],
    ALEX: [
      { date: "2025-08-19", type: "Payment", amount: "$123.00", status: "Success", notes: "Customer Agreed to Pay in 3 installments" },
      { date: "2025-08-15", type: "Reminder Call", amount: "N/A", status: "Not Received", notes: "Phone Disconnected" },
      { date: "2025-08-10", type: "Reminder Call", amount: "N/A", status: "Not Recevied", notes: "Phone Disconnected" },
      { date: "2025-08-05", type: "Remainder Call", amount: "N/A", status: "Not Received", notes: "Phone Disconnected." }
    ],
    MARK: [
      { date: "2025-08-17", type: "Reminder Call", amount: "N/A", status: "Not Received", notes: "Voicemail full, no message left." },
      { date: "2025-08-10", type: "Initial Call", amount: "N/A", status: "Not Received", notes: "Incorrect number listed." }
    ],
    SAM: [
      { date: "2025-08-17", type: "Reminder Call", amount: "N/A", status: "Not Received", notes: "Voicemail full, no message left." },
      { date: "2025-08-10", type: "Initial Call", amount: "N/A", status: "Not Received", notes: "Incorrect number listed." }
    ]
  };

  const historyModal = document.getElementById('historyModal');
  const historyTableContainer = document.getElementById('historyTableContainer');
  const downloadExcelBtn = document.getElementById('downloadExcelBtn');

  // Handle modal trigger
  historyModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const clientName = button.getAttribute('data-client-name');
    const modalTitle = historyModal.querySelector('.modal-title');
    
    modalTitle.textContent = `Full History for ${clientName}`;
    renderHistoryTable(clientName);
    
    // Set up download button for the current client
    downloadExcelBtn.onclick = () => downloadTableAsCSV(clientName);
  });
  
  // Render the table
  function renderHistoryTable(clientName) {
    const history = clientHistoryData[clientName];
    if (!history) {
      historyTableContainer.innerHTML = "<p>No history available for this client.</p>";
      return;
    }

    let tableHTML = `
      <table class="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    history.forEach(row => {
      tableHTML += `
        <tr>
          <td>${row.date}</td>
          <td>${row.type}</td>
          <td>${row.amount}</td>
          <td>${row.status}</td>
          <td>${row.notes}</td>
        </tr>
      `;
    });
    
    tableHTML += `
        </tbody>
      </table>
    `;
    
    historyTableContainer.innerHTML = tableHTML;
  }
  
  // Download function
  function downloadTableAsCSV(clientName) {
    const history = clientHistoryData[clientName];
    if (!history) return;

    const headers = ["Date","Type", "Amount", "Status", "Notes"];
    const csvRows = [
      headers.join(','),
      ...history.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(/\s/g, '')] || '';
        return `"${value}"`;
      }).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${clientName}_history.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});