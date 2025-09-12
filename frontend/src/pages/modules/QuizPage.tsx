import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Question, QuizResult, DisasterModule } from '../../types';
import { moduleService } from '../../services/moduleService';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [moduleType, setModuleType] = useState<string>('earthquake');
  const [moduleTitle, setModuleTitle] = useState<string>('Disaster Preparedness');

  // Question pools organized by module type
  const questionPools: { [key: string]: Question[] } = {
    earthquake: [
      {
        id: 'eq1',
      question: 'What is the most important action to take during an earthquake?',
      options: [
        'Run to the nearest exit',
        'Drop, Cover, and Hold On',
        'Stand in a doorway',
        'Go outside immediately'
      ],
      correctAnswer: 1,
      explanation: 'Drop, Cover, and Hold On is the recommended action because it protects you from falling objects and provides stability.',
      points: 20
    },
    {
      id: 'eq2',
      question: 'Where should you take cover during an earthquake?',
      options: [
        'Under a sturdy desk or table',
        'In a doorway',
        'Near windows',
        'In the center of the room'
      ],
      correctAnswer: 0,
      explanation: 'A sturdy desk or table provides the best protection from falling objects and debris.',
      points: 20
    },
    {
      id: 'eq3',
      question: 'What should you do if you are outside during an earthquake?',
      options: [
        'Run to the nearest building',
        'Move to an open area away from buildings',
        'Stand under a tree',
        'Lie down on the ground'
      ],
      correctAnswer: 1,
      explanation: 'Moving to an open area away from buildings reduces the risk of being hit by falling debris.',
      points: 20
    },
    {
      id: 'eq4',
      question: 'How often should earthquake drills be practiced in schools?',
      options: [
        'Once a year',
        'At least twice a year',
        'Only when there is a warning',
        'Never, they are not necessary'
      ],
      correctAnswer: 1,
      explanation: 'Regular practice helps ensure everyone knows what to do and can react quickly during an actual earthquake.',
      points: 20
    },
    {
      id: 'eq5',
      question: 'What should you do after an earthquake stops?',
      options: [
        'Immediately go back inside',
        'Check for injuries and evacuate if safe',
        'Call everyone you know',
        'Continue with normal activities'
      ],
      correctAnswer: 1,
      explanation: 'After an earthquake, check for injuries, evacuate if the building is unsafe, and follow emergency procedures.',
      points: 20
    },
    {
      id: 'eq6',
      question: 'What causes earthquakes?',
      options: [
        'Movement of tectonic plates',
        'Heavy rainfall',
        'Strong winds',
        'Solar activity'
      ],
      correctAnswer: 0,
      explanation: 'Earthquakes are primarily caused by the movement and collision of tectonic plates beneath the Earth\'s surface.',
      points: 20
    },
    {
      id: 'eq7',
      question: 'What should be included in an earthquake emergency kit?',
      options: [
        'Fashion accessories and entertainment devices',
        'Water, food, first aid kit, flashlight, and battery-powered radio',
        'Only electronic gadgets',
        'Books and magazines'
      ],
      correctAnswer: 1,
      explanation: 'An earthquake emergency kit should contain essential survival items like water, non-perishable food, first aid supplies, and communication tools.',
      points: 20
    },
    {
      id: 'eq8',
      question: 'What is the safest place in a classroom during an earthquake?',
      options: [
        'Near the blackboard',
        'By the windows for quick escape',
        'Under desks away from windows and heavy objects',
        'In the hallway'
      ],
      correctAnswer: 2,
      explanation: 'Under desks provides protection from falling debris, and staying away from windows prevents injury from broken glass.',
      points: 20
    },
    {
      id: 'eq9',
      question: 'How long should you hold the Drop, Cover, and Hold On position?',
      options: [
        'For 5 seconds only',
        'Until the shaking stops completely',
        'For exactly 1 minute',
        'Just until you feel safe'
      ],
      correctAnswer: 1,
      explanation: 'You should maintain the protective position until all shaking has completely stopped to ensure maximum safety.',
      points: 20
    },
      {
        id: 'eq10',
        question: 'What is an aftershock?',
        options: [
          'The initial earthquake',
          'A smaller earthquake that follows the main earthquake',
          'Thunder after lightning',
          'A type of weather phenomenon'
        ],
        correctAnswer: 1,
        explanation: 'Aftershocks are smaller earthquakes that occur after the main earthquake as the Earth\'s crust adjusts to the changes.',
        points: 20
      },
      {
        id: 'eq11',
        question: 'What should teachers do first when an earthquake strikes?',
        options: [
          'Evacuate students immediately',
          'Call emergency services',
          'Command students to Drop, Cover, and Hold On',
          'Check for damage'
        ],
        correctAnswer: 2,
        explanation: 'Teachers should immediately command students to take protective action: Drop, Cover, and Hold On.',
        points: 20
      },
      {
        id: 'eq12',
        question: 'How can you identify a safe evacuation route?',
        options: [
          'It should be marked with emergency exit signs',
          'Any route is fine',
          'Through windows only',
          'Through the main entrance only'
        ],
        correctAnswer: 0,
        explanation: 'Safe evacuation routes are clearly marked with emergency exit signs and should be known to all students and staff.',
        points: 20
      },
      {
        id: 'eq13',
        question: 'What is the Triangle of Life theory?',
        options: [
          'A recommended earthquake safety method',
          'A controversial and largely discredited theory',
          'The best way to survive earthquakes',
          'A type of building structure'
        ],
        correctAnswer: 1,
        explanation: 'The Triangle of Life is a controversial theory that has been largely discredited by experts. Drop, Cover, and Hold On remains the recommended action.',
        points: 20
      },
      {
        id: 'eq14',
        question: 'What should be in a classroom earthquake kit?',
        options: [
          'Only textbooks',
          'First aid supplies, flashlight, whistle, and water',
          'Electronic devices only',
          'Food and entertainment items'
        ],
        correctAnswer: 1,
        explanation: 'A classroom earthquake kit should contain first aid supplies, flashlight, whistle, water, and other emergency essentials.',
        points: 20
      },
      {
        id: 'eq15',
        question: 'When is it safe to re-enter a building after an earthquake?',
        options: [
          'Immediately after shaking stops',
          'After 10 minutes',
          'Only after it has been inspected and declared safe',
          'The next day'
        ],
        correctAnswer: 2,
        explanation: 'Buildings should only be re-entered after proper inspection by qualified personnel who can assess structural damage.',
        points: 20
      }
    ],
    fire: [
      {
      id: 'fs1',
      question: 'What is the first thing to do if you discover a fire?',
      options: [
        'Try to put it out yourself',
        'Sound the alarm and evacuate',
        'Take photos for social media',
        'Gather your belongings'
      ],
      correctAnswer: 1,
      explanation: 'The priority is to alert others and evacuate safely. Fighting fires should only be done by trained personnel.',
      points: 20
    },
    {
      id: 'fs2',
      question: 'How should you evacuate a smoke-filled room?',
      options: [
        'Run as fast as possible',
        'Walk normally',
        'Crawl low under the smoke',
        'Jump through windows'
      ],
      correctAnswer: 2,
      explanation: 'Smoke rises, so the clearest air is near the floor. Crawling helps you breathe better and see more clearly.',
      points: 20
    },
    {
      id: 'fs3',
      question: 'What does the acronym PASS stand for in fire extinguisher use?',
      options: [
        'Push, Activate, Spray, Stop',
        'Pull, Aim, Squeeze, Sweep',
        'Point, Activate, Spray, Save',
        'Prepare, Alert, Spray, Safety'
      ],
      correctAnswer: 1,
      explanation: 'PASS helps remember the correct steps: Pull the pin, Aim at the base, Squeeze the handle, Sweep from side to side.',
      points: 20
    },
    {
      id: 'fs4',
      question: 'Before opening a door during a fire evacuation, you should:',
      options: [
        'Open it quickly to escape',
        'Check if the door is hot with the back of your hand',
        'Knock on it loudly',
        'Wait for firefighters'
      ],
      correctAnswer: 1,
      explanation: 'A hot door indicates fire on the other side. Always check before opening to avoid walking into danger.',
      points: 20
    },
      {
        id: 'fs5',
        question: 'What is the recommended meeting point after evacuating a building?',
        options: [
          'Just outside the main entrance',
          'In the parking lot',
          'A designated assembly point away from the building',
          'Anywhere convenient'
        ],
        correctAnswer: 2,
        explanation: 'A designated assembly point ensures everyone is accounted for and is safely away from the danger zone.',
        points: 20
      },
      {
        id: 'fs6',
        question: 'What type of fire extinguisher is best for electrical fires?',
        options: [
          'Water',
          'Class C or CO2 extinguisher',
          'Foam',
          'Any type will work'
        ],
        correctAnswer: 1,
        explanation: 'Class C or CO2 extinguishers are designed for electrical fires. Never use water on electrical fires.',
        points: 20
      },
      {
        id: 'fs7',
        question: 'How often should fire drills be conducted in schools?',
        options: [
          'Once a year',
          'Once a month',
          'Only when there\'s a real fire',
          'Never'
        ],
        correctAnswer: 1,
        explanation: 'Monthly fire drills help ensure all students and staff know evacuation procedures and can execute them quickly.',
        points: 20
      },
      {
        id: 'fs8',
        question: 'What should you do if your clothes catch fire?',
        options: [
          'Run to get help',
          'Stop, Drop, and Roll',
          'Jump in water immediately',
          'Keep moving to put out flames'
        ],
        correctAnswer: 1,
        explanation: 'Stop, Drop, and Roll smothers the flames. Running would feed oxygen to the fire, making it worse.',
        points: 20
      },
      {
        id: 'fs9',
        question: 'What is the primary danger from smoke in a fire?',
        options: [
          'It\'s hot',
          'It reduces visibility',
          'It contains toxic gases that can cause unconsciousness',
          'It\'s unpleasant'
        ],
        correctAnswer: 2,
        explanation: 'Smoke contains toxic gases like carbon monoxide that can cause unconsciousness and death before the flames reach you.',
        points: 20
      },
      {
        id: 'fs10',
        question: 'How wide should fire evacuation routes be kept?',
        options: [
          'As narrow as possible',
          'Wide enough for one person',
          'Clear and wide enough for multiple people',
          'Width doesn\'t matter'
        ],
        correctAnswer: 2,
        explanation: 'Evacuation routes must be kept clear and wide enough for multiple people to evacuate quickly and safely.',
        points: 20
      }
    ],
    flood: [
      {
      id: 'fl1',
      question: 'What is the most dangerous aspect of flood water?',
      options: [
        'It\'s cold',
        'It may be contaminated and have strong currents',
        'It\'s wet',
        'It\'s deep'
      ],
      correctAnswer: 1,
      explanation: 'Flood water can contain sewage, chemicals, and debris, plus strong currents can sweep people away.',
      points: 20
    },
    {
      id: 'fl2',
      question: 'How much moving water can knock down an adult?',
      options: [
        '6 inches',
        '2 feet',
        '4 feet',
        '6 feet'
      ],
      correctAnswer: 0,
      explanation: 'Just 6 inches of moving water can knock you down, and 12 inches can carry away a vehicle.',
      points: 20
    },
    {
      id: 'fl3',
      question: 'What should you do if trapped in a building during a flood?',
      options: [
        'Stay in the basement',
        'Go to the highest level and signal for help',
        'Try to swim to safety',
        'Open all windows'
      ],
      correctAnswer: 1,
      explanation: 'Moving to the highest level keeps you above rising water, and signaling helps rescuers find you.',
      points: 20
    },
    {
      id: 'fl4',
      question: 'When is it safe to return home after a flood?',
      options: [
        'As soon as the water recedes',
        'After authorities declare it safe',
        'After 24 hours',
        'Whenever you want'
      ],
      correctAnswer: 1,
      explanation: 'Authorities assess structural damage, contamination, and other hazards before declaring areas safe for return.',
      points: 20
    },
      {
        id: 'fl5',
        question: 'What supplies are most critical during flood preparation?',
        options: [
          'Electronics and games',
          'Clean water, non-perishable food, and medications',
          'Clothes and shoes',
          'Books and magazines'
        ],
        correctAnswer: 1,
        explanation: 'Clean water, food, and medications are essential for survival when regular supplies are cut off.',
        points: 20
      },
      {
        id: 'fl6',
        question: 'What should you never do during a flood?',
        options: [
          'Move to higher ground',
          'Drive through flooded roads',
          'Listen to emergency broadcasts',
          'Help others evacuate'
        ],
        correctAnswer: 1,
        explanation: 'Never drive through flooded roads. Just 12 inches of water can carry away a car.',
        points: 20
      },
      {
        id: 'fl7',
        question: 'What diseases can spread after floods?',
        options: [
          'Common cold only',
          'Waterborne diseases like cholera and typhoid',
          'Sunburn',
          'None'
        ],
        correctAnswer: 1,
        explanation: 'Floods can contaminate water supplies, leading to waterborne diseases like cholera, typhoid, and hepatitis A.',
        points: 20
      },
      {
        id: 'fl8',
        question: 'How should electrical equipment be handled after flooding?',
        options: [
          'Turn everything on immediately',
          'Have it inspected by qualified electricians before use',
          'Dry it with a hair dryer',
          'Throw it away'
        ],
        correctAnswer: 1,
        explanation: 'All electrical equipment must be inspected and certified safe by qualified electricians before use to prevent electrocution.',
        points: 20
      },
      {
        id: 'fl9',
        question: 'What is a flash flood?',
        options: [
          'A slow-moving flood',
          'A rapid flood occurring within 6 hours of heavy rain',
          'A flood with lightning',
          'A seasonal flood'
        ],
        correctAnswer: 1,
        explanation: 'Flash floods occur rapidly, usually within 6 hours of heavy rainfall, and are extremely dangerous due to their speed.',
        points: 20
      },
      {
        id: 'fl10',
        question: 'What should schools do to prepare for flood season?',
        options: [
          'Nothing special',
          'Create evacuation plans and stock emergency supplies',
          'Cancel all classes',
          'Build boats'
        ],
        correctAnswer: 1,
        explanation: 'Schools should have evacuation plans, emergency supplies, and communication systems ready before flood season.',
        points: 20
      }
    ],
    cyclone: [
      {
      id: 'cy1',
      question: 'What is the calm area at the center of a cyclone called?',
      options: [
        'The vortex',
        'The eye',
        'The center',
        'The core'
      ],
      correctAnswer: 1,
      explanation: 'The eye of a cyclone is a calm area with light winds, but it\'s surrounded by the dangerous eye wall.',
      points: 20
    },
    {
      id: 'cy2',
      question: 'What should you do when a cyclone warning is issued?',
      options: [
        'Go to the beach to watch',
        'Secure loose objects and move to a safe shelter',
        'Continue normal activities',
        'Drive around to check damage'
      ],
      correctAnswer: 1,
      explanation: 'Securing objects prevents them from becoming projectiles, and sheltering protects you from the storm.',
      points: 20
    },
    {
      id: 'cy3',
      question: 'Which part of a building is safest during a cyclone?',
      options: [
        'Near windows to watch the storm',
        'On the roof',
        'An interior room on the lowest floor',
        'In the garage'
      ],
      correctAnswer: 2,
      explanation: 'Interior rooms on lower floors provide maximum protection from wind and flying debris.',
      points: 20
    },
    {
      id: 'cy4',
      question: 'What is storm surge?',
      options: [
        'Heavy rainfall',
        'Strong winds',
        'Abnormal rise of water generated by a storm',
        'Lightning strikes'
      ],
      correctAnswer: 2,
      explanation: 'Storm surge is the abnormal rise in seawater level during a storm, caused by storm winds pushing water onshore.',
      points: 20
    },
    {
      id: 'cy5',
      question: 'How far inland should you evacuate for a major cyclone?',
      options: [
        '1 kilometer',
        'As recommended by local authorities',
        'Not necessary to evacuate',
        '100 meters'
      ],
      correctAnswer: 1,
      explanation: 'Local authorities determine safe evacuation distances based on the storm\'s strength and local geography.',
      points: 20
    }
    ],
    drought: [
      {
        id: 'dr1',
        question: 'What is the primary cause of drought?',
        options: [
          'Excessive rainfall',
          'Prolonged period of below-average precipitation',
          'Earthquakes',
          'Volcanic eruptions'
        ],
        correctAnswer: 1,
        explanation: 'Drought occurs when there is a prolonged period of below-average precipitation, leading to water shortage.',
        points: 20
      },
      {
        id: 'dr2',
        question: 'Which water conservation method is most effective during drought?',
        options: [
          'Taking longer showers',
          'Drip irrigation and rainwater harvesting',
          'Washing cars daily',
          'Keeping taps running'
        ],
        correctAnswer: 1,
        explanation: 'Drip irrigation and rainwater harvesting are highly effective methods for conserving water during drought conditions.',
        points: 20
      },
      {
        id: 'dr3',
        question: 'What should schools do during severe drought conditions?',
        options: [
          'Increase water usage for cleaning',
          'Implement water rationing and conservation measures',
          'Ignore the situation',
          'Use more water to stay cool'
        ],
        correctAnswer: 1,
        explanation: 'Schools should implement water rationing and conservation measures to ensure water availability for essential needs.',
        points: 20
      },
      {
        id: 'dr4',
        question: 'How can students help during a drought?',
        options: [
          'Report water leaks and practice water conservation',
          'Play with water',
          'Leave taps open',
          'Waste water intentionally'
        ],
        correctAnswer: 0,
        explanation: 'Students can help by reporting leaks, taking shorter showers, and practicing water conservation in daily activities.',
        points: 20
      },
      {
        id: 'dr5',
        question: 'What is gray water?',
        options: [
          'Contaminated water',
          'Relatively clean wastewater from baths, sinks, and washing machines',
          'Drinking water',
          'Sea water'
        ],
        correctAnswer: 1,
        explanation: 'Gray water is relatively clean wastewater that can be reused for irrigation and other non-drinking purposes.',
        points: 20
      }
    ],
    heatwave: [
      {
        id: 'hw1',
        question: 'What is a heat wave?',
        options: [
          'A cool breeze in summer',
          'Prolonged period of excessively hot weather',
          'Normal summer weather',
          'Winter phenomenon'
        ],
        correctAnswer: 1,
        explanation: 'A heat wave is a prolonged period of excessively hot weather, which may be accompanied by high humidity.',
        points: 20
      },
      {
        id: 'hw2',
        question: 'What is the most dangerous heat-related illness?',
        options: [
          'Heat rash',
          'Heat cramps',
          'Heat stroke',
          'Sunburn'
        ],
        correctAnswer: 2,
        explanation: 'Heat stroke is a life-threatening condition where the body\'s temperature regulation fails and body temperature rises rapidly.',
        points: 20
      },
      {
        id: 'hw3',
        question: 'When should outdoor activities be avoided during a heat wave?',
        options: [
          'Early morning',
          'Between 11 AM and 4 PM',
          'Evening',
          'Night time'
        ],
        correctAnswer: 1,
        explanation: 'The hottest part of the day is typically between 11 AM and 4 PM, when sun exposure and heat are at their peak.',
        points: 20
      },
      {
        id: 'hw4',
        question: 'What should you drink most during a heat wave?',
        options: [
          'Caffeinated beverages',
          'Alcohol',
          'Plain water',
          'Sugary sodas'
        ],
        correctAnswer: 2,
        explanation: 'Plain water is best for hydration. Avoid alcohol and caffeine as they can lead to dehydration.',
        points: 20
      },
      {
        id: 'hw5',
        question: 'What are signs of heat exhaustion in students?',
        options: [
          'Excessive energy and alertness',
          'Heavy sweating, weakness, nausea, and dizziness',
          'Feeling cold',
          'Increased appetite'
        ],
        correctAnswer: 1,
        explanation: 'Heat exhaustion symptoms include heavy sweating, weakness, nausea, dizziness, and pale skin. Immediate cooling and hydration are needed.',
        points: 20
      }
    ]
  };

  const initializeQuiz = async () => {
    try {
      // Try to fetch module information to get the module type
      if (id) {
        try {
          const module = await moduleService.getModuleById(id);
          setModuleType(module.type);
          setModuleTitle(module.title);
        } catch (error) {
          console.log('Could not fetch module info, using default');
        }
      }
    } catch (error) {
      console.error('Error fetching module:', error);
    }

    // Get questions for the specific module type
    const moduleQuestions = questionPools[moduleType] || questionPools['earthquake'];
    
    // If we have more than 5 questions, randomly select 5
    let selectedQuestions: Question[];
    if (moduleQuestions.length > 5) {
      const shuffled = [...moduleQuestions].sort(() => Math.random() - 0.5);
      selectedQuestions = shuffled.slice(0, 5).map((q, index) => ({
        ...q,
        id: `q${index + 1}` // Reassign IDs to maintain order
      }));
    } else {
      // If we have 5 or fewer questions, use them all but still shuffle
      selectedQuestions = [...moduleQuestions]
        .sort(() => Math.random() - 0.5)
        .map((q, index) => ({
          ...q,
          id: `q${index + 1}`
        }));
    }

    setQuestions(selectedQuestions);
    setTimeLeft(15 * 60); // 15 minutes
    setHasStarted(true);
    setIsLoading(false);
  };

  useEffect(() => {
    // Load module information when component mounts
    const loadModuleInfo = async () => {
      if (id) {
        try {
          const module = await moduleService.getModuleById(id);
          setModuleType(module.type);
          setModuleTitle(module.title);
        } catch (error) {
          console.log('Could not fetch module info, using defaults');
        }
      }
      setIsLoading(false);
    };
    loadModuleInfo();
  }, [id]);

  const startQuiz = async () => {
    setIsLoading(true);
    // Small delay for better UX
    setTimeout(async () => {
      await initializeQuiz();
    }, 500);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsQuizCompleted(false);
    setQuizResult(null);
    setHasStarted(false);
    setIsSubmitting(false);
    setTimeLeft(0);
    setQuestions([]);
  };

  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !isQuizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (hasStarted && timeLeft === 0 && !isQuizCompleted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, isQuizCompleted, hasStarted]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    setIsQuizCompleted(true);

    // Calculate results
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const results = questions.map(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }
      totalPoints += question.points;

      return {
        questionId: question.id,
        userAnswer: userAnswer || -1,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 70; // Assuming 70% passing score

    const result: QuizResult = {
      score,
      passed,
      correctAnswers,
      totalQuestions: questions.length,
      earnedPoints,
      totalPoints,
      passingScore: 70,
      results,
      badgesEarned: passed ? ['Quiz Master'] : []
    };

    setQuizResult(result);
    setIsSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!hasStarted && !isQuizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{moduleTitle} Quiz</h1>
              <p className="text-lg text-gray-600 mb-6">
                Test your knowledge about {moduleTitle.toLowerCase()} and safety measures.
              </p>
            </div>

            {/* Quiz Information */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">5</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">15</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">70%</div>
                  <div className="text-sm text-gray-600">Passing Score</div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-left mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>
                  <span>You have 15 minutes to complete all 5 questions</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>
                  <span>You can navigate between questions using the numbered buttons</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>
                  <span>You need to score at least 70% to pass</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>
                  <span>Answer all questions before submitting the quiz</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>
                  <span>The quiz will auto-submit when time runs out</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/modules/${id}`}
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Back to Module
              </Link>
              <button
                onClick={startQuiz}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-semibold"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isQuizCompleted && quizResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quiz Results */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                quizResult.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {quizResult.passed ? (
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {quizResult.passed ? 'Congratulations!' : 'Quiz Complete'}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {quizResult.passed 
                  ? 'You passed the quiz! Great job on your disaster preparedness knowledge.'
                  : 'You need to score at least 70% to pass. Review the material and try again.'
                }
              </p>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{quizResult.score}%</div>
                <div className="text-sm text-gray-500">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{quizResult.correctAnswers}/{quizResult.totalQuestions}</div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{quizResult.earnedPoints}</div>
                <div className="text-sm text-gray-500">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{quizResult.passingScore}%</div>
                <div className="text-sm text-gray-500">Passing Score</div>
              </div>
            </div>

            {/* Question Review */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Review</h2>
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const result = quizResult.results.find(r => r.questionId === question.id);
                  return (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result?.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result?.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded ${
                              optionIndex === result?.correctAnswer
                                ? 'bg-green-50 border border-green-200'
                                : optionIndex === result?.userAnswer && !result?.isCorrect
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="font-medium mr-2">{String.fromCharCode(65 + optionIndex)}.</span>
                              <span className={optionIndex === result?.correctAnswer ? 'text-green-800' : 
                                optionIndex === result?.userAnswer && !result?.isCorrect ? 'text-red-800' : 'text-gray-700'}>
                                {option}
                              </span>
                              {optionIndex === result?.correctAnswer && (
                                <svg className="w-4 h-4 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {result?.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>Explanation:</strong> {result.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`/modules/${id}`}
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Back to Module
              </Link>
              
              {!quizResult.passed && (
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Retake Quiz
                </button>
              )}
              
              <Link
                to="/modules"
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue Learning
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{moduleTitle} Quiz</h1>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  timeLeft > 300 ? 'bg-green-100 text-green-800' : 
                  timeLeft > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion?.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === index
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={answers[currentQuestion.id] === index}
                    onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="px-8 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium ${
                      index === currentQuestionIndex
                        ? 'bg-red-600 text-white'
                        : answers[questions[index].id] !== undefined
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>You can navigate between questions using the numbered buttons above.</p>
          <p>Make sure to answer all questions before submitting.</p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
