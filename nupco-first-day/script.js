document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("alarm-sound");
  const tapToStart = document.getElementById("tap-to-start");
  const warningContainer = document.querySelector(".warning-container");

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

    // Show the warning message
    tapToStart.classList.add("hidden");
    warningContainer.classList.remove("hidden");
  }

  // Use 'touchend' for mobile and 'click' for desktop
  tapToStart.addEventListener("click", startExperience);
  tapToStart.addEventListener("touchend", startExperience);
});
