// document.addEventListener("DOMContentLoaded", () => {
//   const modal = document.getElementById("modal");
//   const actionButton = document.getElementById("btnDiv");
//   const blurBackground = document.getElementById("blurSection");
//   const incidentIdInput = document.getElementById("incident-id");
//   const cancelBtn = document.getElementById("cancelBtn");
//   const submitBtn = document.getElementById("submitBtn");

//   document.querySelectorAll(".response-incident").forEach((button) => {
//     button.addEventListener("click", (event) => {
//       event.preventDefault();
//       const incidentId = button.getAttribute("data-id");
//       incidentIdInput.value = incidentId;
//       modal.style.display = "block";
//       blurBackground.classList.add("blurWindow");
//     });
//   });

//   cancelBtn.addEventListener("click", () => {
//     modal.style.display = "none";
//     blurBackground.classList.remove("blurWindow");
//   });

//   submitBtn.addEventListener("click", () => {
//     modal.style.display = "none";
//     blurBackground.classList.remove("blurWindow");
//   });
// });

// =========

document.addEventListener("DOMContentLoaded", () => {
  const responseForm = document.getElementById("responseForm");
  const responseInput = document.getElementById("responseInput");

  responseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(responseForm);
    const incidentId = formData.get("incident_id");
    const responseText = formData.get("response");

    // Log response to console
    console.log("Response Submitted:", responseText);

    // Simulate delay for demonstration purposes (2 seconds)
    setTimeout(() => {
      // Submit the form programmatically
      responseForm.submit();
    }, 2000); // 2000 milliseconds = 2 seconds
  });

  const modal = document.getElementById("modal");
  const blurBackground = document.getElementById("blurSection");
  const cancelBtn = document.getElementById("cancelBtn");

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    blurBackground.classList.remove("blurWindow");
  });
});