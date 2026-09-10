import { ExerciseDefinition } from '../types';

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // KLATKA PIERSIOWA
  {
    id: 'bench_press_barbell',
    name: 'Wyciskanie sztangi na ławce poziomej',
    muscleGroup: 'Klatka piersiowa',
    category: 'compound',
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    instructions: 'Połóż się na ławce, stopy stabilnie na podłodze, ściągnij łopatki. Opuść gryf do dolnej części mostka i dynamicznie wyciśnij do góry.',
    tips: 'Utrzymuj lekki naturalny łuk w lędźwiach i nie odrywaj pośladków.'
  },
  {
    id: 'incline_dumbbell_press',
    name: 'Wyciskanie hantli na skosie dodatnim',
    muscleGroup: 'Klatka piersiowa',
    category: 'compound',
    equipment: ['dumbbells', 'incline_bench'],
    difficulty: 'beginner',
    instructions: 'Kąt ławki 30-45 stopni. Wyciskaj hantle w górę i lekko do środka, zachowując pełną kontrolę.',
    tips: 'Świetne na górną część klatki i mniejsze obciążenie przedniego aktonu barku.'
  },
  {
    id: 'chest_press_machine',
    name: 'Wyciskanie na maszynie siedząc (Chest Press)',
    muscleGroup: 'Klatka piersiowa',
    category: 'machine',
    equipment: ['chest_press_machine'],
    difficulty: 'beginner',
    instructions: 'Ustaw wysokość siedziska tak, by uchwyty były na wysokości klatki piersiowej. Wypychaj ciężar skupiając się na spięciu klatki.',
    tips: 'Idealne do bezpiecznego treningu do upadku mięśniowego bez asekuranta.'
  },
  {
    id: 'cable_crossover',
    name: 'Rozpiętki na wyciągu bramowym',
    muscleGroup: 'Klatka piersiowa',
    category: 'cable',
    equipment: ['cable_machine'],
    difficulty: 'intermediate',
    instructions: 'Stań w lekkim wykroku, linki wyciągu prowadź po łuku przed siebie, krzyżując dłonie w końcowej fazie.',
    tips: 'Utrzymuj stałe lekkie ugięcie w łokciach przez cały ruch.'
  },
  {
    id: 'dips_chest',
    name: 'Pompki na poręczach (Dips) z pochyleniem',
    muscleGroup: 'Klatka piersiowa',
    category: 'compound',
    equipment: ['dip_bars', 'bodyweight'],
    difficulty: 'advanced',
    instructions: 'Pochyl tułów w przód pod kątem 30 stopni, łokcie rozszerz lekko na boki. Schodź do kąta 90 stopni w stawie łokciowym.',
    tips: 'Jeżeli brak siły, użyj gumy oporowej lub maszyny z przeciwwagą.'
  },
  {
    id: 'pushups_standard',
    name: 'Pompki klasyczne',
    muscleGroup: 'Klatka piersiowa',
    category: 'bodyweight',
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Ciało w linii prostej, dłonie nieco szerzej niż barki. Opuść klatkę do ziemi i wróć do pozycji wyjściowej.',
    tips: 'Napnij brzuch i pośladki, aby nie zapadać się w odcinku lędźwiowym.'
  },

  // PLECY
  {
    id: 'deadlift_barbell',
    name: 'Martwy ciąg klasyczny ze sztangą',
    muscleGroup: 'Plecy',
    category: 'compound',
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: 'Gryf nad śródstopiem, biodra cofnięte, plecy proste, klatka wypięta. Wstań prostując biodra i kolana jednocześnie.',
    tips: 'Gryf prowadź możliwie najbliżej piszczeli i ud.'
  },
  {
    id: 'lat_pulldown',
    name: 'Ściąganie drążka wyciągu górnego do klatki',
    muscleGroup: 'Plecy',
    category: 'cable',
    equipment: ['cable_machine', 'lat_pulldown'],
    difficulty: 'beginner',
    instructions: 'Chwyć drążek nachwytem, usiądź stabilnie. Ściągaj drążek do górnej części klatki piersiowej inicjując ruch łopatkami.',
    tips: 'Nie bujaj tułowiem do tyłu; skup się na pracy najszerszego grzbietu.'
  },
  {
    id: 'pullups',
    name: 'Podciąganie na drążku (nachwyt)',
    muscleGroup: 'Plecy',
    category: 'compound',
    equipment: ['pullup_bar', 'bodyweight'],
    difficulty: 'advanced',
    instructions: 'Zawiśnij na drążku, zainicjuj ruch depresją łopatek i podciągnij się aż broda przekroczy drążek.',
    tips: 'Możesz zastosować gumę asystującą (powerband).'
  },
  {
    id: 'barbell_row',
    name: 'Wiosłowanie sztangą w opadzie tułowia',
    muscleGroup: 'Plecy',
    category: 'compound',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: 'Opad tułowia ok. 45-70 stopni. Przyciągaj sztangę do dolnej części brzucha prowadząc łokcie blisko ciała.',
    tips: 'Utrzymuj sztywny korpus i nie wybijaj ciężaru biodrami.'
  },
  {
    id: 'seated_cable_row',
    name: 'Przyciąganie uchwytu wyciągu dolnego siedząc',
    muscleGroup: 'Plecy',
    category: 'cable',
    equipment: ['cable_machine'],
    difficulty: 'beginner',
    instructions: 'Nogi lekko ugięte w kolanach, plecy proste. Przyciągaj uchwyt do pępka i mocno zepnij łopatki na 1 sekundę.',
    tips: 'Kontroluj fazę ekscentryczną (powrót) przez 2-3 sekundy.'
  },
  {
    id: 'chest_supported_row',
    name: 'Wiosłowanie hantlami z oparciem o ławkę skośną',
    muscleGroup: 'Plecy',
    category: 'compound',
    equipment: ['dumbbells', 'incline_bench'],
    difficulty: 'beginner',
    instructions: 'Połóż się klatką na ławce skośnej. Pociągaj hantle w stronę bioder unikając obciążenia lędźwi.',
    tips: 'Najbezpieczniejsze ćwiczenie na grzbiet przy problemach z kręgosłupem lędźwiowym.'
  },

  // NOGI - CZWOROGŁOWE I POŚLADKI
  {
    id: 'barbell_back_squat',
    name: 'Przysiad ze sztangą na plecach (Back Squat)',
    muscleGroup: 'Czworogłowe ud',
    category: 'compound',
    equipment: ['barbell', 'squat_rack'],
    difficulty: 'advanced',
    instructions: 'Sztanga na mięśniu czworobocznym. Zejdź w dół rozpychając kolana na zewnątrz co najmniej do kąta 90 stopni.',
    tips: 'Utrzymuj środek ciężkości nad całym śródstopiem i nie odrywaj pięt.'
  },
  {
    id: 'leg_press_machine',
    name: 'Wypychanie ciężaru na suwnicy skośnej (Leg Press)',
    muscleGroup: 'Czworogłowe ud',
    category: 'machine',
    equipment: ['leg_press_machine'],
    difficulty: 'beginner',
    instructions: 'Stopy na szerokość barków na platformie. Schodź płynnie w dół do kąta 90 stopni w kolanach i wypychaj.',
    tips: 'NIGDY nie blokuj kolan w przeproście w górnej pozycji!'
  },
  {
    id: 'bulgarian_split_squat',
    name: 'Przysiad bułgarski z hantlami',
    muscleGroup: 'Czworogłowe ud',
    category: 'compound',
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    instructions: 'Jedna noga oparta o ławkę za tobą. Schodź na nodze wykrocznej głęboko w dół i wracaj.',
    tips: 'Wspaniałe ćwiczenie na asymetrie siłowe i stabilizację miednicy.'
  },
  {
    id: 'leg_extension',
    name: 'Prostowanie nóg na maszynie siedząc',
    muscleGroup: 'Czworogłowe ud',
    category: 'machine',
    equipment: ['leg_extension_machine'],
    difficulty: 'beginner',
    instructions: 'Ustaw oparcie i wałek nad kostkami. Wyprostuj nogi kontrolując ruch w szczytowym spięciu.',
    tips: 'Świetna izolacja mięśnia czworogłowego bez obciążania pleców.'
  },
  {
    id: 'romanian_deadlift',
    name: 'Rumuński martwy ciąg z hantlami/sztangą (RDL)',
    muscleGroup: 'Dwugłowe ud / Pośladki',
    category: 'compound',
    equipment: ['dumbbells', 'barbell'],
    difficulty: 'intermediate',
    instructions: 'Lekkie ugięcie w kolanach, wypychaj biodra mocno w tył, czując rozciąganie z tyłu ud. Wróć dopinając pośladki.',
    tips: 'Ruch zachodzi w stawie biodrowym, a nie w kręgosłupie.'
  },
  {
    id: 'leg_curl_machine',
    name: 'Uginanie nóg leżąc/siedząc (Leg Curl)',
    muscleGroup: 'Dwugłowe ud / Pośladki',
    category: 'machine',
    equipment: ['leg_curl_machine'],
    difficulty: 'beginner',
    instructions: 'Ugnij kolana przyciągając wałek w stronę pośladków, przytrzymaj na ułamek sekundy.',
    tips: 'Kluczowe ćwiczenie dla zdrowia kolan i balansu zginaczy/prostowników.'
  },
  {
    id: 'hip_thrust',
    name: 'Hip Thrust (mostki biodrowe ze sztangą)',
    muscleGroup: 'Dwugłowe ud / Pośladki',
    category: 'compound',
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    instructions: 'Łopatki oparte o ławkę, gryf na biodrach. Wypchnij biodra do góry do pełnego wyprostu i zepnij pośladki.',
    tips: 'Wzrok skierowany przed siebie, broda przy klatce.'
  },

  // BARKI
  {
    id: 'overhead_press',
    name: 'Wyciskanie żołnierskie sztangi stojąc (OHP)',
    muscleGroup: 'Barki',
    category: 'compound',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: 'Stopy na szerokość bioder, napięty brzuch i pośladki. Wyciskaj sztangę pionowo nad głowę.',
    tips: 'Gdy sztanga mija czoło, przesuń głowę lekko do przodu pod gryf.'
  },
  {
    id: 'seated_dumbbell_shoulder_press',
    name: 'Wyciskanie hantli siedząc',
    muscleGroup: 'Barki',
    category: 'compound',
    equipment: ['dumbbells', 'bench'],
    difficulty: 'beginner',
    instructions: 'Ławka ustawiona na ok. 75-80 stopni. Wyciskaj hantle do góry z zachowaniem kontroli.',
    tips: 'Łokcie trzymaj lekko w płaszczyźnie łopatki (nie prostopadle na boki).'
  },
  {
    id: 'lateral_raises',
    name: 'Wznosy hantli bokiem (boczny akton)',
    muscleGroup: 'Barki',
    category: 'isolation',
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    instructions: 'Lekkie pochylenie, unoś ręce bokiem do poziomu barków, prowadząc ruch łokciami.',
    tips: 'Nie używaj zamachu ciałem; priorytetem jest czucie mięśniowe i tempo.'
  },
  {
    id: 'cable_face_pull',
    name: 'Face Pull na wyciągu z liną',
    muscleGroup: 'Barki',
    category: 'cable',
    equipment: ['cable_machine'],
    difficulty: 'beginner',
    instructions: 'Ustaw wyciąg na wysokości oczu. Ciągnij linę do twarzy rozchylając dłonie na boki i rotując barki na zewnątrz.',
    tips: 'Fundament zdrowia i stabilizacji stożka rotatorów barku!'
  },
  {
    id: 'reverse_pec_deck',
    name: 'Odwrotne rozpiętki na maszynie (tył barku)',
    muscleGroup: 'Barki',
    category: 'machine',
    equipment: ['pec_deck_machine'],
    difficulty: 'beginner',
    instructions: 'Usiądź przodem do oparcia maszyny. Odwodź ramiona w tył napinając tylne aktony mięśni naramiennych.',
    tips: 'Nie cofaj łopatek za mocno – pracuj mięśniem naramiennym tylnym.'
  },

  // RAMIONA - BICEPS & TRICEPS
  {
    id: 'barbell_bicep_curl',
    name: 'Uginanie ramion ze sztangą łamaną stojąc',
    muscleGroup: 'Biceps',
    category: 'isolation',
    equipment: ['barbell'],
    difficulty: 'beginner',
    instructions: 'Łokcie stabilnie przy tułowiu. Uginaj przedramiona do pełnego skurczu bicepsa.',
    tips: 'Sztanga łamana jest znacznie łagodniejsza dla nadgarstków niż prosta.'
  },
  {
    id: 'incline_dumbbell_curl',
    name: 'Uginanie z hantlami z supinacją na ławce skośnej',
    muscleGroup: 'Biceps',
    category: 'isolation',
    equipment: ['dumbbells', 'incline_bench'],
    difficulty: 'intermediate',
    instructions: 'Połóż się na ławce (45 stopni), ramiona wiszą pionowo w dół. Uginaj z rotacją nadgarstka na zewnątrz.',
    tips: 'Znakomicie rozciąga głowę długą mięśnia dwugłowego ramienia.'
  },
  {
    id: 'hammer_curl',
    name: 'Uginanie ramion chwytem młotkowym',
    muscleGroup: 'Biceps',
    category: 'isolation',
    equipment: ['dumbbells'],
    difficulty: 'beginner',
    instructions: 'Dłonie skierowane do siebie kciukami w górę. Unoś hantle bez obracania nadgarstka.',
    tips: 'Rozwija mięsień ramienno-promieniowy i dodaje grubości ramionom.'
  },
  {
    id: 'cable_tricep_pushdown',
    name: 'Prostowanie ramion na wyciągu (triceps - sznur/prosty)',
    muscleGroup: 'Triceps',
    category: 'cable',
    equipment: ['cable_machine'],
    difficulty: 'beginner',
    instructions: 'Łokcie zablokowane przy żebrach. Wciskaj linkę lub drążek w dół rozprostowując łokcie.',
    tips: 'W dolnej fazie mocno zepnij triceps na 1 sekundę.'
  },
  {
    id: 'skull_crushers',
    name: 'Wyciskanie francuskie ze sztangą leżąc (Skull Crushers)',
    muscleGroup: 'Triceps',
    category: 'isolation',
    equipment: ['barbell', 'bench'],
    difficulty: 'intermediate',
    instructions: 'Leżąc na ławce, uginaj łokcie opuszczając gryf w kierunku czoła lub czubka głowy.',
    tips: 'Łokcie trzymaj wąsko, nie pozwól im uciekać na boki.'
  },
  {
    id: 'overhead_cable_tricep_extension',
    name: 'Wyciskanie francuskie z linką wyciągu zza głowy',
    muscleGroup: 'Triceps',
    category: 'cable',
    equipment: ['cable_machine'],
    difficulty: 'intermediate',
    instructions: 'Linka ustawiona nisko lub średnio. Wypychaj ręce w przód nad głowę w pełnym rozciągnięciu tricepsa.',
    tips: 'Najbardziej efektywne ćwiczenie na głowę długą tricepsa.'
  },

  // BRZUCH I ŁYDKI
  {
    id: 'hanging_leg_raise',
    name: 'Wznosy nóg / kolan w zwisie na drążku',
    muscleGroup: 'Brzuch',
    category: 'bodyweight',
    equipment: ['pullup_bar', 'bodyweight'],
    difficulty: 'intermediate',
    instructions: 'Zawiśnij na drążku, podwijaj miednicę unosząc kolana lub proste nogi do wysokości klatki.',
    tips: 'Kluczem jest podwinięcie miednicy, a nie tylko unoszenie samych ud zginaczami bioder.'
  },
  {
    id: 'cable_woodchopper_or_crunch',
    name: 'Allahy – spięcia brzucha na wyciągu klęcząc',
    muscleGroup: 'Brzuch',
    category: 'cable',
    equipment: ['cable_machine'],
    difficulty: 'beginner',
    instructions: 'Klęcząc przodem do wyciągu, trzymaj linę przy uszach. Zwijaj tułów w dół napinając mięśnie brzucha.',
    tips: 'Biodra utrzymuj w stałym miejscu – zgina się tylko kręgosłup.'
  },
  {
    id: 'plank_core',
    name: 'Plank (Deska)',
    muscleGroup: 'Brzuch',
    category: 'bodyweight',
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Podpór przodem na przedramionach, całe ciało w jednej linii, napięty brzuch i pośladki.',
    tips: 'Oddychaj miarowo, nie dopuszczaj do zapadania miednicy.'
  },
  {
    id: 'standing_calf_raise',
    name: 'Wspięcia na palce stojąc (maszyna lub hantle)',
    muscleGroup: 'Łydki',
    category: 'machine',
    equipment: ['standing_calf_machine', 'dumbbells'],
    difficulty: 'beginner',
    instructions: 'Stań na podwyższeniu, opuść pięty do głębokiego rozciągnięcia, a potem wybij się wysoko na palce.',
    tips: 'Zatrzymaj ruch na 2 sekundy w dole i 1 sekundę w szczycie.'
  }
];

