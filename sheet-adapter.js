/**
 * Adaptador de Datos para Ayuno Intermitente v6.1.0
 * Maneja persistencia híbrida entre Google Sheets (Apps Script) y localStorage local.
 */

const STORAGE_KEYS = {
  FASTING_LOGS: 'fasting_app_logs',
  WEIGHT_LOGS: 'fasting_app_weight',
  EXERCISE_LOGS: 'fasting_app_exercise',
  PAUSE_LOGS: 'fasting_app_pauses',
  ACTIVE_FAST: 'fasting_app_active',
  USER_PROFILE: 'fasting_app_profile',
  UNLOCKED_BADGES: 'fasting_app_badges'
};

const DataAdapter = {
  isGoogleAppsScript() {
    return typeof google !== 'undefined' && google.script && google.script.run;
  },

  // Perfil del Usuario y Meta (Peso objetivo 82kg por defecto)
  async getUserProfile() {
    if (this.isGoogleAppsScript()) {
      return new Promise((resolve) => {
        google.script.run.withSuccessHandler(resolve).withFailureHandler(() => {
          resolve(this.getLocalUserProfile());
        }).getUserProfile();
      });
    }
    return this.getLocalUserProfile();
  },

  getLocalUserProfile() {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) return JSON.parse(data);
    return {
      targetWeight: 82.0,
      initialWeight: null,
      fastingGoalHours: 18,
      name: 'Usuario'
    };
  },

  async saveUserProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    if (this.isGoogleAppsScript()) {
      google.script.run.saveUserProfile(profile);
    }
  },

  // Estado del Ayuno Actual
  getActiveFast() {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_FAST);
    return data ? JSON.parse(data) : null;
  },

  saveActiveFast(fastData) {
    if (fastData) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_FAST, JSON.stringify(fastData));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_FAST);
    }
  },

  // Registros de Ayunos Completados
  async getFastingLogs() {
    if (this.isGoogleAppsScript()) {
      return new Promise((resolve) => {
        google.script.run.withSuccessHandler((logs) => {
          if (logs && logs.length > 0) {
            localStorage.setItem(STORAGE_KEYS.FASTING_LOGS, JSON.stringify(logs));
            resolve(logs);
          } else {
            resolve(this.getLocalFastingLogs());
          }
        }).withFailureHandler(() => {
          resolve(this.getLocalFastingLogs());
        }).getFastingLogs();
      });
    }
    return this.getLocalFastingLogs();
  },

  getLocalFastingLogs() {
    const data = localStorage.getItem(STORAGE_KEYS.FASTING_LOGS);
    return data ? JSON.parse(data) : [];
  },

  async saveFastingLog(logEntry) {
    const logs = this.getLocalFastingLogs();
    logs.unshift(logEntry);
    localStorage.setItem(STORAGE_KEYS.FASTING_LOGS, JSON.stringify(logs));

    if (this.isGoogleAppsScript()) {
      google.script.run.saveFastingLog(logEntry);
    }
  },

  // Registros de Peso
  async getWeightLogs() {
    if (this.isGoogleAppsScript()) {
      return new Promise((resolve) => {
        google.script.run.withSuccessHandler((logs) => {
          if (logs && logs.length > 0) {
            localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
            resolve(logs);
          } else {
            resolve(this.getLocalWeightLogs());
          }
        }).withFailureHandler(() => {
          resolve(this.getLocalWeightLogs());
        }).getWeightLogs();
      });
    }
    return this.getLocalWeightLogs();
  },

  getLocalWeightLogs() {
    const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    return data ? JSON.parse(data) : [];
  },

  async saveWeightLog(weightEntry) {
    const logs = this.getLocalWeightLogs();
    logs.unshift(weightEntry);
    // Ordenar por fecha descendente
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));

    if (this.isGoogleAppsScript()) {
      google.script.run.saveWeightLog(weightEntry);
    }
  },

  // Logros e Insignias
  getUnlockedBadges() {
    const data = localStorage.getItem(STORAGE_KEYS.UNLOCKED_BADGES);
    return data ? JSON.parse(data) : [];
  },

  saveUnlockedBadge(badgeId) {
    const badges = this.getUnlockedBadges();
    if (!badges.includes(badgeId)) {
      badges.push(badgeId);
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_BADGES, JSON.stringify(badges));
      if (this.isGoogleAppsScript()) {
        google.script.run.saveUnlockedBadge(badgeId);
      }
      return true;
    }
    return false;
  },

  // Registros de Ejercicio
  async getExerciseLogs() {
    if (this.isGoogleAppsScript()) {
      return new Promise((resolve) => {
        google.script.run.withSuccessHandler((logs) => {
          if (logs && logs.length > 0) {
            localStorage.setItem(STORAGE_KEYS.EXERCISE_LOGS, JSON.stringify(logs));
            resolve(logs);
          } else {
            resolve(this.getLocalExerciseLogs());
          }
        }).withFailureHandler(() => {
          resolve(this.getLocalExerciseLogs());
        }).getExerciseLogs();
      });
    }
    return this.getLocalExerciseLogs();
  },

  getLocalExerciseLogs() {
    const data = localStorage.getItem(STORAGE_KEYS.EXERCISE_LOGS);
    return data ? JSON.parse(data) : [];
  },

  async saveExerciseLog(exerciseEntry) {
    const logs = this.getLocalExerciseLogs();
    logs.unshift(exerciseEntry);
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem(STORAGE_KEYS.EXERCISE_LOGS, JSON.stringify(logs));

    if (this.isGoogleAppsScript()) {
      google.script.run.saveExerciseLog(exerciseEntry);
    }
    return logs;
  },

  deleteExerciseLog(id) {
    let logs = this.getLocalExerciseLogs();
    logs = logs.filter(e => String(e.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.EXERCISE_LOGS, JSON.stringify(logs));

    if (this.isGoogleAppsScript()) {
      google.script.run.deleteExerciseLog(id);
    }
    return logs;
  },

  getLocalPauseLogs() {
    const data = localStorage.getItem(STORAGE_KEYS.PAUSE_LOGS);
    return data ? JSON.parse(data) : [];
  },

  savePauseLog(pauseEntry) {
    const logs = this.getLocalPauseLogs();
    logs.unshift(pauseEntry);
    localStorage.setItem(STORAGE_KEYS.PAUSE_LOGS, JSON.stringify(logs));

    if (this.isGoogleAppsScript()) {
      google.script.run.savePauseLog(pauseEntry);
    }
    return logs;
  },

  getUserMeds() {
    const data = localStorage.getItem('fasting_app_meds');
    return data ? JSON.parse(data) : [];
  },

  saveUserMeds(medsList) {
    localStorage.setItem('fasting_app_meds', JSON.stringify(medsList));
    if (this.isGoogleAppsScript()) {
      try { google.script.run.saveUserMeds(medsList); } catch(e) {}
    }
    return medsList;
  },

  saveUserBmr(bmrVal) {
    const num = Number(bmrVal) || 1400;
    localStorage.setItem('fasting_app_bmr', String(num));
    if (this.isGoogleAppsScript()) {
      try { google.script.run.saveUserBmr(num); } catch(e) {}
    }
    return num;
  }
};
