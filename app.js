/**
 * LÓGICA PRINCIPAL DE LA APLICACIÓN DE AYUNO INTERMITENTE 18:6
 */

// Definición de Insignias y Logros
const BADGES = [
  { id: 'first_fast', icon: '🚀', name: 'Primer Paso', desc: 'Iniciaste tu primer ayuno intermitente.' },
  { id: 'fast_18h', icon: '🏆', name: 'Ayuno 18:6 Completado', desc: 'Completaste con éxito 18 horas de ayuno.' },
  { id: 'autophagy_master', icon: '✨', name: 'Maestro de la Autofagia', desc: 'Entraste a la fase dorada de reciclaje celular (16-18h).' },
  { id: 'night_warrior', icon: '🌙', name: 'Guerrero Nocturno', desc: 'Superaste 12 horas consecutivas de ayuno.' },
  { id: 'weight_logged', icon: '⚖️', name: 'Registro de Peso', desc: 'Registraste tu peso en la aplicación.' },
  { id: 'loss_1kg', icon: '🔥', name: 'Primer Kilo Menos', desc: 'Lograste reducir 1 kg desde tu peso inicial.' },
  { id: 'halfway_goal', icon: '⚡', name: 'Mitad de Camino', desc: 'Avanzaste el 50% del trayecto hacia tu meta de 82 kg.' },
  { id: 'goal_82kg', icon: '👑', name: 'CAMPEÓN 82 KG', desc: '¡Alcanzaste tu meta soñada de 82 kg! Logro Máximo.' }
];

// Frases Motivacionales según Estado y Peso
const MOTIVATION_QUOTES = [
  "«Tu cuerpo es tu templo más sagrado. Cada hora en ayuno es una inversión en tu longevidad.»",
  "«El verdadero poder reside en la disciplina. 18 horas de ayuno abren la puerta a la autofagia y salud óptima.»",
  "«Los 82 kg están más cerca de lo que crees. Mantén el foco en tu meta.»",
  "«La cetosis no es solo quemar grasa, es claridad mental y energía pura.»",
  "«Pequeños hábitos diarios generan transformaciones extraordinarias.»"
];

let appState = {
  profile: null,
  activeFast: null,
  fastingLogs: [],
  weightLogs: [],
  unlockedBadges: [],
  timerInterval: null
};

// Inicialización de la App
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initCanvasConfetti();
  await loadAppData();
  setupEventListeners();
  startTimerLoop();
  requestNotificationPermission();
});

// Solicitud de Permiso de Notificaciones
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Carga Inicial de Datos
async function loadAppData() {
  appState.profile = await DataAdapter.getUserProfile();
  appState.activeFast = DataAdapter.getActiveFast();
  appState.fastingLogs = await DataAdapter.getFastingLogs();
  appState.weightLogs = await DataAdapter.getWeightLogs();
  appState.unlockedBadges = DataAdapter.getUnlockedBadges();

  renderProfileHeader();
  renderWeightView();
  renderBadgesView();
  renderBodyStagesList();
}

// Renderizado de la Cabecera de Perfil
function renderProfileHeader() {
  const currentWeightElem = document.getElementById('header-current-weight');
  const latestWeight = appState.weightLogs.length > 0 ? appState.weightLogs[0].weight : null;

  if (currentWeightElem) {
    if (latestWeight) {
      currentWeightElem.textContent = `${latestWeight.toFixed(1)} kg`;
    } else {
      currentWeightElem.textContent = '-- kg';
    }
  }
}

// Configuración de Navegación por Pestañas (iOS Bottom Bar)
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      
      navItems.forEach(n => n.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(`view-${targetView}`).classList.add('active');
    });
  });
}

// --------------------------------------------------------------------------
// LÓGICA DEL TEMPORIZADOR DE AYUNO (18:6)
// --------------------------------------------------------------------------

function startTimerLoop() {
  if (appState.timerInterval) clearInterval(appState.timerInterval);
  updateTimerUI();
  appState.timerInterval = setInterval(updateTimerUI, 1000);
}

