import {
  UserProfile,
  WorkoutPlan,
  WorkoutSession,
  ChatMessage,
  AppSettings,
  BackupData
} from '../types';

const DB_NAME = 'wkout_ai_database';
const DB_VERSION = 1;

// Default initial state
export const DEFAULT_PROFILE: UserProfile = {
  name: 'Sportowiec',
  age: 26,
  gender: 'male',
  weight: 78,
  height: 180,
  experience: 'intermediate',
  goal: 'hypertrophy',
  daysPerWeek: 3,
  sessionDuration: 60,
  splitPreference: 'ppl',
  equipment: ['barbell', 'dumbbells', 'bench', 'squat_rack', 'cable_machine', 'lat_pulldown', 'leg_press_machine'],
  customEquipment: [],
  injuries: '',
  notes: 'Chcę poprawić siłę w wyciskaniu i zbudować estetyczną sylwetkę.'
};

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  coachPersona: 'motivational',
  coachName: 'Alex',
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'dark',
  googleDrive: {
    isConnected: false,
    clientId: '',
    autoBackup: false
  }
};

export const DEFAULT_INITIAL_PLAN: WorkoutPlan = {
  id: 'plan-default-ppl',
  title: 'PPL Klasyczny – Hipertrofia & Siła (3 Dni)',
  description: 'Kompleksowy plan Push-Pull-Legs oparty na wielostawach i izolacjach. Zaprojektowany pod budowę masy mięśniowej.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
  goal: 'Hipertrofia i siła ogólna',
  level: 'Średniozaawansowany',
  author: 'ai',
  days: [
    {
      id: 'day-push',
      name: 'Dzień 1: PUSH (Klatka, Barki, Triceps)',
      targetFocus: 'Wypychanie i górne partie pchające',
      estimatedDuration: 60,
      exercises: [
        {
          id: 'ex-1',
          exerciseId: 'bench_press_barbell',
          name: 'Wyciskanie sztangi na ławce poziomej',
          muscleGroup: 'Klatka piersiowa',
          equipment: 'barbell',
          targetSets: 4,
          targetReps: '6-8',
          targetRpe: 8,
          restSeconds: 120,
          notes: 'Ruch kontrolowany, 2s w dół, pauza 1s na klatce.'
        },
        {
          id: 'ex-2',
          exerciseId: 'incline_dumbbell_press',
          name: 'Wyciskanie hantli na skosie dodatnim (30°)',
          muscleGroup: 'Klatka piersiowa',
          equipment: 'dumbbells',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: 8,
          restSeconds: 90,
          notes: 'Głębokie rozciągnięcie w dolnej fazie.'
        },
        {
          id: 'ex-3',
          exerciseId: 'overhead_press',
          name: 'Wyciskanie żołnierskie (OHP)',
          muscleGroup: 'Barki',
          equipment: 'barbell',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: 8,
          restSeconds: 90,
          notes: 'Brzuch i pośladki mocno spięte.'
        },
        {
          id: 'ex-4',
          exerciseId: 'lateral_raises',
          name: 'Wznosy hantli bokiem',
          muscleGroup: 'Barki',
          equipment: 'dumbbells',
          targetSets: 4,
          targetReps: '12-15',
          targetRpe: 9,
          restSeconds: 60,
          notes: 'Ruch inicjowany łokciami, bez bujania.'
        },
        {
          id: 'ex-5',
          exerciseId: 'cable_tricep_pushdown',
          name: 'Prostowanie ramion na wyciągu (sznur)',
          muscleGroup: 'Triceps',
          equipment: 'cable_machine',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: 9,
          restSeconds: 60,
          notes: 'Rozszerzaj sznur w dolnej fazie.'
        }
      ]
    },
    {
      id: 'day-pull',
      name: 'Dzień 2: PULL (Grzbiet, Tył barku, Biceps)',
      targetFocus: 'Przyciąganie i plecy',
      estimatedDuration: 65,
      exercises: [
        {
          id: 'ex-6',
          exerciseId: 'lat_pulldown',
          name: 'Ściąganie drążka wyciągu górnego',
          muscleGroup: 'Plecy',
          equipment: 'cable_machine',
          targetSets: 4,
          targetReps: '8-10',
          targetRpe: 8,
          restSeconds: 90,
          notes: 'Ściągaj łopatki w dół przed zgięciem łokci.'
        },
        {
          id: 'ex-7',
          exerciseId: 'barbell_row',
          name: 'Wiosłowanie sztangą w opadzie tułowia',
          muscleGroup: 'Plecy',
          equipment: 'barbell',
          targetSets: 4,
          targetReps: '6-8',
          targetRpe: 8,
          restSeconds: 120,
          notes: 'Stabilny korpus, gryf do pępka.'
        },
        {
          id: 'ex-8',
          exerciseId: 'seated_cable_row',
          name: 'Przyciąganie wyciągu dolnego siedząc',
          muscleGroup: 'Plecy',
          equipment: 'cable_machine',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: 8,
          restSeconds: 75,
          notes: 'Przytrzymaj 1 sekundę w spięciu.'
        },
        {
          id: 'ex-9',
          exerciseId: 'cable_face_pull',
          name: 'Face Pull na wyciągu',
          muscleGroup: 'Barki',
          equipment: 'cable_machine',
          targetSets: 3,
          targetReps: '12-15',
          targetRpe: 8,
          restSeconds: 60,
          notes: 'Kluczowe dla zdrowia barków i retrakcji.'
        },
        {
          id: 'ex-10',
          exerciseId: 'incline_dumbbell_curl',
          name: 'Uginanie hantli na ławce skośnej (biceps)',
          muscleGroup: 'Biceps',
          equipment: 'dumbbells',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: 9,
          restSeconds: 60,
          notes: 'Maksymalne rozciągnięcie głowy długiej.'
        }
      ]
    },
    {
      id: 'day-legs',
      name: 'Dzień 3: LEGS & CORE (Nogi i Brzuch)',
      targetFocus: 'Dolna część ciała i stabilizacja korpusu',
      estimatedDuration: 60,
      exercises: [
        {
          id: 'ex-11',
          exerciseId: 'barbell_back_squat',
          name: 'Przysiad ze sztangą na plecach',
          muscleGroup: 'Czworogłowe ud',
          equipment: 'barbell',
          targetSets: 4,
          targetReps: '6-8',
          targetRpe: 8,
          restSeconds: 150,
          notes: 'Głęboki, kontrolowany przysiad.'
        },
        {
          id: 'ex-12',
          exerciseId: 'romanian_deadlift',
          name: 'Rumuński martwy ciąg z hantlami (RDL)',
          muscleGroup: 'Dwugłowe ud / Pośladki',
          equipment: 'dumbbells',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: 8,
          restSeconds: 90,
          notes: 'Wypchnij biodra mocno w tył.'
        },
        {
          id: 'ex-13',
          exerciseId: 'leg_press_machine',
          name: 'Wypychanie na suwnicy skośnej',
          muscleGroup: 'Czworogłowe ud',
          equipment: 'leg_press_machine',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: 9,
          restSeconds: 90,
          notes: 'Nie blokuj kolan w górze.'
        },
        {
          id: 'ex-14',
          exerciseId: 'standing_calf_raise',
          name: 'Wspięcia na palce stojąc',
          muscleGroup: 'Łydki',
          equipment: 'dumbbells',
          targetSets: 4,
          targetReps: '15-20',
          targetRpe: 9,
          restSeconds: 45,
          notes: 'Zatrzymaj 2 sekundy w dole.'
        },
        {
          id: 'ex-15',
          exerciseId: 'hanging_leg_raise',
          name: 'Wznosy nóg w zwisie na drążku',
          muscleGroup: 'Brzuch',
          equipment: 'pullup_bar',
          targetSets: 3,
          targetReps: '12-15',
          targetRpe: 9,
          restSeconds: 60,
          notes: 'Podwijaj miednicę do góry.'
        }
      ]
    }
  ]
};

