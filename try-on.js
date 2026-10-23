const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const VISION_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1';
const TONES = {
  'Rosa Terracota': '#a66255',
  'Rojo Profundo': '#8d273e',
  'Rosa Suave': '#c18a90'
};
const OUTER_LIPS = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
const INNER_LIPS = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];

const canvas = document.querySelector('#try-on-canvas');
const context = canvas.getContext('2d');
const photo = document.querySelector('#try-on-photo');
const placeholder = document.querySelector('#try-on-placeholder');
const status = document.querySelector('#try-on-status');
const fileInput = document.querySelector('#try-on-file');
const toneInputs = [...document.querySelectorAll('[name="try-on-tone"]')];

let landmarker;
let loadingModel;
let photoUrl;
let photoLandmarks;
let selectedTone = 'Rosa Terracota';
let lastStatus = '';

function announce(message) {
  if (message !== lastStatus) {
    status.textContent = message;
    lastStatus = message;
  }
}

async function prepareModel() {
  if (landmarker) return landmarker;
  if (!loadingModel) {
    loadingModel = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import(`${VISION_URL}/+esm`);
      const vision = await FilesetResolver.forVisionTasks(`${VISION_URL}/wasm`);
      landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
        runningMode: 'IMAGE',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5
      });
      return landmarker;
    })().catch(error => {
      loadingModel = undefined;
      throw error;
    });
  }
  return loadingModel;
}

function sizeCanvas(source) {
  const width = source.naturalWidth;
  const height = source.naturalHeight;
  const scale = Math.min(1, 960 / Math.max(width, height));
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
}

function drawContour(points, landmarks) {
  const first = landmarks[points[0]];
  context.moveTo(first.x * canvas.width, first.y * canvas.height);
  for (let i = 1; i < points.length; i++) {
    const point = landmarks[points[i]];
    context.lineTo(point.x * canvas.width, point.y * canvas.height);
  }
  context.closePath();
}

function drawPreview() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(photo, 0, 0, canvas.width, canvas.height);
  if (!photoLandmarks) return;
  context.save();
  context.beginPath();
  drawContour(OUTER_LIPS, photoLandmarks);
  drawContour([...INNER_LIPS].reverse(), photoLandmarks);
  context.globalCompositeOperation = 'multiply';
  context.globalAlpha = 0.78;
  context.fillStyle = TONES[selectedTone];
  context.fill('evenodd');
  context.restore();
}

async function loadPhoto(file) {
  if (!file) return;
  if (!file.type.startsWith('image/') || file.size > 12 * 1024 * 1024) {
    announce('Elige una imagen JPG, PNG o similar de hasta 12 MB.');
    return;
  }
  announce('Cargando la foto y el filtro…');
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = URL.createObjectURL(file);
  photo.src = photoUrl;
  try {
    await photo.decode();
    await prepareModel();
    photoLandmarks = landmarker.detect(photo).faceLandmarks[0];
    sizeCanvas(photo);
    placeholder.hidden = true;
    drawPreview();
    announce(photoLandmarks ? `${selectedTone}: filtro aplicado a tu foto.` : 'No detectamos un rostro claro. Prueba con otra foto de frente.');
  } catch {
    photoLandmarks = undefined;
    placeholder.hidden = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    announce('No pudimos abrir la foto o cargar el filtro. Revisa tu conexión e intenta otra vez.');
  }
}

fileInput.addEventListener('change', () => loadPhoto(fileInput.files[0]));
toneInputs.forEach(input => input.addEventListener('change', () => {
  if (!input.checked) return;
  selectedTone = input.value;
  if (photoLandmarks) {
    drawPreview();
    announce(`${selectedTone}: filtro aplicado a tu foto.`);
  }
  document.querySelector('#set-lipstick').value = selectedTone;
  document.querySelector('#lipstick-tone-name').textContent = selectedTone;
  document.querySelectorAll('[name="lipstick-tone"]').forEach(swatch => { swatch.checked = swatch.value === selectedTone; });
}));
document.querySelectorAll('[name="lipstick-tone"]').forEach(input => input.addEventListener('change', () => {
  if (!input.checked) return;
  const matchingTone = toneInputs.find(tone => tone.value === input.value);
  if (matchingTone) {
    matchingTone.checked = true;
    matchingTone.dispatchEvent(new Event('change'));
  }
}));
document.querySelector('#set-lipstick').addEventListener('change', event => {
  const matchingTone = toneInputs.find(tone => tone.value === event.target.value);
  if (matchingTone) {
    matchingTone.checked = true;
    matchingTone.dispatchEvent(new Event('change'));
  }
});
window.addEventListener('pagehide', () => {
  if (photoUrl) URL.revokeObjectURL(photoUrl);
});