function updateTimerUI() {
  const timerCircleProgress = document.getElementById('timer-progress-ring');
  const timerTimeDisplay = document.getElementById('timer-time-display');
  const timerStatusBadge = document.getElementById('timer-status-badge');
  const timerSubtext = document.getElementById('timer-subtext');
  const mainBtn = document.getElementById('btn-fast-action');
  const stageCardElem = document.getElementById('current-stage-summary');

  if (!appState.activeFast) {
    // Estado: Sin ayuno activo
    if (timerCircleProgress) timerCircleProgress.style.strokeDashoffset = '754';
    if (timerTimeDisplay) timerTimeDisplay.textContent = '18:00:00';
    if (timerStatusBadge) {
      timerStatusBadge.textContent = 'EN VENTANA DE ALIMENTACIÓN';
      timerStatusBadge.style.color = 'var(--text-secondary)';
      timerStatusBadge.style.background = 'rgba(255, 255, 255, 0.1)';
    }
    if (timerSubtext) timerSubtext.textContent = 'Listo para iniciar tu próximo ayuno 18:6';
    if (mainBtn) {
      mainBtn.textContent = '⚡ Iniciar Ayuno 18:6';
      mainBtn.className = 'btn-primary';
    }
    if (stageCardElem) {
      stageCardElem.style.display = 'none';
    }
    return;
  }

  // Estado: Ayuno en curso
  const startTime = new Date(appState.activeFast.startTime);
  const now = new Date();
  const elapsedMs = now - startTime;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedHours = elapsedSeconds / 3600;

  const targetHours = appState.profile ? appState.profile.fastingGoalHours || 18 : 18;
  const targetSeconds = targetHours * 3600;

  // Actualizar círculo radial SVG (Perímetro r=120 es 2*pi*120 ≈ 754)
  const totalPerimeter = 754;
  const progressRatio = Math.min(1, elapsedSeconds / targetSeconds);
  const dashOffset = totalPerimeter - (totalPerimeter * progressRatio);
  if (timerCircleProgress) timerCircleProgress.style.strokeDashoffset = dashOffset.toString();

  // Formato de tiempo (Mostrar transcurrido y restante)
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const hoursStr = String(Math.floor(remainingSeconds / 3600)).padStart(2, '0');
  const minsStr = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0');
  const secsStr = String(remainingSeconds % 60).padStart(2, '0');

  if (elapsedSeconds >= targetSeconds) {
    if (timerStatusBadge) {
      timerStatusBadge.textContent = '¡AYUNO 18:6 COMPLETADO!';
      timerStatusBadge.style.color = 'var(--cyan-primary)';
      timerStatusBadge.style.background = 'rgba(0, 245, 212, 0.2)';
    }
    if (timerTimeDisplay) timerTimeDisplay.textContent = `+${Math.floor(elapsedHours - targetHours)}h extras`;
    if (timerSubtext) timerSubtext.textContent = '¡Fabuloso! Puedes finalizar el ayuno cuando gustes.';

    // Notificación única al superar el tiempo
    if (!appState.activeFast.notifiedCompletion) {
      triggerFastingCompletionAlert();
      appState.activeFast.notifiedCompletion = true;
      DataAdapter.saveActiveFast(appState.activeFast);
    }
  } else {
    if (timerStatusBadge) {
      timerStatusBadge.textContent = 'AYUNANDO (MODELO 18:6)';
      timerStatusBadge.style.color = 'var(--cyan-primary)';
      timerStatusBadge.style.background = 'rgba(0, 245, 212, 0.15)';
    }
    if (timerTimeDisplay) timerTimeDisplay.textContent = `${hoursStr}:${minsStr}:${secsStr}`;
    if (timerSubtext) timerSubtext.textContent = `Transcurrido: ${Math.floor(elapsedHours)}h ${Math.floor((elapsedSeconds % 3600)/60)}m`;
  }

  if (mainBtn) {
    mainBtn.textContent = '⏹ Finalizar Ayuno';
    mainBtn.className = 'btn-primary btn-danger';
  }

  // Actualizar resumen de etapa en el cronómetro
  const stage = getFastingStageByHours(elapsedHours);
  if (stageCardElem && stage) {
    stageCardElem.style.display = 'block';
    document.getElementById('summary-stage-icon').textContent = stage.icon;
    document.getElementById('summary-stage-title').textContent = stage.title;
    document.getElementById('summary-stage-desc').textContent = stage.shortDesc;
  }
}

