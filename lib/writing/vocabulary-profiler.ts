/**
 * ==============================================================================
 * GLOVA CEFR Writing Vocabulary Profiler & Lexical Analysis Engine
 * ==============================================================================
 * Derived from English Vocabulary Profile (EVP) and Coxhead's Academic Word List (AWL).
 * Computes Type-Token Ratio (TTR), Lexical Density, CEFR Tier Distribution (A1-C2),
 * and identifies Discourse Markers for Coherence scoring.
 * ==============================================================================
 */

// Academic Word List (AWL) - 250+ High-Frequency Academic Headwords
export const ACADEMIC_WORD_LIST = new Set([
  'abandon', 'abstract', 'academy', 'access', 'accommodate', 'accompany', 'accumulate',
  'accurate', 'achieve', 'acknowledge', 'acquire', 'adapt', 'adequate', 'adjacent',
  'adjust', 'administrate', 'adult', 'advocate', 'affect', 'aggregate', 'aid',
  'albeit', 'allocate', 'alter', 'alternative', 'ambiguous', 'amend', 'analogy',
  'analyse', 'analyze', 'analysis', 'analyses', 'analyst', 'annual', 'anticipate', 'apparent', 'append', 'appreciate',
  'approach', 'appropriate', 'approximate', 'arbitrary', 'area', 'aspect', 'assemble',
  'assess', 'assign', 'assist', 'assume', 'assure', 'attach', 'attain',
  'attitude', 'attribute', 'author', 'authority', 'automate', 'available', 'aware',
  'behalf', 'benefit', 'bias', 'bond', 'brief', 'bulk', 'capable',
  'capacity', 'category', 'cease', 'challenge', 'channel', 'chapter', 'chart',
  'chemical', 'circumstance', 'cite', 'civil', 'clarify', 'classic', 'clause',
  'code', 'coherent', 'coincide', 'collapse', 'colleague', 'commence', 'comment',
  'commission', 'commit', 'commodity', 'communicate', 'community', 'compatible', 'compensate',
  'compile', 'complement', 'complex', 'component', 'compound', 'comprehensive', 'comprise',
  'compute', 'conceive', 'concentrate', 'concept', 'conclude', 'concurrent', 'conduct',
  'confer', 'confine', 'confirm', 'conflict', 'conform', 'consent', 'consequent',
  'considerable', 'consist', 'constant', 'constitute', 'constrain', 'construct', 'consult',
  'consume', 'contact', 'contemporary', 'context', 'contract', 'contradict', 'contrary',
  'contrast', 'contribute', 'controversy', 'convene', 'converse', 'convert', 'convince',
  'cooperate', 'coordinate', 'core', 'corporate', 'correspond', 'couple', 'create',
  'credit', 'criteria', 'crucial', 'culture', 'currency', 'cycle', 'data',
  'debate', 'decade', 'decline', 'deduce', 'define', 'definite', 'demonstrate',
  'denote', 'deny', 'depress', 'derive', 'design', 'despite', 'detect',
  'deviate', 'device', 'devote', 'differentiate', 'dimension', 'diminish', 'discrete',
  'discriminate', 'displace', 'display', 'dispose', 'distinct', 'distort', 'distribute',
  'diverse', 'document', 'domain', 'domestic', 'dominate', 'draft', 'drama',
  'duration', 'dynamic', 'economy', 'edit', 'element', 'eliminate', 'emerge',
  'emphasis', 'empirical', 'enable', 'encounter', 'energy', 'enforce', 'enhance',
  'enormous', 'ensure', 'entity', 'environment', 'equate', 'equip', 'equivalent',
  'erode', 'error', 'establish', 'estate', 'estimate', 'ethic', 'ethnic',
  'evaluate', 'eventual', 'evident', 'evolve', 'exceed', 'exclude', 'exhibit',
  'expand', 'expert', 'explicit', 'exploit', 'export', 'expose', 'external',
  'extract', 'facilitate', 'factor', 'feature', 'federal', 'fee', 'file',
  'final', 'finance', 'finite', 'flexible', 'fluctuate', 'focus', 'format',
  'formula', 'forthcoming', 'foundation', 'framework', 'function', 'fund', 'fundamental',
  'furthermore', 'gender', 'generate', 'generation', 'globe', 'goal', 'grade',
  'grant', 'guarantee', 'guideline', 'hence', 'hierarchy', 'highlight', 'hypothesis',
  'identical', 'identify', 'ideology', 'ignorance', 'illustrate', 'image', 'immigrate',
  'impact', 'implement', 'implicate', 'implicit', 'imply', 'impose', 'incentive',
  'incidence', 'incline', 'income', 'incorporate', 'index', 'indicate', 'individual',
  'induce', 'inevitable', 'infer', 'infrastructure', 'inherent', 'inhibit', 'initial',
  'initiate', 'injure', 'innovate', 'input', 'insert', 'insight', 'inspect',
  'instance', 'institute', 'instruct', 'integral', 'integrate', 'integrity', 'intelligence',
  'intense', 'interact', 'intermediate', 'internal', 'interpret', 'interval', 'intervene',
  'intrinsic', 'invest', 'investigate', 'invoke', 'involve', 'isolate', 'issue',
  'item', 'job', 'journal', 'justify', 'label', 'labour', 'layer',
  'lecture', 'legal', 'legislate', 'levy', 'liberal', 'licence', 'likewise',
  'link', 'locate', 'logic', 'maintain', 'major', 'manipulate', 'manual',
  'margin', 'mature', 'maximise', 'maximize', 'mechanism', 'media', 'mediate',
  'medical', 'medium', 'mental', 'method', 'migrate', 'military', 'minimal',
  'minimise', 'minimize', 'minimum', 'ministry', 'minor', 'mode', 'modify',
  'monitor', 'motive', 'mutual', 'negate', 'network', 'neutral', 'nevertheless',
  'nonetheless', 'norm', 'normal', 'notion', 'notwithstanding', 'nuclear', 'objective',
  'obtain', 'obvious', 'occupy', 'occur', 'odd', 'offset', 'ongoing',
  'option', 'orient', 'outcome', 'output', 'overall', 'overlap', 'overseas',
  'panel', 'paradigm', 'paragraph', 'parallel', 'parameter', 'participate', 'partner',
  'passive', 'perceive', 'percent', 'period', 'persist', 'perspective', 'phase',
  'phenomenon', 'philosophy', 'physical', 'plus', 'policy', 'portion', 'pose',
  'positive', 'potential', 'practitioner', 'precede', 'precise', 'predict', 'predominant',
  'preliminary', 'presume', 'previous', 'primary', 'prime', 'principal', 'principle',
  'prior', 'priority', 'proceed', 'process', 'professional', 'prohibit', 'project',
  'promote', 'proportion', 'prospect', 'protocol', 'psychology', 'publication', 'publish',
  'purchase', 'pursue', 'qualitative', 'quote', 'radical', 'random', 'range',
  'ratio', 'rational', 'react', 'recover', 'refine', 'regime', 'region',
  'register', 'regulate', 'reinforce', 'reject', 'relax', 'release', 'relevant',
  'reluctance', 'rely', 'remove', 'require', 'research', 'reside', 'resolve',
  'resource', 'respond', 'restore', 'restrain', 'restrict', 'retain', 'reveal',
  'revenue', 'reverse', 'revise', 'revolution', 'rigid', 'role', 'route',
  'scenario', 'schedule', 'scheme', 'scope', 'section', 'sector', 'secure',
  'seek', 'select', 'sequence', 'series', 'shift', 'significant', 'similar',
  'simulate', 'site', 'so-called', 'sole', 'somewhat', 'source', 'specific',
  'specify', 'sphere', 'stable', 'statistic', 'status', 'straightforward', 'strategy',
  'stress', 'structure', 'style', 'submit', 'subordinate', 'subsequent', 'subsidy',
  'substitute', 'successor', 'sufficient', 'sum', 'summary', 'supplement', 'survey',
  'survive', 'suspend', 'sustain', 'symbol', 'tape', 'target', 'task',
  'team', 'technical', 'technique', 'technology', 'temporary', 'tense', 'terminate',
  'text', 'theme', 'theory', 'thereby', 'thesis', 'topic', 'trace',
  'tradition', 'transfer', 'transform', 'transit', 'transmit', 'transport', 'trend',
  'trigger', 'ultimate', 'undergo', 'underlie', 'undertake', 'uniform', 'unify',
  'unique', 'utilise', 'utilize', 'valid', 'vary', 'vehicle', 'version',
  'via', 'violate', 'virtual', 'visible', 'vision', 'visual', 'volume',
  'voluntary', 'welfare', 'whereas', 'whereby', 'widespread',
]);

