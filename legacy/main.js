const config = {
particleCount: 40000,
viscosity: 0.12,
vorticity: 2.5,
timeScale: 1.0,
luminance: 1.8,
themeIndex: 0,
isPaused: false
};

const particleVertexShader = `
uniform float uTime;
uniform float uSize;
uniform float uLuminance;
uniform int uTheme;

attribute float aSpeed;
attribute float aDistance;

varying vec3 vColor;
varying float vSpeed;

vec3 getThemeColor(float dist, float speed) {
    if (uTheme == 0) {
        vec3 cian = vec3(0.0, 0.94, 1.0);
        vec3 orange = vec3(1.0, 0.4, 0.0);
        vec3 white = vec3(1.0, 0.98, 0.92);
        
        float mixCore = smoothstep(5.0, 0.8, dist);
        vec3 col = mix(cian, orange, mixCore);
        
        float mixCenter = smoothstep(1.3, 0.0, dist);
        return mix(col, white, mixCenter * 0.85);
    } 
    else if (uTheme == 1) {
        vec3 base = vec3(0.55, 0.62, 0.75);
        vec3 bright = vec3(1.0, 1.0, 1.0);
        return mix(base, bright, smoothstep(6.0, 0.0, dist));
    } 
    else {
        vec3 red = vec3(0.9, 0.1, 0.05);
        vec3 amber = vec3(1.0, 0.6, 0.0);
        vec3 yellow = vec3(1.0, 0.95, 0.3);
        
        float mixMid = smoothstep(7.0, 1.8, dist);
        vec3 col = mix(red, amber, mixMid);
        return mix(col, yellow, smoothstep(1.8, 0.0, dist));
    }
}

void main() {
    vSpeed = aSpeed;
    vColor = getThemeColor(aDistance, aSpeed);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float dynamicSize = uSize * (1.0 + aSpeed * 0.12) * uLuminance;
    gl_PointSize = dynamicSize * (14.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
varying vec3 vColor;
varying float vSpeed;
uniform float uLuminance;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist);
    float intensity = pow(alpha, 1.4) * uLuminance;

    gl_FragColor = vec4(vColor * intensity, alpha * 0.85);
}
`;

const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030306, 0.018);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.04;
controls.maxDistance = 70;
controls.minDistance = 2;

let geometry, material, particleSystem;
let positions, speeds, distances, particleData;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-999, -999);
const mouseWorld = new THREE.Vector3(0, 0, 0);
const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function initParticles() {
if (particleSystem) scene.remove(particleSystem);

const count = config.particleCount;
geometry = new THREE.BufferGeometry();

positions = new Float32Array(count * 3);
speeds = new Float32Array(count);
distances = new Float32Array(count);
particleData = [];

for (let i = 0; i < count; i++) {
    resetParticle(i, true);
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
geometry.setAttribute('aDistance', new THREE.BufferAttribute(distances, 1));

material = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uSize: { value: window.innerWidth < 900 ? 1.2 : 1.8 },
        uLuminance: { value: config.luminance },
        uTheme: { value: config.themeIndex }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);
}

// --- INICIALIZACIÓN TRIDIMENSIONAL / DISPERSA ---
function resetParticle(i, initial = false) {
const arms = 3;
const armOffset = (i % arms) * ((Math.PI * 2) / arms);
const radius = initial ? (1.8 + Math.random() * 12.0) : (11.0 + Math.random() * 4.0);

// Dispersión helicoidal tridimensional
const spiralAngle = radius * 0.7 + armOffset;

// Variación tridimensional (Nube abombada / elipsoidal)
const heightSpread = (Math.random() - 0.5) * (radius * 0.65 + 1.5);

// Ruido aleatorio espacial
const dispersionX = (Math.random() - 0.5) * 2.5;
const dispersionZ = (Math.random() - 0.5) * 2.5;

const x = Math.cos(spiralAngle) * radius + dispersionX;
const z = Math.sin(spiralAngle) * radius + dispersionZ;
const y = heightSpread;

positions[i * 3] = x;
positions[i * 3 + 1] = y;
positions[i * 3 + 2] = z;

speeds[i] = 0.0;
distances[i] = Math.sqrt(x*x + y*y + z*z);

particleData[i] = {
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    vz: (Math.random() - 0.5) * 0.2
};
}

const views = {
persp: { pos: new THREE.Vector3(0, 12, 24), target: new THREE.Vector3(0, 0, 0) },
top: { pos: new THREE.Vector3(0, 32, 0.1), target: new THREE.Vector3(0, 0, 0) },
center: { pos: new THREE.Vector3(0, 2.0, 6.5), target: new THREE.Vector3(0, 0, 0) }
};

function setCameraView(viewKey) {
document.querySelectorAll('.bottom-toolbar .btn').forEach(btn => {
    if (btn.id.startsWith('cam-')) btn.classList.remove('active');
});
const selectedBtn = document.getElementById(`cam-${viewKey}`);
if (selectedBtn) selectedBtn.classList.add('active');

const targetView = views[viewKey];
animateCamera(targetView.pos, targetView.target);
}

function animateCamera(newPos, newTarget) {
const startTime = performance.now();
const duration = 1200;
const startPos = camera.position.clone();
const startTarget = controls.target.clone();

function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1.0);
    const ease = 1 - Math.pow(1 - progress, 3);

    camera.position.lerpVectors(startPos, newPos, ease);
    controls.target.lerpVectors(startTarget, newTarget, ease);
    controls.update();

    if (progress < 1.0) {
        requestAnimationFrame(step);
    }
}
requestAnimationFrame(step);
}

window.addEventListener('mousemove', (e) => {
mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

raycaster.setFromCamera(mouse, camera);
raycaster.ray.intersectPlane(interactionPlane, mouseWorld);
});

