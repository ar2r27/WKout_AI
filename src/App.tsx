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
import { sendChatMessageToGemini } from './services/gemini';
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
  const [isCoachLoading, setIsCoachLoading] = useState(false);

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

  const handleApplyPlanFromAI = async (plan: WorkoutPlan, suppressChatMessage = false) => {
    plan.isActive = true;
    const updatedPlans = [plan, ...plans.filter((p) => p.id !== plan.id).map((p) => ({ ...p, isActive: false }))];
    await saveWorkoutPlans(updatedPlans);
    await setActivePlanId(plan.id);
    setPlans(updatedPlans);
    setActivePlan(plan);

    if (!suppressChatMessage) {
      const confirmMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'system',
        content: `Plan "${plan.title}" został pomyślnie ustawiony jako Twój aktywny plan treningowy. Możesz przejść do zakładki Trening lub Plany, aby rozpocząć!`,
        timestamp: new Date().toISOString()
      };
      setChatMessages((prev) => [...prev, confirmMsg]);
      await appendChatMessage(confirmMsg);
    }
  };

  // PROFILE SAVING
  const handleSaveProfile = async (updated: UserProfile) => {
    setProfile(updated);
    await saveUserProfile(updated);
  };

  // CHAT & AI COACH INTERACTION
  const isPlanAcceptanceMessage = (text: string) => {
    const t = text.trim().toLowerCase();
    return (
      t === 'akceptuje' ||
      t === 'akceptuję' ||
      t === 'akceptacja' ||
      t === 'zatwierdzam' ||
      t === 'zgadzam się' ||
      t === 'zgoda' ||
      t === 'biorę' ||
      t === 'biorę to' ||
      t === 'biorę ten plan' ||
      t === 'dodaj' ||
      t === 'dodaj plan' ||
      t === 'dodaj trening' ||
      t === 'zastosuj' ||
      t === 'zastosuj plan' ||
      t === 'zapisz plan' ||
      t === 'ok' ||
      t === 'okej' ||
      t === 'dobrze' ||
      t === 'tak' ||
      t.startsWith('akceptuj') ||
      t.startsWith('zatwierd') ||
      t.includes('dodaj ten plan') ||
      t.includes('dodaj do treningu') ||
      t.includes('zapisz ten plan')
    );
  };

  const handleSendUserMessage = async (content: string, overrideProfile?: UserProfile) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    const updatedWithUser = [...chatMessages, userMsg];
    setChatMessages(updatedWithUser);
    await appendChatMessage(userMsg);

    // If user says "Akceptuje" and there is a proposed plan in chat history, apply it immediately without calling Gemini!
    if (isPlanAcceptanceMessage(content)) {
      const pendingProposal = [...chatMessages]
        .reverse()
        .find((m) => m.action?.type === 'plan_proposal' && m.action.planData);

      if (pendingProposal && pendingProposal.action?.planData) {
        const planToApply = pendingProposal.action.planData;
        await handleApplyPlanFromAI(planToApply, true);

        const coachAckMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `Świetnie! Twój plan "${planToApply.title}" został zaakceptowany i dodany do aplikacji. Wszystkie dni i ćwiczenia są już gotowe w zakładce Trening. Powodzenia na pierwszej sesji!`,
          timestamp: new Date().toISOString(),
          action: {
            type: 'plan_proposal',
            planData: planToApply
          }
        };

        const finalMsgs = [...updatedWithUser, coachAckMsg];
        setChatMessages(finalMsgs);
        await appendChatMessage(coachAckMsg);
        return;
      }
    }

    setIsCoachLoading(true);

    try {
      const effectiveProfile = overrideProfile || profile;
      const response = await sendChatMessageToGemini(
        content,
        updatedWithUser,
        effectiveProfile,
        activePlan,
        settings.geminiApiKey,
        settings.geminiModel
      );

      const coachMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        action: response.proposedPlan
          ? {
              type: 'plan_proposal',
              planData: response.proposedPlan
            }
          : undefined
      };

      const finalMessages = [...updatedWithUser, coachMsg];
      setChatMessages(finalMessages);
      await appendChatMessage(coachMsg);

      // Automatically activate the newly created plan in training if user accepted or requested adaptation from profile
      if (response.proposedPlan && (isPlanAcceptanceMessage(content) || !activePlan || overrideProfile)) {
        await handleApplyPlanFromAI(response.proposedPlan, false);
      }
    } catch (err: any) {
      console.error('Error generating AI coach response:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Przepraszam, wystąpił problem podczas łączenia z Trenerem AI: ${err?.message || 'Nieznany błąd'}. Sprawdź swój klucz API w ustawieniach.`,
        timestamp: new Date().toISOString()
      };
      setChatMessages((prev) => [...prev, errorMsg]);
      await appendChatMessage(errorMsg);
    } finally {
      setIsCoachLoading(false);
    }
  };

  const handleAskCoachToAdaptPlan = (updatedProfile: UserProfile) => {
    handleSaveProfile(updatedProfile);
    setCurrentTab('coach');

    const prompt = `Zaktualizowałem swój profil!
Cel: ${updatedProfile.goal}
Poziom zaawansowania: ${updatedProfile.experience}
Dostępny sprzęt: ${updatedProfile.equipment.join(', ')}
Dni treningowe w tygodniu: ${updatedProfile.daysPerWeek}
Czas na sesję: ok. ${updatedProfile.sessionDuration} minut
Ograniczenia / kontuzje / uwagi: "${updatedProfile.injuries || 'brak'}"

Przeanalizuj te dane i ułóż dla mnie dopasowany, kompletny plan treningowy z podziałem na dni i ćwiczenia.`;

    handleSendUserMessage(prompt, updatedProfile);
  };

  const handleAskCoachAboutSession = (summaryText: string) => {
    setCurrentTab('coach');
    handleSendUserMessage(summaryText);
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/40 selection:text-white">
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
            onOpenBackupModal={() => setIsBackupModalOpen(true)}
          />
        )}

        {currentTab === 'coach' && (
          <AICoachChat
            messages={chatMessages}
            onSendUserMessage={handleSendUserMessage}
            isLoading={isCoachLoading}
            onClearChat={handleClearChat}
            onApplyPlan={handleApplyPlanFromAI}
            profile={profile}
            currentPlan={activePlan}
            settings={settings}
            onOpenSettings={() => setIsBackupModalOpen(true)}
            onGoToWorkout={() => setCurrentTab('workout')}
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