// CEFR B1 - B2 Core Vocabulary (Upper Intermediate Threshold)
export const CEFR_B_TIER_WORDS = new Set([
  'abroad', 'accommodation', 'achievement', 'action', 'activity', 'advantage', 'advice',
  'afford', 'ambition', 'amount', 'ancient', 'announcement', 'annoyed', 'anxious',
  'appearance', 'applicant', 'application', 'appointment', 'appreciate', 'argument', 'arrangement',
  'artificial', 'assistance', 'atmosphere', 'attractive', 'audience', 'available', 'average',
  'balance', 'bargain', 'barrier', 'behavior', 'belief', 'blame', 'boredom',
  'boundary', 'brilliant', 'broad', 'broadcast', 'budget', 'calm', 'campaign',
  'candidate', 'careless', 'celebrate', 'ceremony', 'certainly', 'certificate', 'character',
  'charity', 'cheerful', 'citizen', 'climate', 'climbing', 'coastal', 'collection',
  'combine', 'comfortable', 'commercial', 'communicate', 'community', 'companion', 'company',
  'comparison', 'compete', 'competition', 'complain', 'complaint', 'complicated', 'concentrate',
  'concern', 'confident', 'confirm', 'confused', 'consequence', 'consider', 'convenient',
  'conversation', 'convince', 'courage', 'creativity', 'creature', 'critical', 'crowded',
  'crucial', 'culture', 'curious', 'custom', 'damage', 'deadline', 'deal',
  'decision', 'decorate', 'decrease', 'deliver', 'demand', 'depend', 'depressed',
  'describe', 'description', 'destination', 'determine', 'development', 'disadvantage', 'disappointed',
  'discipline', 'discount', 'discover', 'discussion', 'disease', 'dishonest', 'distance',
  'distract', 'diversity', 'dramatic', 'efficient', 'effort', 'elderly', 'embarrassed',
  'emergency', 'emotion', 'encourage', 'enthusiastic', 'environment', 'episode', 'equipment',
  'essential', 'evidence', 'examine', 'exchange', 'excitement', 'exhausted', 'exhibition',
  'expand', 'expect', 'expedition', 'expensive', 'experience', 'experiment', 'expert',
  'explanation', 'explore', 'explorer', 'extinct', 'extraordinary', 'failure', 'familiar',
  'fantastic', 'fascinating', 'favorable', 'feature', 'financial', 'flexible', 'fluent',
  'forecast', 'fortunate', 'frequent', 'friendship', 'frustrated', 'fulfill', 'functional',
  'generous', 'genuine', 'geography', 'gorgeous', 'gradually', 'graduate', 'guarantee',
  'guidance', 'guilty', 'habitat', 'hesitate', 'highlight', 'historical', 'homeless',
  'horizon', 'hospitality', 'huge', 'humorous', 'identical', 'illegal', 'illness',
  'imagination', 'immediate', 'immigrant', 'importance', 'impress', 'impression', 'impressive',
  'improvement', 'incident', 'include', 'income', 'increase', 'independent', 'individual',
  'industry', 'infection', 'infinite', 'influence', 'informal', 'information', 'ingredient',
  'initiative', 'injury', 'innocent', 'innovative', 'inspiration', 'instance', 'institution',
  'insurance', 'intelligence', 'intention', 'interaction', 'interest', 'international', 'interrupt',
  'interview', 'introduce', 'introduction', 'invent', 'invention', 'invest', 'investigate',
  'invitation', 'involve', 'jealous', 'judgment', 'justice', 'knowledge', 'landscape',
  'leadership', 'leisure', 'liberty', 'lifestyle', 'literature', 'location', 'logical',
  'loyal', 'magnificent', 'maintain', 'major', 'management', 'manufacture', 'marvelous',
  'mature', 'maximum', 'meaningful', 'measurement', 'mechanic', 'media', 'medical',
  'memorable', 'mention', 'messy', 'mild', 'minor', 'miserable', 'modest',
  'mood', 'motivate', 'motivation', 'multiple', 'mysterious', 'narrative', 'nasty',
  'native', 'necessary', 'negotiate', 'neighborhood', 'nervous', 'nominate', 'notable',
  'noticeable', 'nutrition', 'obedience', 'obligation', 'observation', 'observe', 'obvious',
  'occasion', 'occupation', 'offense', 'official', 'operate', 'opinion', 'opportunity',
  'opposite', 'option', 'ordinary', 'organization', 'organize', 'original', 'outcome',
  'outgoing', 'outstanding', 'overcome', 'overseas', 'participate', 'particular', 'passion',
  'patience', 'patient', 'pattern', 'peaceful', 'percentage', 'perception', 'performance',
  'permanent', 'permission', 'personality', 'persuade', 'phenomenon', 'philosophy', 'pleasant',
  'plenty', 'polite', 'pollution', 'popularity', 'population', 'positive', 'possession',
  'possibility', 'potential', 'poverty', 'practical', 'precious', 'predict', 'preference',
  'preparation', 'presence', 'presentation', 'preserve', 'pressure', 'previous', 'priority',
  'privacy', 'probable', 'productive', 'professional', 'profitable', 'progress', 'prohibit',
  'prominent', 'promise', 'promote', 'prompt', 'property', 'proposal', 'prospect',
  'protect', 'protection', 'protest', 'proud', 'provide', 'publicity', 'punctual',
  'punishment', 'purchase', 'purpose', 'qualification', 'quantity', 'quarrel', 'radiation',
  'radical', 'realistic', 'reasonable', 'reassure', 'rebellion', 'receipt', 'recommend',
  'recommendation', 'recover', 'recreation', 'reduce', 'reduction', 'reference', 'refugee',
  'refuse', 'region', 'register', 'regular', 'regulation', 'reject', 'relationship',
  'relative', 'relaxation', 'reliable', 'relief', 'remarkable', 'remind', 'remote',
  'renewable', 'reputation', 'requirement', 'rescue', 'research', 'resident', 'resource',
  'respect', 'response', 'responsibility', 'responsible', 'restriction', 'retirement', 'revolution',
  'reward', 'ridiculous', 'romantic', 'routine', 'ruin', 'rumor', 'sacrifice',
  'safety', 'salary', 'satisfaction', 'satisfied', 'scarcely', 'scenery', 'schedule',
  'scholarship', 'scientific', 'security', 'sensible', 'sensitive', 'settlement', 'severe',
  'shallow', 'shelter', 'significant', 'similarity', 'sincere', 'situation', 'skillful',
  'slight', 'solution', 'sophisticated', 'sorrow', 'source', 'spectacular', 'spiritual',
  'splendid', 'spontaneous', 'stability', 'standard', 'statement', 'strategy', 'strength',
  'struggle', 'stubborn', 'substance', 'substantial', 'substitute', 'subtle', 'successful',
  'sufficient', 'suitable', 'summarize', 'summary', 'superior', 'superstition', 'supplement',
  'surface', 'surround', 'survive', 'suspect', 'suspicious', 'sustainable', 'sympathy',
  'talent', 'target', 'technical', 'technique', 'technology', 'temporary', 'tendency',
  'tension', 'terrible', 'territory', 'threat', 'threaten', 'thrilling', 'tolerate',
  'traditional', 'tragedy', 'transform', 'transport', 'tremendous', 'tropical', 'trustworthy',
  'typical', 'ultimate', 'unbearable', 'unconscious', 'underestimate', 'understandable', 'unfortunate',
  'universal', 'urgent', 'valuable', 'variety', 'various', 'vehicle', 'victim',
  'victory', 'violence', 'virtual', 'vision', 'vital', 'volunteer', 'vulnerable',
  'wealthy', 'welfare', 'widespread', 'wilderness', 'wildlife', 'wisdom', 'worthwhile',
]);

