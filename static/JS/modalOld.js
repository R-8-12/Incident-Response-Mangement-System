previous code
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