export const INITIAL_CHAT_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: 'Cześć! Jestem Twoim trenerem personalnym AI napędzanym przez Gemini.\n\nPrzeanalizowałem Twój profil i przygotowałem dla Ciebie wstępny plan **PPL (Push-Pull-Legs 3 dni)**. \n\nMożesz ze mną swobodnie porozmawiać o wszystkim:\n- **Dostosować ćwiczenia** pod sprzęt na Twojej siłowni lub w domu,\n- **Zgłosić ograniczenia lub ból stawu**, a natychmiast zamienię ćwiczenie na bezpieczne,\n- **Skrócić lub wydłużyć trening**, jeśli dziś masz mniej czasu,\n- **Zaplanować progres ciężaru** na kolejną sesję.\n\nNapisz, jaki masz dziś cel lub o co chcesz zapytać.',
  timestamp: new Date().toISOString()
};

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore('store');
      }
    };
  });
}

// Low-level get/set with localStorage fallback
async function getStoredValue<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('store', 'readonly');
      const store = tx.objectStore('store');
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result !== undefined && req.result !== null) {
          resolve(req.result);
        } else {
          // Check localStorage as fallback
          const localVal = localStorage.getItem(`wkout_${key}`);
          if (localVal) {
            try {
              resolve(JSON.parse(localVal));
              return;
            } catch {
              // ignore
            }
          }
          resolve(defaultValue);
        }
      };
      req.onerror = () => {
        const localVal = localStorage.getItem(`wkout_${key}`);
        if (localVal) {
          try {
            resolve(JSON.parse(localVal));
            return;
          } catch {
            // ignore
          }
        }
        resolve(defaultValue);
      };
    });
  } catch {
    const localVal = localStorage.getItem(`wkout_${key}`);
    if (localVal) {
      try {
        return JSON.parse(localVal);
      } catch {
        // ignore
      }
    }
    return defaultValue;
  }
}

