import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  WorkoutPlan,
  WorkoutDay,
  WorkoutSession,
  ChatMessage,
  AppSettings
} from './types';
import {
  getUserProfile,
  saveUserProfile,
  getWorkoutPlans,
  saveWorkoutPlans,
  getActivePlan,
  setActivePlanId,
  getActiveWorkoutSession,
  saveActiveWorkoutSession,
  getWorkoutSessionsHistory,
  saveCompletedWorkoutSession,
  deleteWorkoutSessionFromHistory,
  getChatMessages,
  appendChatMessage,
  clearChatHistory,
  getAppSettings,
  saveAppSettings,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS
} from './services/db';
import { backupToGoogleDrive } from './services/googleDrive';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { ActiveWorkout } from './components/ActiveWorkout';
import { PlanView } from './components/PlanView';
import { AICoachChat } from './components/AICoachChat';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { DataBackupModal } from './components/DataBackupModal';
import { RestTimer } from './components/RestTimer';

export const App: React.FC = () => {
  // State
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [historySessions, setHistorySessions] = useState<WorkoutSession[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [currentTab, setCurrentTab] = useState<TabType>('workout');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Rest Timer overlay state
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(90);
  const [isRestTimerOpen, setIsRestTimerOpen] = useState<boolean>(false);

  const [isLoadingApp, setIsLoadingApp] = useState(true);

  // Load all initial data from IndexedDB
  const loadAppState = async () => {
    try {
      const [
        loadedProfile,
        loadedPlans,
        loadedActivePlan,
        loadedActiveSession,
        loadedHistory,
        loadedMessages,
        loadedSettings
      ] = await Promise.all([
        getUserProfile(),
        getWorkoutPlans(),
        getActivePlan(),
        getActiveWorkoutSession(),
        getWorkoutSessionsHistory(),
        getChatMessages(),
        getAppSettings()
      ]);

      setProfile(loadedProfile);
      setPlans(loadedPlans);
      setActivePlan(loadedActivePlan);
      setActiveSession(loadedActiveSession);
      setHistorySessions(loadedHistory);
      setChatMessages(loadedMessages);
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Błąd wczytywania danych z IndexedDB:', err);
    } finally {
      setIsLoadingApp(false);
    }
  };

  useEffect(() => {
    loadAppState();
  }, []);

  // START A LIVE WORKOUT SESSION
  const handleStartSession = async (day: WorkoutDay) => {
    if (!activePlan) return;

    // Convert plan exercises to session logs
    const sessionExercises = day.exercises.map((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      notes: ex.notes,
      sets: Array.from({ length: ex.targetSets || 3 }, (_, idx) => ({
        setNum: idx + 1,
        weight: 60, // sensible default starting weight
        reps: 10,
        rpe: ex.targetRpe || 8,
        completed: false
      }))
    }));

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      planId: activePlan.id,
      planTitle: activePlan.title,
      dayId: day.id,
      dayName: day.name,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      exercises: sessionExercises,
      totalVolumeKg: 0,
      totalSets: 0,
      completed: false
    };

    setActiveSession(newSession);
    await saveActiveWorkoutSession(newSession);
    setCurrentTab('workout');
  };

  // UPDATE ACTIVE SESSION
  const handleUpdateSession = async (updated: WorkoutSession) => {
    setActiveSession(updated);
    await saveActiveWorkoutSession(updated);
  };

  // FINISH WORKOUT SESSION
  const handleFinishSession = async (finished: WorkoutSession) => {
    await saveCompletedWorkoutSession(finished);
    setActiveSession(null);
    setIsRestTimerOpen(false);

    // Refresh history list
    const updatedHistory = await getWorkoutSessionsHistory();
    setHistorySessions(updatedHistory);

    // Auto-backup to Google Drive if configured
    if (settings.googleDrive.isConnected && settings.googleDrive.autoBackup) {
      backupToGoogleDrive().catch((err) =>
        console.warn('Auto backup to Google Drive failed:', err)
      );
    }
  };

  // CANCEL WORKOUT SESSION
  const handleCancelSession = async () => {
    setActiveSession(null);
    await saveActiveWorkoutSession(null);
    setIsRestTimerOpen(false);
  };

  // REST TIMER TRIGGER
  const handleTriggerRestTimer = (seconds: number) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerOpen(true);
  };

  // PLAN SELECTION & SAVING
  const handleSelectActivePlan = async (planId: string) => {
    await setActivePlanId(planId);
    const updated = await getActivePlan();
    setActivePlan(updated);
  };

  const handleSavePlan = async (plan: WorkoutPlan) => {
    const updatedPlans = plans.map((p) => (p.id === plan.id ? plan : p));
    if (!plans.some((p) => p.id === plan.id)) {
      updatedPlans.unshift(plan);
    }
    await saveWorkoutPlans(updatedPlans);
    setPlans(updatedPlans);
    if (plan.id === activePlan?.id) {
      setActivePlan(plan);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const filtered = plans.filter((p) => p.id !== planId);
    await saveWorkoutPlans(filtered);
    setPlans(filtered);
    if (activePlan?.id === planId) {
      setActivePlan(filtered[0] || null);
    }
  };

  const handleApplyPlanFromAI = async (plan: WorkoutPlan) => {
    plan.isActive = true;
    const updatedPlans = [plan, ...plans.map((p) => ({ ...p, isActive: false }))];
    await saveWorkoutPlans(updatedPlans);
    await setActivePlanId(plan.id);
    setPlans(updatedPlans);
    setActivePlan(plan);
  };

  // PROFILE SAVING
  const handleSaveProfile = async (updated: UserProfile) => {
    setProfile(updated);
    await saveUserProfile(updated);
  };

  const handleAskCoachToAdaptPlan = () => {
    setCurrentTab('coach');
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: `Zaktualizowałem swój profil! Mój cel to ${profile.goal}, poziom: ${profile.experience}, mam do dyspozycji: ${profile.equipment.length} rodzajów sprzętu. Moje ograniczenia: "${profile.injuries || 'brak'}". Czy mógłbyś dopasować lub ułożyć dla mnie optymalny plan treningowy?`,
      timestamp: new Date().toISOString()
    };
    handleSendMessage(msg);
  };

  const handleAskCoachAboutSession = (summaryText: string) => {
    setCurrentTab('coach');
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: summaryText,
      timestamp: new Date().toISOString()
    };
    handleSendMessage(msg);
  };

  // CHAT
  const handleSendMessage = async (msg: ChatMessage) => {
    const updated = [...chatMessages, msg];
    setChatMessages(updated);
    await appendChatMessage(msg);
  };

  const handleClearChat = async () => {
    await clearChatHistory();
    const fresh = await getChatMessages();
    setChatMessages(fresh);
  };

  // SETTINGS
  const handleUpdateSettings = async (updated: AppSettings) => {
    setSettings(updated);
    await saveAppSettings(updated);
  };

  // DELETE SESSION HISTORY
  const handleDeleteSession = async (id: string) => {
    await deleteWorkoutSessionFromHistory(id);
    const updated = await getWorkoutSessionsHistory();
    setHistorySessions(updated);
  };

  if (isLoadingApp) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-white">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-zinc-400">Ładowanie WKout AI...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <Header
        googleDrive={settings.googleDrive}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        activeWorkoutActive={!!activeSession}
        onGoToActiveWorkout={() => setCurrentTab('workout')}
      />

      {/* Main Navigation (Desktop Top Bar & Mobile Bottom Bar) */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'backup') {
            setIsBackupModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        activeWorkoutRunning={!!activeSession}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 w-full overflow-y-auto">
        {currentTab === 'workout' && (
          <ActiveWorkout
            activePlan={activePlan}
            activeSession={activeSession}
            onStartSession={handleStartSession}
            onUpdateSession={handleUpdateSession}
            onFinishSession={handleFinishSession}
            onCancelSession={handleCancelSession}
            onTriggerRestTimer={handleTriggerRestTimer}
            soundEnabled={settings.soundEnabled}
            onAskCoachAboutSession={handleAskCoachAboutSession}
          />
        )}

        {currentTab === 'plan' && (
          <PlanView
            plans={plans}
            activePlan={activePlan}
            onSelectActivePlan={handleSelectActivePlan}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
            onStartDaySession={handleStartSession}
            onGoToCoach={() => setCurrentTab('coach')}
          />
        )}

        {currentTab === 'coach' && (
          <AICoachChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onApplyPlan={handleApplyPlanFromAI}
            profile={profile}
            currentPlan={activePlan}
            settings={settings}
            onOpenSettings={() => setIsBackupModalOpen(true)}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            sessions={historySessions}
            onDeleteSession={handleDeleteSession}
            onGoToWorkout={() => setCurrentTab('workout')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onAskCoachToAdaptPlan={handleAskCoachToAdaptPlan}
          />
        )}
      </main>

      {/* Floating Rest Timer Component */}
      <RestTimer
        isOpen={isRestTimerOpen}
        initialSeconds={restTimerSeconds}
        onClose={() => setIsRestTimerOpen(false)}
        soundEnabled={settings.soundEnabled}
      />

      {/* Local Database & Google Drive & AI Settings Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onRefreshAppState={loadAppState}
      />
    </div>
  );
};

export default App;