// CEFR C1 - C2 Advanced Lexicon (Mastery Tier)
export const CEFR_C_TIER_WORDS = new Set([
  'aesthetic', 'ambivalent', 'anachronism', 'anomaly', 'antithesis', 'apathy', 'arbitrary',
  'articulate', 'ascetic', 'assiduous', 'audacious', 'austere', 'autonomous', 'belligerent',
  'benevolent', 'bolster', 'brevity', 'cacophony', 'candid', 'capricious', 'catalyst',
  'circumlocution', 'clandestine', 'coalesce', 'cognitive', 'cogent', 'collusion', 'commensurate',
  'complacent', 'complicity', 'connoisseur', 'contentious', 'conundrum', 'copious', 'corroborate',
  'cryptic', 'cursory', 'dearth', 'debacle', 'deference', 'delineate', 'demagogue',
  'denounce', 'depict', 'deride', 'derivative', 'despot', 'detriment', 'devoid',
  'diatribe', 'didactic', 'diffident', 'digress', 'diligent', 'discern', 'discrepancy',
  'disdain', 'disparage', 'disparity', 'disseminate', 'dissonance', 'divergent', 'docile',
  'dogmatic', 'dubious', 'duplicity', 'ebullient', 'eccentric', 'eclectic', 'efficacy',
  'effrontery', 'egregious', 'elegy', 'elicit', 'eloquent', 'elucidate', 'elusive',
  'empathy', 'empirical', 'emulate', 'enervate', 'engender', 'enigma', 'ephemeral',
  'epitome', 'equanimity', 'equivocal', 'erudite', 'esoteric', 'eulogy', 'euphemism',
  'evanescent', 'exacerbate', 'exacting', 'exalt', 'exemplary', 'exhaustive', 'exonerate',
  'expedient', 'explicate', 'explicit', 'extol', 'extraneous', 'facetious', 'fallacious',
  'fastidious', 'fatuous', 'fawn', 'feasible', 'fervid', 'flabbergasted', 'florid',
  'foster', 'fractious', 'frugal', 'furtive', 'garrulous', 'gregarious', 'guile',
  'hackneyed', 'hapless', 'harangue', 'hegemony', 'hierarchy', 'homogenous', 'hyperbole',
  'iconoclast', 'idiosyncrasy', 'ignominious', 'immutable', 'impassive', 'impeccable', 'imperative',
  'impervious', 'impetuous', 'implacable', 'implicit', 'impudent', 'inadvertent', 'inchoate',
  'incisive', 'incongruous', 'indolent', 'ineffable', 'inert', 'inevitable', 'inexorable',
  'ingenious', 'ingenuous', 'inherent', 'innocuous', 'insatiable', 'insidious', 'insipid',
  'insolent', 'intractable', 'intransigent', 'intrepid', 'inundate', 'inured', 'invective',
  'inveterate', 'irascible', 'irrevocable', 'judicious', 'juxtaposition', 'laconic', 'lament',
  'latent', 'laudable', 'lethargic', 'levity', 'lucid', 'lucrative', 'magnanimous',
  'malevolent', 'malleable', 'maverick', 'mendacious', 'mercurial', 'meticulous', 'mitigate',
  'mollify', 'morose', 'mundane', 'myriad', 'nefarious', 'negligent', 'nemesis',
  'neophyte', 'nihilism', 'noxious', 'nuance', 'obdurate', 'obfuscate', 'oblivious',
  'obscure', 'obsequious', 'obstinate', 'obtuse', 'ominous', 'onerous', 'opaque',
  'opportune', 'opulent', 'orthodox', 'ostentatious', 'pacify', 'palpable', 'panacea',
  'paradox', 'paramount', 'pariah', 'parsimonious', 'pathos', 'paucity', 'pejorative',
  'pellucid', 'penchant', 'penitent', 'peremptory', 'perfunctory', 'permeate', 'pernicious',
  'perpetuate', 'perquisite', 'perspicacious', 'peruse', 'pervasive', 'petulant', 'philanthropy',
  'pivotal', 'placate', 'platitude', 'plausible', 'plethora', 'poignant', 'polemic',
  'pragmatic', 'precarious', 'preclude', 'precocious', 'predilection', 'preponderance', 'prerogative',
  'prescient', 'presumptuous', 'prevalent', 'pristine', 'probity', 'proclivity', 'prodigal',
  'profuse', 'prolific', 'promulgate', 'propensity', 'propitious', 'prosaic', 'proselytize',
  'proscribe', 'prudent', 'puerile', 'pugnacious', 'punctilious', 'quagmire', 'quandary',
  'quell', 'querulous', 'quiescent', 'quintessential', 'quixotic', 'rancor', 'rapacious',
  'recalcitrant', 'recant', 'recondite', 'redoubtable', 'refractory', 'relegate', 'remonstrate',
  'reprehensible', 'repudiate', 'rescind', 'resilient', 'reticent', 'reverent', 'rhetoric',
  'ribald', 'robust', 'rudimentary', 'sagacious', 'salient', 'salutary', 'sanctimonious',
  'sanguine', 'satiate', 'scathing', 'scrupulous', 'scrutinize', 'sedulous', 'seminal',
  'serendipity', 'servile', 'sinuous', 'skeptical', 'solicitous', 'somber', 'sophistry',
  'spurious', 'staunch', 'strident', 'stringent', 'subjugate', 'sublime', 'subversive',
  'succinct', 'superfluous', 'surreptitious', 'sycophant', 'tacit', 'taciturn', 'tangential',
  'tenacious', 'tenuous', 'terse', 'timorous', 'tirade', 'torpid', 'tractable',
  'transient', 'trenchant', 'trepidation', 'trite', 'truncate', 'ubiquitous', 'umbrage',
  'unctuous', 'unequivocal', 'unfathomable', 'unflappable', 'unprecedented', 'untenable', 'vacillate',
  'variegated', 'vehement', 'venerable', 'veracity', 'verbose', 'verisimilitude', 'vestige',
  'vexation', 'viable', 'vicarious', 'vigilant', 'vilify', 'vindicate', 'virulent',
  'visceral', 'vitriolic', 'vituperate', 'vociferous', 'volatile', 'voluble', 'voracious',
  'wane', 'wary', 'wistful', 'zealot', 'zealous', 'zenith',
]);

