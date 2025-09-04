document.addEventListener("DOMContentLoaded", function () {
  const historyModal = document.getElementById("historyModal");
  historyModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const clientName = button.getAttribute("data-client-name");
    const modalTitle = historyModal.querySelector(".modal-title");
    modalTitle.textContent = "Full History for " + clientName;
  });
});
