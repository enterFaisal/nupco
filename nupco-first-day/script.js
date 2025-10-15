document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("alarm-sound");
  const tapToStart = document.getElementById("tap-to-start");
  const caughtMessage = document.getElementById("caught-message");
  const warningModal = document.querySelector(".warning-modal");

  // Create Web Audio API context for iOS volume control
  let audioContext;
  let source;
  let gainNode;

  function setupWebAudio() {
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create gain node to control volume
    gainNode = audioContext.createGain();
    gainNode.gain.value = 3.0; // Maximum amplification (1.0 = normal, higher = louder)

    // Create source from audio element
    source = audioContext.createMediaElementSource(audio);

    // Connect: source -> gain -> destination (speakers)
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
  }

  function startExperience() {
    // Setup Web Audio API if not already done
    if (!audioContext) {
      setupWebAudio();
    }

    // Resume audio context (required for iOS)
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    // Play the audio
    audio.play().catch((error) => {
      console.log("Audio play failed:", error);
    });

    // Hide tap to start
    tapToStart.classList.add("hidden");

    // Show caught message immediately
    caughtMessage.classList.remove("hidden");

    // After 1 second, hide caught message and show warning modal
    setTimeout(() => {
      caughtMessage.classList.add("hidden");
      warningModal.classList.remove("hidden");
    }, 3000);
  }

  // Use 'touchend' for mobile and 'click' for desktop
  tapToStart.addEventListener("click", startExperience);
  tapToStart.addEventListener("touchend", startExperience);
});
