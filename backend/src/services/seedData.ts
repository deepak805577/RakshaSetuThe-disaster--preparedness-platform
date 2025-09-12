import DisasterModule from '../models/DisasterModule';
import Badge from '../models/Badge';
import EmergencyContact from '../models/EmergencyContact';
import User from '../models/User';

export const seedEarthquakeModule = async () => {
  try {
    // Check if earthquake module already exists
    const existingModule = await DisasterModule.findOne({ 
      title: 'Earthquake Preparedness for Punjab Schools' 
    });
    
    if (existingModule) {
      console.log('Earthquake module already exists');
      return existingModule;
    }

    const earthquakeModule = await DisasterModule.create({
      title: 'Earthquake Preparedness for Punjab Schools',
      description: 'Learn essential earthquake safety measures, preparedness strategies, and emergency response procedures specifically designed for Punjab region.',
      type: 'earthquake',
      difficulty: 'beginner',
      content: {
        introduction: `Punjab, located in a seismically active region, is prone to earthquakes. The state lies in seismic zones II to IV, with areas near the Himalayan foothills facing higher risk. Understanding earthquake preparedness is crucial for students, teachers, and families in Punjab to ensure safety during seismic events.`,
        
        keyPoints: [
          'Punjab is located in seismic zones II to IV, making earthquake preparedness essential',
          'Most injuries during earthquakes are caused by falling objects, not the ground shaking itself',
          'The "Drop, Cover, and Hold On" technique is the internationally recommended response during earthquakes',
          'Having an emergency kit and family communication plan is vital for post-earthquake survival',
          'Schools and homes should have clearly marked safe spots and evacuation routes'
        ],
        
        preventionMeasures: [
          'Secure heavy furniture and appliances to walls using safety straps',
          'Keep emergency kits in accessible locations with water, food, first aid supplies, and flashlights',
          'Create and practice a family emergency plan with meeting points',
          'Learn the location of gas, water, and electricity shut-offs in your building',
          'Ensure buildings follow earthquake-resistant construction guidelines',
          'Participate in regular earthquake drills at school and home',
          'Keep important documents in waterproof containers'
        ],
        
        duringDisaster: [
          'DROP to hands and knees immediately when you feel shaking',
          'Take COVER under a sturdy desk, table, or against an interior wall',
          'HOLD ON to your shelter and protect your head and neck with your arms',
          'Stay where you are until shaking stops - do not run outside during shaking',
          'If outdoors, move away from buildings, trees, and power lines',
          'If in a vehicle, stop safely and stay inside until shaking stops',
          'If in bed, stay there and cover your head with a pillow'
        ],
        
        afterDisaster: [
          'Check yourself and others for injuries and provide first aid if needed',
          'Inspect your surroundings for hazards like gas leaks, electrical damage, or structural damage',
          'Use stairs, never elevators, when evacuating multi-story buildings',
          'Stay out of damaged buildings and watch for aftershocks',
          'Listen to emergency broadcasts on radio for official information',
          'Contact family and friends to let them know you are safe',
          'Avoid using telephone except for emergencies to keep lines open',
          'Take photos of damage for insurance purposes',
          'Cooperate with public safety officials and follow their instructions'
        ],
        
        images: [
          '/images/punjab-seismic-map.jpg',
          '/images/drop-cover-hold.jpg',
          '/images/emergency-kit.jpg'
        ],
        
        videos: [
          {
            id: 'eq_intro',
            title: 'Understanding Earthquakes in Punjab',
            description: 'Learn about seismic zones and earthquake basics in Punjab region',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnail: '/images/thumbnails/earthquake-intro.jpg',
            duration: 180,
            section: 'introduction'
          },
          {
            id: 'eq_drop_cover_hold',
            title: 'Drop, Cover, and Hold On Technique',
            description: 'Animated demonstration of the proper earthquake response technique',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
            thumbnail: '/images/thumbnails/drop-cover-hold.jpg',
            duration: 120,
            section: 'duringDisaster'
          },
          {
            id: 'eq_school_evacuation',
            title: 'School Evacuation Procedures',
            description: 'Step-by-step guide for safe school evacuation during earthquakes',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_3mb.mp4',
            thumbnail: '/images/thumbnails/school-evacuation.jpg',
            duration: 240,
            section: 'duringDisaster'
          },
          {
            id: 'eq_emergency_kit',
            title: 'Building Your Emergency Kit',
            description: 'Essential items for earthquake preparedness and family emergency planning',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_4mb.mp4',
            thumbnail: '/images/thumbnails/emergency-kit.jpg',
            duration: 210,
            section: 'preventionMeasures'
          },
          {
            id: 'eq_after_earthquake',
            title: 'What to Do After an Earthquake',
            description: 'Post-earthquake safety checks and recovery procedures',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
            thumbnail: '/images/thumbnails/after-earthquake.jpg',
            duration: 195,
            section: 'afterDisaster'
          },
          {
            id: 'eq_punjab_specific',
            title: 'Punjab-Specific Earthquake Risks',
            description: 'Understanding earthquake risks in different districts of Punjab',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_6mb.mp4',
            thumbnail: '/images/thumbnails/punjab-seismic.jpg',
            duration: 150,
            section: 'introduction'
          }
        ]
      },
      
      quiz: {
        passingScore: 70,
        timeLimit: 15,
        questions: [
          {
            id: 'eq_q1',
            question: 'What seismic zones does Punjab fall into?',
            options: [
              'Zones I to III',
              'Zones II to IV', 
              'Zones III to V',
              'Zone IV only'
            ],
            correctAnswer: 1,
            explanation: 'Punjab is located in seismic zones II to IV, with areas near the Himalayan foothills in higher risk zones.',
            points: 10
          },
          {
            id: 'eq_q2',
            question: 'What is the correct earthquake response technique?',
            options: [
              'Run outside immediately',
              'Stand in a doorway',
              'Drop, Cover, and Hold On',
              'Hide under stairs'
            ],
            correctAnswer: 2,
            explanation: 'Drop, Cover, and Hold On is the internationally recommended technique for earthquake safety.',
            points: 15
          },
          {
            id: 'eq_q3',
            question: 'During an earthquake, what causes most injuries?',
            options: [
              'Ground shaking',
              'Building collapse',
              'Falling objects',
              'Panic running'
            ],
            correctAnswer: 2,
            explanation: 'Most earthquake injuries are caused by falling objects like furniture, fixtures, and debris.',
            points: 10
          },
          {
            id: 'eq_q4',
            question: 'What should you do immediately after an earthquake stops?',
            options: [
              'Run outside as fast as possible',
              'Check for injuries and hazards',
              'Turn on all electrical appliances',
              'Call everyone you know'
            ],
            correctAnswer: 1,
            explanation: 'After an earthquake, first check for injuries and immediate hazards before taking any other action.',
            points: 15
          },
          {
            id: 'eq_q5',
            question: 'Which districts in Punjab are at higher earthquake risk?',
            options: [
              'Southern districts only',
              'Central districts only', 
              'Northern districts near Himalayas',
              'All districts have equal risk'
            ],
            correctAnswer: 2,
            explanation: 'Northern districts of Punjab near the Himalayan foothills are at higher seismic risk due to their proximity to active fault lines.',
            points: 10
          },
          {
            id: 'eq_q6',
            question: 'What should an emergency kit contain?',
            options: [
              'Only water and food',
              'Water, food, first aid, flashlight, radio',
              'Just a flashlight',
              'Only important documents'
            ],
            correctAnswer: 1,
            explanation: 'A comprehensive emergency kit should include water, food, first aid supplies, flashlight, battery radio, and other essential items.',
            points: 15
          },
          {
            id: 'eq_q7',
            question: 'If you are in bed during an earthquake, what should you do?',
            options: [
              'Jump out immediately',
              'Stay in bed and cover head with pillow',
              'Run to the bathroom',
              'Hide under the bed'
            ],
            correctAnswer: 1,
            explanation: 'If in bed during an earthquake, stay there and protect your head with a pillow as beds provide some protection.',
            points: 10
          },
          {
            id: 'eq_q8',
            question: 'How often should schools conduct earthquake drills?',
            options: [
              'Once a year',
              'Only when earthquakes are predicted',
              'Regularly throughout the year',
              'Never - they cause panic'
            ],
            correctAnswer: 2,
            explanation: 'Regular earthquake drills throughout the year help students and staff develop muscle memory for proper response.',
            points: 15
          }
        ]
      }
    });

    console.log('✅ Earthquake preparedness module created successfully');
    return earthquakeModule;
    
  } catch (error) {
    console.error('Error creating earthquake module:', error);
    throw error;
  }
};

