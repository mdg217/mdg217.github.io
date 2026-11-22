/**
 * js/data.js
 * Contiene i dati strutturati delle 5 sezioni (Floppy Disk su PC / Pennette USB su Smartphone).
 */
window.PORTFOLIO_DATA = [
  {
    id: 'profilo',
    code: 'DISK 01',
    usbCapacity: '64GB',
    filename: '01_PROFILO.SYS',
    shortName: 'Profilo',
    tag: 'BIO & EDU',
    size: '1.44 MB',
    color: '#2563eb',
    accent: '#1d4ed8',
    previewTitle: 'Chi sono & Formazione',
    previewText: 'Software Engineer & PhD Student in Automation & Control Systems. Laurea Magistrale 110/110 cum Laude.',
    type: 'profile',
    content: {
      badge: 'Software Engineer // PhD Student',
      name: 'Marco De Gregorio',
      bio: 'Dottorando di ricerca e Control Systems Engineer con solida esperienza in sistemi embedded, stima dello stato e testing MIL/SIL. Orientato al problem solving e allo sviluppo di soluzioni che collegano ricerca avanzata e ingegneria applicata.',
      education: [
        {
          role: 'M.Sc. Computer Engineering — Automation & Control Systems',
          org: 'Università degli Studi di Salerno',
          period: '2022 - 2023',
          desc: 'Votazione: 110/110 cum Laude.'
        },
        {
          role: 'B.Sc. Computer Engineering',
          org: 'Università degli Studi di Salerno',
          period: '2018 - 2021',
          desc: 'Votazione: 110/110 cum Laude.'
        },
        {
          role: 'Diploma di Liceo Scientifico — Scienze Applicate',
          org: 'Liceo De Liguori',
          period: '2018',
          desc: 'Formazione scientifico-tecnologica.'
        }
      ]
    }
  },
  {
    id: 'esperienze',
    code: 'DISK 02',
    usbCapacity: '128GB',
    filename: '02_ESPERIENZE.EXE',
    shortName: 'Esperienze',
    tag: 'CAREER',
    size: '1.38 MB',
    color: '#0d9488',
    accent: '#0f766e',
    previewTitle: 'Percorso Professionale',
    previewText: 'Guest Researcher (Jozef Stefan Institute), PhD Researcher (UNISA) e Control System Engineer per General Motors.',
    type: 'experience',
    content: {
      items: [
        {
          role: 'Guest Researcher',
          org: 'Jozef Stefan Institute — Ljubljana, Slovenia',
          period: 'Lug 2026 - Presente',
          desc: 'Ricerca su Electrochemical Impedance Spectroscopy (EIS), sistemi embedded, segnali DRBS/PRBS e tecniche di ottimizzazione.'
        },
        {
          role: 'PhD Researcher',
          org: 'Università degli Studi di Salerno — Fisciano, Italia',
          period: 'Nov 2024 - Presente',
          desc: 'Ricerca su stima dello stato, Battery Management Systems (BMS) e algoritmi EIS per diagnostica batterie.'
        },
        {
          role: 'Expert Student Evaluator',
          org: 'QUACING — Italia',
          period: 'Nov 2022 - Presente',
          desc: 'Membro delle commissioni di valutazione QUACING (agenzia affiliata ENQA) per l’accreditamento EUR-ACE dei corsi di ingegneria.'
        },
        {
          role: 'Control System Engineer (General Motors)',
          org: 'Dumarey Automotive Italia (Brain Technologies) — Torino',
          period: 'Set 2023 - Ott 2024',
          desc: 'Sviluppo di sistemi di controllo automotive, definizione dei requisiti e testing Model-in-the-Loop (MIL) e Software-in-the-Loop (SIL).'
        },
        {
          role: 'Research Fellow',
          org: 'Università degli Studi di Salerno — Fisciano, Italia',
          period: 'Apr 2022 - Ott 2022',
          desc: 'Progettazione di un sistema per acquisizione, catalogazione e analisi dati da sensori piezoresistivi innovativi.'
        },
        {
          role: 'Student Internship',
          org: 'Università degli Studi di Salerno — Salerno, Italia',
          period: 'Giu 2021 - Ago 2021',
          desc: 'Progettazione e implementazione di una smart chair per il monitoraggio in tempo reale della postura.'
        },
        {
          role: 'Internship — Server & Computer Technician',
          org: 'microsistemi — Piano di Sorrento, Italia',
          period: 'Lug 2015 - Ago 2015',
          desc: 'Assistenza tecnica su server, reti locali e postazioni hardware/software.'
        }
      ]
    }
  },
  {
    id: 'skills',
    code: 'DISK 03',
    usbCapacity: '64GB',
    filename: '03_SKILLS.BIN',
    shortName: 'Competenze',
    tag: 'TECH STACK',
    size: '1.21 MB',
    color: '#d97706',
    accent: '#b45309',
    previewTitle: 'Stack Tecnico & Lingue',
    previewText: 'MATLAB/Simulink, MIL/SIL/HIL, Kalman Filter, EIS, Python, C/C++, VHDL e Sistemi Embedded.',
    type: 'skills',
    content: {
      groups: [
        {
          title: 'Control Systems & Testing',
          tags: ['MATLAB', 'Simulink', 'MIL / SIL / HIL / PIL', 'Kalman Filter', 'EIS (Impedance Spectroscopy)', 'State Estimation']
        },
        {
          title: 'Programming Languages',
          tags: ['Python', 'C', 'C++', 'Java', 'Bash', 'VHDL']
        },
        {
          title: 'Embedded & IoT',
          tags: ['Embedded Systems', 'Sensors Integration', 'Signal Processing', 'Requirements Engineering', 'BMS']
        },
        {
          title: 'Languages',
          tags: ['Italiano (Madrelingua)', 'Inglese (Livello B2)']
        }
      ]
    }
  },
  {
    id: 'ricerca',
    code: 'DISK 04',
    usbCapacity: '256GB',
    filename: '04_RICERCA.DOC',
    shortName: 'Ricerca',
    tag: 'PAPERS',
    size: '1.40 MB',
    color: '#7c3aed',
    accent: '#6d28d9',
    previewTitle: 'Pubblicazioni Scientifiche',
    previewText: 'Articoli pubblicati su IEEE (2026) sulla validazione EIS per batterie e su Sensors MDPI (2023) su sistemi IoT.',
    type: 'publications',
    content: {
      publications: [
        {
          venue: 'IEEE',
          year: '2026',
          title: 'Enhanced Linear Kramers-Kronig Validation Method for Battery EIS Data',
          desc: 'Framework avanzato di validazione per l’elaborazione e la verifica di affidabilità dei dati di spettroscopia di impedenza elettrochimica (EIS) delle batterie.'
        },
        {
          venue: 'Sensors (MDPI)',
          year: '2023',
          title: 'IoT System for Real-Time Posture Asymmetry Detection',
          desc: 'Sistema di misura basato su architettura IoT per il rilevamento e l’analisi in tempo reale delle asimmetrie posturali.'
        }
      ],
      scholarUrl: 'https://scholar.google.com/scholar?q=Marco+De+Gregorio'
    }
  },
  {
    id: 'contatti',
    code: 'DISK 05',
    usbCapacity: '32GB',
    filename: '05_CONTATTI.NET',
    shortName: 'Contatti',
    tag: 'CONNECT',
    size: '0.98 MB',
    color: '#e11d48',
    accent: '#be123c',
    previewTitle: 'Contatti & Link Diretti',
    previewText: 'Email personale e accademica, telefono, profilo GitHub (@mdg217) e Google Scholar.',
    type: 'contacts',
    content: {
      contacts: [
        {
          label: 'Email Personale',
          value: 'marcodegregorio17@gmail.com',
          actionType: 'copy',
          copyValue: 'marcodegregorio17@gmail.com'
        },
        {
          label: 'Email Accademica (UNISA)',
          value: 'mdegregorio@unisa.it',
          actionType: 'copy',
          copyValue: 'mdegregorio@unisa.it'
        },
        {
          label: 'Telefono',
          value: '+39 ..... (request it)',
          actionType: 'copy',
        },
        {
          label: 'GitHub',
          value: 'github.com/mdg217',
          actionType: 'link',
          url: 'https://github.com/mdg217'
        },
        {
          label: 'Google Scholar',
          value: 'Pubblicazioni & Citazioni',
          actionType: 'link',
          url: 'https://scholar.google.com/scholar?q=Marco+De+Gregorio'
        },
        {
          label: 'Base Operativa',
          value: 'Italia / Ljubljana (Slovenia)',
          actionType: 'none'
        }
      ]
    }
  }
];
