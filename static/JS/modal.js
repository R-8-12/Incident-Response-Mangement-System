document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const viewModal = document.getElementById("viewModal");
  const blurBackground = document.getElementById("blurSection");
  const cancelBtn = document.getElementById("cancelBtn");
  const viewCancelBtn = document.getElementById("viewCancelBtn");

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    blurBackground.classList.remove("blurWindow");
  });

  viewCancelBtn.addEventListener("click", () => {
    viewModal.style.display = "none";
    blurBackground.classList.remove("blurWindow");
  });
});
