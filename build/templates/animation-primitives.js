/**
 * Character Walk Cycle Primitive
 */
export const walkCyclePrimitive = {
    name: 'walk-cycle',
    description: 'Creates a frame-by-frame walking character animation',
    requiredParams: ['dimensions', 'duration', 'fps'],
    defaultParams: {
        characterType: 'ascii',
        walkSpeed: 8,
        bounceAmount: 3,
    },
    generateCode: (params) => {
        const { dimensions, duration, fps, characterType = 'ascii', walkSpeed = 8, bounceAmount = 3 } = params;
        const durationInFrames = Math.round(duration * fps);
        // Different character types
        const characterSets = {
            ascii: [
                { head: "😊", leftArm: "\\\\", rightArm: "/", body: "|", leftLeg: "/", rightLeg: "\\\\" },
                { head: "😊", leftArm: "|", rightArm: "|", body: "|", leftLeg: "|", rightLeg: "|" },
                { head: "😊", leftArm: "/", rightArm: "\\\\", body: "|", leftLeg: "\\\\", rightLeg: "/" },
                { head: "😊", leftArm: "|", rightArm: "|", body: "|", leftLeg: "|", rightLeg: "|" }
            ],
            emoji: [
                { head: "🚶", leftArm: "", rightArm: "", body: "", leftLeg: "", rightLeg: "" },
                { head: "🚶‍♂️", leftArm: "", rightArm: "", body: "", leftLeg: "", rightLeg: "" },
                { head: "🚶", leftArm: "", rightArm: "", body: "", leftLeg: "", rightLeg: "" },
                { head: "🚶‍♂️", leftArm: "", rightArm: "", body: "", leftLeg: "", rightLeg: "" }
            ]
        };
        const frames = characterSets[characterType] || characterSets.ascii;
        return `
  // Walk cycle frames
  const walkFrames = ${JSON.stringify(frames, null, 2)};

  // Calculate which frame to show
  const walkSpeed = ${walkSpeed};
  const currentWalkFrame = Math.floor(frame / walkSpeed) % walkFrames.length;
  const character = walkFrames[currentWalkFrame];

  // Character movement across screen
  const totalDistance = ${dimensions.width} - 200;
  const position = interpolate(
    frame,
    [0, durationInFrames],
    [100, totalDistance],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Bounce effect
  const bounceAmount = Math.sin((frame / walkSpeed) * Math.PI) * ${bounceAmount};
  const baseY = ${dimensions.height / 2};`;
    }
};
/**
 * Physics Bounce Primitive
 */
export const physicsBounce = {
    name: 'physics-bounce',
    description: 'Creates realistic bouncing ball physics with dampening',
    requiredParams: ['dimensions', 'duration', 'fps'],
    defaultParams: {
        objectSize: 60,
        bounceCount: 4,
        dampening: 0.7,
        horizontalMotion: true,
    },
    generateCode: (params) => {
        const { dimensions, duration, fps, objectSize = 60, bounceCount = 4, dampening = 0.7, horizontalMotion = true } = params;
        return `
  // Bouncing physics
  const ballSize = ${objectSize};
  const groundLevel = ${dimensions.height} - 100;
  const bounceCount = ${bounceCount};
  
  const totalFrames = durationInFrames;
  const bounceFrames = totalFrames / bounceCount;
  
  const currentBounce = Math.floor(frame / bounceFrames);
  const frameInBounce = frame % bounceFrames;
  
  // Decreasing bounce height with dampening
  const bounceHeight = (groundLevel - 50) * Math.pow(${dampening}, currentBounce);
  
  // Physics calculation for Y position
  const t = frameInBounce / bounceFrames;
  const y = groundLevel - (bounceHeight * Math.sin(Math.PI * t));
  
  ${horizontalMotion
            ? `// Horizontal movement
  const x = interpolate(frame, [0, totalFrames], [100, ${dimensions.width} - 100]);`
            : `const x = ${dimensions.width / 2};`}
  
  // Compression effect when hitting ground
  const compressionFactor = Math.abs(Math.sin(Math.PI * t)) < 0.1 ? 0.8 : 1;`;
    }
};
/**
 * Smooth Rotation Primitive
 */
export const smoothRotation = {
    name: 'smooth-rotation',
    description: 'Creates smooth rotation animation with easing',
    requiredParams: ['duration', 'fps'],
    defaultParams: {
        rotations: 2,
        direction: 'clockwise',
        easing: 'linear',
    },
    generateCode: (params) => {
        const { duration, fps, rotations = 2, direction = 'clockwise', easing = 'linear' } = params;
        const totalDegrees = rotations * 360 * (direction === 'clockwise' ? 1 : -1);
        const easingOptions = {
            'linear': '',
            'ease-in': ', { extrapolateLeft: "clamp", extrapolateRight: "clamp" }',
            'ease-out': ', { extrapolateLeft: "clamp", extrapolateRight: "clamp" }',
            'ease-in-out': ', { extrapolateLeft: "clamp", extrapolateRight: "clamp" }'
        };
        return `
  // Rotation animation
  const rotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, ${totalDegrees}]${easingOptions[easing] || ''}
  );`;
    }
};
/**
 * Typewriter Text Primitive
 */