async function setStoredValue<T>(key: string, value: T): Promise<void> {
  // Always mirror in localStorage for redundancy and fast sync
  try {
    localStorage.setItem(`wkout_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage setItem failed:', e);
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('store', 'readwrite');
      const store = tx.objectStore('store');
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB setItem failed, persisted to localStorage:', err);
  }
}

// User Profile
export async function getUserProfile(): Promise<UserProfile> {
  return getStoredValue<UserProfile>('profile', DEFAULT_PROFILE);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setStoredValue('profile', profile);
}

// Workout Plans
export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  return getStoredValue<WorkoutPlan[]>('plans', [DEFAULT_INITIAL_PLAN]);
}

export async function saveWorkoutPlans(plans: WorkoutPlan[]): Promise<void> {
  await setStoredValue('plans', plans);
}

export async function getActivePlan(): Promise<WorkoutPlan | null> {
  const plans = await getWorkoutPlans();
  const activeId = await getStoredValue<string | null>('activePlanId', DEFAULT_INITIAL_PLAN.id);
  const found = plans.find((p) => p.id === activeId);
  return found || plans[0] || null;
}

export async function setActivePlanId(planId: string): Promise<void> {
  await setStoredValue('activePlanId', planId);
  const plans = await getWorkoutPlans();
  const updated = plans.map((p) => ({
    ...p,
    isActive: p.id === planId
  }));
  await saveWorkoutPlans(updated);
}

export async function addOrUpdatePlan(plan: WorkoutPlan): Promise<void> {
  const plans = await getWorkoutPlans();
  const index = plans.findIndex((p) => p.id === plan.id);
  let updated: WorkoutPlan[];
  if (index >= 0) {
    updated = [...plans];
    updated[index] = plan;
  } else {
    updated = [plan, ...plans];
  }
  await saveWorkoutPlans(updated);
  if (plan.isActive) {
    await setActivePlanId(plan.id);
  }
}

export async function deleteWorkoutPlan(planId: string): Promise<void> {
  const plans = await getWorkoutPlans();
  const updated = plans.filter((p) => p.id !== planId);
  await saveWorkoutPlans(updated);
}

// Active Live Workout Session (persisted so refresh won't lose session)
export async function getActiveWorkoutSession(): Promise<WorkoutSession | null> {
  return getStoredValue<WorkoutSession | null>('active_workout_session', null);
}

export async function saveActiveWorkoutSession(session: WorkoutSession | null): Promise<void> {
  await setStoredValue('active_workout_session', session);
}

// Completed Workout Sessions History
export async function getWorkoutSessionsHistory(): Promise<WorkoutSession[]> {
  return getStoredValue<WorkoutSession[]>('sessions_history', []);
}

export async function saveCompletedWorkoutSession(session: WorkoutSession): Promise<void> {
  const history = await getWorkoutSessionsHistory();
  const updated = [session, ...history];
  await setStoredValue('sessions_history', updated);
  // Clear active workout session
  await saveActiveWorkoutSession(null);
}

export async function deleteWorkoutSessionFromHistory(id: string): Promise<void> {
  const history = await getWorkoutSessionsHistory();
  const updated = history.filter((s) => s.id !== id);
  await setStoredValue('sessions_history', updated);
}

// Chat Messages
export async function getChatMessages(): Promise<ChatMessage[]> {
  return getStoredValue<ChatMessage[]>('chat_messages', [INITIAL_CHAT_MESSAGE]);
}

export async function saveChatMessages(messages: ChatMessage[]): Promise<void> {
  await setStoredValue('chat_messages', messages);
}

export async function appendChatMessage(message: ChatMessage): Promise<void> {
  const current = await getChatMessages();
  await saveChatMessages([...current, message]);
}

export async function clearChatHistory(): Promise<void> {
  await saveChatMessages([INITIAL_CHAT_MESSAGE]);
}

// App Settings
export async function getAppSettings(): Promise<AppSettings> {
  return getStoredValue<AppSettings>('settings', DEFAULT_SETTINGS);
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await setStoredValue('settings', settings);
}

// FULL DATABASE EXPORT AND IMPORT
export async function exportDatabaseToJSON(): Promise<string> {
  const profile = await getUserProfile();
  const plans = await getWorkoutPlans();
  const activePlanId = await getStoredValue<string | null>('activePlanId', DEFAULT_INITIAL_PLAN.id);
  const workoutSessions = await getWorkoutSessionsHistory();
  const chatMessages = await getChatMessages();
  const settings = await getAppSettings();

  const backupData: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profile,
    plans,
    activePlanId,
    workoutSessions,
    chatMessages,
    settings: {
      ...settings,
      // Do not export API key in plain download unless user requested
      geminiApiKey: settings.geminiApiKey
    }
  };

  return JSON.stringify(backupData, null, 2);
}

export async function importDatabaseFromJSON(jsonString: string): Promise<boolean> {
  try {
    const data: Partial<BackupData> = JSON.parse(jsonString);

    if (data.profile) {
      await saveUserProfile(data.profile);
    }
    if (data.plans && Array.isArray(data.plans)) {
      await saveWorkoutPlans(data.plans);
    }
    if (data.activePlanId) {
      await setActivePlanId(data.activePlanId);
    }
    if (data.workoutSessions && Array.isArray(data.workoutSessions)) {
      await setStoredValue('sessions_history', data.workoutSessions);
    }
    if (data.chatMessages && Array.isArray(data.chatMessages)) {
      await saveChatMessages(data.chatMessages);
    }
    if (data.settings) {
      await saveAppSettings(data.settings);
    }

    return true;
  } catch (err) {
    console.error('Błąd importu bazy danych:', err);
    throw new Error('Nieprawidłowy format pliku kopii zapasowej.');
  }
}
