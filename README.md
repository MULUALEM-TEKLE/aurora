# Aurora Effect

A mesmerizing aurora borealis effect created using Three.js and GLSL shaders. This project implements a dynamic, customizable aurora visualization that can be controlled in real-time.

## Features

- Real-time aurora borealis simulation using GLSL shaders
- Interactive controls for customizing the aurora effect:
  - Rotation controls (X, Y, Z axes)
  - Appearance controls (Height Taper, Horizontal/Vertical Fade)
  - Color controls (Green, Teal, Blue components)
  - Movement controls (Wave Speed, Distortion, Swirl, Wave Scale)
- Responsive design that adapts to window size
- Smooth animation with OrbitControls support

## Installation

1. Clone the repository
2. Open `index.html` in a modern web browser

No build process is required as the project uses CDN-hosted dependencies.

## Dependencies

- Three.js (v0.139.0)
- dat.GUI (v0.7.9)

## Usage

1. Open the application in a web browser
2. Use the control panel (dat.GUI) to customize the aurora effect:
   - Click the controls button to show/hide the control panel
   - Adjust sliders to modify various aspects of the aurora
   - Experiment with different color combinations
   - Try different movement parameters for unique effects

## Technical Implementation

The aurora effect is achieved through:

- Custom vertex shader for mesh deformation and movement
- Custom fragment shader for color blending and transparency
- Three.js for 3D rendering and camera controls
- dat.GUI for interactive parameter adjustment

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## Support

If you like this project, you can support it by:

- Starring the repository on GitHub
- Supporting on Ko-fi

## License

MIT License

## Credits

Made with ❤️ by xar