// Iniciar o Finalizar Ayuno
async function handleFastingToggle() {
  if (!appState.activeFast) {
    // Iniciar Ayuno
    const newFast = {
      id: 'fast_' + Date.now(),
      startTime: new Date().toISOString(),
      notifiedCompletion: false
    };
    appState.activeFast = newFast;
    DataAdapter.saveActiveFast(newFast);
    checkAndUnlockBadge('first_fast');
    updateTimerUI();
    showToast('🚀 ¡Ayuno iniciado! Tu cuerpo ha comenzado su proceso de regeneración.');
  } else {
    // Finalizar Ayuno
    const startTime = new Date(appState.activeFast.startTime);
    const endTime = new Date();
    const durationHours = (endTime - startTime) / (1000 * 3600);

    const logEntry = {
      id: appState.activeFast.id,
      startTime: appState.activeFast.startTime,
      endTime: endTime.toISOString(),
      durationHours: Number(durationHours.toFixed(2)),
      completedGoal: durationHours >= 18
    };

    await DataAdapter.saveFastingLog(logEntry);
    appState.fastingLogs.unshift(logEntry);
    appState.activeFast = null;
    DataAdapter.saveActiveFast(null);

    // Verificar Logros por duración
    if (durationHours >= 12) checkAndUnlockBadge('night_warrior');
    if (durationHours >= 16) checkAndUnlockBadge('autophagy_master');
    if (durationHours >= 18) {
      checkAndUnlockBadge('fast_18h');
      triggerConfetti();
      playSuccessChime();
      showRewardModal('🏆 ¡Ayuno 18:6 Logrado!', `Completaste ${durationHours.toFixed(1)} horas de ayuno intermitente. Tu cuerpo ha experimentado un valioso proceso de autofagia y renovación.`);
    } else {
      showToast(`Ayuno finalizado con ${durationHours.toFixed(1)} horas registrados.`);
    }

    updateTimerUI();
  }
}

// --------------------------------------------------------------------------
// LÓGICA DE ETAPAS DEL CUERPO (Vista Mi Cuerpo)
// --------------------------------------------------------------------------

