import { UserProfile, WorkoutPlan, ChatMessage } from '../types';

export interface AIResponseResult {
  text: string;
  proposedPlan?: WorkoutPlan;
  swapSuggestion?: { original: string; replacement: string; reason: string };
  isSimulated?: boolean;
}

const COACH_SYSTEM_PROMPT = `
Jesteś elitarnym, certyfikowanym trenerem personalnym, fizjoterapeutą i dietetykiem sportowym o imieniu Alex (lub imieniu wybranym przez użytkownika).
Prowadzisz użytkownika w języku polskim.
Twoim celem jest prowadzenie dialogu motywującego, edukacyjnego, opartego na dowodach naukowych (evidence-based strength & conditioning) oraz układanie precyzyjnych, bezpiecznych i skutecznych planów treningowych.

Zasady:
1. Zawsze bierz pod uwagę:
   - Cel użytkownika (np. hipertrofia, redukcja, siła, kondycja)
   - Poziom zaawansowania (początkujący, średniozaawansowany, zaawansowany)
   - Dostępny sprzęt i maszyny (nie polecaj ćwiczeń na sprzęcie, którego użytkownik nie posiada!)
   - Zgłoszone kontuzje, ograniczenia ruchowe i bóle stawów
   - Preferowaną częstotliwość (dni w tygodniu) i czas trwania jednostki treningowej.
2. Gdy użytkownik prosi o:
   - Ułożenie nowego planu treningowego,
   - Zmianę lub modyfikację planu,
   odpowiedz zwięźle i profesjonalnie, a na końcu odpowiedzi ZAWSZE dołącz poprawny blok JSON oznaczony etykietą \`\`\`json:wkout_plan
   Format JSON planu:
   {
     "title": "Nazwa planu",
     "description": "Krótki opis założeń",
     "goal": "Cel planu",
     "level": "Poziom",
     "days": [
       {
         "id": "day-1",
         "name": "Dzień 1: Nazwa (np. Góra Ciała / Push)",
         "targetFocus": "Główne partie",
         "estimatedDuration": 60,
         "exercises": [
           {
             "id": "ex-1",
             "exerciseId": "identyfikator_lub_nazwa",
             "name": "Nazwa ćwiczenia po polsku",
             "muscleGroup": "Partia mięśniowa",
             "equipment": "Sprzęt (np. barbell, dumbbells, machine, cable)",
             "targetSets": 3,
             "targetReps": "8-10",
             "targetRpe": 8,
             "restSeconds": 90,
             "notes": "Wskazówka techniczna"
           }
         ]
       }
     ]
   }
   \`\`\`
3. Bądź pomocny, profesjonalny i precyzyjny. Nie używaj emotikonów - zachowaj przejrzysty, techniczny styl raportu sportowego.
4. Jeśli użytkownik zgłasza ból lub kontuzję, natychmiast zaproponuj bezpieczny zamiennik i wyjaśnij biomechaniczną przyczynę.
`;

/**
 * Call real Google Gemini API
 */
export async function sendChatMessageToGemini(
  userMessage: string,
  history: ChatMessage[],
  profile: UserProfile,
  currentPlan: WorkoutPlan | null,
  apiKey: string,
  model: string = 'gemini-2.5-flash'
): Promise<AIResponseResult> {
  if (!apiKey || apiKey.trim() === '') {
    // Return intelligent simulation if no API key provided
    return generateSmartOfflineResponse(userMessage, profile, currentPlan);
  }

  // Construct context
  const contextMessage = `
[DANE UŻYTKOWNIKA]:
- Imię: ${profile.name}, Wiek: ${profile.age}, Waga: ${profile.weight}kg, Wzrost: ${profile.height}cm
- Poziom: ${profile.experience}, Cel: ${profile.goal}
- Dni w tygodniu: ${profile.daysPerWeek}, Czas sesji: ${profile.sessionDuration} min
- Dostępny sprzęt: ${profile.equipment.join(', ')} ${profile.customEquipment.length ? ', inne: ' + profile.customEquipment.join(', ') : ''}
- Ograniczenia/Kontuzje: ${profile.injuries || 'Brak'}
- Aktualny plan: ${currentPlan ? currentPlan.title : 'Brak'}
`;

  // Format Gemini API payload
  // Convert chat history to Gemini format
  const contents = [
    {
      role: 'user',
      parts: [{ text: COACH_SYSTEM_PROMPT + '\n' + contextMessage }]
    },
    {
      role: 'model',
      parts: [
        {
          text: 'Zrozumiałem! Jestem gotowy prowadzić użytkownika jako jego dedykowany trener personalny z uwzględnieniem jego sprzętu i celów.'
        }
      ]
    }
  ];

  // Include last 6 messages for conversation context
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }

  // Add the new user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `Błąd Gemini API (${response.status})`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text || 'Nie udało się wygenerować odpowiedzi.';

    return parseAIResponse(rawText);
  } catch (err: any) {
    console.warn('Gemini API call failed, falling back to smart simulation:', err);
    const sim = generateSmartOfflineResponse(userMessage, profile, currentPlan);
    return {
      ...sim,
      text: `⚠️ *(Uwaga: Wystąpił problem z Gemini API: ${err?.message || 'Sprawdź klucz API w Ustawieniach'}. Odpowiedź wygenerowana przez wbudowany symulator trenera)*\n\n` + sim.text
    };
  }
}

