import { Player } from '../models/types';

// Country-specific name databases
const countryNames: { [key: string]: { firstNames: string[], lastNames: string[] } } = {
  // Nigeria (Yoruba, Igbo, Hausa influences)
  'Nigeria': {
    firstNames: [
      'Ade', 'Chinedu', 'Emeka', 'Femi', 'Chukwu', 'Oluwaseun', 'Nneka', 'Chiamaka',
      'Amina', 'Zainab', 'Ibrahim', 'Musa', 'Obinna', 'Ifeanyi', 'Chidi', 'Ngozi',
      'Yusuf', 'Habiba', 'Sadiq', 'Fatima', 'Olamide', 'Temitope', 'Ayodele', 'Bola'
    ],
    lastNames: [
      'Adeyemi', 'Okafor', 'Nwankwo', 'Eze', 'Obi', 'Balogun', 'Suleiman', 'Mohammed',
      'Okoro', 'Ibe', 'Oni', 'Bello', 'Yusuf', 'Abubakar', 'Chukwu', 'Nnamdi',
      'Odunayo', 'Akinwale', 'Babangida', 'Oladipo', 'Uche', 'Okeke', 'Adebayo', 'Jelili'
    ]
  },

  // Egypt (Arabic names)
  'Egypt': {
    firstNames: [
      'Ahmed', 'Mohamed', 'Mahmoud', 'Omar', 'Youssef', 'Abdul', 'Karim', 'Hassan',
      'Amir', 'Rami', 'Khalid', 'Samir', 'Tariq', 'Zayed', 'Faris', 'Nasir',
      'Layla', 'Fatima', 'Aisha', 'Noura', 'Samira', 'Zahra', 'Mona', 'Hana'
    ],
    lastNames: [
      'El-Sayed', 'Hassan', 'Ibrahim', 'Mahmoud', 'Abdullah', 'Khalil', 'Rashid',
      'Farouk', 'Naguib', 'Sabry', 'Zaki', 'Gamal', 'Osman', 'Salem', 'Wahba', 'Shawky'
    ]
  },

  // South Africa (Various ethnic groups)
  'South Africa': {
    firstNames: [
      'Lerato', 'Thabo', 'Kagiso', 'Puleng', 'Naledi', 'Sipho', 'Bongani', 'Mandla',
      'Zanele', 'Nolwazi', 'Themba', 'Ayanda', 'Tumi', 'Kgotso', 'Dumisani', 'Refilwe',
      'Mpho', 'Lindiwe', 'Siyabonga', 'Nomvula', 'Vusi', 'Nkosinathi', 'Busisiwe', 'Sandile'
    ],
    lastNames: [
      'Dlamini', 'Nkosi', 'Zulu', 'Mbeki', 'Tambo', 'Sithole', 'Mokoena', 'Moloi',
      'Khumalo', 'Mthembu', 'Ndlovu', 'Cele', 'Mbatha', 'Ngcobo', 'Xaba', 'Mhlongo'
    ]
  },

  // Ghana (Akan names)
  'Ghana': {
    firstNames: [
      'Kwame', 'Kofi', 'Kwasi', 'Yaw', 'Ekow', 'Kojo', 'Ama', 'Abena', 'Akua', 'Yaa',
      'Adwoa', 'Afua', 'Kwabena', 'Kwaku', 'Akwasi', 'Araba', 'Esi', 'Kweku', 'Adoma'
    ],
    lastNames: [
      'Mensah', 'Appiah', 'Owusu', 'Asare', 'Darko', 'Sarpong', 'Boateng', 'Tetteh',
      'Sackey', 'Ansah', 'Agyemang', 'Osei', 'Amoako', 'Gyamfi', 'Opoku', 'Frimpong'
    ]
  },

  // Morocco (Arabic/Berber names)
  'Morocco': {
    firstNames: [
      'Youssef', 'Mehdi', 'Rachid', 'Hicham', 'Karim', 'Noureddine', 'Hassan', 'Bilal',
      'Samir', 'Tariq', 'Zouhair', 'Nabil', 'Adil', 'Walid', 'Said', 'Fouad',
      'Fatima', 'Aicha', 'Khadija', 'Naima', 'Samira', 'Zahra', 'Houda', 'Sanaa'
    ],
    lastNames: [
      'El-Mansouri', 'Benjelloun', 'Alaoui', 'Berrada', 'Chraibi', 'Kabbaj', 'Tazi',
      'Bennani', 'Belhaj', 'Amrani', 'Rhoumi', 'Sbai', 'Fassi', 'Lahlou', 'Khattabi'
    ]
  },

  // Senegal (Wolof names)
  'Senegal': {
    firstNames: [
      'Mamadou', 'Abdoulaye', 'Ibrahima', 'Ousmane', 'Cheikh', 'Modou', 'Pape', 'Aliou',
      'Seydou', 'Moussa', 'Boubacar', 'Demba', 'Malick', 'Samba', 'Moustapha', 'Ndeye',
      'Aminata', 'Fatou', 'Rokhaya', 'Mariama', 'Aissatou', 'Khadidiatou', 'Sokhna', 'Yacine'
    ],
    lastNames: [
      'Diallo', 'Diop', 'Ndiaye', 'Sow', 'Fall', 'Gueye', 'Ba', 'Kane', 'Sarr', 'Sy',
      'Thiam', 'Touré', 'Mbaye', 'Faye', 'Cissé', 'Seck'
    ]
  },

  // Ivory Coast (French/Akan influences)
  'Ivory Coast': {
    firstNames: [
      'Jean', 'Pierre', 'Paul', 'Kouame', 'Yao', 'Koffi', 'Amani', 'Sekou', 'Moussa',
      'Bamba', 'Siaka', 'Drissa', 'Fofana', 'Adama', 'Bakary', 'Mariam', 'Aminata',
      'Salimata', 'Kadiatou', 'Hawa', 'Ramatoulaye', 'Fanta', 'Nafissatou', 'Aissata'
    ],
    lastNames: [
      'Kouadio', 'Koné', 'Yao', 'Bamba', 'Traoré', 'Touré', 'Cissé', 'Diabaté',
      'Keita', 'Soro', 'Fofana', 'Coulibaly', 'Ouattara', 'Kacou', 'Gbagbo', 'Bedie'
    ]
  },

  // Cameroon (Diverse ethnic groups)
  'Cameroon': {
    firstNames: [
      'Jean', 'Pierre', 'Samuel', 'Patrice', 'Roger', 'Alain', 'Eric', 'David',
      'Joseph', 'Paul', 'Martial', 'Guy', 'Bertrand', 'Emmanuel', 'Christian', 'Luc',
      'Grace', 'Marie', 'Jeanne', 'Marthe', 'Brigitte', 'Suzanne', 'Rose', 'Claudine'
    ],
    lastNames: [
      'Mboma', 'Eto\'o', 'Song', 'Kana-Biyik', 'N\'Kono', 'Milla', 'Abo', 'Tchato',
      'Wome', 'N\'Diefi', 'Suffo', 'Job', 'N\'Gom', 'Bekono', 'M\'Bami', 'N\'Guemo'
    ]
  },

  // Algeria (Arabic names)
  'Algeria': {
    firstNames: [
      'Ahmed', 'Mohamed', 'Nasser', 'Karim', 'Rachid', 'Said', 'Mustapha', 'Ali',
      'Hocine', 'Farid', 'Samir', 'Yacine', 'Abdel', 'Khalil', 'Bilal', 'Nabil',
      'Fatima', 'Nadia', 'Samira', 'Yasmina', 'Leila', 'Soraya', 'Hafsa', 'Zohra'
    ],
    lastNames: [
      'Ben', 'Boumediene', 'Bouteflika', 'Zidane', 'Madjer', 'Belloumi', 'Laroussi',
      'Benzema', 'Guerroudj', 'Boukhari', 'Saadi', 'Boulmerka', 'Mansouri', 'Khalef'
    ]
  },

  // Tunisia (Arabic names)
  'Tunisia': {
    firstNames: [
      'Mohamed', 'Ali', 'Houssem', 'Youssef', 'Wissem', 'Riadh', 'Saber', 'Nader',
      'Karim', 'Bassem', 'Maher', 'Fakhri', 'Hatem', 'Sofiene', 'Moez', 'Anis',
      'Amel', 'Rym', 'Sonia', 'Nadia', 'Hajer', 'Mouna', 'Sana', 'Raja'
    ],
    lastNames: [
      'Ben', 'Trabelsi', 'Ghazouani', 'Jaziri', 'Clayton', 'Sassi', 'Khlifi', 'Msakni',
      'Mathlouthi', 'Haddadi', 'Abdennour', 'Ragued', 'Chikhaoui', 'Darragi', 'Jomaa'
    ]
  },

  // Kenya (Swahili names)
  'Kenya': {
    firstNames: [
      'John', 'David', 'Peter', 'James', 'Joseph', 'William', 'Robert', 'Michael',
      'Paul', 'Thomas', 'Charles', 'Daniel', 'Stephen', 'Kenneth', 'George', 'Brian',
      'Mary', 'Elizabeth', 'Susan', 'Margaret', 'Dorothy', 'Joyce', 'Grace', 'Ann'
    ],
    lastNames: [
      'Omondi', 'Odhiambo', 'Kipchoge', 'Kenyatta', 'Odinga', 'Kibaki', 'Moi', 'Ruto',
      'Musyoka', 'Mudavadi', 'Ngige', 'Wambua', 'Njonjo', 'Kariuki', 'Mwangi', 'Kamau'
    ]
  },

  // Ethiopia (Amharic names)
  'Ethiopia': {
    firstNames: [
      'Haile', 'Bekele', 'Gebre', 'Tesfaye', 'Mulugeta', 'Tadesse', 'Getachew', 'Mekonnen',
      'Solomon', 'Yohannes', 'Samuel', 'Daniel', 'Michael', 'Gabriel', 'Raphael', 'Elias',
      'Meron', 'Selamawit', 'Hirut', 'Meskarem', 'Kidan', 'Tigist', 'Birtukan', 'Roman'
    ],
    lastNames: [
      'Gebrselassie', 'Bekele', 'Dibaba', 'Tola', 'Girma', 'Kebede', 'Tadese', 'Abshero',
      'Desisa', 'Lemma', 'Berhanu', 'Kipruto', 'Kejela', 'Regasa', 'Negash', 'Wolde'
    ]
  },

  // DR Congo (French/Lingala influences)
  'DR Congo': {
    firstNames: [
      'Jean', 'Pascal', 'Dieumerci', 'Cedric', 'Yannick', 'Joel', 'Gaël', 'Herve',
      'Christian', 'Romain', 'Steve', 'Jonathan', 'Kevin', 'Jordan', 'Bryan', 'Mike',
      'Prisca', 'Gloria', 'Rachel', 'Sarah', 'Esther', 'Ruth', 'Naomi', 'Deborah'
    ],
    lastNames: [
      'Mbemba', 'Kabasele', 'Bolingi', 'Bokila', 'Muleka', 'Akolo', 'Mputu', 'Lomami',
      'Tshibola', 'Mongongu', 'Kanda', 'Mpeko', 'Zakuani', 'Mabidi', 'Kabangu', 'N\'Sakala'
    ]
  },

  // Tanzania (Swahili names)
  'Tanzania': {
    firstNames: [
      'Juma', 'Rajab', 'Ramadhani', 'Saidi', 'Hamisi', 'Hussein', 'Abdallah', 'Omar',
      'Ali', 'Hassan', 'Mohamed', 'Yahya', 'Suleiman', 'Kassim', 'Mwinyi', 'Salum',
      'Asha', 'Mwanamvua', 'Zainab', 'Fatuma', 'Halima', 'Amina', 'Neema', 'Rehema'
    ],
    lastNames: [
      'Mwinyi', 'Mkapa', 'Kikwete', 'Magufuli', 'Nyerere', 'Kawawa', 'Sokoine', 'Mrema',
      'Lowassa', 'Pinda', 'Malecela', 'Sumaye', 'Warioba', 'Slaa', 'Lipumba', 'Mungai'
    ]
  },

  // Uganda (Various ethnic groups)
  'Uganda': {
    firstNames: [
      'Moses', 'David', 'John', 'Joseph', 'James', 'Peter', 'Paul', 'Stephen',
      'Andrew', 'Thomas', 'Daniel', 'Samuel', 'Michael', 'Robert', 'Charles', 'Edward',
      'Mary', 'Grace', 'Sarah', 'Ruth', 'Esther', 'Joyce', 'Dorothy', 'Alice'
    ],
    lastNames: [
      'Museveni', 'Obote', 'Amin', 'Mutebi', 'Kiwanda', 'Kasozi', 'Lubega', 'Nsubuga',
      'Ssekandi', 'Kadaga', 'Oulanyah', 'Mbabazi', 'Besigye', 'Mao', 'Otim', 'Okello'
    ]
  },

  // Zambia (Bemba/Nyanja names)
  'Zambia': {
    firstNames: [
      'Kenneth', 'Michael', 'Levy', 'Rupiah', 'Edgar', 'Guy', 'Patrick', 'Simon',
      'Webster', 'Davies', 'Given', 'Clifford', 'Boyd', 'Chilufya', 'Mukuka', 'Chanda',
      'Esther', 'Inonge', 'Mutale', 'Chiluba', 'Nakamba', 'Lungu', 'Sata', 'Banda'
    ],
    lastNames: [
      'Kaunda', 'Chiluba', 'Mwanawasa', 'Banda', 'Sata', 'Lungu', 'Hichilema', 'Mumba',
      'M\'membe', 'Mazoka', 'Mwiinga', 'Muntanga', 'Sichone', 'Katongo', 'Sunzu', 'Kalaba'
    ]
  },

  // Zimbabwe (Shona/Ndebele names)
  'Zimbabwe': {
    firstNames: [
      'Robert', 'Morgan', 'Emmerson', 'Constantino', 'Tendai', 'Blessing', 'Knowledge',
      'Pardon', 'Innocent', 'Liberty', 'Gift', 'Lovemore', 'Tafadzwa', 'Farai', 'Kudzai',
      'Ngonidzashe', 'Rumbidzai', 'Shingai', 'Nyasha', 'Tariro', 'Ruvimbo', 'Anesu', 'Tatenda'
    ],
    lastNames: [
      'Mugabe', 'Tsvangirai', 'Mnangagwa', 'Chamisa', 'Moyo', 'Ncube', 'Nkomo', 'Muzorewa',
      'Tekere', 'Stihole', 'Mutasa', 'Mpofu', 'Ndlovu', 'Khuphe', 'Maridadi', 'Makoni'
    ]
  },

  // Mali (Bambara/French influences)
  'Mali': {
    firstNames: [
      'Moussa', 'Seydou', 'Boubacar', 'Amadou', 'Cheick', 'Modibo', 'Souleymane', 'Youssouf',
      'Drissa', 'Bakary', 'Mamadou', 'Ousmane', 'Abdoul', 'Harouna', 'Fousseyni', 'Habib',
      'Aminata', 'Kadiatou', 'Oumou', 'Fanta', 'Mariam', 'Assetou', 'Rokia', 'Téné'
    ],
    lastNames: [
      'Traoré', 'Keita', 'Coulibaly', 'Diallo', 'Sissoko', 'Diarra', 'Konaté', 'Sacko',
      'Dembélé', 'Doucouré', 'Kanté', 'Camara', 'Sangaré', 'Ba', 'Touré', 'Diakité'
    ]
  },

  // Burkina Faso (French/Mooré influences)
  'Burkina Faso': {
    firstNames: [
      'Blaise', 'Roch', 'Salif', 'Alain', 'Jean', 'Pierre', 'Paul', 'Thomas',
      'Moussa', 'Hamado', 'Toussaint', 'Prosper', 'Souleymane', 'Abdoulaye', 'Moumouni', 'Wendpouiré',
      'Aminata', 'Bintou', 'Saran', 'Pélagie', 'Safiatou', 'Kadidia', 'Ramatou', 'Mariam'
    ],
    lastNames: [
      'Compaoré', 'Kaboré', 'Zongo', 'Yaméogo', 'Sankara', 'Ouédraogo', 'Kiéma', 'Sawadogo',
      'Konaté', 'Traoré', 'Diallo', 'Barro', 'Nikiéma', 'Somé', 'Kinda', 'Pouya'
    ]
  },

  // Angola (Portuguese influences)
  'Angola': {
    firstNames: [
      'José', 'João', 'Manuel', 'António', 'Francisco', 'Paulo', 'Carlos', 'Miguel',
      'Luís', 'Fernando', 'Rui', 'Nuno', 'Ricardo', 'Sérgio', 'Bruno', 'Diogo',
      'Maria', 'Ana', 'Teresa', 'Isabel', 'Carla', 'Sofia', 'Patrícia', 'Catarina'
    ],
    lastNames: [
      'Santos', 'Fernandes', 'Silva', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins',
      'Jesus', 'Sousa', 'Gonçalves', 'Ferreira', 'Ribeiro', 'Carvalho', 'Almeida', 'Teixeira'
    ]
  }
};