export const seedBadges = async () => {
  try {
    console.log('🏆 Seeding gamification badges...');
    
    const badges = [
      {
        name: 'First Steps',
        description: 'Complete your first disaster preparedness module',
        icon: '🎯',
        criteria: 'Complete 1 module',
        points: 50,
        rarity: 'common'
      },
      {
        name: 'Knowledge Seeker',
        description: 'Complete 3 disaster preparedness modules',
        icon: '📚',
        criteria: 'Complete 3 modules',
        points: 150,
        rarity: 'common'
      },
      {
        name: 'Disaster Expert',
        description: 'Complete 5 disaster preparedness modules',
        icon: '🛡️',
        criteria: 'Complete 5 modules',
        points: 300,
        rarity: 'rare'
      },
      {
        name: 'Perfect Score',
        description: 'Achieve a perfect 100% score on any quiz',
        icon: '⭐',
        criteria: 'Score 100% on a quiz',
        points: 200,
        rarity: 'rare'
      },
      {
        name: 'Consistent Learner',
        description: 'Maintain 85%+ average across 3+ modules',
        icon: '📈',
        criteria: 'Average 85%+ on 3+ modules',
        points: 250,
        rarity: 'epic'
      },
      {
        name: 'Speed Learner',
        description: 'Complete a module in under 10 minutes',
        icon: '⚡',
        criteria: 'Complete module in <10 minutes',
        points: 100,
        rarity: 'common'
      },
      {
        name: 'Master',
        description: 'Earn 500+ points with 90%+ average',
        icon: '👑',
        criteria: '500+ points, 90%+ average',
        points: 500,
        rarity: 'epic'
      },
      {
        name: 'Champion',
        description: 'Reach 1000 total points',
        icon: '🏆',
        criteria: 'Earn 1000+ points',
        points: 1000,
        rarity: 'legendary'
      }
    ];

    for (const badgeData of badges) {
      const existingBadge = await Badge.findOne({ name: badgeData.name });
      if (!existingBadge) {
        await Badge.create(badgeData);
        console.log(`✅ Badge created: ${badgeData.name}`);
      }
    }
    
    console.log('✅ All badges seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
  }
};

export const seedEmergencyContacts = async () => {
  try {
    console.log('📦 Seeding emergency contacts for Punjab districts...');
    
    const emergencyContacts = [
      // Ludhiana District
      { name: 'Ludhiana Police Control Room', designation: 'Control Room Officer', phone: '9876543210', email: 'control@ludhianapolice.gov.in', district: 'Ludhiana', type: 'police' },
      { name: 'Ludhiana Fire Station', designation: 'Fire Officer', phone: '9876543211', district: 'Ludhiana', type: 'fire' },
      { name: 'CMC Hospital Emergency', designation: 'Emergency Doctor', phone: '9876543212', district: 'Ludhiana', type: 'medical' },
      { name: 'District Collector Office', designation: 'Disaster Management Officer', phone: '9876543213', district: 'Ludhiana', type: 'disaster_management' },
      
      // Amritsar District
      { name: 'Amritsar Police HQ', designation: 'Senior Superintendent', phone: '9876543220', district: 'Amritsar', type: 'police' },
      { name: 'Amritsar Fire Department', designation: 'Chief Fire Officer', phone: '9876543221', district: 'Amritsar', type: 'fire' },
      { name: 'AIIMS Bathinda Emergency', designation: 'Emergency Coordinator', phone: '9876543222', district: 'Amritsar', type: 'medical' },
      { name: 'Amritsar DC Office', designation: 'ADC Emergency', phone: '9876543223', district: 'Amritsar', type: 'disaster_management' },
      
      // Jalandhar District
      { name: 'Jalandhar City Police', designation: 'DSP Control', phone: '9876543230', district: 'Jalandhar', type: 'police' },
      { name: 'Jalandhar Fire Station', designation: 'Station Officer', phone: '9876543231', district: 'Jalandhar', type: 'fire' },
      { name: 'Jalandhar Civil Hospital', designation: 'Medical Superintendent', phone: '9876543232', district: 'Jalandhar', type: 'medical' },
      
      // Patiala District
      { name: 'Patiala Police Control', designation: 'Control Room', phone: '9876543240', district: 'Patiala', type: 'police' },
      { name: 'Patiala Fire Services', designation: 'Fire Controller', phone: '9876543241', district: 'Patiala', type: 'fire' },
      { name: 'Government Medical College', designation: 'Emergency Ward', phone: '9876543242', district: 'Patiala', type: 'medical' },
      
      // Bathinda District
      { name: 'Bathinda Police Station', designation: 'SHO', phone: '9876543250', district: 'Bathinda', type: 'police' },
      { name: 'Bathinda Fire Station', designation: 'Fire Officer', phone: '9876543251', district: 'Bathinda', type: 'fire' },
      { name: 'Bathinda District Hospital', designation: 'Emergency Doctor', phone: '9876543252', district: 'Bathinda', type: 'medical' },
      
      // Mohali District
      { name: 'Mohali Police Control', designation: 'Control Officer', phone: '9876543260', district: 'Mohali', type: 'police' },
      { name: 'Mohali Fire Department', designation: 'Fire Commander', phone: '9876543261', district: 'Mohali', type: 'fire' },
      { name: 'PGI Chandigarh Emergency', designation: 'Emergency Services', phone: '9876543262', district: 'Mohali', type: 'medical' },
      { name: 'Mohali Disaster Management', designation: 'DM Officer', phone: '9876543263', district: 'Mohali', type: 'disaster_management' },
      
      // School Admin Contacts
      { name: 'Punjab School Education Board', designation: 'Emergency Coordinator', phone: '9876543270', email: 'emergency@pseb.ac.in', district: 'Mohali', type: 'school_admin' },
      { name: 'District Education Officer Ludhiana', designation: 'DEO', phone: '9876543271', district: 'Ludhiana', type: 'school_admin' },
      { name: 'District Education Officer Amritsar', designation: 'DEO', phone: '9876543272', district: 'Amritsar', type: 'school_admin' }
    ];

    for (const contactData of emergencyContacts) {
      const existingContact = await EmergencyContact.findOne({ 
        phone: contactData.phone 
      });
      
      if (!existingContact) {
        await EmergencyContact.create(contactData);
        console.log(`✅ Emergency contact created: ${contactData.name}`);
      }
    }
    
    console.log('✅ All emergency contacts seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding emergency contacts:', error);
  }
};

export const seedDemoUsers = async () => {
  try {
    console.log('👥 Seeding demo users...');
    
    const demoUsers = [
      {
        name: 'Admin Demo',
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'admin',
        phone: '9876543210',
        school: 'Punjab Education Board',
        profile: {
          district: 'Mohali',
          emergencyContact: '9876543211'
        }
      },
      {
        name: 'Teacher Demo',
        email: 'teacher@demo.com',
        password: 'teacher123',
        role: 'teacher',
        phone: '9876543220',
        school: 'Government Senior Secondary School, Ludhiana',
        profile: {
          district: 'Ludhiana',
          emergencyContact: '9876543221'
        }
      },
      {
        name: 'Student Demo',
        email: 'student@demo.com',
        password: 'student123',
        role: 'student',
        phone: '9876543230',
        school: 'Government Senior Secondary School, Ludhiana',
        grade: 10,
        profile: {
          district: 'Ludhiana',
          emergencyContact: '9876543231'
        }
      },
      {
        name: 'Parent Demo',
        email: 'parent@demo.com',
        password: 'parent123',
        role: 'parent',
        phone: '9876543240',
        school: 'Government Senior Secondary School, Amritsar',
        profile: {
          district: 'Amritsar',
          emergencyContact: '9876543241'
        }
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Demo user created: ${userData.name} (${userData.email})`);
      } else {
        console.log(`ℹ️  Demo user already exists: ${userData.email}`);
      }
    }
    
    console.log('✅ All demo users seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
  }
};

export const seedFloodModule = async () => {
  try {
    const existingModule = await DisasterModule.findOne({ 
      title: 'Flood Safety for Punjab Schools' 
    });
    
    if (existingModule) {
      console.log('Flood module already exists');
      return existingModule;
    }

    const floodModule = await DisasterModule.create({
      title: 'Flood Safety for Punjab Schools',
      description: 'Learn flood safety measures, preparation strategies, and emergency response procedures for Punjab\'s monsoon and river flood risks.',
      type: 'flood',
      difficulty: 'beginner',
      content: {
        introduction: 'Punjab experiences seasonal flooding due to monsoon rains and river overflow, particularly from the Sutlej, Beas, and Ravi rivers. Understanding flood safety is crucial for all residents, especially in flood-prone areas.',
        
        keyPoints: [
          'Punjab\'s major rivers can cause flooding during monsoon season (July-September)',
          'Flash floods can occur within minutes, while river floods develop over hours or days',
          'Just 6 inches of fast-moving water can knock you down; 12 inches can carry away a vehicle',
          'Avoid walking or driving through flooded areas - "Turn Around, Don\'t Drown"',
          'Have an evacuation plan and emergency kit ready before flood season'
        ],
        
        preventionMeasures: [
          'Know your area\'s flood risk and evacuation routes',
          'Keep emergency supplies in a waterproof container',
          'Install sump pumps and backup power in flood-prone areas',
          'Create a family communication plan with out-of-area contacts',
          'Sign up for local weather and flood alerts',
          'Practice evacuation procedures with family and school',
          'Keep important documents in waterproof containers'
        ],
        
        duringDisaster: [
          'Move to higher ground immediately when flooding begins',
          'Never walk, swim, or drive through flood waters',
          'If trapped in a building, go to the highest level',
          'If trapped in a car, abandon it and move to higher ground',
          'Stay away from downed power lines and electrical wires',
          'Listen to emergency broadcasts for evacuation orders',
          'Call for help only if life is in immediate danger'
        ],
        
        afterDisaster: [
          'Wait for authorities to declare areas safe before returning',
          'Avoid walking in moving water and standing water',
          'Check for structural damage before entering buildings',
          'Do not use electrical appliances that have been wet',
          'Throw away food that has come into contact with flood water',
          'Clean and disinfect everything that got wet',
          'Take photos of damage for insurance claims',
          'Seek medical attention for any injuries or illnesses'
        ],
        
        images: [
          '/images/punjab-flood-map.jpg',
          '/images/flood-safety-signs.jpg',
          '/images/flood-evacuation.jpg'
        ],
        
        videos: [
          {
            id: 'flood_intro',
            title: 'Understanding Floods in Punjab',
            description: 'Learn about monsoon patterns and river flood risks in Punjab',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail: '/images/thumbnails/flood-intro.jpg',
            duration: 200,
            section: 'introduction'
          },
          {
            id: 'flood_evacuation',
            title: 'Safe Evacuation During Floods',
            description: 'Step-by-step evacuation procedures for schools and homes',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            thumbnail: '/images/thumbnails/flood-evacuation.jpg',
            duration: 180,
            section: 'duringDisaster'
          },
          {
            id: 'flood_water_safety',
            title: 'Water Safety During Floods',
            description: 'Understanding the dangers of flood water and how to stay safe',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            thumbnail: '/images/thumbnails/water-safety.jpg',
            duration: 150,
            section: 'duringDisaster'
          }
        ]
      },
      
      quiz: {
        passingScore: 70,
        timeLimit: 12,
        questions: [
          {
            id: 'flood_q1',
            question: 'How much fast-moving water can knock down an adult?',
            options: ['2 inches', '6 inches', '12 inches', '18 inches'],
            correctAnswer: 1,
            explanation: '6 inches of fast-moving water can knock down an adult.',
            points: 10
          },
          {
            id: 'flood_q2',
            question: 'What should you do if trapped in a car during a flood?',
            options: ['Stay in the car', 'Try to drive through', 'Abandon the car and move to higher ground', 'Wait for rescue'],
            correctAnswer: 2,
            explanation: 'Abandon the car and move to higher ground immediately.',
            points: 15
          }
        ]
      }
    });

    console.log('✅ Flood preparedness module created successfully');
    return floodModule;
    
  } catch (error) {
    console.error('Error creating flood module:', error);
    throw error;
  }
};

export const seedFireModule = async () => {
  try {
    const existingModule = await DisasterModule.findOne({ 
      title: 'Fire Safety for Punjab Schools' 
    });
    
    if (existingModule) {
      console.log('Fire module already exists');
      return existingModule;
    }

    const fireModule = await DisasterModule.create({
      title: 'Fire Safety for Punjab Schools',
      description: 'Comprehensive fire safety education covering prevention, evacuation, and emergency response for schools and homes.',
      type: 'fire',
      difficulty: 'beginner',
      content: {
        introduction: 'Fire safety is crucial for protecting lives and property. In Punjab schools and homes, understanding fire prevention, detection, and evacuation can save lives during fire emergencies.',
        
        keyPoints: [
          'Most fire-related deaths are caused by smoke inhalation, not burns',
          'You may have as little as 2 minutes to escape a house fire',
          'Smoke rises, so stay low to the ground during evacuation',
          'Never re-enter a burning building for any reason',
          'Have working smoke detectors and check batteries regularly'
        ],
        
        preventionMeasures: [
          'Install smoke detectors in every room and test monthly',
          'Create and practice a fire escape plan with two exits from each room',
          'Keep fire extinguishers in key areas and know how to use them',
          'Store flammable materials safely away from heat sources',
          'Maintain electrical systems and avoid overloading circuits',
          'Never leave cooking unattended',
          'Establish a family meeting point outside the home'
        ],
        
        duringDisaster: [
          'Alert others by shouting "FIRE!" and activating fire alarms',
          'Evacuate immediately using the nearest safe exit',
          'Stay low to avoid smoke - crawl if necessary',
          'Feel doors with the back of your hand before opening',
          'If clothes catch fire: Stop, Drop, and Roll',
          'Once outside, go to your meeting point and call 101',
          'Never use elevators during a fire emergency'
        ],
        
        afterDisaster: [
          'Do not re-enter the building until fire officials say it\'s safe',
          'Contact family members and let them know you\'re safe',
          'Seek medical attention for any burns or smoke inhalation',
          'Contact insurance company to report the fire',
          'Take photos of damage for insurance claims',
          'Find temporary shelter if your home is damaged',
          'Keep receipts for any expenses related to the fire'
        ],
        
        images: [
          '/images/fire-escape-plan.jpg',
          '/images/smoke-detector.jpg',
          '/images/stop-drop-roll.jpg'
        ],
        
        videos: [
          {
            id: 'fire_prevention',
            title: 'Fire Prevention in Schools and Homes',
            description: 'Learn how to prevent fires before they start',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            thumbnail: '/images/thumbnails/fire-prevention.jpg',
            duration: 240,
            section: 'preventionMeasures'
          },
          {
            id: 'fire_evacuation',
            title: 'School Fire Evacuation Procedures',
            description: 'Safe and orderly evacuation during fire emergencies',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            thumbnail: '/images/thumbnails/fire-evacuation.jpg',
            duration: 200,
            section: 'duringDisaster'
          },
          {
            id: 'stop_drop_roll',
            title: 'Stop, Drop, and Roll Technique',
            description: 'What to do if your clothes catch fire',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            thumbnail: '/images/thumbnails/stop-drop-roll.jpg',
            duration: 90,
            section: 'duringDisaster'
          }
        ]
      },
      
      quiz: {
        passingScore: 75,
        timeLimit: 15,
        questions: [
          {
            id: 'fire_q1',
            question: 'How much time might you have to escape a house fire?',
            options: ['30 seconds', '2 minutes', '5 minutes', '10 minutes'],
            correctAnswer: 1,
            explanation: 'You may have as little as 2 minutes to escape a house fire.',
            points: 10
          },
          {
            id: 'fire_q2',
            question: 'What should you do if your clothes catch fire?',
            options: ['Run for help', 'Stop, Drop, and Roll', 'Pour water on yourself', 'Remove clothing quickly'],
            correctAnswer: 1,
            explanation: 'Stop, Drop, and Roll to smother the flames.',
            points: 15
          }
        ]
      }
    });

    console.log('✅ Fire safety module created successfully');
    return fireModule;
    
  } catch (error) {
    console.error('Error creating fire module:', error);
    throw error;
  }
};

export const clearExistingModules = async () => {
  try {
    console.log('🗑️  Clearing existing modules...');
    await DisasterModule.deleteMany({});
    console.log('✅ Existing modules cleared');
  } catch (error) {
    console.error('❌ Error clearing modules:', error);
  }
};

export const seedCycloneModule = async () => {
  try {
    const existingModule = await DisasterModule.findOne({ 
      title: 'Cyclone Preparedness for Punjab' 
    });
    
    if (existingModule) {
      console.log('Cyclone module already exists');
      return existingModule;
    }

    const cycloneModule = await DisasterModule.create({
      title: 'Cyclone Preparedness for Punjab',
      description: 'Learn about cyclone safety, preparation strategies, and emergency response procedures for severe weather events affecting Punjab.',
      type: 'cyclone',
      difficulty: 'intermediate',
      content: {
        introduction: 'While Punjab is not directly on the coast, it can be affected by severe cyclonic weather systems that bring heavy rains, strong winds, and flooding. Understanding cyclone preparedness helps protect lives and property.',
        
        keyPoints: [
          'Cyclonic storms can bring winds over 100 km/h and torrential rains to Punjab',
          'Storm surge is not a concern, but heavy rainfall and flooding are major risks',
          'Power outages and communication disruptions are common during cyclones',
          'Mobile homes and temporary structures are particularly vulnerable',
          'Advance warning systems give 48-72 hours notice for preparation'
        ],
        
        preventionMeasures: [
          'Monitor weather forecasts and cyclone tracking during monsoon season',
          'Secure outdoor furniture, signs, and loose objects that could become projectiles',
          'Trim trees and remove dead branches near buildings',
          'Install storm shutters or board up windows with plywood',
          'Stock up on emergency supplies including water, food, medications, and batteries',
          'Charge all electronic devices and have backup power sources',
          'Know your evacuation zone and routes to higher ground'
        ],
        
        duringDisaster: [
          'Stay indoors and away from windows during the storm',
          'If flooding occurs, move to the highest floor of your building',
          'Avoid using electrical appliances during heavy rain and lightning',
          'Do not go outside during the eye of the storm - winds will return',
          'Listen to battery-powered radio for emergency updates',
          'If you must evacuate, do so before conditions become dangerous',
          'Stay in a small interior room on the lowest floor if winds are severe'
        ],
        
        afterDisaster: [
          'Wait for officials to declare the all-clear before going outside',
          'Watch for fallen power lines, broken glass, and debris',
          'Check on neighbors, especially elderly and disabled residents',
          'Document damage with photos for insurance claims',
          'Report power outages and downed lines to utilities',
          'Boil water if advised by authorities due to contamination',
          'Be patient - restoration of services may take several days'
        ],
        
        images: [
          '/images/cyclone-tracking.jpg',
          '/images/storm-damage.jpg',
          '/images/emergency-supplies.jpg'
        ],
        
        videos: [
          {
            id: 'cyclone_intro',
            title: 'Understanding Cyclonic Weather in Punjab',
            description: 'How cyclonic systems affect inland areas like Punjab',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            thumbnail: '/images/thumbnails/cyclone-intro.jpg',
            duration: 220,
            section: 'introduction'
          },
          {
            id: 'cyclone_prep',
            title: 'Preparing Your Home for Cyclonic Weather',
            description: 'Steps to secure your property before a storm hits',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            thumbnail: '/images/thumbnails/storm-prep.jpg',
            duration: 180,
            section: 'preventionMeasures'
          }
        ]
      },
      
      quiz: {
        passingScore: 75,
        timeLimit: 12,
        questions: [
          {
            id: 'cyclone_q1',
            question: 'What is the primary danger from cyclonic weather in Punjab?',
            options: ['Storm surge', 'Heavy rainfall and flooding', 'Tornadoes', 'Hail'],
            correctAnswer: 1,
            explanation: 'Punjab\'s main risk from cyclonic weather is heavy rainfall leading to flooding.',
            points: 15
          },
          {
            id: 'cyclone_q2',
            question: 'When should you evacuate during a cyclone warning?',
            options: ['During the storm', 'After the storm passes', 'Before dangerous conditions arrive', 'Never evacuate'],
            correctAnswer: 2,
            explanation: 'Evacuation should be completed before dangerous weather conditions arrive.',
            points: 15
          }
        ]
      }
    });

    console.log('✅ Cyclone preparedness module created successfully');
    return cycloneModule;
    
  } catch (error) {
    console.error('Error creating cyclone module:', error);
    throw error;
  }
};

export const seedHeatwaveModule = async () => {
  try {
    const existingModule = await DisasterModule.findOne({ 
      title: 'Heatwave Safety for Punjab' 
    });
    
    if (existingModule) {
      console.log('Heatwave module already exists');
      return existingModule;
    }

    const heatwaveModule = await DisasterModule.create({
      title: 'Heatwave Safety for Punjab',
      description: 'Learn how to stay safe during extreme heat conditions common in Punjab during summer months (April-June).',
      type: 'heatwave',
      difficulty: 'beginner',
      content: {
        introduction: 'Punjab experiences severe heatwaves with temperatures often exceeding 45°C (113°F) during summer. Extreme heat can cause serious health problems and even death. Knowing how to stay cool and recognize heat-related illnesses is essential.',
        
        keyPoints: [
          'Punjab temperatures can reach 48°C (118°F) during peak summer months',
          'Heat-related illnesses include heat exhaustion, heat cramps, and heat stroke',
          'Children, elderly, and people with chronic conditions are most vulnerable',
          'Even healthy adults can suffer from heat-related problems during extreme heat',
          'Most heat-related deaths are preventable with proper precautions'
        ],
        
        preventionMeasures: [
          'Stay indoors during hottest parts of day (10 AM - 4 PM)',
          'Drink plenty of water throughout the day, even if not thirsty',
          'Wear loose-fitting, light-colored, lightweight clothing',
          'Use fans, air conditioning, or visit public cooling centers',
          'Never leave children or pets in parked vehicles',
          'Schedule outdoor activities for early morning or evening',
          'Take frequent breaks in shade if you must be outside'
        ],
        
        duringDisaster: [
          'Move to the coolest room in your home or a public cooling center',
          'Drink cool water regularly - avoid alcohol and caffeine',
          'Take cool showers or baths to lower body temperature',
          'Use damp towels on neck, wrists, and ankles to cool down',
          'Limit outdoor activities and stay in shade when possible',
          'Watch for signs of heat exhaustion: dizziness, nausea, headache',
          'Call for medical help if someone shows signs of heat stroke'
        ],
        
        afterDisaster: [
          'Continue to monitor yourself and others for heat-related illness symptoms',
          'Gradually return to normal activities as temperatures cool',
          'Check on elderly neighbors and relatives who may need assistance',
          'Ensure air conditioning systems are working for future heatwaves',
          'Restock emergency supplies used during the heatwave',
          'Review and improve your heat emergency plan',
          'Stay hydrated as your body recovers from heat stress'
        ],
        
        images: [
          '/images/heatwave-safety.jpg',
          '/images/cooling-techniques.jpg',
          '/images/heat-illness-signs.jpg'
        ],
        
        videos: [
          {
            id: 'heat_safety',
            title: 'Staying Safe During Punjab Heatwaves',
            description: 'Essential tips for surviving extreme heat in Punjab',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
            thumbnail: '/images/thumbnails/heat-safety.jpg',
            duration: 190,
            section: 'preventionMeasures'
          },
          {
            id: 'heat_illness',
            title: 'Recognizing Heat-Related Illnesses',
            description: 'Signs, symptoms, and treatment of heat exhaustion and heat stroke',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            thumbnail: '/images/thumbnails/heat-illness.jpg',
            duration: 160,
            section: 'duringDisaster'
          }
        ]
      },
      
      quiz: {
        passingScore: 70,
        timeLimit: 10,
        questions: [
          {
            id: 'heat_q1',
            question: 'What temperature can Punjab reach during peak summer?',
            options: ['40°C', '45°C', '48°C', '50°C'],
            correctAnswer: 2,
            explanation: 'Punjab can reach temperatures of 48°C (118°F) during peak summer.',
            points: 10
          },
          {
            id: 'heat_q2',
            question: 'What are the hottest hours of the day to avoid?',
            options: ['8 AM - 12 PM', '10 AM - 4 PM', '12 PM - 6 PM', '2 PM - 8 PM'],
            correctAnswer: 1,
            explanation: '10 AM to 4 PM are typically the hottest and most dangerous hours.',
            points: 15
          }
        ]
      }
    });

    console.log('✅ Heatwave safety module created successfully');
    return heatwaveModule;
    
  } catch (error) {
    console.error('Error creating heatwave module:', error);
    throw error;
  }
};

export const seedDroughtModule = async () => {
  try {
    const existingModule = await DisasterModule.findOne({ 
      title: 'Drought Preparedness for Punjab Farmers' 
    });
    
    if (existingModule) {
      console.log('Drought module already exists');
      return existingModule;
    }

    const droughtModule = await DisasterModule.create({
      title: 'Drought Preparedness for Punjab Farmers',
      description: 'Understanding drought impacts on Punjab agriculture and water resources, with strategies for conservation and adaptation.',
      type: 'drought',
      difficulty: 'intermediate',
      content: {
        introduction: 'Drought significantly impacts Punjab\'s agriculture-dependent economy. Understanding water conservation, crop selection, and drought mitigation helps farmers and communities prepare for water scarcity periods.',
        
        keyPoints: [
          'Punjab relies heavily on groundwater and monsoon rains for agriculture',
          'Drought can last for months or years, requiring long-term adaptation',
          'Water conservation techniques can reduce drought impact',
          'Crop selection and timing adjustments help manage drought risk',
          'Community cooperation is essential for effective drought response'
        ],
        
        preventionMeasures: [
          'Install rainwater harvesting systems to collect and store monsoon water',
          'Use drip irrigation and micro-sprinkler systems for efficient watering',
          'Plant drought-resistant crops and varieties suited to local conditions',
          'Mulch around plants to reduce evaporation and retain soil moisture',
          'Create community water storage and sharing systems',
          'Monitor groundwater levels and use water sustainably',
          'Develop alternative income sources beyond rain-dependent farming'
        ],
        
        duringDisaster: [
          'Prioritize water use for drinking, cooking, and essential hygiene',
          'Share water resources fairly within the community',
          'Reduce non-essential water usage like car washing and lawn watering',
          'Focus on saving the most valuable crops and livestock',
          'Seek government assistance and drought relief programs',
          'Cooperate with water rationing and conservation measures',
          'Monitor family and livestock health for dehydration signs'
        ],
        
        afterDisaster: [
          'Assess crop and livestock losses for insurance and aid claims',
          'Rebuild soil health with organic matter and cover crops',
          'Repair and improve water conservation infrastructure',
          'Plan for future droughts by diversifying crops and income',
          'Participate in community drought preparedness planning',
          'Apply for government recovery assistance and loans',
          'Share lessons learned with other farmers and community members'
        ],
        
        images: [
          '/images/drought-crops.jpg',
          '/images/water-conservation.jpg',
          '/images/rainwater-harvesting.jpg'
        ],
        
        videos: [
          {
            id: 'drought_farming',
            title: 'Drought-Resistant Farming in Punjab',
            description: 'Sustainable farming practices for water-scarce conditions',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            thumbnail: '/images/thumbnails/drought-farming.jpg',
            duration: 280,
            section: 'preventionMeasures'
          },
          {
            id: 'water_conservation',
            title: 'Water Conservation Techniques',
            description: 'Efficient irrigation and water management strategies',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnail: '/images/thumbnails/water-conservation.jpg',
            duration: 240,
            section: 'preventionMeasures'
          }
        ]
      },
      
      quiz: {
        passingScore: 75,
        timeLimit: 15,
        questions: [
          {
            id: 'drought_q1',
            question: 'What is the most efficient irrigation method during drought?',
            options: ['Flood irrigation', 'Sprinkler irrigation', 'Drip irrigation', 'Channel irrigation'],
            correctAnswer: 2,
            explanation: 'Drip irrigation delivers water directly to plant roots with minimal waste.',
            points: 15
          },
          {
            id: 'drought_q2',
            question: 'What should be the priority for water use during drought?',
            options: ['Irrigation', 'Drinking and essential needs', 'Cleaning', 'Recreation'],
            correctAnswer: 1,
            explanation: 'Drinking water and essential human needs must be prioritized during drought.',
            points: 15
          }
        ]
      }
    });

    console.log('✅ Drought preparedness module created successfully');
    return droughtModule;
    
  } catch (error) {
    console.error('Error creating drought module:', error);
    throw error;
  }
};

export const seedAllModules = async () => {
  try {
    console.log('🌱 Seeding disaster preparedness data...');
    
    // Clear existing modules first to avoid conflicts
    await clearExistingModules();
    
    await seedEarthquakeModule();
    await seedFloodModule();
    await seedFireModule();
    await seedCycloneModule();
    await seedHeatwaveModule();
    await seedDroughtModule();
    await seedBadges();
    await seedEmergencyContacts();
    await seedDemoUsers();
    
    console.log('✅ All data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};