// --- FÍSICA Y DINÁMICA DE FLUIDOS EN 3D ---
function updatePhysics(dt) {
const pos = geometry.attributes.position.array;
const spd = geometry.attributes.aSpeed.array;
const distAttr = geometry.attributes.aDistance.array;
const count = config.particleCount;

const baseVorticity = config.vorticity;
const viscosity = config.viscosity;

for (let i = 0; i < count; i++) {
    let idx = i * 3;
    let x = pos[idx];
    let y = pos[idx + 1];
    let z = pos[idx + 2];

    const r = Math.sqrt(x * x + z * z) + 0.001;
    const sphericalR = Math.sqrt(x * x + y * y + z * z) + 0.001;

    let vx = 0, vy = 0, vz = 0;

    // 1. Giro helicoidal 3D
    const swirlSpeed = baseVorticity / (r + viscosity * 2.5);
    vx += -z * swirlSpeed;
    vz += x * swirlSpeed;

    // 2. Convergencia Tridimensional
    const inflowSpeed = 0.85 / (r * 0.45 + 0.25);
    vx -= (x / r) * inflowSpeed;
    vz -= (z / r) * inflowSpeed;

    // Compresión vertical progresiva hacia el disco central conforme se acerca
    const verticalCompression = (y / (r + 1.0)) * 1.5;
    vy -= verticalCompression;

    // 3. Chorro Bipolar Axial (Colimación)
    const coreRadius = 1.4;
    if (r < coreRadius) {
        const jetForce = (1.0 - r / coreRadius) * 15.0;
        const dirY = y >= 0 ? 1 : -1;
        vy += dirY * jetForce;

        // Colimación hacia el eje vertical
        vx -= x * 2.8;
        vz -= z * 2.8;
    }

    // 4. Perturbación por Cursor del Ratón
    if (mouseWorld.lengthSq() > 0) {
        const dx = x - mouseWorld.x;
        const dz = z - mouseWorld.z;
        const distToMouse = Math.sqrt(dx * dx + dz * dz);
        if (distToMouse < 4.0) {
            const pushForce = (1.0 - distToMouse / 4.0) * 6.0;
            vx += (dx / distToMouse) * pushForce;
            vz += (dz / distToMouse) * pushForce;
        }
    }

    // Inercia y fricción viscosa
    const pData = particleData[i];
    pData.vx = THREE.MathUtils.lerp(pData.vx, vx, 0.12);
    pData.vy = THREE.MathUtils.lerp(pData.vy, vy, 0.12);
    pData.vz = THREE.MathUtils.lerp(pData.vz, vz, 0.12);

    pos[idx]     += pData.vx * dt;
    pos[idx + 1] += pData.vy * dt;
    pos[idx + 2] += pData.vz * dt;

    const speedMag = Math.sqrt(pData.vx * pData.vx + pData.vy * pData.vy + pData.vz * pData.vz);
    spd[i] = speedMag;
    distAttr[i] = sphericalR;

    if (Math.abs(pos[idx + 1]) > 24.0 || sphericalR > 25.0) {
        resetParticle(i);
    }
}

geometry.attributes.position.needsUpdate = true;
geometry.attributes.aSpeed.needsUpdate = true;
geometry.attributes.aDistance.needsUpdate = true;
}

let lastTime = performance.now();
let frameCount = 0;
let lastFpsUpdate = performance.now();

function animate(time) {
requestAnimationFrame(animate);

const now = performance.now();
lastTime = now;

frameCount++;
if (now - lastFpsUpdate > 500) {
    document.getElementById('val-fps').innerText = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
    frameCount = 0;
    lastFpsUpdate = now;
}

if (!config.isPaused) {
    const effectiveDt = 0.016 * config.timeScale;
    updatePhysics(effectiveDt);

    if (material) {
        material.uniforms.uTime.value = time * 0.001;
    }
}

controls.update();
renderer.render(scene, camera);
}

function togglePlayPause() {
config.isPaused = !config.isPaused;
const btn = document.getElementById('btn-play-pause');
if (config.isPaused) {
    btn.innerHTML = '▶ Reanudar';
    btn.classList.add('active');
} else {
    btn.innerHTML = '⏸ Pause';
    btn.classList.remove('active');
}
}

function toggleSettingsDrawer() {
const drawer = document.getElementById('settings-drawer');
drawer.classList.toggle('open');
}

function updateDensity(val) {
config.particleCount = parseInt(val);
document.getElementById('disp-density').innerText = Number(val).toLocaleString();
document.getElementById('val-particles').innerText = Number(val).toLocaleString();
initParticles();
}

function updateViscosity(val) {
config.viscosity = parseFloat(val);
document.getElementById('disp-viscosity').innerText = val;
}

function updateVorticity(val) {
config.vorticity = parseFloat(val);
document.getElementById('disp-vorticity').innerText = val;
}

function updateTimeScale(val) {
config.timeScale = parseFloat(val);
document.getElementById('disp-dt').innerText = val + 'x';
document.getElementById('val-dt').innerText = (0.016 * config.timeScale).toFixed(3) + ' s';
}

function updateLuminance(val) {
config.luminance = parseFloat(val);
document.getElementById('disp-luminance').innerText = val;
if (material) material.uniforms.uLuminance.value = config.luminance;
}

function setTheme(themeIdx) {
config.themeIndex = themeIdx;
document.querySelectorAll('.theme-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === themeIdx);
});
if (material) material.uniforms.uTheme.value = themeIdx;
}

window.addEventListener('resize', () => {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);

if (material) {
    material.uniforms.uSize.value = window.innerWidth < 900 ? 1.2 : 1.8;
}
});

setCameraView('persp');
initParticles();
animate(0);