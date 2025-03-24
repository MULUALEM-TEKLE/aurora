uniform float uTime;
uniform float uTaperStrength; // Controls how much the height tapers at the ends
uniform float uWaveSpeed; // Controls overall wave animation speed
uniform float uDistortionIntensity; // Controls the intensity of wave distortions
uniform float uSwirlIntensity; // Controls the intensity of swirling motion
uniform float uWaveScale; // Controls the scale of wave patterns
varying vec2 vUv;
//random function
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                 vec2(12.9898,78.233)))*
        43758.5453123);
}

//noise function
float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners of the pixel
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth interpolation between the corners
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) +
           (c - a)*u.y*(1.0-u.x) +
           (d - b)*u.x*u.y;
}

#define OCTAVES 6
float fbm (vec2 st) {
    float value = 0.0;
    float amplitude = 0.4;
    float frequency = 0.8;
    float lacunarity = 2.3;
    float persistence = 0.5;

    // Add time-varying phase shift for more fluid motion
    vec2 shift = vec2(uTime * uWaveSpeed);

    for (int i = 0; i < OCTAVES; ++i) {
        value += amplitude * noise(st * frequency + shift);
        shift *= 1.4; // Vary the shift per octave
        frequency *= lacunarity;
        amplitude *= persistence;
    }
    return value;
}

void main() {
    vec3 transformed = position;

    // Create fluid, aurora-like wave movements
    float waveScale = uWaveScale * 0.1;
    float primaryWave = fbm(vec2(transformed.x * waveScale + uTime * uWaveSpeed, transformed.y * (waveScale * 0.7) + uTime * (uWaveSpeed * 0.6)));
    float secondaryWave = fbm(vec2(transformed.x * (waveScale * 2.0) - uTime * (uWaveSpeed * 0.8), transformed.y * waveScale - uTime * (uWaveSpeed * 0.4)));

    // Add tertiary wave for more complex motion
    float tertiaryWave = fbm(vec2(transformed.x * (waveScale * 1.5) + uTime * (uWaveSpeed * 1.2), transformed.y * (waveScale * 1.2) - uTime * (uWaveSpeed * 0.8)));

    // Combine waves with dynamic weights for organic flow
    float timeWeight = sin(uTime * 0.2) * 0.2 + 0.8;
    float distortion = (primaryWave * 1.6 * timeWeight +
                      secondaryWave * 1.1 * (1.0 - timeWeight) +
                      tertiaryWave * 0.8) * uDistortionIntensity;

    // Enhanced swirling motion with time-varying intensity
    float swirlTime = sin(uTime * 0.15) * 0.3 + 0.7;
    float swirl = sin(transformed.y * (waveScale * 1.2) + uTime * (uWaveSpeed * 1.6)) *
                 cos(transformed.x * waveScale + uTime * (uWaveSpeed * 1.2)) *
                 0.7 * swirlTime * uSwirlIntensity;

    // Apply transformations with organic scaling
    transformed.z += distortion * 1.3 + swirl * 0.5;
    transformed.x += cos(transformed.y * 0.15 + uTime * 0.1) * 0.5 * (1.0 + sin(uTime * 0.2) * 0.2);

    // Enhanced height tapering at edges with adjustable strength
    float normalizedY = abs(transformed.y / 20.0); // Get absolute distance from center
    float smoothCurve = smoothstep(0.0, 1.0, normalizedY);
    float taperFactor = 1.0 - (uTaperStrength * pow(smoothCurve, 1.5));
    transformed.x *= max(taperFactor, 0.15); // Ensure minimum height of 15%

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);

    vUv = uv;
}