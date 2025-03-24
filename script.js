// 1. Scene setup
const scene = new THREE.Scene()

// 2. Camera setup
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
)
camera.position.z = 10

// 3. Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x000000) // Black background for aurora effect
document.body.appendChild(renderer.domElement)

// 4. Load shaders
fetch("aurora.vert")
	.then((response) => response.text())
	.then((vertexShader) => {
		fetch("aurora.frag")
			.then((response) => response.text())
			.then((fragmentShader) => {
				initScene(vertexShader, fragmentShader)
			})
	})

// Store rotation values
const rotationValues = {
	rotationX: 0,
	rotationY: 0,
	rotationZ: 0,
}

function initScene(vertexShader, fragmentShader) {
	shaderMaterial = new THREE.ShaderMaterial({
		vertexShader: vertexShader,
		fragmentShader: fragmentShader,
		side: THREE.DoubleSide,
		transparent: true,
		blending: THREE.NormalBlending,
		// wireframe: true,
		uniforms: {
			uTime: { value: 0.0 }, // Time uniform for animation
			resolution: {
				value: new THREE.Vector2(window.innerWidth, window.innerHeight),
			},
			uTaperStrength: { value: 0 }, // Controls height tapering at mesh ends
			uHorizontalFade: { value: 1.5 }, // Controls horizontal transparency fade
			uVerticalFade: { value: 1.0 }, // Controls vertical transparency fade
			uWaveSpeed: { value: 0.25 }, // Controls overall wave animation speed
			uDistortionIntensity: { value: 0.75 }, // Controls the intensity of wave distortions
			uSwirlIntensity: { value: 7.0 }, // Controls the intensity of swirling motion
			uWaveScale: { value: 1.5 }, // Controls the scale of wave patterns,
			// Aurora color uniforms
			uAuroraGreen: { value: new THREE.Vector3(0.0, 0.9, 0.4) },
			uAuroraBlue: { value: new THREE.Vector3(0.0, 0.6, 0.8) },
			uAuroraTeal: { value: new THREE.Vector3(0.0, 0.8, 0.6) },
		},
	})

	// 5. Create planes
	const planeGeometry = new THREE.PlaneGeometry(100, 7.5, 64 * 2, 32 * 2)
	const plane = new THREE.Mesh(planeGeometry, shaderMaterial)
	plane.rotation.x = Math.PI / 3.5
	plane.rotation.y = Math.PI / 8
	plane.position.y = -1
	scene.add(plane)

	// Setup dat.GUI controls
	const gui = new dat.GUI()
	gui.close()
	// Create rotation controls folder
	const rotationFolder = gui.addFolder("Rotation Controls")
	rotationFolder
		.add(rotationValues, "rotationX", -Math.PI, Math.PI)
		.name("X Axis")
		.onChange(() => {
			plane.rotation.x = rotationValues.rotationX
		})
	rotationFolder
		.add(rotationValues, "rotationY", -Math.PI, Math.PI)
		.name("Y Axis")
		.onChange(() => {
			plane.rotation.y = rotationValues.rotationY
		})
	rotationFolder
		.add(rotationValues, "rotationZ", -Math.PI, Math.PI)
		.name("Z Axis")
		.onChange(() => {
			plane.rotation.z = rotationValues.rotationZ
		})

	// Create appearance controls folder
	const appearanceFolder = gui.addFolder("Appearance Controls")
	appearanceFolder
		.add(shaderMaterial.uniforms.uTaperStrength, "value", 0.0, 2.0)
		.name("Height Taper")
	appearanceFolder
		.add(shaderMaterial.uniforms.uHorizontalFade, "value", 0.0, 5.0)
		.name("Horizontal Fade")
	appearanceFolder
		.add(shaderMaterial.uniforms.uVerticalFade, "value", 0.0, 5.0)
		.name("Vertical Fade")

	// Create color controls folder
	const colorFolder = gui.addFolder("Color Controls")
	// Helper function to convert THREE.Vector3 to hex color
	const vectorToHex = (vector) => {
		const r = Math.floor(vector.x * 255)
		const g = Math.floor(vector.y * 255)
		const b = Math.floor(vector.z * 255)
		return (r << 16) | (g << 8) | b
	}

	// Helper function to update vector from hex color
	const updateVectorFromHex = (vector, hex) => {
		const r = ((hex >> 16) & 255) / 255
		const g = ((hex >> 8) & 255) / 255
		const b = (hex & 255) / 255
		vector.set(r, g, b)
	}

	colorFolder
		.addColor(
			{
				color: vectorToHex(shaderMaterial.uniforms.uAuroraGreen.value),
			},
			"color"
		)
		.name("Aurora Green")
		.onChange((hex) => {
			updateVectorFromHex(shaderMaterial.uniforms.uAuroraGreen.value, hex)
		})

	colorFolder
		.addColor(
			{
				color: vectorToHex(shaderMaterial.uniforms.uAuroraTeal.value),
			},
			"color"
		)
		.name("Aurora Teal")
		.onChange((hex) => {
			updateVectorFromHex(shaderMaterial.uniforms.uAuroraTeal.value, hex)
		})

	colorFolder
		.addColor(
			{
				color: vectorToHex(shaderMaterial.uniforms.uAuroraBlue.value),
			},
			"color"
		)
		.name("Aurora Blue")
		.onChange((hex) => {
			updateVectorFromHex(shaderMaterial.uniforms.uAuroraBlue.value, hex)
		})

	// Create movement controls folder
	const movementFolder = gui.addFolder("Movement Controls")
	movementFolder
		.add(shaderMaterial.uniforms.uWaveSpeed, "value", 0.01, 0.2)
		.name("Wave Speed")
	movementFolder
		.add(shaderMaterial.uniforms.uDistortionIntensity, "value", 0.0, 2.0)
		.name("Distortion Intensity")
	movementFolder
		.add(shaderMaterial.uniforms.uSwirlIntensity, "value", 0.0, 20.0)
		.name("Swirl Intensity")
	movementFolder
		.add(shaderMaterial.uniforms.uWaveScale, "value", 0.5, 2.0)
		.name("Wave Scale")

	// Open folders by default
	rotationFolder.open()
	appearanceFolder.open()
	movementFolder.open()

	// Adjust camera position for better view of horizontal plane
	camera.position.set(0, 0, 15)

	// 7. Add orbit controls
	const controls = new THREE.OrbitControls(camera, renderer.domElement)
	controls.enableDamping = true
	controls.dampingFactor = 0.1
	controls.target.set(0, 0, 0)
	controls.enabled = false // Disable panning

	// 8. Animation loop
	let time = 0
	function animate() {
		requestAnimationFrame(animate)
		controls.update()
		renderer.render(scene, camera)
		time += 0.01
		shaderMaterial.uniforms.uTime.value = time
	}
	animate()
}

// 9. Handle window resize
let shaderMaterial

function handleResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
	if (shaderMaterial) {
		shaderMaterial.uniforms.resolution.value.set(
			window.innerWidth,
			window.innerHeight
		)
	}
}

window.addEventListener("resize", handleResize)
handleResize()