// Discourse Markers / Linking Words by Function
export const DISCOURSE_MARKERS = [
  // Addition / Elaboration
  { text: 'in addition', category: 'addition', weight: 1.2 },
  { text: 'furthermore', category: 'addition', weight: 1.5 },
  { text: 'moreover', category: 'addition', weight: 1.5 },
  { text: 'additionally', category: 'addition', weight: 1.3 },
  { text: 'as well as', category: 'addition', weight: 1.1 },
  { text: 'not only', category: 'addition', weight: 1.4 },
  { text: 'what is more', category: 'addition', weight: 1.4 },
  
  // Contrast / Concession
  { text: 'however', category: 'contrast', weight: 1.2 },
  { text: 'nevertheless', category: 'contrast', weight: 1.6 },
  { text: 'nonetheless', category: 'contrast', weight: 1.6 },
  { text: 'on the other hand', category: 'contrast', weight: 1.4 },
  { text: 'in contrast', category: 'contrast', weight: 1.4 },
  { text: 'conversely', category: 'contrast', weight: 1.7 },
  { text: 'whereas', category: 'contrast', weight: 1.4 },
  { text: 'although', category: 'contrast', weight: 1.2 },
  { text: 'even though', category: 'contrast', weight: 1.2 },
  { text: 'despite', category: 'contrast', weight: 1.3 },
  { text: 'in spite of', category: 'contrast', weight: 1.4 },
  { text: 'yet', category: 'contrast', weight: 1.0 },

  // Cause / Effect / Result
  { text: 'therefore', category: 'cause_effect', weight: 1.3 },
  { text: 'consequently', category: 'cause_effect', weight: 1.6 },
  { text: 'as a result', category: 'cause_effect', weight: 1.3 },
  { text: 'thus', category: 'cause_effect', weight: 1.4 },
  { text: 'hence', category: 'cause_effect', weight: 1.5 },
  { text: 'accordingly', category: 'cause_effect', weight: 1.5 },
  { text: 'for this reason', category: 'cause_effect', weight: 1.2 },
  { text: 'due to', category: 'cause_effect', weight: 1.1 },

  // Exemplification / Illustration
  { text: 'for example', category: 'example', weight: 1.1 },
  { text: 'for instance', category: 'example', weight: 1.3 },
  { text: 'to illustrate', category: 'example', weight: 1.5 },
  { text: 'such as', category: 'example', weight: 1.0 },
  { text: 'namely', category: 'example', weight: 1.4 },

  // Conclusion / Summary
  { text: 'in conclusion', category: 'summary', weight: 1.3 },
  { text: 'to conclude', category: 'summary', weight: 1.3 },
  { text: 'to summarize', category: 'summary', weight: 1.4 },
  { text: 'overall', category: 'summary', weight: 1.1 },
  { text: 'in summary', category: 'summary', weight: 1.3 },
  { text: 'ultimately', category: 'summary', weight: 1.5 },

  // Sequencing / Organization
  { text: 'firstly', category: 'sequence', weight: 1.0 },
  { text: 'secondly', category: 'sequence', weight: 1.0 },
  { text: 'thirdly', category: 'sequence', weight: 1.0 },
  { text: 'subsequently', category: 'sequence', weight: 1.5 },
  { text: 'initially', category: 'sequence', weight: 1.3 },
  { text: 'finally', category: 'sequence', weight: 1.0 },
];

