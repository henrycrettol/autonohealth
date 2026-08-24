(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const today = new Date();
  const dateKey = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
  const storagePrefix = `autonohealth-demo-${dateKey}`;

  const setText = (selector, value) => {
    const element = $(selector);
    if (element) element.textContent = value;
  };

  $$("[data-current-year]").forEach((element) => {
    element.textContent = String(today.getFullYear());
  });

  $$("[data-today]").forEach((element) => {
    element.textContent = today.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  });

  const body = document.body;
  const menuButton = $("[data-menu-toggle]");
  const nav = $("[data-primary-nav]");

  function closeMenu() {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  }

  menuButton?.addEventListener("click", () => {
    const willOpen = !nav?.classList.contains("open");
    nav?.classList.toggle("open", willOpen);
    menuButton.setAttribute("aria-expanded", String(willOpen));
    body.classList.toggle("menu-open", willOpen);
  });

  $$("[data-primary-nav] a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 880) closeMenu();
  });

  const searchData = [
    { title: "High blood pressure", type: "Condition", url: "conditions.html#high-blood-pressure", terms: "hypertension heart circulation blood pressure" },
    { title: "Hyperlipidemia", type: "Condition", url: "conditions.html#hyperlipidemia", terms: "dyslipidemia hypercholesterolemia high cholesterol LDL triglycerides lipids cardiovascular" },
    { title: "Type 2 diabetes", type: "Condition", url: "conditions.html#type-2-diabetes", terms: "blood sugar glucose metabolic a1c" },
    { title: "Chronic insomnia", type: "Condition", url: "conditions.html#chronic-insomnia", terms: "sleep trouble falling staying asleep" },
    { title: "Seasonal allergies", type: "Condition", url: "conditions.html#seasonal-allergies", terms: "allergic rhinitis hay fever pollen sneezing congestion" },
    { title: "Migraine", type: "Condition", url: "conditions.html#migraine", terms: "headache aura nausea light sound neurological" },
    { title: "Gastroesophageal reflux disease (GERD)", type: "Condition", url: "conditions.html#gerd", terms: "acid reflux heartburn regurgitation digestive" },
    { title: "Asthma", type: "Condition", url: "conditions.html#asthma", terms: "wheeze cough shortness breath inhaler respiratory" },
    { title: "Osteoarthritis", type: "Condition", url: "conditions.html#osteoarthritis", terms: "arthritis joint pain stiffness knee hip hand movement" },
    { title: "Depression", type: "Condition", url: "conditions.html#depression", terms: "major depressive disorder mood sadness interest mental health" },
    { title: "Chronic kidney disease", type: "Condition", url: "conditions.html#chronic-kidney-disease", terms: "ckd renal egfr uacr albuminuria kidney function" },
    { title: "Atopic dermatitis (eczema)", type: "Condition", url: "conditions.html#atopic-dermatitis", terms: "itch rash dry skin flare dermatology eczema" },
    { title: "Chronic obstructive pulmonary disease (COPD)", type: "Condition", url: "conditions.html#copd", terms: "copd emphysema chronic bronchitis cough sputum breathlessness respiratory" },
    { title: "Generalized anxiety disorder", type: "Condition", url: "conditions.html#generalized-anxiety-disorder", terms: "gad worry anxiety tension restlessness mental health" },
    { title: "Irritable bowel syndrome", type: "Condition", url: "conditions.html#irritable-bowel-syndrome", terms: "ibs abdominal pain bloating constipation diarrhea digestive" },
    { title: "Hypothyroidism", type: "Condition", url: "conditions.html#hypothyroidism", terms: "underactive thyroid tsh t4 hashimoto endocrine fatigue" },
    { title: "Atrial fibrillation", type: "Condition", url: "conditions.html#atrial-fibrillation", terms: "afib af irregular heartbeat arrhythmia palpitations stroke cardiovascular" },
    { title: "Osteoporosis", type: "Condition", url: "conditions.html#osteoporosis", terms: "bone density bmd fracture hip spine wrist bone health" },
    { title: "Peripheral neuropathy", type: "Condition", url: "conditions.html#peripheral-neuropathy", terms: "nerve damage numbness tingling burning pain diabetic foot neurological" },
    { title: "Celiac disease", type: "Condition", url: "conditions.html#celiac-disease", terms: "gluten autoimmune wheat barley rye malabsorption digestive" },
    { title: "Obstructive sleep apnea", type: "Condition", url: "conditions.html#obstructive-sleep-apnea", terms: "osa snoring breathing pauses cpap sleepiness respiratory" },
    { title: "Heart failure", type: "Condition", url: "conditions.html#heart-failure", terms: "congestive heart failure chf hfref hfpef swelling breathlessness cardiovascular" },
    { title: "Obesity", type: "Condition", url: "conditions.html#obesity", terms: "adiposity weight metabolic bmi waist weight management" },
    { title: "Prediabetes", type: "Condition", url: "conditions.html#prediabetes", terms: "pre diabetes impaired fasting glucose a1c diabetes prevention metabolic" },
    { title: "Coronary artery disease", type: "Condition", url: "conditions.html#coronary-artery-disease", terms: "cad coronary heart disease atherosclerosis angina heart attack myocardial infarction stent bypass" },
    { title: "Stroke and transient ischemic attack", type: "Condition", url: "conditions.html#stroke-tia", terms: "stroke tia mini stroke ischemic hemorrhagic face droop weakness speech fast brain attack" },
    { title: "Venous thromboembolism", type: "Condition", url: "conditions.html#venous-thromboembolism", terms: "vte dvt deep vein thrombosis pulmonary embolism pe blood clot leg swelling chest pain" },
    { title: "Tobacco dependence", type: "Condition", url: "conditions.html#tobacco-dependence", terms: "nicotine smoking vaping cigarettes tobacco cessation quit withdrawal cravings" },
    { title: "Low-back pain", type: "Condition", url: "conditions.html#low-back-pain", terms: "low back pain lumbar sciatica radiculopathy spine backache musculoskeletal" },
    { title: "Chronic constipation", type: "Condition", url: "conditions.html#chronic-constipation", terms: "constipation hard stool straining infrequent bowel movement cic digestive" },
    { title: "Gout", type: "Condition", url: "conditions.html#gout", terms: "gout uric acid urate crystals podagra inflammatory arthritis flare tophi" },
    { title: "Fibromyalgia", type: "Condition", url: "conditions.html#fibromyalgia", terms: "fibro widespread pain fatigue sleep brain fog central sensitization" },
    { title: "DASH eating pattern", type: "Lifestyle treatment", url: "treatments.html#dash", terms: "diet nutrition hypertension sodium blood pressure" },
    { title: "Structured physical activity", type: "Lifestyle treatment", url: "treatments.html#physical-activity", terms: "exercise movement diabetes blood pressure" },
    { title: "Cognitive behavioral therapy", type: "Behavioral treatment", url: "treatments.html#cbti", terms: "cbt cbt-i psychotherapy sleep insomnia generalized anxiety disorder gad worry depression major depressive disorder therapy" },
    { title: "ACE inhibitors", type: "Medication class", url: "treatments.html#ace-inhibitors", terms: "lisinopril enalapril ramipril hypertension blood pressure heart failure hfref chronic kidney disease ckd albuminuria medication" },
    { title: "Statins", type: "Medication class", url: "treatments.html#statins", terms: "atorvastatin rosuvastatin simvastatin hyperlipidemia dyslipidemia cholesterol LDL coronary artery disease cad stroke tia secondary prevention medication" },
    { title: "Metformin", type: "Medication", url: "treatments.html#metformin", terms: "biguanide diabetes blood sugar prediabetes prevention medication" },
    { title: "Melatonin", type: "Natural product", url: "treatments.html#melatonin", terms: "supplement sleep insomnia jet lag" },
    { title: "Magnesium", type: "Natural product", url: "treatments.html#magnesium", terms: "supplement mineral blood pressure sleep" },
    { title: "Valerian", type: "Natural product", url: "treatments.html#valerian", terms: "herbal supplement sleep insomnia" },
    { title: "Triptans", type: "Medication class", url: "treatments.html#triptans", terms: "sumatriptan rizatriptan zolmitriptan migraine headache acute" },
    { title: "Proton pump inhibitors", type: "Medication class", url: "treatments.html#proton-pump-inhibitors", terms: "ppi omeprazole pantoprazole acid reflux heartburn gerd" },
    { title: "Inhaled corticosteroid-containing therapy", type: "Medication class", url: "treatments.html#inhaled-corticosteroids", terms: "ics budesonide fluticasone beclomethasone asthma inhaler" },
    { title: "Topical NSAIDs", type: "Medication class", url: "treatments.html#topical-nsaids", terms: "diclofenac gel osteoarthritis knee hand joint pain" },
    { title: "SSRIs and SNRIs", type: "Medication classes", url: "treatments.html#ssris", terms: "ssri snri sertraline fluoxetine escitalopram citalopram duloxetine venlafaxine depression anxiety gad antidepressant" },
    { title: "SGLT2 inhibitors", type: "Medication class", url: "treatments.html#sglt2-inhibitors", terms: "dapagliflozin empagliflozin canagliflozin chronic kidney disease ckd renal type 2 diabetes glucose heart failure hfref hfpef" },
    { title: "Topical corticosteroids", type: "Medication class", url: "treatments.html#topical-corticosteroids", terms: "hydrocortisone triamcinolone eczema atopic dermatitis cream ointment" },
    { title: "Long-acting inhaled bronchodilators", type: "Medication class", url: "treatments.html#long-acting-bronchodilators", terms: "lama laba tiotropium formoterol copd inhaler respiratory" },
    { title: "Pulmonary rehabilitation", type: "Lifestyle treatment", url: "treatments.html#pulmonary-rehabilitation", terms: "copd exercise breathing rehab rehabilitation" },
    { title: "Soluble fiber", type: "Nutrition treatment", url: "treatments.html#soluble-fiber-ibs", terms: "psyllium fiber ibs constipation diarrhea digestive cholesterol ldl hyperlipidemia" },
    { title: "Structured low-FODMAP diet trial", type: "Nutrition treatment", url: "treatments.html#low-fodmap-diet", terms: "fodmap ibs diet nutrition elimination reintroduction" },
    { title: "Levothyroxine", type: "Medication", url: "treatments.html#levothyroxine", terms: "t4 thyroid hormone hypothyroidism synthroid endocrine" },
    { title: "Combination T4/T3 therapy", type: "Medication therapy", url: "treatments.html#combination-thyroid-hormone", terms: "liothyronine levothyroxine thyroid hypothyroidism combination" },
    { title: "Direct oral anticoagulants", type: "Medication class", url: "treatments.html#doac-atrial-fibrillation", terms: "doac apixaban dabigatran edoxaban rivaroxaban afib stroke anticoagulant dvt pe vte thrombosis embolism" },
    { title: "Beta blockers", type: "Medication class", url: "treatments.html#beta-blockers-afib", terms: "metoprolol carvedilol bisoprolol beta blocker afib rate control arrhythmia hypertension high blood pressure heart failure hfref" },
    { title: "Bisphosphonates", type: "Medication class", url: "treatments.html#bisphosphonates", terms: "alendronate risedronate ibandronate zoledronic acid osteoporosis fracture" },
    { title: "Bone-safe exercise and fall prevention", type: "Lifestyle treatment", url: "treatments.html#osteoporosis-exercise-fall-prevention", terms: "osteoporosis strength resistance balance falls fracture exercise" },
    { title: "Duloxetine", type: "Medication", url: "treatments.html#duloxetine-neuropathic-pain", terms: "snri nerve pain diabetic neuropathy cymbalta depression anxiety gad fibromyalgia chronic musculoskeletal low back pain" },
    { title: "Pregabalin", type: "Medication", url: "treatments.html#pregabalin-neuropathic-pain", terms: "gabapentinoid nerve pain diabetic neuropathy lyrica postherpetic neuralgia spinal cord injury fibromyalgia focal onset seizure epilepsy" },
    { title: "Strict gluten-free diet for celiac disease", type: "Medical nutrition therapy", url: "treatments.html#gluten-free-diet-celiac", terms: "gluten wheat barley rye celiac diet cross contact" },
    { title: "Celiac dietitian and deficiency care", type: "Nutrition care", url: "treatments.html#celiac-dietitian-deficiency-care", terms: "celiac dietitian iron vitamin deficiency follow up nutrition" },
    { title: "CPAP and positive airway pressure therapy", type: "Medical device", url: "treatments.html#cpap-osa", terms: "cpap pap apap mask obstructive sleep apnea osa breathing" },
    { title: "Custom oral appliance therapy for OSA", type: "Medical device", url: "treatments.html#oral-appliance-osa", terms: "mandibular advancement mouthpiece sleep apnea osa dental" },
    { title: "Angiotensin receptor-neprilysin inhibitor therapy", type: "Medication class", url: "treatments.html#arni-heart-failure", terms: "arni sacubitril valsartan entresto hfref heart failure" },
    { title: "Mineralocorticoid receptor antagonists", type: "Medication class", url: "treatments.html#mra-heart-failure", terms: "mra spironolactone eplerenone aldosterone hfref heart failure resistant hypertension primary aldosteronism" },
    { title: "Angiotensin receptor blockers", type: "Medication class", url: "treatments.html#arbs", terms: "arb losartan valsartan candesartan hypertension high blood pressure chronic kidney disease ckd albuminuria heart failure hfref" },
    { title: "Thiazide and thiazide-like diuretics", type: "Medication class", url: "treatments.html#thiazide-diuretics", terms: "chlorthalidone hydrochlorothiazide indapamide hypertension high blood pressure diuretic" },
    { title: "Calcium-channel blockers", type: "Medication class", url: "treatments.html#calcium-channel-blockers", terms: "ccb amlodipine diltiazem verapamil hypertension high blood pressure atrial fibrillation afib rate control" },
    { title: "GLP-1–based therapy", type: "Medication class", url: "treatments.html#glp1-therapy", terms: "glp-1 gip semaglutide dulaglutide tirzepatide type 2 diabetes glucose weight cardiovascular" },
    { title: "Insulin therapy for type 2 diabetes", type: "Medication", url: "treatments.html#insulin-type-2-diabetes", terms: "insulin basal bolus injection pump type 2 diabetes blood sugar glucose a1c" },
    { title: "Ezetimibe", type: "Medication", url: "treatments.html#ezetimibe", terms: "zetia cholesterol absorption inhibitor hyperlipidemia dyslipidemia ldl nonstatin" },
    { title: "Finerenone", type: "Medication", url: "treatments.html#finerenone-ckd", terms: "kerendia nonsteroidal mra nsmra chronic kidney disease ckd type 2 diabetes albuminuria kidney cardiovascular" },
    { title: "Second-generation oral antihistamines", type: "Medication class", url: "treatments.html#second-generation-antihistamines", terms: "cetirizine loratadine fexofenadine seasonal allergies allergic rhinitis hay fever pollen sneezing itching" },
    { title: "Intranasal corticosteroids", type: "Medication class", url: "treatments.html#intranasal-corticosteroids", terms: "fluticasone budesonide triamcinolone nasal spray seasonal allergies allergic rhinitis hay fever pollen congestion" },
    { title: "Allergen immunotherapy", type: "Specialist treatment", url: "treatments.html#allergen-immunotherapy", terms: "allergy shots sublingual tablets seasonal allergies allergic rhinitis hay fever pollen" },
    { title: "ICS–formoterol anti-inflammatory reliever", type: "Medication class", url: "treatments.html#ics-formoterol", terms: "air mart budesonide formoterol asthma inhaler controller reliever" },
    { title: "Triple inhaler therapy for COPD", type: "Medication class", url: "treatments.html#copd-triple-inhaler", terms: "ics laba lama copd emphysema chronic bronchitis inhaler exacerbation" },
    { title: "Behavioral counseling and quitline support", type: "Behavioral treatment", url: "treatments.html#smoking-cessation-treatment", terms: "quit tobacco dependence nicotine smoking counseling quitline text support copd" },
    { title: "Targeted biologic therapy", type: "Specialist medication", url: "treatments.html#targeted-biologics", terms: "dupilumab omalizumab mepolizumab benralizumab tezepelumab tralokinumab severe asthma atopic dermatitis eczema" },
    { title: "Moisturizer and skin-barrier care", type: "Skin care", url: "treatments.html#eczema-barrier-care", terms: "moisturizer emollient cream ointment bathing eczema atopic dermatitis dry skin" },
    { title: "Steroid-sparing topical medicines", type: "Medication class", url: "treatments.html#steroid-sparing-topicals", terms: "tacrolimus pimecrolimus crisaborole ruxolitinib calcineurin eczema atopic dermatitis topical" },
    { title: "CGRP-targeting migraine therapies", type: "Medication class", url: "treatments.html#cgrp-migraine-therapy", terms: "gepant rimegepant ubrogepant atogepant erenumab fremanezumab galcanezumab migraine acute prevention headache" },
    { title: "H2 receptor blockers", type: "Medication class", url: "treatments.html#h2-blockers-gerd", terms: "famotidine pepcid acid reflux heartburn gerd nighttime" },
    { title: "Dual orexin receptor antagonists", type: "Medication class", url: "treatments.html#orexin-antagonists-insomnia", terms: "dora daridorexant lemborexant suvorexant insomnia sleep" },
    { title: "Exercise and physical therapy for osteoarthritis", type: "Lifestyle treatment", url: "treatments.html#osteoarthritis-exercise-therapy", terms: "arthritis joint pain exercise physical therapy pt strength mobility aquatic" },
    { title: "IBS subtype-directed medicines", type: "Medication class", url: "treatments.html#ibs-prescription-medicines", terms: "ibs-c ibs-d constipation diarrhea linaclotide plecanatide lubiprostone rifaximin eluxadoline loperamide irritable bowel syndrome" },
    { title: "Atrial fibrillation rhythm-control strategies", type: "Medication and procedure", url: "treatments.html#afib-rhythm-control", terms: "afib atrial fibrillation antiarrhythmic cardioversion catheter ablation rhythm control" },
    { title: "Non-bisphosphonate osteoporosis medicines", type: "Medication class", url: "treatments.html#advanced-osteoporosis-medicines", terms: "denosumab prolia teriparatide abaloparatide romosozumab anabolic rankl osteoporosis fracture bone" },
    { title: "Topical medicines for localized neuropathic pain", type: "Medication class", url: "treatments.html#topical-neuropathic-pain", terms: "capsaicin lidocaine patch cream nerve pain neuropathy peripheral neuropathy burning" },
    { title: "Weight and positional strategies for OSA", type: "Lifestyle treatment", url: "treatments.html#osa-lifestyle-positional", terms: "obstructive sleep apnea osa weight loss weight management side sleeping positional therapy" },
    { title: "Loop diuretics for heart-failure congestion", type: "Medication class", url: "treatments.html#loop-diuretics-heart-failure", terms: "furosemide lasix torsemide bumetanide heart failure swelling edema congestion breathlessness" },
    { title: "Intensive behavioral weight management", type: "Lifestyle treatment", url: "treatments.html#intensive-weight-management", terms: "obesity weight loss nutrition exercise coaching behavioral program sleep" },
    { title: "Non-GLP-1 anti-obesity medicines", type: "Medication classes", url: "treatments.html#non-glp1-obesity-medicines", terms: "obesity phentermine topiramate qsymia naltrexone bupropion contrave orlistat alli xenical" },
    { title: "Metabolic and bariatric surgery", type: "Specialist procedure", url: "treatments.html#metabolic-bariatric-surgery", terms: "obesity weight loss surgery sleeve gastrectomy gastric bypass metabolic bariatric" },
    { title: "Diabetes Prevention Program lifestyle intervention", type: "Lifestyle treatment", url: "treatments.html#diabetes-prevention-program", terms: "prediabetes prevent type 2 diabetes dpp lifestyle coaching nutrition physical activity" },
    { title: "Antiplatelet therapy", type: "Medication class", url: "treatments.html#antiplatelet-therapy", terms: "aspirin clopidogrel plavix p2y12 coronary artery disease cad stent heart attack stroke tia secondary prevention" },
    { title: "Cardiac rehabilitation", type: "Rehabilitation", url: "treatments.html#cardiac-rehabilitation", terms: "coronary artery disease cad heart attack stent bypass exercise rehab recovery" },
    { title: "Coronary revascularization", type: "Specialist procedure", url: "treatments.html#coronary-revascularization", terms: "pci angioplasty stent cabg bypass surgery coronary artery disease cad angina" },
    { title: "Nitroglycerin and long-acting nitrates", type: "Medication class", url: "treatments.html#nitrates-angina", terms: "nitroglycerin nitrate angina chest pain coronary artery disease cad" },
    { title: "Acute ischemic stroke reperfusion", type: "Emergency treatment", url: "treatments.html#acute-stroke-reperfusion", terms: "stroke thrombolysis alteplase tpa tenecteplase thrombectomy clot buster brain attack emergency" },
    { title: "Interdisciplinary stroke rehabilitation", type: "Rehabilitation", url: "treatments.html#stroke-rehabilitation", terms: "stroke recovery physical therapy occupational therapy speech swallowing cognition rehab" },
    { title: "Heparin-based and warfarin anticoagulation for VTE", type: "Medication class", url: "treatments.html#heparin-warfarin-vte", terms: "vte dvt pe anticoagulant enoxaparin lovenox heparin warfarin coumadin blood clot" },
    { title: "Non-drug care for low-back pain", type: "Rehabilitation", url: "treatments.html#non-drug-low-back-care", terms: "back pain lumbar exercise physical therapy cbt mindfulness acupuncture spinal manipulation massage" },
    { title: "Oral NSAIDs", type: "Medication class", url: "treatments.html#oral-nsaids", terms: "ibuprofen naproxen celecoxib back pain gout flare osteoarthritis inflammation" },
    { title: "Medicines for chronic constipation", type: "Medication class", url: "treatments.html#constipation-medicines", terms: "constipation peg polyethylene glycol miralax bisacodyl senna laxative linaclotide plecanatide lubiprostone prucalopride" },
    { title: "Urate-lowering therapy", type: "Medication class", url: "treatments.html#urate-lowering-therapy", terms: "gout allopurinol febuxostat probenecid uric acid urate treat to target tophi" },
    { title: "Colchicine and glucocorticoids for gout flares", type: "Medication class", url: "treatments.html#gout-flare-medicines", terms: "gout flare colchicine prednisone steroid glucocorticoid inflammation" },
    { title: "Exercise and self-management for fibromyalgia", type: "Lifestyle treatment", url: "treatments.html#fibromyalgia-exercise-self-management", terms: "fibromyalgia exercise aerobic strength aquatic yoga tai chi pacing cbt sleep" },
    { title: "Milnacipran", type: "Medication", url: "treatments.html#milnacipran-fibromyalgia", terms: "savella snri fibromyalgia pain fatigue" },
    { title: "Varenicline", type: "Medication", url: "treatments.html#varenicline-tobacco", terms: "chantix tobacco dependence nicotine smoking cessation quit cravings withdrawal" },
    { title: "Combination nicotine replacement therapy", type: "Medication class", url: "treatments.html#combination-nrt-tobacco", terms: "nrt nicotine patch gum lozenge tobacco dependence smoking cessation quit cravings withdrawal" },
    { title: "Bupropion SR for tobacco dependence", type: "Medication", url: "treatments.html#bupropion-tobacco", terms: "zyban wellbutrin tobacco dependence nicotine smoking cessation quit cravings withdrawal" },
    { title: "Evidence rating guide", type: "Evidence Center", url: "evidence.html#ratings", terms: "strong moderate limited insufficient methodology" },
    { title: "Daily health tracker", type: "Tracking", url: "track.html#daily-check-in", terms: "mood sleep habits medication symptoms custom checklist text number yes no" },
    { title: "BMI calculator", type: "Tool", url: "tools.html#bmi-calculator", terms: "body mass index height weight" },
    { title: "Creatinine clearance calculator", type: "Tool", url: "tools.html#crcl-calculator", terms: "cockcroft gault renal kidney pharmacy" },
    { title: "Sleep debt calculator", type: "Tool", url: "tools.html#sleep-debt-calculator", terms: "sleep loss hours target rest fatigue debt" },
    { title: "Caffeine half-life calculator", type: "Tool", url: "tools.html#caffeine-half-life-calculator", terms: "coffee energy drink stimulant milligrams timing clearance wear off" },
    { title: "Medication schedule", type: "Tool", url: "tools.html#medication-schedule", terms: "medicine medication dose timing instructions refill organizer schedule" },
    { title: "Prepare for a healthcare visit", type: "Tool", url: "tools.html#visit-plan", terms: "health summary visit brief question builder doctor appointment clinician pharmacist concerns conditions medicines allergies symptoms treatment test procedure follow up copy print" },
    { title: "Personal Student Pharmacist", type: "Free service", url: "shop.html", terms: "pharmacy pharmacist medication medicine question personal help free student" },
    { title: "Shop", type: "Shop", url: "shop.html", terms: "products kits organizer journal guide wellness" },
    { title: "Meet Otto", type: "About", url: "about.html#otto", terms: "assistant guide ai mascot" },
    { title: "Learning hub", type: "Education", url: "learn.html", terms: "articles videos pharmacy facts education" },
    { title: "Fasting timer", type: "Tool", url: "tools.html#fasting-timer", terms: "fast intermittent fasting elapsed time goal clock" },
    { title: "Pomodoro timer", type: "Tool", url: "tools.html#pomodoro-timer", terms: "focus productivity work break study 25 minute clock" },
  ];

  const searchOverlay = $("#site-search");
  const searchInput = $("#site-search-input");
  const searchResults = $("#site-search-results");

  function renderSearch(query = "") {
    if (!searchResults) return;
    const normalized = query.trim().toLowerCase();
    const results = normalized
      ? searchData.filter((item) => `${item.title} ${item.type} ${item.terms}`.toLowerCase().includes(normalized))
      : searchData.slice(0, 7);

    if (!results.length) {
      searchResults.innerHTML = '<div class="search-empty">No close matches yet. Try a broader term, or ask Otto for a starting point.</div>';
      return;
    }

    searchResults.innerHTML = results
      .map(
        (item) => `
          <a class="search-result" href="${item.url}">
            <span><strong>${item.title}</strong><small>${item.type}</small></span>
            <span>Open →</span>
          </a>`,
      )
      .join("");
  }

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add("open");
    searchOverlay.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    renderSearch("");
    window.setTimeout(() => searchInput?.focus(), 80);
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove("open");
    searchOverlay.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
  }

  $$("[data-search-open]").forEach((button) => button.addEventListener("click", openSearch));
  $$("[data-search-close]").forEach((button) => button.addEventListener("click", closeSearch));
  searchInput?.addEventListener("input", (event) => renderSearch(event.target.value));
  searchOverlay?.addEventListener("click", (event) => {
    if (event.target === searchOverlay) closeSearch();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSearch();
      closeChat();
      closeMenu();
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });

  /* ------------------------------------------------------------------------
     Otto now lives in assets/otto.js — a Gemini-backed guide that knows the
     site and, with permission, the signed-in person's tracked data. It is an
     ES module, so it is imported dynamically from this classic script; that
     way every page picks it up without a single change to its HTML.

     The keyword-matching ottoReply() that used to sit here has been removed.
     ---------------------------------------------------------------------- */
  /* A dynamic import inside a CLASSIC script resolves against the document
     URL, not the script's, so a bare "./otto.js" would look in the site root.
     Resolve against app.js's own URL instead. */
  const ottoUrl = new URL(
    "otto.js",
    document.currentScript?.src || new URL("assets/app.js", document.baseURI),
  ).href;

  import(ottoUrl).catch((error) => {
    console.error("Otto failed to load:", error);
  });

  /* Same trick for the header's sign-in control: built at runtime from
     assets/account.js, so every page gets it without an HTML change. */
  const accountUrl = new URL(
    "account.js",
    document.currentScript?.src || new URL("assets/app.js", document.baseURI),
  ).href;

  import(accountUrl).catch((error) => {
    console.error("Account control failed to load:", error);
  });

  const toast = $("#site-toast");
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  $$("[data-coming-soon]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(button.dataset.comingSoon || "This feature is ready for the next build phase.");
    });
  });

  function setupFilterGroup(group) {
    const chips = $$(`[data-filter-group="${group}"]`);
    const items = $$(`[data-filter-item="${group}"]`);
    const search = $(`[data-local-search="${group}"]`);
    const empty = $(`[data-empty-state="${group}"]`);
    let activeFilter = "all";

    function applyFilters() {
      const query = search?.value.trim().toLowerCase() || "";
      let visible = 0;
      items.forEach((item) => {
        const categories = (item.dataset.categories || "").split(" ");
        const summarySelector = group === "conditions" ? ".condition-summary" : ".treatment-summary";
        const summaryText = item.querySelector(summarySelector)?.textContent || "";
        const indicationText = group === "treatments"
          ? $$(':scope > .treatment-indications > .treatment-indication > summary', item)
              .map((summary) => summary.textContent || "")
              .join(" ")
          : "";
        const searchableText = `${summaryText} ${indicationText} ${item.dataset.categories || ""}`.toLowerCase();
        const matchesCategory = activeFilter === "all" || categories.includes(activeFilter);
        const matchesQuery = !query || searchableText.includes(query);
        const show = matchesCategory && matchesQuery;
        item.hidden = !show;
        if (show) visible += 1;
      });
      empty?.classList.toggle("visible", visible === 0);
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeFilter = chip.dataset.filter || "all";
        chips.forEach((candidate) => candidate.classList.toggle("active", candidate === chip));
        applyFilters();
      });
    });
    search?.addEventListener("input", applyFilters);
    applyFilters();
  }

  const filterGroups = [...new Set($$("[data-filter-group]").map((chip) => chip.dataset.filterGroup))];
  filterGroups.forEach(setupFilterGroup);

  function revealHashTarget() {
    if (!window.location.hash) return;
    const target = $(window.location.hash);
    if (target?.tagName === "DETAILS") target.open = true;
    const containingDetails = target?.closest("details");
    if (containingDetails) containingDetails.open = true;
    const nestedDetails = target?.querySelector("details");
    if (nestedDetails) nestedDetails.open = true;
    window.requestAnimationFrame(() => target?.scrollIntoView({ block: "start" }));
  }

  revealHashTarget();
  window.addEventListener("hashchange", revealHashTarget);

  const trackerItems = $("#tracker-items");
  const moodButtons = $$("[data-mood]");
  const sleepRange = $("#sleep-hours");
  const submitMood = $("#submit-mood");
  const submitSleep = $("#submit-sleep");
  const customTrackerForm = $("#custom-tracker-form");
  const customTrackerName = $("#custom-tracker-name");
  const customTrackerType = $("#custom-tracker-type");
  const customTrackerUnit = $("#custom-tracker-unit");
  const customTrackerUnitField = $("#custom-tracker-unit-field");
  const customTrackerGrid = customTrackerForm ? $(".custom-builder-grid", customTrackerForm) : null;
  const customTrackerFeedback = $("#custom-tracker-feedback");
  const customTrackerStorageKey = "autonohealth-demo-custom-tracker-items";
  const trackerLayoutStorageKey = "autonohealth-demo-tracker-layout";
  const allowedTrackerTypes = new Set(["text", "number", "yesno"]);
  let customTrackerItems = [];
  let trackerLayout = { order: [], hiddenDefaultItems: [] };
  let moodSubmitted = false;
  let sleepSubmitted = false;

  const allTrackerRows = () => (trackerItems ? $$("[data-tracker-item]", trackerItems) : []);
  const trackerRows = () => allTrackerRows().filter((row) => !row.hidden);
  const defaultTrackerIds = allTrackerRows().map((row) => row.dataset.trackerItem);

  function normalizeTrackerUnit(value = "") {
    return String(value).trim().replace(/\s+/g, " ").slice(0, 16);
  }

  function isTrackerInputLogged(input) {
    if (!input) return false;
    if (input.type === "number") {
      return input.value !== "" && input.validity.valid && Number.isFinite(Number(input.value));
    }
    return input.value.trim() !== "";
  }

  function updateTrackerRow(row) {
    const input = $("[data-tracker-input]", row);
    const status = $("[data-habit-status]", row);
    const logged = isTrackerInputLogged(input);
    const label = $(".habit-label strong", row)?.textContent || "Checklist item";
    row.classList.toggle("logged", logged);
    status?.classList.toggle("done", logged);
    status?.setAttribute("aria-label", `${label} data ${logged ? "logged; complete" : "not logged; incomplete"}`);
    return logged;
  }

  function trackerState() {
    const entries = {};
    trackerRows().forEach((row) => {
      entries[row.dataset.trackerItem] = $("[data-tracker-input]", row)?.value || "";
    });
    const mood = moodButtons.find((button) => button.classList.contains("selected"))?.dataset.mood || "";
    const sleep = sleepRange?.value || "";
    return { version: 3, entries, mood, sleep, moodSubmitted, sleepSubmitted };
  }

  function saveTracker() {
    try {
      localStorage.setItem(storagePrefix, JSON.stringify(trackerState()));
    } catch (_error) {
      // The prototype remains usable when browser storage is unavailable.
    }
  }

  function saveCustomTrackerItems() {
    try {
      localStorage.setItem(customTrackerStorageKey, JSON.stringify(customTrackerItems));
    } catch (_error) {
      // Custom items remain usable for the current page session.
    }
  }

  function saveTrackerLayout() {
    trackerLayout.order = allTrackerRows().map((row) => row.dataset.trackerItem);
    try {
      localStorage.setItem(trackerLayoutStorageKey, JSON.stringify(trackerLayout));
    } catch (_error) {
      // Layout changes remain usable for the current page session.
    }
  }

  function loadTrackerLayout() {
    try {
      const saved = JSON.parse(localStorage.getItem(trackerLayoutStorageKey) || "null");
      const order = Array.isArray(saved?.order) ? saved.order.filter((id, index, values) => typeof id === "string" && values.indexOf(id) === index) : [];
      const hiddenDefaultItems = Array.isArray(saved?.hiddenDefaultItems)
        ? saved.hiddenDefaultItems.filter((id, index, values) => defaultTrackerIds.includes(id) && values.indexOf(id) === index)
        : [];
      trackerLayout = { order, hiddenDefaultItems };
    } catch (_error) {
      trackerLayout = { order: [], hiddenDefaultItems: [] };
    }
  }

  function loadCustomTrackerItems() {
    try {
      const saved = JSON.parse(localStorage.getItem(customTrackerStorageKey) || "[]");
      const seen = new Set();
      customTrackerItems = Array.isArray(saved)
        ? saved
            .filter((item) => {
              const valid = item && /^custom-[a-z0-9-]+$/.test(item.id) && typeof item.label === "string" && item.label.trim() && allowedTrackerTypes.has(item.type) && !seen.has(item.id);
              if (valid) seen.add(item.id);
              return valid;
            })
            .slice(0, 20)
            .map((item) => ({
              id: item.id,
              label: item.label.trim().slice(0, 60),
              type: item.type,
              unit: item.type === "number" ? normalizeTrackerUnit(item.unit) : "",
            }))
        : [];
    } catch (_error) {
      customTrackerItems = [];
    }
  }

  function makeCustomTrackerRow(item) {
    const row = document.createElement("div");
    row.className = "habit-row custom-habit-row";
    if (item.type === "number" && item.unit) row.classList.add("has-unit");
    row.dataset.trackerItem = item.id;
    row.dataset.inputType = item.type;

    const labelWrap = document.createElement("div");
    labelWrap.className = "habit-label";
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "+";
    const copy = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = item.label;
    const small = document.createElement("small");
    const responseDescription = item.type === "yesno" ? "yes / no" : item.type;
    small.textContent = `Custom item · ${responseDescription} response${item.unit ? ` · ${item.unit}` : ""}`;
    copy.append(strong, small);
    labelWrap.append(icon, copy);

    const entry = document.createElement("div");
    entry.className = "habit-entry";
    const inputId = `tracker-${item.id}`;
    const inputLabel = document.createElement("label");
    inputLabel.className = "sr-only";
    inputLabel.htmlFor = inputId;
    inputLabel.textContent = `${item.label} response${item.unit ? ` in ${item.unit}` : ""}`;
    let input;
    if (item.type === "yesno") {
      input = document.createElement("select");
      [["", "Choose yes or no"], ["yes", "Yes"], ["no", "No"]].forEach(([value, textValue]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = textValue;
        input.append(option);
      });
    } else {
      input = document.createElement("input");
      input.type = item.type;
      input.placeholder = item.type === "number" ? "Enter a number" : "Enter a response";
      if (item.type === "number") {
        input.step = "any";
        input.inputMode = "decimal";
      } else {
        input.maxLength = 180;
      }
    }
    input.id = inputId;
    input.dataset.trackerInput = "";
    entry.append(inputLabel, input);
    if (item.type === "number" && item.unit) {
      const unit = document.createElement("span");
      unit.className = "habit-unit";
      unit.setAttribute("aria-hidden", "true");
      unit.textContent = item.unit;
      entry.append(unit);
    }

    const actions = document.createElement("div");
    actions.className = "habit-actions";
    const status = document.createElement("span");
    status.className = "habit-check";
    status.dataset.habitStatus = "";
    status.setAttribute("role", "img");
    status.setAttribute("aria-label", `${item.label} data not logged; incomplete`);
    actions.append(status);
    row.append(labelWrap, entry, actions);
    return row;
  }

  function ensureTrackerRowControls(row) {
    const actions = $(".habit-actions", row);
    if (!actions) return;
    const id = row.dataset.trackerItem;
    const label = $(".habit-label strong", row)?.textContent || "checklist item";
    row.classList.toggle("has-unit", Boolean($(".habit-unit", row)?.textContent.trim()));

    if (!$(".tracker-move-controls", actions)) {
      const controls = document.createElement("div");
      controls.className = "tracker-move-controls";
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `Reorder ${label}`);
      [["up", "↑"], ["down", "↓"]].forEach(([direction, symbol]) => {
        const button = document.createElement("button");
        button.className = "tracker-move-button";
        button.type = "button";
        button.dataset.moveTrackerItem = direction;
        button.setAttribute("aria-label", `Move ${label} ${direction}`);
        button.title = `Move ${direction}`;
        button.textContent = symbol;
        controls.append(button);
      });
      actions.insertBefore(controls, $("[data-habit-status]", actions));
    }

    if (!$("[data-remove-tracker-item]", actions)) {
      const remove = document.createElement("button");
      remove.className = "tracker-item-remove";
      remove.type = "button";
      remove.dataset.removeTrackerItem = id;
      remove.setAttribute("aria-label", `Remove ${label}`);
      remove.title = `Remove ${label}`;
      remove.textContent = "×";
      actions.append(remove);
    }
  }

  function updateReorderControls() {
    const rows = trackerRows();
    rows.forEach((row, index) => {
      const up = $('[data-move-tracker-item="up"]', row);
      const down = $('[data-move-tracker-item="down"]', row);
      if (up) up.disabled = index === 0;
      if (down) down.disabled = index === rows.length - 1;
    });
    const restoreButton = $("#restore-default-tracker-items");
    if (restoreButton) restoreButton.hidden = trackerLayout.hiddenDefaultItems.length === 0;
  }

  function applyTrackerLayout() {
    if (!trackerItems) return;
    const rows = allTrackerRows();
    rows.forEach((row) => {
      ensureTrackerRowControls(row);
      row.hidden = defaultTrackerIds.includes(row.dataset.trackerItem) && trackerLayout.hiddenDefaultItems.includes(row.dataset.trackerItem);
    });
    const rowsById = new Map(rows.map((row) => [row.dataset.trackerItem, row]));
    const orderedIds = trackerLayout.order.filter((id) => rowsById.has(id));
    orderedIds.forEach((id) => trackerItems.append(rowsById.get(id)));
    rows.filter((row) => !orderedIds.includes(row.dataset.trackerItem)).forEach((row) => trackerItems.append(row));
    updateReorderControls();
  }

  function restoreTrackerEntries(entries = {}) {
    trackerRows().forEach((row) => {
      const input = $("[data-tracker-input]", row);
      const value = entries[row.dataset.trackerItem];
      if (input && typeof value === "string") input.value = value;
    });
  }

  function renderCustomTrackerItems(preservedEntries = {}) {
    if (!trackerItems) return;
    $$(".custom-habit-row", trackerItems).forEach((row) => row.remove());
    customTrackerItems.forEach((item) => trackerItems.append(makeCustomTrackerRow(item)));
    restoreTrackerEntries(preservedEntries);
    applyTrackerLayout();
  }

  function updateCheckinSubmissionUI() {
    const selectedMood = moodButtons.some((button) => button.classList.contains("selected"));
    const moodStatus = $("#mood-completion");
    const sleepStatus = $("#sleep-completion");
    moodStatus?.classList.toggle("done", moodSubmitted);
    moodStatus?.setAttribute("aria-label", `Mood ${moodSubmitted ? "submitted; complete" : "not submitted; incomplete"}`);
    sleepStatus?.classList.toggle("done", sleepSubmitted);
    sleepStatus?.setAttribute("aria-label", `Sleep ${sleepSubmitted ? "submitted; complete" : "not submitted; incomplete"}`);
    if (submitMood) {
      submitMood.disabled = !selectedMood || moodSubmitted;
      submitMood.textContent = moodSubmitted ? "Mood submitted" : "Submit mood";
    }
    if (submitSleep) {
      submitSleep.disabled = sleepSubmitted;
      submitSleep.textContent = sleepSubmitted ? "Sleep submitted" : "Submit sleep";
    }
  }

  function updateTracker() {
    updateCheckinSubmissionUI();
    const rows = trackerRows();
    const checklistDone = rows.filter(updateTrackerRow).length;
    const done = checklistDone + Number(moodSubmitted) + Number(sleepSubmitted);
    const total = rows.length + 2;
    const percentage = Math.round((done / total) * 100);
    const ring = $("#tracker-progress");
    if (ring) ring.style.setProperty("--progress", `${percentage}%`);
    setText("#tracker-percentage", `${percentage}%`);

    const mood = moodButtons.find((button) => button.classList.contains("selected"))?.dataset.mood;
    const sleep = Number(sleepRange?.value || 0);
    let heading = "A steady start counts.";
    let insight = "Check in with what feels realistic today. Progress is information—not a grade.";

    if (done === total) {
      heading = "You logged every planned check-in.";
      insight = "Your check-in is complete for today. The green checks confirm that data was entered—not whether an answer was “good” or “bad.”";
    } else if (done >= Math.ceil(total / 2)) {
      heading = "You’re building a useful record.";
      insight = `${done} of ${total} planned check-ins have data logged. You can stop whenever the check-in feels useful.`;
    } else if (sleepSubmitted && sleep && sleep < 6) {
      heading = "A lower-energy day is understandable.";
      insight = "You logged a shorter night of sleep. Consider a lighter goal today and focus on a consistent wind-down tonight.";
    } else if (moodSubmitted && mood === "low") {
      heading = "Thank you for checking in honestly.";
      insight = "A low mood deserves care, not judgment. A small supportive action—or reaching out to someone you trust—may be a helpful next step.";
    }

    setText("#otto-insight-heading", heading);
    setText("#otto-insight-copy", insight);
  }

  function loadTracker() {
    if (!trackerItems) return;
    loadTrackerLayout();
    loadCustomTrackerItems();
    renderCustomTrackerItems();
    try {
      const saved = JSON.parse(localStorage.getItem(storagePrefix) || "null");
      if (saved?.entries && typeof saved.entries === "object") restoreTrackerEntries(saved.entries);
      if (saved?.mood) {
        moodButtons.forEach((button) => button.classList.toggle("selected", button.dataset.mood === saved.mood));
      }
      if (saved?.sleep && sleepRange) sleepRange.value = saved.sleep;
      moodSubmitted = saved?.moodSubmitted === true && Boolean(saved?.mood);
      sleepSubmitted = saved?.sleepSubmitted === true && Boolean(saved?.sleep);
    } catch (_error) {
      // Ignore malformed or unavailable local prototype data.
    }
    if (sleepRange) setText("#sleep-output", `${sleepRange.value} hr`);
    saveTrackerLayout();
    updateTracker();
  }

  function handleTrackerEntry(event) {
    if (!event.target.matches("[data-tracker-input]")) return;
    updateTracker();
    saveTracker();
  }

  trackerItems?.addEventListener("input", handleTrackerEntry);
  trackerItems?.addEventListener("change", handleTrackerEntry);

  trackerItems?.addEventListener("click", (event) => {
    const moveButton = event.target.closest("[data-move-tracker-item]");
    if (moveButton) {
      const row = moveButton.closest("[data-tracker-item]");
      const rows = trackerRows();
      const index = rows.indexOf(row);
      const destinationIndex = moveButton.dataset.moveTrackerItem === "up" ? index - 1 : index + 1;
      const destination = rows[destinationIndex];
      if (!row || !destination) return;
      if (destinationIndex < index) destination.before(row);
      else destination.after(row);
      saveTrackerLayout();
      updateReorderControls();
      return;
    }

    const removeButton = event.target.closest("[data-remove-tracker-item]");
    if (!removeButton) return;
    const row = removeButton.closest("[data-tracker-item]");
    const label = $(".habit-label strong", row)?.textContent || "Custom item";
    const id = removeButton.dataset.removeTrackerItem;
    const input = $("[data-tracker-input]", row);
    if (input) input.value = "";
    if (defaultTrackerIds.includes(id)) {
      if (!trackerLayout.hiddenDefaultItems.includes(id)) trackerLayout.hiddenDefaultItems.push(id);
      row.hidden = true;
    } else {
      customTrackerItems = customTrackerItems.filter((item) => item.id !== id);
      row?.remove();
    }
    saveCustomTrackerItems();
    saveTrackerLayout();
    saveTracker();
    updateTracker();
    updateReorderControls();
    if (customTrackerFeedback) customTrackerFeedback.textContent = `${label} was removed from your checklist.`;
  });

  function updateCustomUnitField() {
    const showUnit = customTrackerType?.value === "number";
    if (customTrackerUnitField) customTrackerUnitField.hidden = !showUnit;
    customTrackerGrid?.classList.toggle("unit-enabled", showUnit);
    if (!showUnit && customTrackerUnit) customTrackerUnit.value = "";
  }

  customTrackerType?.addEventListener("change", updateCustomUnitField);
  updateCustomUnitField();

  customTrackerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const label = customTrackerName?.value.trim().replace(/\s+/g, " ") || "";
    const type = customTrackerType?.value || "";
    const unit = type === "number" ? normalizeTrackerUnit(customTrackerUnit?.value) : "";
    if (!label || !allowedTrackerTypes.has(type)) return;
    if (customTrackerItems.length >= 20) {
      if (customTrackerFeedback) customTrackerFeedback.textContent = "This prototype supports up to 20 custom items.";
      return;
    }
    if (customTrackerItems.some((item) => item.label.toLowerCase() === label.toLowerCase())) {
      if (customTrackerFeedback) customTrackerFeedback.textContent = "An item with that name already exists.";
      customTrackerName?.focus();
      return;
    }
    const preservedEntries = trackerState().entries;
    let id = `custom-${Date.now().toString(36)}`;
    while (customTrackerItems.some((item) => item.id === id)) id += "-1";
    customTrackerItems.push({ id, label: label.slice(0, 60), type, unit });
    saveCustomTrackerItems();
    renderCustomTrackerItems(preservedEntries);
    saveTrackerLayout();
    saveTracker();
    updateTracker();
    customTrackerForm.reset();
    updateCustomUnitField();
    if (customTrackerFeedback) customTrackerFeedback.textContent = `${label} was added as a ${type === "yesno" ? "yes / no" : type} entry${unit ? ` measured in ${unit}` : ""}.`;
    $(`#tracker-${id}`)?.focus();
  });

  $("#restore-default-tracker-items")?.addEventListener("click", () => {
    trackerLayout.hiddenDefaultItems = [];
    applyTrackerLayout();
    saveTrackerLayout();
    saveTracker();
    updateTracker();
    if (customTrackerFeedback) customTrackerFeedback.textContent = "The default checklist items were restored.";
  });

  moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      moodButtons.forEach((candidate) => candidate.classList.toggle("selected", candidate === button));
      moodSubmitted = false;
      updateTracker();
      saveTracker();
    });
  });

  sleepRange?.addEventListener("input", () => {
    setText("#sleep-output", `${sleepRange.value} hr`);
    sleepSubmitted = false;
    updateTracker();
    saveTracker();
  });

  submitMood?.addEventListener("click", () => {
    if (!moodButtons.some((button) => button.classList.contains("selected"))) return;
    moodSubmitted = true;
    updateTracker();
    saveTracker();
  });

  submitSleep?.addEventListener("click", () => {
    sleepSubmitted = true;
    updateTracker();
    saveTracker();
  });

  $("#clear-tracker")?.addEventListener("click", () => {
    try {
      localStorage.removeItem(storagePrefix);
    } catch (_error) {
      // No action needed.
    }
    trackerRows().forEach((row) => {
      const input = $("[data-tracker-input]", row);
      if (input) input.value = "";
    });
    moodButtons.forEach((button) => button.classList.remove("selected"));
    moodSubmitted = false;
    sleepSubmitted = false;
    if (sleepRange) sleepRange.value = "7.5";
    setText("#sleep-output", "7.5 hr");
    updateTracker();
    showToast("Today’s local entries were cleared. Your custom checklist items were kept.");
  });

  loadTracker();

  $("#bmi-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const feet = Number($("#bmi-feet")?.value);
    const inches = Number($("#bmi-inches")?.value);
    const pounds = Number($("#bmi-pounds")?.value);
    const totalInches = feet * 12 + inches;
    const result = $("#bmi-result");
    if (!result) return;
    if (!totalInches || !pounds || totalInches <= 0 || pounds <= 0) {
      result.textContent = "Enter a valid height and weight to calculate an estimate.";
      return;
    }
    const bmi = (703 * pounds) / totalInches ** 2;
    const range = bmi < 18.5 ? "below the typical screening range" : bmi < 25 ? "within the typical screening range" : bmi < 30 ? "within the overweight screening range" : "within the obesity screening range";
    result.innerHTML = `<strong>Estimated BMI: ${bmi.toFixed(1)}</strong><br>This falls ${range}. BMI is one screening measure and does not describe health on its own.`;
  });

  $("#crcl-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const age = Number($("#crcl-age")?.value);
    const weight = Number($("#crcl-weight")?.value);
    const creatinine = Number($("#crcl-scr")?.value);
    const coefficient = Number($("#crcl-coefficient")?.value || 1);
    const result = $("#crcl-result");
    if (!result) return;
    if (!age || !weight || !creatinine || age < 18 || age > 120 || weight <= 0 || creatinine <= 0) {
      result.textContent = "Enter valid values for age, weight, and serum creatinine.";
      return;
    }
    const estimate = (((140 - age) * weight) / (72 * creatinine)) * coefficient;
    result.innerHTML = `<strong>Estimated Cockcroft–Gault CrCl: ${estimate.toFixed(1)} mL/min</strong><br>Clinical interpretation depends on weight selection, kidney stability, laboratory context, and the medication being evaluated.`;
  });

  function formatHourAmount(value) {
    const rounded = Math.round(value * 100) / 100;
    return `${rounded} ${rounded === 1 ? "hour" : "hours"}`;
  }

  $("#sleep-debt-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const target = Number($("#sleep-target")?.value);
    const actual = Number($("#sleep-actual")?.value);
    const nights = Number($("#sleep-nights")?.value);
    const result = $("#sleep-debt-result");
    if (!result) return;
    if (!target || actual < 0 || !Number.isInteger(nights) || target < 3 || target > 12 || actual > 12 || nights < 1 || nights > 30) {
      result.textContent = "Enter valid sleep hours and a whole number of nights from 1 to 30.";
      return;
    }
    const nightlyDifference = target - actual;
    const totalDifference = nightlyDifference * nights;
    if (totalDifference > 0) {
      result.innerHTML = `<strong>Estimated sleep debt: ${formatHourAmount(totalDifference)}</strong><br>That is an average shortfall of ${formatHourAmount(nightlyDifference)} per night across ${nights} ${nights === 1 ? "night" : "nights"}. This arithmetic estimate does not mean recovery must occur hour for hour.`;
    } else if (totalDifference < 0) {
      result.innerHTML = `<strong>No estimated sleep debt for this period.</strong><br>Your entered average is ${formatHourAmount(Math.abs(nightlyDifference))} above your target per night, or ${formatHourAmount(Math.abs(totalDifference))} across the selected period.`;
    } else {
      result.innerHTML = `<strong>No estimated sleep debt for this period.</strong><br>Your entered average matches your nightly target across ${nights} ${nights === 1 ? "night" : "nights"}.`;
    }
  });

  const caffeineTime = $("#caffeine-time");
  if (caffeineTime && !caffeineTime.value) {
    const localNow = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    caffeineTime.value = localNow.toISOString().slice(0, 16);
  }

  function addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  function formatDateTime(date) {
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  $("#caffeine-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number($("#caffeine-amount")?.value);
    const consumedAt = new Date(caffeineTime?.value || "");
    const result = $("#caffeine-result");
    if (!result) return;
    if (!amount || amount < 1 || amount > 2000 || Number.isNaN(consumedAt.getTime())) {
      result.textContent = "Enter a valid caffeine amount from 1 to 2,000 mg and a consumption date and time.";
      return;
    }
    const halfLifeHours = 5;
    const tenPercentHours = halfLifeHours * Math.log2(10);
    const fivePercentHours = halfLifeHours * Math.log2(20);
    const halfAmount = Math.round(amount / 2 * 10) / 10;
    const quarterAmount = Math.round(amount / 4 * 10) / 10;
    const tenPercentAmount = Math.round(amount * 0.1 * 10) / 10;
    const fivePercentAmount = Math.round(amount * 0.05 * 10) / 10;
    result.innerHTML = `<strong>Low-residual estimate: about ${tenPercentAmount} mg (10%) around ${formatDateTime(addHours(consumedAt, tenPercentHours))}.</strong><br>Using a five-hour half-life, about ${halfAmount} mg may remain around ${formatDateTime(addHours(consumedAt, halfLifeHours))}, ${quarterAmount} mg around ${formatDateTime(addHours(consumedAt, halfLifeHours * 2))}, and ${fivePercentAmount} mg (5%) around ${formatDateTime(addHours(consumedAt, fivePercentHours))}. This is a clearance estimate—not a precise “wear-off” time.`;
  });

  const fastingStorageKey = "autonohealth-fasting-timer-v1";
  const fastingTarget = $("#fasting-target");
  const fastingDisplay = $("#fasting-timer-display");
  const fastingProgress = $("#fasting-progress");
  const fastingProgressBar = $("#fasting-progress-bar");
  const fastingProgressLabel = $("#fasting-progress-label");
  const fastingRemainingLabel = $("#fasting-remaining-label");
  const fastingStatus = $("#fasting-status");
  const fastingStart = $("#fasting-start");
  const fastingEnd = $("#fasting-end");
  const fastingReset = $("#fasting-reset");
  let fastingInterval;
  let fastingState = { targetHours: 16, elapsedMs: 0, startedAt: null };

  function loadFastingTimer() {
    try {
      const saved = JSON.parse(localStorage.getItem(fastingStorageKey) || "null");
      const targetHours = Number(saved?.targetHours);
      const elapsedMs = Number(saved?.elapsedMs);
      const startedAt = Number(saved?.startedAt);
      if ([12, 14, 16, 18, 20, 24].includes(targetHours)) fastingState.targetHours = targetHours;
      if (Number.isFinite(elapsedMs) && elapsedMs >= 0) fastingState.elapsedMs = elapsedMs;
      if (Number.isFinite(startedAt) && startedAt > 0 && startedAt <= Date.now()) fastingState.startedAt = startedAt;
    } catch (_error) {
      // Keep the default timer state when local storage is unavailable or invalid.
    }
  }

  function saveFastingTimer() {
    try {
      localStorage.setItem(fastingStorageKey, JSON.stringify(fastingState));
    } catch (_error) {
      // The timer still works for the current page session.
    }
  }

  function currentFastingElapsed() {
    return fastingState.elapsedMs + (fastingState.startedAt ? Math.max(0, Date.now() - fastingState.startedAt) : 0);
  }

  function formatTimerDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  }

  function formatRemainingTime(milliseconds) {
    if (milliseconds <= 0) return "Goal reached";
    const totalMinutes = Math.ceil(milliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (!hours) return `${minutes} min remaining`;
    return `${hours} hr${minutes ? ` ${minutes} min` : ""} remaining`;
  }

  function renderFastingTimer() {
    if (!fastingDisplay) return;
    const elapsed = currentFastingElapsed();
    const goalMs = fastingState.targetHours * 60 * 60 * 1000;
    const progress = Math.min(100, elapsed / goalMs * 100);
    const running = Boolean(fastingState.startedAt);
    const hasElapsed = elapsed > 0;
    fastingDisplay.textContent = formatTimerDuration(elapsed);
    fastingProgressBar.style.width = `${progress}%`;
    fastingProgress.setAttribute("aria-valuenow", String(Math.round(progress)));
    fastingProgressLabel.textContent = `${Math.floor(progress)}% of ${fastingState.targetHours}-hour goal`;
    fastingRemainingLabel.textContent = formatRemainingTime(goalMs - elapsed);
    fastingTarget.value = String(fastingState.targetHours);
    fastingStart.textContent = hasElapsed ? "Resume fast" : "Start fast";
    fastingStart.disabled = running;
    fastingEnd.disabled = !running;
    fastingReset.disabled = !running && !hasElapsed;
  }

  function startFastingTimer() {
    if (fastingState.startedAt) return;
    fastingState.startedAt = Date.now();
    saveFastingTimer();
    fastingStatus.textContent = "Your fast is in progress. The timer will continue on this device if you close or reload the page.";
    renderFastingTimer();
    window.clearInterval(fastingInterval);
    fastingInterval = window.setInterval(renderFastingTimer, 1000);
  }

  fastingStart?.addEventListener("click", startFastingTimer);
  fastingEnd?.addEventListener("click", () => {
    if (!fastingState.startedAt) return;
    fastingState.elapsedMs = currentFastingElapsed();
    fastingState.startedAt = null;
    saveFastingTimer();
    window.clearInterval(fastingInterval);
    fastingStatus.textContent = `Fast ended at ${formatTimerDuration(fastingState.elapsedMs)}. You can resume or reset the timer.`;
    renderFastingTimer();
  });
  fastingReset?.addEventListener("click", () => {
    fastingState.elapsedMs = 0;
    fastingState.startedAt = null;
    saveFastingTimer();
    window.clearInterval(fastingInterval);
    fastingStatus.textContent = "Timer reset. Start when your next fast begins.";
    renderFastingTimer();
  });
  fastingTarget?.addEventListener("change", () => {
    fastingState.targetHours = Number(fastingTarget.value) || 16;
    saveFastingTimer();
    renderFastingTimer();
  });

  if (fastingDisplay) {
    loadFastingTimer();
    renderFastingTimer();
    if (fastingState.startedAt) {
      fastingStatus.textContent = "Your fast is in progress. The timer continued while this page was closed.";
      fastingInterval = window.setInterval(renderFastingTimer, 1000);
    }
  }

  $("#fasting-duration-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const startedAt = new Date($("#fasting-calculator-start")?.value || "");
    const endedAt = new Date($("#fasting-calculator-end")?.value || "");
    const result = $("#fasting-duration-result");
    if (!result) return;
    if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime())) {
      result.textContent = "Enter a valid start and end date and time.";
      return;
    }
    if (endedAt <= startedAt) {
      result.textContent = "The end of the fast must be later than the start.";
      return;
    }
    const totalMinutes = Math.round((endedAt - startedAt) / 60000);
    const wholeHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const decimalHours = (totalMinutes / 60).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
    const hourLabel = `${wholeHours} ${wholeHours === 1 ? "hour" : "hours"}`;
    const minuteLabel = remainingMinutes ? ` ${remainingMinutes} ${remainingMinutes === 1 ? "minute" : "minutes"}` : "";
    result.innerHTML = `<strong>Fast duration: ${decimalHours} hours</strong><br>${hourLabel}${minuteLabel} from start to end.`;
  });

  const pomodoroStorageKey = "autonohealth-pomodoro-timer-v1";
  const pomodoroDurations = { focus: 25 * 60 * 1000, shortBreak: 5 * 60 * 1000, longBreak: 15 * 60 * 1000 };
  const pomodoroLabels = { focus: "Focus", shortBreak: "Short break", longBreak: "Long break" };
  const pomodoroDisplay = $("#pomodoro-timer-display");
  const pomodoroProgress = $("#pomodoro-progress");
  const pomodoroProgressBar = $("#pomodoro-progress-bar");
  const pomodoroModeLabel = $("#pomodoro-mode-label");
  const pomodoroSessionCount = $("#pomodoro-session-count");
  const pomodoroStatus = $("#pomodoro-status");
  const pomodoroStart = $("#pomodoro-start");
  const pomodoroPause = $("#pomodoro-pause");
  const pomodoroReset = $("#pomodoro-reset");
  const pomodoroModeButtons = $$("[data-pomodoro-mode]");
  const defaultPageTitle = document.title;
  let pomodoroInterval;
  let pomodoroState = { mode: "focus", remainingMs: pomodoroDurations.focus, endsAt: null, completedFocus: 0 };

  function savePomodoroTimer() {
    try {
      localStorage.setItem(pomodoroStorageKey, JSON.stringify(pomodoroState));
    } catch (_error) {
      // The timer still works for the current page session.
    }
  }

  function loadPomodoroTimer() {
    try {
      const saved = JSON.parse(localStorage.getItem(pomodoroStorageKey) || "null");
      if (!saved || !pomodoroDurations[saved.mode]) return;
      const remainingMs = Number(saved.remainingMs);
      const endsAt = Number(saved.endsAt);
      const completedFocus = Number(saved.completedFocus);
      pomodoroState.mode = saved.mode;
      if (Number.isFinite(remainingMs) && remainingMs >= 0 && remainingMs <= pomodoroDurations[saved.mode]) pomodoroState.remainingMs = remainingMs;
      if (Number.isFinite(endsAt) && endsAt > 0) pomodoroState.endsAt = endsAt;
      if (Number.isInteger(completedFocus) && completedFocus >= 0) pomodoroState.completedFocus = Math.min(4, completedFocus);
    } catch (_error) {
      // Keep the default timer state when local storage is unavailable or invalid.
    }
  }

  function currentPomodoroRemaining() {
    return pomodoroState.endsAt ? Math.max(0, pomodoroState.endsAt - Date.now()) : pomodoroState.remainingMs;
  }

  function formatPomodoroTime(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function completePomodoroInterval() {
    const finishedMode = pomodoroState.mode;
    if (finishedMode === "focus") pomodoroState.completedFocus = Math.min(4, pomodoroState.completedFocus + 1);
    const nextMode = finishedMode === "focus"
      ? (pomodoroState.completedFocus === 4 ? "longBreak" : "shortBreak")
      : "focus";
    if (finishedMode === "longBreak") pomodoroState.completedFocus = 0;
    pomodoroState.mode = nextMode;
    pomodoroState.remainingMs = pomodoroDurations[nextMode];
    pomodoroState.endsAt = null;
    window.clearInterval(pomodoroInterval);
    savePomodoroTimer();
    pomodoroStatus.textContent = finishedMode === "focus"
      ? `Focus session complete. Your ${nextMode === "longBreak" ? "long" : "short"} break is ready.`
      : "Break complete. Your next focus session is ready.";
    showToast(`${pomodoroLabels[finishedMode]} complete.`);
  }

  function renderPomodoroTimer() {
    if (!pomodoroDisplay) return;
    let remaining = currentPomodoroRemaining();
    if (pomodoroState.endsAt && remaining <= 0) {
      completePomodoroInterval();
      remaining = pomodoroState.remainingMs;
    }
    const duration = pomodoroDurations[pomodoroState.mode];
    const progress = Math.min(100, Math.max(0, (duration - remaining) / duration * 100));
    const running = Boolean(pomodoroState.endsAt);
    const displayTime = formatPomodoroTime(remaining);
    pomodoroDisplay.textContent = displayTime;
    pomodoroDisplay.setAttribute("aria-label", `${displayTime} remaining in ${pomodoroLabels[pomodoroState.mode].toLowerCase()}`);
    pomodoroProgressBar.style.width = `${progress}%`;
    pomodoroProgress.setAttribute("aria-valuenow", String(Math.round(progress)));
    pomodoroModeLabel.textContent = `${pomodoroLabels[pomodoroState.mode]} interval`;
    pomodoroSessionCount.textContent = `${pomodoroState.completedFocus} of 4 focus sessions`;
    pomodoroStart.textContent = remaining < duration ? `Resume ${pomodoroLabels[pomodoroState.mode].toLowerCase()}` : `Start ${pomodoroLabels[pomodoroState.mode].toLowerCase()}`;
    pomodoroStart.disabled = running;
    pomodoroPause.disabled = !running;
    pomodoroModeButtons.forEach((button) => {
      const active = button.dataset.pomodoroMode === pomodoroState.mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.title = running ? `${displayTime} · ${pomodoroLabels[pomodoroState.mode]} | AutonoHealth` : defaultPageTitle;
  }

  function setPomodoroMode(mode) {
    if (!pomodoroDurations[mode]) return;
    pomodoroState.mode = mode;
    pomodoroState.remainingMs = pomodoroDurations[mode];
    pomodoroState.endsAt = null;
    window.clearInterval(pomodoroInterval);
    savePomodoroTimer();
    pomodoroStatus.textContent = `${pomodoroLabels[mode]} interval selected and ready to start.`;
    renderPomodoroTimer();
  }

  pomodoroModeButtons.forEach((button) => button.addEventListener("click", () => setPomodoroMode(button.dataset.pomodoroMode)));
  pomodoroStart?.addEventListener("click", () => {
    if (pomodoroState.endsAt) return;
    pomodoroState.endsAt = Date.now() + pomodoroState.remainingMs;
    savePomodoroTimer();
    pomodoroStatus.textContent = `${pomodoroLabels[pomodoroState.mode]} interval in progress. The timer will continue if you close or reload the page.`;
    renderPomodoroTimer();
    window.clearInterval(pomodoroInterval);
    pomodoroInterval = window.setInterval(renderPomodoroTimer, 250);
  });
  pomodoroPause?.addEventListener("click", () => {
    if (!pomodoroState.endsAt) return;
    pomodoroState.remainingMs = currentPomodoroRemaining();
    pomodoroState.endsAt = null;
    window.clearInterval(pomodoroInterval);
    savePomodoroTimer();
    pomodoroStatus.textContent = `${pomodoroLabels[pomodoroState.mode]} interval paused.`;
    renderPomodoroTimer();
  });
  pomodoroReset?.addEventListener("click", () => {
    pomodoroState.remainingMs = pomodoroDurations[pomodoroState.mode];
    pomodoroState.endsAt = null;
    window.clearInterval(pomodoroInterval);
    savePomodoroTimer();
    pomodoroStatus.textContent = `${pomodoroLabels[pomodoroState.mode]} interval reset.`;
    renderPomodoroTimer();
  });

  if (pomodoroDisplay) {
    loadPomodoroTimer();
    if (pomodoroState.endsAt && currentPomodoroRemaining() <= 0) completePomodoroInterval();
    renderPomodoroTimer();
    if (pomodoroState.endsAt) {
      pomodoroStatus.textContent = `${pomodoroLabels[pomodoroState.mode]} interval in progress. The timer continued while this page was closed.`;
      pomodoroInterval = window.setInterval(renderPomodoroTimer, 250);
    }
  }

  const medicationScheduleStorageKey = "autonohealth-medication-schedule-v1";
  const medicationScheduleForm = $("#medication-schedule-form");
  const medicationScheduleList = $("#medication-schedule-list");
  let medicationSchedule = [];

  function normalizeScheduleEntry(entry) {
    if (!entry || typeof entry !== "object" || typeof entry.name !== "string" || !entry.name.trim()) return null;
    return {
      id: typeof entry.id === "string" && entry.id ? entry.id : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: entry.name.trim().slice(0, 80),
      dose: typeof entry.dose === "string" ? entry.dose.trim().slice(0, 80) : "",
      time: typeof entry.time === "string" && /^\d{2}:\d{2}$/.test(entry.time) ? entry.time : "",
      frequency: typeof entry.frequency === "string" ? entry.frequency.trim().slice(0, 80) : "",
      instructions: typeof entry.instructions === "string" ? entry.instructions.trim().slice(0, 140) : "",
      refill: typeof entry.refill === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry.refill) ? entry.refill : "",
      notes: typeof entry.notes === "string" ? entry.notes.trim().slice(0, 300) : "",
    };
  }

  function loadMedicationSchedule() {
    try {
      const saved = JSON.parse(localStorage.getItem(medicationScheduleStorageKey) || "[]");
      medicationSchedule = Array.isArray(saved) ? saved.map(normalizeScheduleEntry).filter(Boolean).slice(0, 50) : [];
    } catch (_error) {
      medicationSchedule = [];
    }
  }

  function saveMedicationSchedule() {
    try {
      localStorage.setItem(medicationScheduleStorageKey, JSON.stringify(medicationSchedule));
    } catch (_error) {
      showToast("The schedule could not be saved in this browser.");
    }
  }

  function formatScheduleTime(value) {
    if (!value) return "No fixed time";
    const [hours, minutes] = value.split(":").map(Number);
    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  function formatScheduleDate(value) {
    if (!value) return "";
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function sortedMedicationSchedule() {
    return [...medicationSchedule].sort((a, b) => {
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      return (a.time || "").localeCompare(b.time || "") || a.name.localeCompare(b.name);
    });
  }

  function renderMedicationSchedule() {
    if (!medicationScheduleList) return;
    medicationScheduleList.replaceChildren();
    if (!medicationSchedule.length) {
      medicationScheduleList.append(createTextElement("p", "schedule-empty", "No medications added yet."));
      return;
    }

    sortedMedicationSchedule().forEach((entry) => {
      const item = document.createElement("article");
      item.className = "medication-schedule-item";

      const time = createTextElement("div", "medication-schedule-time", formatScheduleTime(entry.time));
      const content = document.createElement("div");
      content.className = "medication-schedule-content";
      content.append(createTextElement("h3", "", entry.name));
      const doseAndFrequency = [entry.dose, entry.frequency].filter(Boolean).join(" · ");
      if (doseAndFrequency) content.append(createTextElement("p", "medication-schedule-primary", doseAndFrequency));
      if (entry.instructions) content.append(createTextElement("p", "", `Instructions: ${entry.instructions}`));
      if (entry.refill) content.append(createTextElement("p", "", `Next refill: ${formatScheduleDate(entry.refill)}`));
      if (entry.notes) content.append(createTextElement("p", "medication-schedule-note", `Note: ${entry.notes}`));

      const remove = createTextElement("button", "button button-ghost button-small", "Remove");
      remove.type = "button";
      remove.dataset.scheduleRemove = entry.id;
      remove.setAttribute("aria-label", `Remove ${entry.name} from schedule`);
      item.append(time, content, remove);
      medicationScheduleList.append(item);
    });
  }

  medicationScheduleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (medicationSchedule.length >= 50) {
      showToast("This schedule supports up to 50 entries.");
      return;
    }
    const entry = normalizeScheduleEntry({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: $("#schedule-name")?.value || "",
      dose: $("#schedule-dose")?.value || "",
      time: $("#schedule-time")?.value || "",
      frequency: $("#schedule-frequency")?.value || "",
      instructions: $("#schedule-instructions")?.value || "",
      refill: $("#schedule-refill")?.value || "",
      notes: $("#schedule-notes")?.value || "",
    });
    if (!entry) return;
    medicationSchedule.push(entry);
    saveMedicationSchedule();
    renderMedicationSchedule();
    medicationScheduleForm.reset();
    showToast(`${entry.name} was added to your local schedule.`);
    $("#schedule-name")?.focus();
  });

  medicationScheduleList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-schedule-remove]");
    if (!button) return;
    medicationSchedule = medicationSchedule.filter((entry) => entry.id !== button.dataset.scheduleRemove);
    saveMedicationSchedule();
    renderMedicationSchedule();
  });

  $("#clear-medication-schedule")?.addEventListener("click", () => {
    if (!medicationSchedule.length || !window.confirm("Clear every medication from this browser’s schedule?")) return;
    medicationSchedule = [];
    saveMedicationSchedule();
    renderMedicationSchedule();
    showToast("The local medication schedule was cleared.");
  });

  function medicationScheduleSummaryText() {
    return sortedMedicationSchedule().map((entry) => {
      const details = [entry.dose, entry.frequency, formatScheduleTime(entry.time)].filter(Boolean).join(" · ");
      const extras = [
        entry.instructions ? `Instructions: ${entry.instructions}` : "",
        entry.refill ? `Refill: ${formatScheduleDate(entry.refill)}` : "",
        entry.notes ? `Note: ${entry.notes}` : "",
      ].filter(Boolean);
      return `• ${entry.name}${details ? ` — ${details}` : ""}${extras.length ? ` — ${extras.join("; ")}` : ""}`;
    }).join("\n");
  }

  loadMedicationSchedule();
  renderMedicationSchedule();

  const visitTypeLabels = {
    symptom: "New or changing symptom",
    condition: "Condition follow-up",
    treatment: "Medicine or treatment decision",
    test: "Test or result",
    procedure: "Procedure or surgery",
    preventive: "Checkup or prevention",
  };

  const visitTypeQuestions = {
    symptom: [
      "What are the most likely explanations for this symptom, and what other possibilities should we consider?",
      "What details about timing, triggers, severity, or associated symptoms would help clarify what is happening?",
      "Would an examination, test, or a period of monitoring be useful, and what would each option tell us?",
    ],
    condition: [
      "How well controlled or stable does this condition appear to be right now?",
      "What changes would suggest the condition is improving, worsening, or affecting another part of my health?",
      "Which measurements, tests, or symptoms should we monitor, and how often?",
    ],
    treatment: [
      "What benefit should I realistically expect from this treatment, and how long might it take to notice?",
      "What are the common side effects, serious risks, and important interactions to understand?",
      "What reasonable alternatives—including monitoring or no change—should we compare before deciding?",
    ],
    test: [
      "What question is this test or result meant to answer?",
      "How reliable is the test in my situation, and what can cause an unclear, false-positive, or false-negative result?",
      "How would a normal, abnormal, or uncertain result change the next step?",
    ],
    procedure: [
      "What are the expected benefits, important risks, and reasonable alternatives to this procedure?",
      "What preparation and recovery should I expect, and which restrictions may affect daily life?",
      "How often does the care team perform this procedure, and how are complications handled?",
    ],
    preventive: [
      "Which screenings, vaccines, or preventive steps are most relevant for me now, and why?",
      "Are there preventive services I can reasonably defer or skip based on my history and preferences?",
      "Which one or two health habits would offer the most meaningful benefit for me to focus on?",
    ],
  };

  const visitPriorityQuestions = {
    balanced: [],
    understanding: [
      "Could you explain what you think may be happening in plain language and how certain you are?",
      "What information would make you more or less confident in that explanation?",
    ],
    options: [
      "What options do we have, and how do their likely benefits, burdens, costs, and uncertainties compare?",
      "How do my goals and preferences change which option may fit best?",
    ],
    safety: [
      "Which warning signs should prompt urgent care, an emergency visit, or a call to the care team?",
      "What side effects, interactions, or complications should I watch for, and what should I do if they occur?",
    ],
    "follow-up": [
      "How will we decide whether the plan is working, and when should we reassess it?",
      "How and when will I receive results, and whom should I contact if I do not hear back?",
    ],
  };

  let latestVisitQuestions = [];

  function compactVisitValue(id, maximumLength = 260) {
    return ($("#" + id)?.value || "").trim().replace(/\s+/g, " ").slice(0, maximumLength);
  }

  function uniqueQuestions(questions) {
    const seen = new Set();
    return questions.filter((question) => {
      const key = question.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const visitPlanDate = $("#visit-plan-date");
  if (visitPlanDate && !visitPlanDate.value) visitPlanDate.value = dateKey;

  $("#visit-plan-use-schedule")?.addEventListener("click", () => {
    const scheduleText = medicationScheduleSummaryText();
    if (!scheduleText) {
      showToast("Add at least one medication to the schedule first.");
      return;
    }
    const medicationField = $("#visit-plan-medications");
    if (medicationField) medicationField.value = scheduleText;
    const optionalBackground = medicationField?.closest(".tool-subdisclosure");
    if (optionalBackground?.tagName === "DETAILS") optionalBackground.open = true;
    showToast("The medication schedule was added to your visit plan.");
  });

  async function visitTrackerSummaryText() {
    const tracker = await import("./firebase.js");
    if (typeof tracker.auth.authStateReady === "function") await tracker.auth.authStateReady();

    const activeStore = tracker.auth.currentUser ? tracker.cloudStore(tracker.auth.currentUser.uid) : tracker.localStore;
    const cutoff = tracker.shiftKey(tracker.TODAY, -13);
    const [template, entryMap] = await Promise.all([activeStore.loadTemplate(), activeStore.loadAll(cutoff)]);
    const entries = [...entryMap.values()].filter(tracker.entryHasData).sort((a, b) => a.date.localeCompare(b.date));
    if (!entries.length) return "";

    const allItems = new Map([...tracker.BUILT_IN, ...template.custom].map((item) => [item.id, item]));
    const hidden = new Set(template.hidden);
    const activeItems = template.order.map((id) => allItems.get(id)).filter((item) => item && !hidden.has(item.id));
    const average = (values) => (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
    const lines = [`Tracker summary (${cutoff} to ${tracker.TODAY}; ${entries.length} of 14 days logged)`];

    activeItems.forEach((item) => {
      const datedValues = entries
        .map((day) => ({ date: day.date, value: String(day.values[item.id] || "").trim() }))
        .filter(({ value }) => value);
      if (!datedValues.length) return;

      if (item.type === "text") {
        const recent = datedValues.slice(-2).map(({ date, value }) => `${date}: ${value}`);
        lines.push(`${item.label}: ${recent.join(" | ")}`);
        return;
      }
      if (item.type === "yesno") {
        const yes = datedValues.filter(({ value }) => value === "yes").length;
        lines.push(`${item.label}: yes on ${yes} of ${datedValues.length} logged days`);
        return;
      }

      const values = datedValues.map(({ value }) => Number(value)).filter(Number.isFinite);
      if (!values.length) return;
      const suffix = item.type === "scale5" ? " of 5" : item.unit ? ` ${item.unit}` : "";
      lines.push(`${item.label}: average ${average(values)}${suffix} (range ${Math.min(...values)}–${Math.max(...values)})`);
    });

    lines.push("Self-reported tracker data; not a clinical record.");
    return lines.join("; ");
  }

  $("#visit-plan-use-tracker")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Adding tracker summary…";
    try {
      const summary = await visitTrackerSummaryText();
      if (!summary) {
        showToast("Nothing has been logged in the tracker during the last 14 days.");
        return;
      }
      const changesField = $("#visit-plan-changes");
      if (!changesField) return;
      const combined = [changesField.value.trim(), summary].filter(Boolean).join("\n\n");
      changesField.value = combined.length > changesField.maxLength ? `${combined.slice(0, changesField.maxLength - 1).trimEnd()}…` : combined;
      showToast("Your 14-day tracker summary was added to the visit plan.");
    } catch (error) {
      console.error("Could not add tracker summary:", error);
      showToast("The tracker summary could not be loaded. Try again from the tracker page.");
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });

  function appendVisitPlanSection(container, title, value) {
    const trimmed = value.trim();
    if (!trimmed) return;
    const section = document.createElement("section");
    section.className = "health-summary-section";
    section.append(createTextElement("h3", "", title), createTextElement("p", "", trimmed));
    container.append(section);
  }

  async function copyText(text, successMessage) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_error) {
      const fallback = document.createElement("textarea");
      fallback.value = text;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.append(fallback);
      fallback.select();
      document.execCommand("copy");
      fallback.remove();
    }
    showToast(successMessage);
  }

  $("#visit-plan-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const output = $("#visit-plan-output");
    const result = $("#visit-plan-result");
    if (!output || !result) return;

    const topic = compactVisitValue("visit-plan-topic", 160);
    const type = $("#visit-plan-type")?.value || "symptom";
    const priority = $("#visit-plan-priority")?.value || "balanced";
    const requestedCount = Math.min(8, Math.max(3, Number($("#visit-plan-question-count")?.value) || 5));
    const goal = compactVisitValue("visit-plan-goal", 600);
    const changes = compactVisitValue("visit-plan-changes", 1200);
    const treatments = compactVisitValue("visit-plan-medications", 2400);
    const concerns = compactVisitValue("visit-plan-concern", 800);
    const conditions = compactVisitValue("visit-plan-conditions", 1200);
    const allergies = compactVisitValue("visit-plan-allergies", 800);
    const name = compactVisitValue("visit-plan-name", 80);
    if (!topic) return;

    const contextQuestions = [
      goal ? `My main goal is “${goal}.” What would a realistic, useful outcome from today’s visit look like?` : "",
      changes ? `I have noticed these changes or patterns: “${changes}.” Could they be relevant, and what should I track next?` : "",
      treatments ? `I want to discuss these medicines or treatments: “${treatments}.” How might they affect the options or symptoms we are considering?` : "",
      concerns ? `I am particularly concerned about “${concerns}.” How should that concern affect our plan or decision?` : "",
    ].filter(Boolean);

    const commonQuestions = [
      `What is the most important issue to address today regarding ${topic}?`,
      "If a test is being considered, what would the result change about the plan?",
      "What can I do between visits, and what should I avoid changing without checking first?",
      "How will we know whether the plan is helping, and when should we follow up?",
      "Which warning signs should prompt urgent care, emergency care, or an earlier call?",
      "Could you summarize the next steps, who is responsible for each one, and when they should happen?",
      "Where can I find reliable information to review after the visit?",
    ];

    latestVisitQuestions = uniqueQuestions([
      ...contextQuestions,
      ...(visitPriorityQuestions[priority] || []),
      ...(visitTypeQuestions[type] || visitTypeQuestions.symptom),
      ...commonQuestions,
    ]).slice(0, requestedCount);
    output.replaceChildren();
    output.append(createTextElement("h2", "", "My visit plan"));
    const enteredDate = $("#visit-plan-date")?.value || dateKey;
    output.append(createTextElement("p", "health-summary-meta", [name, formatScheduleDate(enteredDate), visitTypeLabels[type] || visitTypeLabels.symptom].filter(Boolean).join(" · ")));
    appendVisitPlanSection(output, "Main topic", topic);
    appendVisitPlanSection(output, "What I want from this visit", goal);
    appendVisitPlanSection(output, "Specific concern or decision", concerns);
    appendVisitPlanSection(output, "Recent symptoms, changes, or tracked patterns", changes);
    appendVisitPlanSection(output, "Relevant health conditions", conditions);
    appendVisitPlanSection(output, "Medicines, supplements, or treatments to discuss", treatments);
    appendVisitPlanSection(output, "Allergies or medication reactions", allergies);

    output.append(createTextElement("h3", "visit-question-list-title", "Questions to ask"));
    const questionList = document.createElement("ol");
    questionList.className = "visit-question-list";
    latestVisitQuestions.forEach((question, index) => {
      const item = createTextElement("li", index < 3 ? "visit-question-priority" : "", question);
      if (index < 3) item.prepend(createTextElement("span", "question-priority-badge", "Top priority"));
      questionList.append(item);
    });
    output.append(questionList);
    output.append(createTextElement("p", "visit-question-tip", "The first three questions are prioritized in case appointment time is limited."));
    result.hidden = false;
    result.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
  });

  $("#copy-visit-plan")?.addEventListener("click", () => copyText($("#visit-plan-output")?.innerText.trim() || "", "Visit plan copied."));

  $("#print-visit-plan")?.addEventListener("click", () => {
    if ($("#visit-plan-result")?.hidden) return;
    body.classList.add("visit-plan-printing");
    window.addEventListener("afterprint", () => body.classList.remove("visit-plan-printing"), { once: true });
    window.print();
    window.setTimeout(() => body.classList.remove("visit-plan-printing"), 1000);
  });

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    $$(".reveal").forEach((element) => observer.observe(element));
  } else {
    $$(".reveal").forEach((element) => element.classList.add("visible"));
  }
})();
