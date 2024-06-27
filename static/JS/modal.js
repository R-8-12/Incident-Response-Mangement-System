document.addEventListener("DOMContentLoaded", () => {
  const responseForm = document.getElementById("responseForm");
  const responseInput = document.getElementById("responseInput");
  const incidentIdInput = document.getElementById("incident-id"); // Add this line

  responseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(responseForm);
    const incidentId = formData.get("incident_id");
    const responseText = formData.get("response");
    responseForm.submit();
  });

  const modal = document.getElementById("modal");
  const blurBackground = document.getElementById("blurSection");
  const cancelBtn = document.getElementById("cancelBtn");

  //IMP
  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    blurBackground.classList.remove("blurWindow");
  });

  // Update the code that opens the modal to include incident ID
  document.querySelectorAll(".response-incident").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const incidentId = button.getAttribute("data-id");
      incidentIdInput.value = incidentId; // Set incident ID
      modal.style.display = "block";
      blurBackground.classList.add("blurWindow");
    });
  });
});
