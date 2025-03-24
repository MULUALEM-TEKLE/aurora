uniform vec2 resolution;
uniform float uHorizontalFade;
uniform float uVerticalFade;
uniform float uTime;

// Color uniforms for customizable aurora colors
uniform vec3 uAuroraGreen;
uniform vec3 uAuroraBlue;
uniform vec3 uAuroraTeal;

varying vec2 vUv;

// Enhanced Gaussian blur with organic color mixing
vec3 gaussianBlur(vec2 uv, float radius) {
    vec3 color = vec3(0.0);
    float total = 0.0;

    for(float x = -radius; x <= radius; x += 0.5) {
        for(float y = -radius; y <= radius; y += 0.5) {
            vec2 offset = vec2(x, y) / resolution;
            float weight = exp(-dot(offset, offset) * 0.5);

            vec2 sampleUv = uv + offset;

            // Enhanced smooth color transitions with refined noise
            float noise = fract(sin(dot(sampleUv, vec2(12.9898, 78.233))) * 43758.5453);
            float t = smoothstep(0.0, 0.5, sampleUv.y + noise * 0.15);
            float t2 = smoothstep(0.2, 0.8, sampleUv.y + noise * 0.15);
            float t3 = smoothstep(0.5, 1.0, sampleUv.y + noise * 0.15);

            vec3 sampleColor;
            // Use uniform colors for customizable aurora effect
            vec3 auroraGreen = uAuroraGreen;
            vec3 auroraBlue = uAuroraBlue;
            vec3 auroraTeal = uAuroraTeal;

            // Time-based color shifting
            float timeShift = sin(uTime * 0.3) * 0.5 + 0.5;
            float xOffset = sampleUv.x + noise * 0.15 + sin(uTime * 0.2 + sampleUv.y * 2.0) * 0.1;

            // Enhanced color mixing with wider transition zones
            vec3 color1 = mix(auroraGreen, auroraBlue, smoothstep(0.2, 0.8, xOffset));
            vec3 color2 = mix(auroraBlue, auroraTeal, smoothstep(0.4, 0.9, xOffset + timeShift));
            vec3 color3 = mix(auroraTeal, auroraGreen, smoothstep(0.3, 0.7, xOffset - timeShift));

            // Smoother color blending with expanded overlap
            sampleColor = mix(color1, color2, smoothstep(0.2, 0.7, t2));
            sampleColor = mix(sampleColor, color3, smoothstep(0.4, 0.9, t3));

            // Gentler time-based movement with softer wave patterns
            float wavePattern = sin(uTime * 0.12 + sampleUv.y * 2.5) * cos(uTime * 0.08 + sampleUv.x * 1.8);
            float intensityPulse = sin(uTime * 0.15) * 0.3 + 0.7;

            // Subtle color intensity variations
            vec3 enhancedColor = sampleColor * (1.0 + wavePattern * 0.15);
            sampleColor = mix(sampleColor, enhancedColor, intensityPulse);

            color += sampleColor * weight;
            total += weight;
        }
    }

    return color / total;
}

void main() {
    // Define aurora colors matching the reference image
    vec3 primaryGreen = vec3(0.0, 0.9, 0.4);   // Dominant aurora green
    vec3 iceBlue = vec3(0.0, 0.6, 0.8);       // Ice blue undertones
    vec3 nightSky = vec3(0.0, 0.1, 0.2);      // Dark night sky

    // Apply enhanced Gaussian blur with larger radius for more blurriness
    vec3 color = gaussianBlur(vUv, 3.0);

    // Enhanced transparency with dynamic fade effects
    float baseAlpha = 0.85;
    float horizontalFade = smoothstep(0.0, 1.0, sin(vUv.x * 2.8 + sin(uTime * 0.2) * 0.2)) * uHorizontalFade;
    float verticalFade = smoothstep(0.0, 1.0, sin(vUv.y * 2.8 + cos(uTime * 0.15) * 0.2)) * uVerticalFade;

    // Add organic pulsing effect to the alpha
    float pulse = sin(uTime * 0.3 + vUv.x * 2.0) * 0.15 + 0.85;
    float noisePulse = fract(sin(dot(vUv + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453) * 0.1;
    float combinedFade = horizontalFade * verticalFade * (pulse + noisePulse);
    float alpha = baseAlpha * combinedFade;

    // Ensure alpha is properly clamped with extra smooth transition
    alpha = smoothstep(0.05, 0.95, alpha);

    // Add subtle color variation based on alpha
    color *= 1.0 + (alpha * 0.2);

    gl_FragColor = vec4(color, alpha);
}