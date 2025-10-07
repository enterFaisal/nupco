/* particles-config.js */

particlesJS('particles-js',
    {
      "particles": {
        "number": {
          "value": 80, // Adjust the number of particles
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#ffffff" // Particle color
        },
        "shape": {
          "type": "circle", // Shape of particles
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          },
          // Uncomment and set image parameters if you want to use an image shape
          /*
          "image": {
            "src": "path/to/image.png",
            "width": 100,
            "height": 100
          }
          */
        },
        "opacity": {
          "value": 0.5, // Opacity of particles
          "random": false,
          "anim": {
            "enable": false
          }
        },
        "size": {
          "value": 5, // Size of particles
          "random": true,
          "anim": {
            "enable": false
          }
        },
        "line_linked": {
          "enable": true, // Enable lines between particles
          "distance": 150,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1
        },
        "move": {
          "enable": true, // Enable particle movement
          "speed": 6,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true, // Enable hover effect
            "mode": "grab"
          },
          "onclick": {
            "enable": true, // Enable click effect
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 140,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 400,
            "size": 40,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 200,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    }
  );
  