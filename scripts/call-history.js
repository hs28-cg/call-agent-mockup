document.addEventListener("DOMContentLoaded", function () {
  const transcriptModal = document.getElementById("transcriptModal");
  transcriptModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const clientName = button.getAttribute("data-client-name");
    const modalTitle = transcriptModal.querySelector(".modal-title");
    modalTitle.textContent = "Transcript for " + clientName;
  });
});
