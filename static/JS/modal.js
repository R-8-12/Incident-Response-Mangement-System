document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const blurBackground = document.getElementById("blurSection");
  const cancelBtn = document.getElementById("cancelBtn");

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
    blurBackground.classList.remove("blurWindow");
  });
});