export const typewriterText = {
    name: 'typewriter-text',
    description: 'Creates typewriter effect for text animation',
    requiredParams: ['text'],
    defaultParams: {
        charsPerFrame: 2,
        showCursor: true,
        cursorBlinkRate: 30,
    },
    generateCode: (params) => {
        const { text, charsPerFrame = 2, showCursor = true, cursorBlinkRate = 30 } = params;
        return `
  // Typewriter effect
  const text = "${text}";
  const charsPerFrame = ${charsPerFrame};
  const totalChars = text.length;
  const visibleChars = Math.min(frame * charsPerFrame, totalChars);
  const visibleText = text.substring(0, visibleChars);
  
  ${showCursor ? `
  // Blinking cursor
  const showCursor = frame % ${cursorBlinkRate} < ${cursorBlinkRate / 2} && visibleChars < totalChars;
  const cursor = showCursor ? "|" : "";` : 'const cursor = "";'}`;
    }
};
/**
 * Fade Transition Primitive
 */
export const fadeTransition = {
    name: 'fade-transition',
    description: 'Creates smooth fade in/out transitions',
    requiredParams: ['duration', 'fps'],
    defaultParams: {
        fadeInDuration: 30,
        fadeOutDuration: 30,
        holdDuration: 0,
    },
    generateCode: (params) => {
        const { duration, fps, fadeInDuration = 30, fadeOutDuration = 30, holdDuration = 0 } = params;
        const durationInFrames = Math.round(duration * fps);
        return `
  // Fade transitions
  const fadeIn = interpolate(
    frame,
    [0, ${fadeInDuration}],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const fadeOut = interpolate(
    frame,
    [${durationInFrames - fadeOutDuration}, ${durationInFrames}],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = Math.min(fadeIn, fadeOut);`;
    }
};
/**
 * Scale Animation Primitive
 */
export const scaleAnimation = {
    name: 'scale-animation',
    description: 'Creates smooth scaling animations',
    requiredParams: ['duration', 'fps'],
    defaultParams: {
        startScale: 0,
        endScale: 1,
        bounceEffect: false,
    },
    generateCode: (params) => {
        const { duration, fps, startScale = 0, endScale = 1, bounceEffect = false } = params;
        const durationInFrames = Math.round(duration * fps);
        if (bounceEffect) {
            return `
  // Scale with bounce effect
  const baseScale = interpolate(
    frame,
    [0, ${durationInFrames}],
    [${startScale}, ${endScale}],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const bounce = Math.sin(frame * 0.5) * 0.1;
  const scale = baseScale + bounce;`;
        }
        else {
            return `
  // Smooth scale animation
  const scale = interpolate(
    frame,
    [0, ${durationInFrames}],
    [${startScale}, ${endScale}],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );`;
        }
    }
};
/**
 * Path Following Primitive
 */
export const pathFollowing = {
    name: 'path-following',
    description: 'Makes objects follow predefined paths',
    requiredParams: ['dimensions', 'duration', 'fps'],
    defaultParams: {
        pathType: 'linear',
        startPos: { x: 0, y: 50 },
        endPos: { x: 100, y: 50 },
    },
    generateCode: (params) => {
        const { dimensions, duration, fps, pathType = 'linear', startPos = { x: 0, y: 50 }, endPos = { x: 100, y: 50 } } = params;
        const paths = {
            linear: `
  const x = interpolate(
    frame,
    [0, durationInFrames],
    [${dimensions.width * startPos.x / 100}, ${dimensions.width * endPos.x / 100}],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const y = interpolate(
    frame,
    [0, durationInFrames],
    [${dimensions.height * startPos.y / 100}, ${dimensions.height * endPos.y / 100}],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );`,
            circular: `
  const centerX = ${dimensions.width / 2};
  const centerY = ${dimensions.height / 2};
  const radius = ${Math.min(dimensions.width, dimensions.height) / 4};
  
  const angle = interpolate(
    frame,
    [0, durationInFrames],
    [0, Math.PI * 2],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const x = centerX + Math.cos(angle) * radius;
  const y = centerY + Math.sin(angle) * radius;`,
            wave: `
  const x = interpolate(
    frame,
    [0, durationInFrames],
    [50, ${dimensions.width - 50}],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const waveAmplitude = 50;
  const waveFrequency = 0.02;
  const baseY = ${dimensions.height / 2};
  const y = baseY + Math.sin(frame * waveFrequency) * waveAmplitude;`
        };
        return paths[pathType] || paths.linear;
    }
};
/**
 * Get all available animation primitives
 */
export function getAllPrimitives() {
    return [
        walkCyclePrimitive,
        physicsBounce,
        smoothRotation,
        typewriterText,
        fadeTransition,
        scaleAnimation,
        pathFollowing,
    ];
}
/**
 * Get primitive by name
 */
export function getPrimitive(name) {
    const primitives = getAllPrimitives();
    return primitives.find(p => p.name === name) || null;
}
/**
 * Combine multiple primitives into a single code block
 */
export function combinePrimitives(primitives, baseParams) {
    const codeBlocks = [];
    for (const { name, params } of primitives) {
        const primitive = getPrimitive(name);
        if (primitive) {
            const combinedParams = { ...primitive.defaultParams, ...baseParams, ...params };
            const code = primitive.generateCode(combinedParams);
            codeBlocks.push(code);
        }
    }
    return codeBlocks.join('\n');
}
//# sourceMappingURL=animation-primitives.js.map