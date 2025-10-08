document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("alarm-sound");
  const tapToStart = document.getElementById("tap-to-start");
  const warningContainer = document.querySelector(".warning-container");

  function startExperience() {
    // Play the audio
    audio.play().catch((error) => {
      console.log("Audio play failed:", error);
    });

    // Show the warning message
    tapToStart.classList.add("hidden");
    warningContainer.classList.remove("hidden");
  }

  // Use 'touchend' for mobile and 'click' for desktop
  tapToStart.addEventListener("click", startExperience);
  tapToStart.addEventListener("touchend", startExperience);
});