function renderBodyStagesList() {
  const container = document.getElementById('body-stages-container');
  if (!container) return;

  const currentHours = appState.activeFast 
    ? (new Date() - new Date(appState.activeFast.startTime)) / (1000 * 3600)
    : 0;

  container.innerHTML = FASTING_STAGES.map(stage => {
    const isActive = appState.activeFast && currentHours >= stage.minHours && currentHours < stage.maxHours;
    return `
      <div class="stage-card ${isActive ? 'current-active' : ''}">
        <div class="stage-card-top">
          <span style="font-size: 32px;">${stage.icon}</span>
          <div class="stage-info">
            <span class="stage-badge-hours">${stage.minHours} - ${stage.maxHours === 999 ? '24+' : stage.maxHours} Horas</span>
            <h4>${stage.title}</h4>
            <div class="stage-sub">${stage.subtitle}</div>
            <p style="font-size: 13px; color: var(--text-secondary);">${stage.shortDesc}</p>
            <ul class="stage-details-list">
              ${stage.details.map(d => `<li>${d}</li>`).join('')}
            </ul>
            <div class="stage-benefit-tag">✨ ${stage.benefits.join(' • ')}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// LÓGICA DE CONTROL DE PESO (Meta 82 Kg)
// --------------------------------------------------------------------------

function renderWeightView() {
  const targetWeight = 82.0;
  const logs = appState.weightLogs;

  const latestWeightElem = document.getElementById('weight-latest-val');
  const targetWeightElem = document.getElementById('weight-target-val');
  const remainingElem = document.getElementById('weight-remaining-val');
  const progressBarFill = document.getElementById('weight-progress-fill');
  const quoteElem = document.getElementById('motivation-quote-text');
  const historyContainer = document.getElementById('weight-history-list');

  if (targetWeightElem) targetWeightElem.textContent = `${targetWeight.toFixed(1)} kg`;

  if (logs.length === 0) {
    if (latestWeightElem) latestWeightElem.textContent = '-- kg';
    if (remainingElem) remainingElem.textContent = '-- kg';
    if (progressBarFill) progressBarFill.style.width = '0%';
    if (quoteElem) quoteElem.textContent = "«Ingresa tu peso actual para comenzar tu viaje motivacional hacia los 82 kg.»";
    if (historyContainer) historyContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No hay registros de peso aún.</p>';
    return;
  }

  const currentWeight = logs[0].weight;
  const initialWeight = logs[logs.length - 1].weight;
  const remainingKg = Math.max(0, currentWeight - targetWeight);

  if (latestWeightElem) latestWeightElem.textContent = `${currentWeight.toFixed(1)} kg`;
  if (remainingElem) remainingElem.textContent = `${remainingKg.toFixed(1)} kg`;

  // Cálculo del porcentaje hacia los 82kg
  let progressPct = 0;
  if (initialWeight > targetWeight) {
    const totalToLose = initialWeight - targetWeight;
    const lostSoFar = initialWeight - currentWeight;
    progressPct = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
  } else if (currentWeight <= targetWeight) {
    progressPct = 100;
  }
  if (progressBarFill) progressBarFill.style.width = `${progressPct.toFixed(1)}%`;

  // Frase Motivacional Dinámica
  if (quoteElem) {
    if (currentWeight <= targetWeight) {
      quoteElem.textContent = "🎉 ¡FELICITACIONES! Has alcanzado y superado tu meta de 82 kg. Eres un verdadero ejemplo de disciplina y salud.";
    } else {
      const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
      quoteElem.textContent = `«¡Te faltan solo ${remainingKg.toFixed(1)} kg para tus 82 kg! ${randomQuote.replace(/«|»/g, '')}»`;
    }
  }

  // Renderizar historial
  if (historyContainer) {
    historyContainer.innerHTML = logs.map((log, index) => {
      const dateStr = new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
      let diffHtml = '';
      if (index < logs.length - 1) {
        const prevWeight = logs[index + 1].weight;
        const diff = log.weight - prevWeight;
        if (diff < 0) {
          diffHtml = `<span class="weight-diff loss">${diff.toFixed(1)} kg</span>`;
        } else if (diff > 0) {
          diffHtml = `<span class="weight-diff gain">+${diff.toFixed(1)} kg</span>`;
        }
      }
      return `
        <div class="weight-item">
          <div>
            <strong>${log.weight.toFixed(1)} kg</strong>
            <div style="font-size: 11px; color: var(--text-secondary);">${dateStr}</div>
          </div>
          ${diffHtml}
        </div>
      `;
    }).join('');
  }
}

// Modal Agregar Peso
function openWeightModal() {
  document.getElementById('modal-weight').classList.add('active');
}

function closeWeightModal() {
  document.getElementById('modal-weight').classList.remove('active');
}

async function handleSaveWeight() {
  const inputElem = document.getElementById('input-weight-val');
  const weight = parseFloat(inputElem.value);

  if (isNaN(weight) || weight < 30 || weight > 250) {
    alert('Por favor ingresa un peso válido en kg.');
    return;
  }

  const weightEntry = {
    id: 'w_' + Date.now(),
    date: new Date().toISOString(),
    weight: weight
  };

  await DataAdapter.saveWeightLog(weightEntry);
  appState.weightLogs.unshift(weightEntry);
  closeWeightModal();
  inputElem.value = '';

  // Actualización de Perfil e Insignias
  checkAndUnlockBadge('weight_logged');
  const initialWeight = appState.weightLogs[appState.weightLogs.length - 1].weight;
  if (initialWeight - weight >= 1) checkAndUnlockBadge('loss_1kg');
  if (initialWeight > 82 && (initialWeight - weight) >= (initialWeight - 82) / 2) {
    checkAndUnlockBadge('halfway_goal');
  }

  // ¿Alcanzó la meta de 82 kg?
  if (weight <= 82.0) {
    checkAndUnlockBadge('goal_82kg');
    triggerConfetti();
    playSuccessChime();
    showRewardModal('👑 ¡META DE 82 KG ALCANZADA!', '¡Felicidades increibles! Has logrado tu peso objetivo de 82 kg. Tu perseverancia y disciplina han dado el fruto definitivo.');
  } else {
    showToast(`✅ Peso de ${weight.toFixed(1)} kg registrado exitosamente.`);
  }

  renderProfileHeader();
  renderWeightView();
}

// --------------------------------------------------------------------------
// LÓGICA DE GAMIFICACIÓN E INSIGNIAS
// --------------------------------------------------------------------------

function renderBadgesView() {
  const container = document.getElementById('badges-grid-container');
  if (!container) return;

  const unlocked = appState.unlockedBadges;

  container.innerHTML = BADGES.map(badge => {
    const isUnlocked = unlocked.includes(badge.id);
    return `
      <div class="badge-card ${isUnlocked ? 'unlocked' : ''}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-desc">${badge.desc}</div>
      </div>
    `;
  }).join('');
}

function checkAndUnlockBadge(badgeId) {
  const newlyUnlocked = DataAdapter.saveUnlockedBadge(badgeId);
  if (newlyUnlocked) {
    appState.unlockedBadges.push(badgeId);
    renderBadgesView();
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge) {
      triggerConfetti();
      playSuccessChime();
      showRewardModal(`🎖️ ¡Nuevo Logro: ${badge.name}!`, badge.desc);
    }
  }
}

// --------------------------------------------------------------------------
// EFECTOS VISUALES, SONIDO Y NOTIFICACIONES
// --------------------------------------------------------------------------

// Sonido Chime Sintetizado (Web Audio API)
function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do octava
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (e) {
    console.log('Audio no disponible', e);
  }
}

// Alerta de Notificación Web al completar ayuno
function triggerFastingCompletionAlert() {
  playSuccessChime();
  triggerConfetti();
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('🏆 ¡Ayuno 18:6 Completado!', {
      body: 'Has alcanzado tus 18 horas de ayuno intermitente. La autofagia y lipólisis están en su nivel máximo.',
      icon: '🏆'
    });
  }
}

// Modal de Recompensas
function showRewardModal(title, message) {
  document.getElementById('reward-title').textContent = title;
  document.getElementById('reward-message').textContent = message;
  document.getElementById('modal-reward').classList.add('active');
}

function closeRewardModal() {
  document.getElementById('modal-reward').classList.remove('active');
}

// Toast Notificación Flotante
function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 180, 216, 0.95);
      backdrop-filter: blur(10px);
      color: #fff;
      padding: 12px 24px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 600;
      z-index: 4000;
      box-shadow: 0 8px 25px rgba(0,0,0,0.5);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3500);
}

// Canvas Confetti Motor Ligero
let confettiCtx = null;
let confettiParticles = [];

function initCanvasConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    confettiCtx = canvas.getContext('2d');
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
}

function triggerConfetti() {
  if (!confettiCtx) return;
  confettiParticles = [];
  const colors = ['#00f5d4', '#00b4d8', '#7209b7', '#ffb703', '#ffffff'];

  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      opacity: 1
    });
  }

  function renderConfetti() {
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let active = false;

    confettiParticles.forEach(p => {
      if (p.opacity > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravedad
        p.opacity -= 0.015;

        confettiCtx.save();
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        confettiCtx.restore();
      }
    });

    if (active) requestAnimationFrame(renderConfetti);
  }

  renderConfetti();
}

// Configuración de Event Listeners
function setupEventListeners() {
  const fastBtn = document.getElementById('btn-fast-action');
  if (fastBtn) fastBtn.addEventListener('click', handleFastingToggle);

  const openWeightBtn = document.getElementById('btn-open-weight-modal');
  if (openWeightBtn) openWeightBtn.addEventListener('click', openWeightModal);

  const closeWeightBtn = document.getElementById('btn-close-weight-modal');
  if (closeWeightBtn) closeWeightBtn.addEventListener('click', closeWeightModal);

  const saveWeightBtn = document.getElementById('btn-save-weight');
  if (saveWeightBtn) saveWeightBtn.addEventListener('click', handleSaveWeight);

  const closeRewardBtn = document.getElementById('btn-close-reward-modal');
  if (closeRewardBtn) closeRewardBtn.addEventListener('click', closeRewardModal);
}
