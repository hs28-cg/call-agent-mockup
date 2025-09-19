document.addEventListener("DOMContentLoaded", function () {
  const allUsers = [
    {
      name: "MAX",
      phone: "040-123-123",
      reason: "credit",
      amount: 455.98,
      date: "2025-08-01",
      status: "Success",
    },
    {
      name: "LISA",
      phone: "040-333-111",
      reason: "loan",
      amount: 200.0,
      date: "2025-08-01",
      status: "Not Picked",
    },
    {
      name: "ANNA",
      phone: "040-555-789",
      reason: "loan",
      amount: 320.45,
      date: "2025-08-02",
      status: "Success",
    },
    { name: "MARK", phone: "040-444-222", reason: "bill", amount: 550.50, date: "2025-08-02", status: "Not Picked" },
    { name: "JOHN", phone: "040-222-999", reason: "bill", amount: 123.00, date: "2025-08-03", status: "Success" },
  ];

  const container = document.getElementById("cardsContainer");
  const statusFilter = document.getElementById("statusFilter");
  const sortFilter = document.getElementById("sortFilter");

  flatpickr("#date-range-picker", {
    mode: "range",
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "F j, Y",
  });

  function renderCards(data) {
    container.innerHTML = "";
    data.forEach((user) => {
      const card = document.createElement("div");
      card.className = "col-lg-4 col-md-6";
      const statusClass =
        user.status === "Success" ? "status-success" : "status-fail";
      card.innerHTML = `
            <div class="card report-card">
              <h5 class="card-title">${user.name}</h5>
              <p><strong>Phone:</strong> ${user.phone}</p>
              <p><strong>Reason:</strong> ${user.reason}</p>
              <p><strong>Due Amount:</strong> $${user.amount.toFixed(2)}</p>
              <p class="text-muted"><small>Due Date: ${user.date}</small></p>
              <p class="status-text ${statusClass}"><strong>Status:</strong> ${
        user.status
      }</p>
              <div class="card-actions">
                <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#transcriptModal" data-user-name="${
                  user.name
                }">View Transcript</button>
                <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#detailsModal" data-user-name="${
                  user.name
                }">View Details</button>
              </div>
            </div>`;
      container.appendChild(card);
    });
  }

  function sortData(data, sortBy) {
    return data.sort((a, b) => {
      if (sortBy === "date") return new Date(a.date) - new Date(b.date);
      return a.amount - b.amount;
    });
  }

  function updateView() {
    const status = statusFilter.value;
    const sortBy = sortFilter.value;
    let dataToRender =
      status === "all"
        ? [...allUsers]
        : status === "success"
        ? allUsers.filter((u) => u.status === "Success")
        : allUsers.filter((u) => u.status === "Not Picked");
    let sortedData = sortData(dataToRender, sortBy);
    renderCards(sortedData);
  }

  statusFilter.addEventListener("change", updateView);
  sortFilter.addEventListener("change", updateView);

  document
    .getElementById("transcriptModal")
    .addEventListener("show.bs.modal", function (event) {
      const userName = event.relatedTarget.getAttribute("data-user-name");
      this.querySelector(".modal-title").textContent =
        "Transcript for " + userName;
    });

  document
    .getElementById("detailsModal")
    .addEventListener("show.bs.modal", function (event) {
      const userName = event.relatedTarget.getAttribute("data-user-name");
      this.querySelector(".modal-title").textContent =
        "Details for " + userName;
    });

  updateView();
});