/**
 * Tokenize and normalize text into clean lowercase words.
 */
export function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^\d+$/.test(w));
}

/**
 * Extract sentences cleanly handling punctuation.
 */
export function extractSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Clean simple lemmatization heuristic (removing plural -s, -ed, -ing, -ic, -al).
 */
export function simpleLemmatize(word: string): string {
  const w = word.toLowerCase();
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ical') && w.length > 5) return w.slice(0, -4) + 'y';
  if (w.endsWith('ic') && w.length > 4) {
    const base = w.slice(0, -2);
    if (ACADEMIC_WORD_LIST.has(base + 'y')) return base + 'y';
    return base;
  }
  if (w.endsWith('al') && w.length > 4) {
    const base = w.slice(0, -2);
    if (ACADEMIC_WORD_LIST.has(base + 'e')) return base + 'e';
    if (ACADEMIC_WORD_LIST.has(base)) return base;
  }
  if (w.endsWith('ly') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

/**
 * Compute Vocabulary Profiling against AWL and CEFR Bands.
 */
export function profileVocabulary(words: string[]) {
  const total = words.length || 1;
  const uniqueWords = new Set(words);
  const typeTokenRatio = Number((uniqueWords.size / total).toFixed(3));

  let awlCount = 0;
  const awlWordsUsed: string[] = [];
  let bTierCount = 0;
  let cTierCount = 0;
  let aTierCount = 0;

  for (const raw of words) {
    const lemma = simpleLemmatize(raw);
    let matched = false;

    if (ACADEMIC_WORD_LIST.has(raw) || ACADEMIC_WORD_LIST.has(lemma)) {
      awlCount++;
      if (!awlWordsUsed.includes(raw)) awlWordsUsed.push(raw);
      matched = true;
    }

    if (CEFR_C_TIER_WORDS.has(raw) || CEFR_C_TIER_WORDS.has(lemma)) {
      cTierCount++;
      matched = true;
    } else if (CEFR_B_TIER_WORDS.has(raw) || CEFR_B_TIER_WORDS.has(lemma)) {
      bTierCount++;
      matched = true;
    } else {
      aTierCount++;
    }
  }

  const cefrDistribution = {
    a1_a2: Number(((aTierCount / total) * 100).toFixed(1)),
    b1_b2: Number(((bTierCount / total) * 100).toFixed(1)),
    c1_c2: Number(((cTierCount / total) * 100).toFixed(1)),
    academic: Number(((awlCount / total) * 100).toFixed(1)),
  };

  return {
    typeTokenRatio,
    awlCount,
    awlWordsUsed,
    cefrDistribution,
  };
}

/**
 * Find discourse markers in text.
 */
export function detectDiscourseMarkers(text: string) {
  const lower = text.toLowerCase();
  const detected: string[] = [];
  let weightedScore = 0;

  for (const marker of DISCOURSE_MARKERS) {
    // Regex matching whole phrase boundary
    const regex = new RegExp(`\\b${marker.text}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      detected.push(marker.text);
      weightedScore += matches.length * marker.weight;
    }
  }

  return {
    markersUsed: detected,
    markerCount: detected.length,
    weightedScore,
  };
}

/**
 * Check if a sentence is complex or compound.
 */
const COMPLEX_CONNECTORS = [
  'because', 'although', 'even though', 'though', 'since', 'whereas',
  'while', 'unless', 'if', 'provided that', 'whether', 'as long as',
  'which', 'that', 'who', 'whom', 'whose', 'where', 'when',
  'in order that', 'so that', 'despite the fact', 'in spite of',
];

export function isComplexSentence(sentence: string): boolean {
  const lower = ` ${sentence.toLowerCase()} `;
  return COMPLEX_CONNECTORS.some((c) => lower.includes(` ${c} `));
}