// Fallback names for any country not in the list
const fallbackNames = {
  firstNames: [
    'Kwame', 'Chijioke', 'Amara', 'Zuberi', 'Nala', 'Jabari', 'Faraji', 'Liyana',
    'Kofi', 'Chiamaka', 'Tendai', 'Zola', 'Baraka', 'Nia', 'Sekou', 'Adanna',
    'Ade', 'Emeka', 'Femi', 'Oluwaseun', 'Nneka', 'Amina', 'Zainab', 'Ibrahim'
  ],
  lastNames: [
    'Diallo', 'Nkrumah', 'Mensah', 'Okoro', 'Touré', 'Kamau', 'Abebe', 'Sow',
    'Diop', 'Okafor', 'Bello', 'Keita', 'Mohammed', 'Traoré', 'Ibe', 'Oni',
    'Adeyemi', 'Nwankwo', 'Eze', 'Obi', 'Balogun', 'Suleiman', 'Okeke', 'Adebayo'
  ]
};

const positions = ['GK', 'DF', 'MD', 'AT'] as const;

// Track used names to avoid duplicates within the same squad
const usedNames = new Set<string>();

export const generatePlayerName = (country: string): string => {
  const countryData = countryNames[country] || fallbackNames;
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops
  
  while (attempts < maxAttempts) {
    const firstName = countryData.firstNames[Math.floor(Math.random() * countryData.firstNames.length)];
    const lastName = countryData.lastNames[Math.floor(Math.random() * countryData.lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    
    // Check if this name hasn't been used in the current squad
    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      return fullName;
    }
    
    attempts++;
  }
  
  // If i can't find a unique name, generate one with a random suffix
  const firstName = countryData.firstNames[Math.floor(Math.random() * countryData.firstNames.length)];
  const lastName = countryData.lastNames[Math.floor(Math.random() * countryData.lastNames.length)];
  return `${firstName} ${lastName} ${Math.floor(Math.random() * 100)}`;
};

export const generatePlayerRatings = (naturalPosition: string) => {
  const ratings: any = {};
  
  positions.forEach(pos => {
    if (pos === naturalPosition) {
      // Higher ratings for natural position (60-95)
      ratings[pos] = Math.floor(Math.random() * 36) + 60;
    } else {
      // Lower ratings for other positions (10-55)
      ratings[pos] = Math.floor(Math.random() * 46) + 10;
    }
  });
  
  return ratings;
};

export const generateSquad = (country: string): Player[] => {
  // Clear used names for new squad
  usedNames.clear();
  
  const squad: Player[] = [];
  const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
  
  // Generate 3 Goalkeepers
  for (let i = 0; i < 3; i++) {
    squad.push({
      id: `player-${uniqueId}-gk-${i}`,
      name: generatePlayerName(country),
      naturalPosition: 'GK',
      ratings: generatePlayerRatings('GK'),
      isCaptain: i === 0 && squad.length === 0
    });
  }
  
  // Generate 8 Defenders
  for (let i = 0; i < 8; i++) {
    squad.push({
      id: `player-${uniqueId}-df-${i}`,
      name: generatePlayerName(country),
      naturalPosition: 'DF',
      ratings: generatePlayerRatings('DF'),
      isCaptain: i === 0 && squad.length === 0
    });
  }
  
  // Generate 8 Midfielders
  for (let i = 0; i < 8; i++) {
    squad.push({
      id: `player-${uniqueId}-md-${i}`,
      name: generatePlayerName(country),
      naturalPosition: 'MD',
      ratings: generatePlayerRatings('MD'),
      isCaptain: i === 0 && squad.length === 0
    });
  }
  
  // Generate 4 Attackers
  for (let i = 0; i < 4; i++) {
    squad.push({
      id: `player-${uniqueId}-at-${i}`,
      name: generatePlayerName(country),
      naturalPosition: 'AT',
      ratings: generatePlayerRatings('AT'),
      isCaptain: i === 0 && squad.length === 0
    });
  }
  
  // Set captain - choose from key positions (not goalkeepers)
  const potentialCaptains = squad.filter(player => player.naturalPosition !== 'GK');
  if (potentialCaptains.length > 0 && !squad.find(p => p.isCaptain)) {
    const captain = potentialCaptains[Math.floor(Math.random() * potentialCaptains.length)];
    captain.isCaptain = true;
  }
  
  return squad;
};

export const calculateTeamRating = (squad: Player[]): number => {
  const totalRating = squad.reduce((sum, player) => {
    return sum + player.ratings[player.naturalPosition];
  }, 0);
  
  return Math.round(totalRating / squad.length);
};