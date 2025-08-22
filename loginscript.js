document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".switchForm");
  const registerForm = document.getElementById("registerFormElement");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const passwordError = document.getElementById("passwordError");

  // Toggle forms
  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("data-target");

      // Hide both
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("registerForm").style.display = "none";

      // Show target
      document.getElementById(target).style.display = "block";
    });
  });

  // Validate Confirm Password
  registerForm.addEventListener("submit", function (e) {
    if (password.value !== confirmPassword.value) {
      e.preventDefault(); // stop form submission
      passwordError.classList.remove("d-none");
    } else {
      passwordError.classList.add("d-none");
      alert("✅ Registration successful!");
window.location.href = "./index.html";
    }
  });
});