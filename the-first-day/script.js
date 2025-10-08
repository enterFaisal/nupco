// This script is intentionally left blank for now.
// It's here to make the <script> tag in index.html valid.
// We will add code to play the alarm sound here later.
document.addEventListener('DOMContentLoaded', (event) => {
    const audio = document.getElementById('alarm-sound');
    audio.play().catch(error => {
        console.log('Autoplay was prevented:', error);
        // Show a button to let the user play the sound manually.
        const button = document.createElement('button');
        button.textContent = 'Play Sound';
        button.addEventListener('click', () => {
            audio.play();
        });
        document.body.appendChild(button);
    });
});