/**
 * Extracts structured workout plan or swap data from the AI output
 */
function parseAIResponse(text: string): AIResponseResult {
  let cleanText = text;
  let proposedPlan: WorkoutPlan | undefined = undefined;

  // Check for json:wkout_plan or standard json block
  const jsonMatch = text.match(/```json(?::wkout_plan)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.title && Array.isArray(parsed.days)) {
        proposedPlan = {
          id: `plan-${Date.now()}`,
          title: parsed.title,
          description: parsed.description || 'Plan wygenerowany przez Trenera AI',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: false,
          goal: parsed.goal || 'Sylwetka i siła',
          level: parsed.level || 'Średniozaawansowany',
          author: 'ai',
          days: parsed.days.map((day: any, dIdx: number) => ({
            id: day.id || `day-${dIdx + 1}`,
            name: day.name || `Dzień ${dIdx + 1}`,
            targetFocus: day.targetFocus || 'Trening',
            estimatedDuration: day.estimatedDuration || 60,
            exercises: (day.exercises || []).map((ex: any, eIdx: number) => ({
              id: ex.id || `ex-${dIdx + 1}-${eIdx + 1}`,
              exerciseId: ex.exerciseId || `custom-${eIdx + 1}`,
              name: ex.name,
              muscleGroup: ex.muscleGroup || 'Ogólne',
              equipment: ex.equipment || 'Sprzęt siłowni',
              targetSets: Number(ex.targetSets) || 3,
              targetReps: String(ex.targetReps || '8-10'),
              targetRpe: ex.targetRpe ? Number(ex.targetRpe) : 8,
              restSeconds: Number(ex.restSeconds) || 90,
              notes: ex.notes || ''
            }))
          }))
        };

        // Remove the raw JSON block from displayed chat text for clean typography
        cleanText = text.replace(/```json(?::wkout_plan)?\s*[\s\S]*?\s*```/, '').trim();
      }
    } catch (e) {
      console.warn('Could not parse workout plan JSON from AI response:', e);
    }
  }

  return {
    text: cleanText,
    proposedPlan
  };
}

/**
 * Intelligent sports-science simulator when offline or without Gemini API key
 */
export function generateSmartOfflineResponse(
  userMessage: string,
  profile: UserProfile,
  currentPlan: WorkoutPlan | null
): AIResponseResult {
  const query = userMessage.toLowerCase();

  // 1. Request for new workout plan or split
  if (
    query.includes('plan') ||
    query.includes('ułóż') ||
    query.includes('nowy trening') ||
    query.includes('rozpisz') ||
    query.includes('fbw') ||
    query.includes('push pull') ||
    query.includes('góra dół')
  ) {
    const isFBW = query.includes('fbw') || profile.daysPerWeek <= 2 || profile.splitPreference === 'fbw';
    const hasDumbbellsOnly = profile.equipment.length === 1 && profile.equipment.includes('dumbbells');

    if (isFBW) {
      const generatedPlan: WorkoutPlan = {
        id: `plan-fbw-${Date.now()}`,
        title: `Optymalny FBW ${profile.daysPerWeek}x w tygodniu (${profile.goal === 'hypertrophy' ? 'Masa' : 'Kondycja/Siła'})`,
        description: `Plan Full Body Workout dopasowany do ${profile.equipment.length} dostępnych sprzętów użytkownika.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        goal: profile.goal,
        level: profile.experience,
        author: 'ai',
        days: [
          {
            id: 'fbw-a',
            name: 'Trening A (Siła & Baza)',
            targetFocus: 'Całe ciało – dominacja przysiadu i wyciskania',
            estimatedDuration: profile.sessionDuration || 55,
            exercises: [
              {
                id: 'ex-fbw-1',
                exerciseId: 'barbell_back_squat',
                name: 'Przysiad ze sztangą / hantlami',
                muscleGroup: 'Czworogłowe ud',
                equipment: 'barbell',
                targetSets: 4,
                targetReps: '6-8',
                targetRpe: 8,
                restSeconds: 120,
                notes: 'Utrzymuj proste plecy i kolana w osi stóp.'
              },
              {
                id: 'ex-fbw-2',
                exerciseId: 'bench_press_barbell',
                name: 'Wyciskanie na ławce poziomej',
                muscleGroup: 'Klatka piersiowa',
                equipment: 'barbell',
                targetSets: 4,
                targetReps: '6-8',
                targetRpe: 8,
                restSeconds: 120,
                notes: 'Stabilne łopatki ściągnięte do dołu.'
              },
              {
                id: 'ex-fbw-3',
                exerciseId: 'lat_pulldown',
                name: 'Ściąganie wyciągu górnego do klatki',
                muscleGroup: 'Plecy',
                equipment: 'cable_machine',
                targetSets: 3,
                targetReps: '8-10',
                targetRpe: 8,
                restSeconds: 90,
                notes: 'Przyciągaj z łopatek, nie odchylaj się nadmiernie.'
              },
              {
                id: 'ex-fbw-4',
                exerciseId: 'overhead_press',
                name: 'Wyciskanie żołnierskie (barki)',
                muscleGroup: 'Barki',
                equipment: 'barbell',
                targetSets: 3,
                targetReps: '8-10',
                targetRpe: 8,
                restSeconds: 90,
                notes: 'Mocno zepnij pośladki i brzuch.'
              },
              {
                id: 'ex-fbw-5',
                exerciseId: 'hanging_leg_raise',
                name: 'Wznosy nóg w zwisie',
                muscleGroup: 'Brzuch',
                equipment: 'pullup_bar',
                targetSets: 3,
                targetReps: '12-15',
                targetRpe: 9,
                restSeconds: 60,
                notes: 'Kontrolowane opuszczanie.'
              }
            ]
          },
          {
            id: 'fbw-b',
            name: 'Trening B (Hipertrofia & Pociąganie)',
            targetFocus: 'Całe ciało – dominacja martwego ciągu i pociągania',
            estimatedDuration: profile.sessionDuration || 55,
            exercises: [
              {
                id: 'ex-fbw-6',
                exerciseId: 'romanian_deadlift',
                name: 'Rumuński martwy ciąg (RDL)',
                muscleGroup: 'Dwugłowe ud / Pośladki',
                equipment: 'barbell',
                targetSets: 4,
                targetReps: '8-10',
                targetRpe: 8,
                restSeconds: 120,
                notes: 'Płynny ruch z bioder, lekkie ugięcie w kolanach.'
              },
              {
                id: 'ex-fbw-7',
                exerciseId: 'incline_dumbbell_press',
                name: 'Wyciskanie hantli na skosie dodatnim',
                muscleGroup: 'Klatka piersiowa',
                equipment: 'dumbbells',
                targetSets: 4,
                targetReps: '8-10',
                targetRpe: 8,
                restSeconds: 90,
                notes: 'Skup się na czuciu górnej części klatki.'
              },
              {
                id: 'ex-fbw-8',
                exerciseId: 'barbell_row',
                name: 'Wiosłowanie sztangą w opadzie',
                muscleGroup: 'Plecy',
                equipment: 'barbell',
                targetSets: 4,
                targetReps: '8-10',
                targetRpe: 8,
                restSeconds: 90,
                notes: 'Łokcie prowadź blisko tułowia.'
              },
              {
                id: 'ex-fbw-9',
                exerciseId: 'lateral_raises',
                name: 'Wznosy hantli bokiem',
                muscleGroup: 'Barki',
                equipment: 'dumbbells',
                targetSets: 3,
                targetReps: '12-15',
                targetRpe: 9,
                restSeconds: 60,
                notes: 'Izolacja bocznego aktonu.'
              },
              {
                id: 'ex-fbw-10',
                exerciseId: 'barbell_bicep_curl',
                name: 'Uginanie ramion z hantlami/sztangą',
                muscleGroup: 'Biceps',
                equipment: 'barbell',
                targetSets: 3,
                targetReps: '10-12',
                targetRpe: 9,
                restSeconds: 60,
                notes: 'Pełny zakres ruchu.'
              }
            ]
          }
        ]
      };

      return {
        text: `Ułożyłem dla Ciebie spersonalizowany plan **Full Body Workout (FBW)**.\n\nUwzględniłem Twój poziom (**${profile.experience}**), cel (**${profile.goal}**) oraz dostępny sprzęt. Plan zakłada periodyzację bodźców (Dzień A skupia się na dominacji przysiadu i wyciskania horyzontalnego, Dzień B na taśmie tylnej i skosie dodatnim).\n\nKliknij przycisk poniżej, aby zapisać ten plan w swojej aplikacji.`,
        proposedPlan: generatedPlan,
        isSimulated: true
      };
    } else {
      // Upper / Lower or Push Pull Legs
      const generatedPlan: WorkoutPlan = {
        id: `plan-ppl-ai-${Date.now()}`,
        title: `Progresywny PPL ${profile.daysPerWeek}D (${profile.name})`,
        description: `Indywidualnie skomponowany plan Push-Pull-Legs pod hipertrofię z periodyzacją RPE.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        goal: profile.goal,
        level: profile.experience,
        author: 'ai',
        days: [
          {
            id: 'd-push',
            name: 'Dzień 1: PUSH (Klatka, Barki, Triceps)',
            targetFocus: 'Wypychanie',
            estimatedDuration: 60,
            exercises: [
              {
                id: 'p-1',
                exerciseId: 'bench_press_barbell',
                name: 'Wyciskanie sztangi na ławce poziomej',
                muscleGroup: 'Klatka piersiowa',
                equipment: 'barbell',
                targetSets: 4,
                targetReps: '6-8',
                targetRpe: 8,
                restSeconds: 120,
                notes: 'Ciężar główny, 2s faza negatywna.'
              },
              {
                id: 'p-2',
                exerciseId: 'incline_dumbbell_press',
                name: 'Wyciskanie hantli na skosie 30 stopni',
                muscleGroup: 'Klatka piersiowa',
                equipment: 'dumbbells',
                targetSets: 3,
                targetReps: '8-10',
                targetRpe: 8,
                restSeconds: 90,
                notes: 'Rozciągaj klatkę w dole.'
              },
              {
                id: 'p-3',
                exerciseId: 'overhead_press',
                name: 'Wyciskanie żołnierskie OHP',
                muscleGroup: 'Barki',
                equipment: 'barbell',
                targetSets: 3,
                targetReps: '8-10',
                targetRpe: 8,
                restSeconds: 90,
                notes: 'Głowa przechodzi pod gryfem w szczycie.'
              },
              {
                id: 'p-4',
                exerciseId: 'lateral_raises',
                name: 'Wznosy bokiem z hantlami',
                muscleGroup: 'Barki',
                equipment: 'dumbbells',
                targetSets: 4,
                targetReps: '12-15',
                targetRpe: 9,
                restSeconds: 60,
                notes: 'Tempo 2-0-1-0.'
              },
              {
                id: 'p-5',
                exerciseId: 'cable_tricep_pushdown',
                name: 'Prostowanie ramion na wyciągu (sznur)',
                muscleGroup: 'Triceps',
                equipment: 'cable_machine',
                targetSets: 3,
                targetReps: '10-12',
                targetRpe: 9,
                restSeconds: 60,
                notes: 'Rozszerzaj sznur w dole.'
              }
            ]
          },
          {
            id: 'd-pull',
            name: 'Dzień 2: PULL (Plecy, Tył barku, Biceps)',
            targetFocus: 'Przyciąganie',
            estimatedDuration: 60,
            exercises: [
              {
                id: 'pl-1',
                exerciseId: 'lat_pulldown',
                name: 'Ściąganie drążka wyciągu do klatki',
                muscleGroup: 'Plecy',
                equipment: 'cable_machine',
                targetSets: 4,
                targetReps: '8-10',
                targetRpe: 8,
                restSeconds: 90,
                notes: 'Ruch zaczynaj od depresji łopatek.'
              },
              {
                id: 'pl-2',
                exerciseId: 'barbell_row',
                name: 'Wiosłowanie sztangą w opadzie',
                muscleGroup: 'Plecy',
                equipment: 'barbell',
                targetSets: 4,
                targetReps: '6-8',
                targetRpe: 8,
                restSeconds: 120,
                notes: 'Mocne spięcie grzbietu.'
              },
              {
                id: 'pl-3',
                exerciseId: 'cable_face_pull',
                name: 'Face Pull na wyciągu',
                muscleGroup: 'Barki',
                equipment: 'cable_machine',
                targetSets: 3,
                targetReps: '12-15',
                targetRpe: 8,
                restSeconds: 60,
                notes: 'Zdrowie stożka rotatorów.'
              },
              {
                id: 'pl-4',
                exerciseId: 'incline_dumbbell_curl',
                name: 'Uginanie hantli na ławce skośnej',
                muscleGroup: 'Biceps',
                equipment: 'dumbbells',
                targetSets: 3,
                targetReps: '10-12',
                targetRpe: 9,
                restSeconds: 60,
                notes: 'Maksymalne rozciągnięcie w dole.'
              }
            ]
          },
          {
            id: 'd-legs',
            name: 'Dzień 3: LEGS & BRZUCH (Dolne partie)',
            targetFocus: 'Nogi i brzuch',
            estimatedDuration: 60,
            exercises: [
              {
                id: 'lg-1',
                exerciseId: 'barbell_back_squat',
                name: 'Przysiad ze sztangą na plecach',
                muscleGroup: 'Czworogłowe ud',
                equipment: 'barbell',
                targetSets: 4,
                targetReps: '6-8',
                targetRpe: 8,
                restSeconds: 150,
                notes: 'Głęboki przysiad z kontrolą.'
              },
              {
                id: 'lg-2',
                exerciseId: 'romanian_deadlift',
                name: 'Rumuński martwy ciąg z hantlami',
                muscleGroup: 'Dwugłowe ud / Pośladki',
                equipment: 'dumbbells',
                targetSets: 3,
                targetReps: '8-10',
                targetRpe: 8,
                restSeconds: 90,
                notes: 'Poczuj tył ud i pośladki.'
              },
              {
                id: 'lg-3',
                exerciseId: 'leg_press_machine',
                name: 'Wypychanie na suwnicy (Leg Press)',
                muscleGroup: 'Czworogłowe ud',
                equipment: 'leg_press_machine',
                targetSets: 3,
                targetReps: '10-12',
                targetRpe: 9,
                restSeconds: 90,
                notes: 'Nie blokuj kolan w górze.'
              },
              {
                id: 'lg-4',
                exerciseId: 'hanging_leg_raise',
                name: 'Wznosy nóg w zwisie na drążku',
                muscleGroup: 'Brzuch',
                equipment: 'pullup_bar',
                targetSets: 3,
                targetReps: '12-15',
                targetRpe: 9,
                restSeconds: 60,
                notes: 'Podwijaj miednicę.'
              }
            ]
          }
        ]
      };

      return {
        text: `Przygotowałem dla Ciebie zoptymalizowany plan **Push-Pull-Legs (3 dni)**, doskonale skalowalny pod Twój cel (**${profile.goal}**) i wyposażenie.\n\nPodział ten pozwala na idealną regenerację układu nerwowego i mięśniowego (48-72h między partiami), co jest kluczem do ciągłego progresu.\n\nKliknij przycisk poniżej, aby załadować ten plan do swojej bazy treningowej.`,
        proposedPlan: generatedPlan,
        isSimulated: true
      };
    }
  }

  // 2. Knee / shoulder / back pain or limitations
  if (query.includes('ból') || query.includes('boli') || query.includes('kolan') || query.includes('bark') || query.includes('plec')) {
    let advice = '';
    if (query.includes('kolan')) {
      advice = `Przy bólu kolan kluczowe jest **zmniejszenie sił ścinających w stawie rzepkowo-udowym**:\n1. Zamiast głębokich przysiadów ze sztangą na karku, zamień ćwiczenie na **wypychanie na suwnicy (Leg Press) ze stopami ustawionymi wysoko na platformie** lub **przysiady do skrzyni (Box Squat)**.\n2. Wprowadź **Rumuński Martwy Ciąg (RDL)** – wzmocnienie taśmy tylnej (dwugłowe ud, pośladki) stabilizuje staw kolanowy.\n3. Przed treningiem zrób 5 minut rozgrzewki na rowerku stacjonarnym oraz rolowanie pasma biodrowo-piszczelowego.`;
    } else if (query.includes('bark')) {
      advice = `W przypadku dolegliwości w stawie ramiennym (często konflikt podbarkowy / stożek rotatorów):\n1. Zamień wyciskanie sztangi poziomo na **wyciskanie hantli z chwytem neutralnym (dłonie skierowane do siebie)** na lekkim skosie 15-30°.\n2. Wprowadź regularnie **Face Pull na wyciągu** (3 serie po 15 powtórzeń) w celu wzmocnienia rotatorów zewnętrznych.\n3. Unikaj wyciskania sztangi zza karku i głębokich dipów bez kontroli.`;
    } else {
      advice = `Przy dolegliwościach w odcinku lędźwiowym:\n1. Unikaj osiowego obciążania kręgosłupa w zmęczeniu (zamień klasyczne wiosłowanie sztangą na **wiosłowanie hantlami z klatką opartą o ławkę skośną**).\n2. Zamiast wyciskania stojąc wybierz wersję siedzącą z mocnym podparciem pleców.\n3. Skup się na aktywacji mięśni głębokich (Dead Bug, Bird-Dog, Plank).`;
    }

    return {
      text: `**Wskazówki Trenera Dotyczące Bezpieczeństwa Stawów:**\n\n${advice}\n\nPamiętaj: ból ostry to sygnał ostrzegawczy od układu nerwowego. Zawsze trenujemy w bezbólowym zakresie ruchu! Jeśli ból nie ustępuje, skonsultuj się z fizjoterapeutą.`,
      isSimulated: true
    };
  }

  // 3. Short on time
  if (query.includes('czas') || query.includes('minut') || query.includes('krótki') || query.includes('spiesz')) {
    return {
      text: `**Strategia na szybki trening (High-Density Session):**\n\nGdy masz tylko 30-40 minut, nie rezygnuj z treningu! Zastosuj zasady:\n1. **Serie łączone (Antagonist Supersets)**: Połącz wyciskanie klatki z wiosłowaniem lub biceps z tricepsem – odpoczywasz tylko 45-60s między ćwiczeniami przeciwnymi.\n2. **Skup się tylko na 3 kluczowych wielostawach** po 3 solidne serie robocze.\n3. Ogranicz rozgrzewkę do celowanej: 2 szybkie serie rampy na pierwsze ćwiczenie i od razu serie robocze.\n\nPrzejdź do zakładki **Aktywny Trening** i włącz stoper.`,
      isSimulated: true
    };
  }

  // 4. Progressive Overload / Strength progression
  if (query.includes('progres') || query.includes('ciężar') || query.includes('sił') || query.includes('overload')) {
    return {
      text: `**Jak prawidłowo stosować Progressive Overload (Przeładowanie Progresywne)?**\n\nNie musisz na każdym treningu dokładać 5kg na sztangę! Oto hierarchia progresji:\n\n1. **Progresja powtórzeń w widełkach**: Jeśli masz zapisane 3x8-10, zaczynasz od wagi z którą zrobisz 3x8. Na kolejnym treningu robisz 9, 8, 8, potem 9, 9, 9, aż dojdziesz do 3x10.\n2. **Dopiero wtedy dokładasz najmniejszy ciężar** (+1kg do 2.5kg łącznie) i wracasz do 3x8.\n3. **Jakość i tempo**: Poprawa pauzy na dole lub wolniejsze opuszczanie (3 sekundy) przy tym samym ciężarze to również potężny progres hipertroficzny!\n4. **RPE**: Trzymaj serie robocze na RPE 8-9 (zostawiaj 1-2 powtórzenia w zapasie), a tylko ostatnią serię możesz dociągnąć do upadku.`,
      isSimulated: true
    };
  }

  // Default helpful coach response
  return {
    text: `Jako Twój trener AI jestem tu, aby pomóc Ci wyciągnąć maksimum z każdej sesji treningowej.\n\nTwoje aktualne parametry:\n- Cel: **${profile.goal === 'hypertrophy' ? 'Budowa masy mięśniowej' : profile.goal}**\n- Poziom: **${profile.experience}**\n- Sprzęt: **${profile.equipment.length} rodzajów wyposażenia**\n\nMożesz mnie poprosić o:\n- *"Ułóż mi nowy plan treningowy na 3 dni"*\n- *"Zastąp przysiady ćwiczeniem na maszynie"*\n- *"Co zrobić gdy boli mnie bark?"*\n- *"Jak skrócić dzisiejszy trening do 35 minut?"*\n\nCo chciałbyś zoptymalizować?`,
    isSimulated: true
  };
}