export const EQUIPMENT_OPTIONS = [
  { id: 'barbell', name: 'Sztanga i talerze olimpijskie', category: 'Wolne ciężary', icon: 'Dumbbell' },
  { id: 'dumbbells', name: 'Zestaw hantli', category: 'Wolne ciężary', icon: 'Dumbbell' },
  { id: 'bench', name: 'Ławka płaska / regulowana', category: 'Stanowiska', icon: 'Layout' },
  { id: 'squat_rack', name: 'Klatka / Stojaki do przysiadów', category: 'Stanowiska', icon: 'Grid' },
  { id: 'cable_machine', name: 'Wyciąg bramowy / bloczkowy', category: 'Wyciągi', icon: 'Cable' },
  { id: 'pullup_bar', name: 'Drążek do podciągania', category: 'Kalistenika', icon: 'MoveUp' },
  { id: 'dip_bars', name: 'Poręcze do dipów', category: 'Kalistenika', icon: 'Pause' },
  { id: 'smith_machine', name: 'Maszyna Smitha (suwnica pionowa)', category: 'Maszyny', icon: 'Server' },
  { id: 'leg_press_machine', name: 'Suwnica do nóg (Leg Press 45°)', category: 'Maszyny', icon: 'ArrowDownUp' },
  { id: 'leg_extension_machine', name: 'Maszyna do prostowania nóg', category: 'Maszyny', icon: 'Cpu' },
  { id: 'leg_curl_machine', name: 'Maszyna do uginania nóg', category: 'Maszyny', icon: 'Cpu' },
  { id: 'chest_press_machine', name: 'Maszyna do wyciskania na klatkę', category: 'Maszyny', icon: 'Cpu' },
  { id: 'lat_pulldown', name: 'Wyciąg górny (Lat Pulldown)', category: 'Wyciągi', icon: 'ArrowDown' },
  { id: 'pec_deck_machine', name: 'Butterfly / Maszyna do rozpiętek', category: 'Maszyny', icon: 'Cpu' },
  { id: 'kettlebell', name: 'Kettlebells (odważniki)', category: 'Wolne ciężary', icon: 'Dumbbell' },
  { id: 'resistance_bands', name: 'Gumy oporowe (Powerband / Miniband)', category: 'Akcesoria', icon: 'Maximize2' },
  { id: 'bodyweight', name: 'Tylko masa własnego ciała', category: 'Kalistenika', icon: 'User' },
];
