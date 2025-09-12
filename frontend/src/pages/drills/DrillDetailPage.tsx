import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

interface DrillStep {
  stepNumber: number;
  title: string;
  description: string;
  instructions: string[];
  timeLimit?: number;
  isCompleted: boolean;
  completionTime?: number;
  feedback?: string;
}

interface DrillSession {
  id: string;
  templateId: string;
  type: string;
  title: string;
  steps: DrillStep[];
  currentStep: number;
  startTime: Date;
  totalTime?: number;
  score?: number;
  isCompleted: boolean;
}

const DrillDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [session, setSession] = useState<DrillSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrillActive, setIsDrillActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStartTime, setStepStartTime] = useState<Date | null>(null);
  const [stepTimeLeft, setStepTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const loadDrillSession = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockSession: DrillSession = {
          id: sessionId || '1',
          templateId: '1',
          type: 'evacuation',
          title: 'School Evacuation Drill',
          currentStep: 0,
          startTime: new Date(),
          isCompleted: false,
          steps: [
            {
              stepNumber: 1,
              title: 'Alert Recognition',
              description: 'Recognize the evacuation alarm and initial response',
              instructions: [
                'Listen for the evacuation alarm',
                'Stop all activities immediately',
                'Stay calm and alert',
                'Wait for teacher instructions'
              ],
              timeLimit: 30,
              isCompleted: false
            },
            {
              stepNumber: 2,
              title: 'Formation and Line Up',
              description: 'Organize students in an orderly line',
              instructions: [
                'Form a single line at the classroom door',
                'Maintain silence and order',
                'Follow the designated line leader',
                'Wait for the signal to proceed'
              ],
              timeLimit: 60,
              isCompleted: false
            },
            {
              stepNumber: 3,
              title: 'Exit the Classroom',
              description: 'Safely exit the classroom following procedures',
              instructions: [
                'Walk, do not run',
                'Stay in line formation',
                'Follow the designated exit route',
                'Keep hands free of belongings'
              ],
              timeLimit: 45,
              isCompleted: false
            },
            {
              stepNumber: 4,
              title: 'Navigate to Assembly Point',
              description: 'Follow the evacuation route to the assembly area',
              instructions: [
                'Follow the marked evacuation route',
                'Stay with your class group',
                'Avoid shortcuts or alternative routes',
                'Help others if needed'
              ],
              timeLimit: 120,
              isCompleted: false
            },
            {
              stepNumber: 5,
              title: 'Assembly Point Check-in',
              description: 'Report to the designated assembly area',
              instructions: [
                'Go to your class designated area',
                'Stand in formation',
                'Wait for roll call',
                'Remain quiet and attentive'
              ],
              timeLimit: 90,
              isCompleted: false
            },
            {
              stepNumber: 6,
              title: 'Roll Call and Verification',
              description: 'Ensure all students are accounted for',
              instructions: [
                'Answer when your name is called',
                'Report any missing students',
                'Stay in your designated area',
                'Wait for further instructions'
              ],
              timeLimit: 60,
              isCompleted: false
            },
            {
              stepNumber: 7,
              title: 'Wait for All Clear',
              description: 'Remain at assembly point until given permission',
              instructions: [
                'Stay in formation',
                'Listen for announcements',
                'Do not leave the area',
                'Wait for official all-clear signal'
              ],
              timeLimit: 180,
              isCompleted: false
            },
            {
              stepNumber: 8,
              title: 'Return to Classroom',
              description: 'Safely return to the classroom when instructed',
              instructions: [
                'Wait for teacher instructions',
                'Return in an orderly manner',
                'Resume normal activities',
                'Report any issues to teacher'
              ],
              timeLimit: 90,
              isCompleted: false
            }
          ]
        };

        setSession(mockSession);
        setIsLoading(false);
      }, 1000);
    };

    loadDrillSession();
  }, [sessionId]);

  useEffect(() => {
    if (socket && session) {
      // Join drill room for real-time updates
      socket.emit('join-drill', {
        userId: user?._id,
        drillType: session.type
      });

      // Listen for drill events
      socket.on('step-completed', (data) => {
        console.log('Step completed:', data);
      });

      socket.on('drill-completed', (data) => {
        console.log('Drill completed:', data);
        setIsDrillActive(false);
      });

      socket.on('progress-update', (data) => {
        console.log('Progress update:', data);
      });

      return () => {
        socket.off('step-completed');
        socket.off('drill-completed');
        socket.off('progress-update');
      };
    }
  }, [socket, session, user]);

  useEffect(() => {
    if (isDrillActive && session && currentStepIndex < session.steps.length) {
      const currentStep = session.steps[currentStepIndex];
      if (currentStep.timeLimit) {
        setStepTimeLeft(currentStep.timeLimit);
        setStepStartTime(new Date());
      }
    }
  }, [isDrillActive, currentStepIndex, session]);

  useEffect(() => {
    if (stepTimeLeft !== null && stepTimeLeft > 0) {
      const timer = setTimeout(() => {
        setStepTimeLeft(stepTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (stepTimeLeft === 0) {
      // Time's up for current step
      handleStepComplete();
    }
  }, [stepTimeLeft]);

  const startDrill = () => {
    setIsDrillActive(true);
    setCurrentStepIndex(0);
    setStepStartTime(new Date());
  };

  const handleStepComplete = () => {
    if (!session) return;

    const completionTime = stepStartTime ? 
      Math.round((new Date().getTime() - stepStartTime.getTime()) / 1000) : 0;

    // Update current step as completed
    const updatedSteps = session.steps.map((step, index) => {
      if (index === currentStepIndex) {
        return {
          ...step,
          isCompleted: true,
          completionTime,
          feedback: completionTime <= (step.timeLimit || 0) ? 'Great job!' : 'Good effort, try to be faster next time.'
        };
      }
      return step;
    });

    setSession({
      ...session,
      steps: updatedSteps,
      currentStep: currentStepIndex + 1
    });

    // Emit step completion to server
    if (socket) {
      socket.emit('step-completed', {
        userId: user?._id,
        stepNumber: currentStepIndex + 1,
        completionTime
      });
    }

    // Move to next step or complete drill
    if (currentStepIndex < session.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setStepStartTime(new Date());
    } else {
      completeDrill();
    }
  };

  const completeDrill = () => {
    if (!session) return;

    const totalTime = Math.round((new Date().getTime() - session.startTime.getTime()) / 1000);
    const completedSteps = session.steps.filter(step => step.isCompleted).length;
    const score = Math.round((completedSteps / session.steps.length) * 100);

    const completedSession = {
      ...session,
      isCompleted: true,
      totalTime,
      score
    };

    setSession(completedSession);
    setIsDrillActive(false);

    // Emit drill completion to server
    if (socket) {
      socket.emit('drill-completed', {
        userId: user?._id,
        totalTime,
        score
      });
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'current': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drill...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Drill not found</h1>
          <button
            onClick={() => navigate('/drills')}
            className="text-red-600 hover:text-red-700"
          >
            ← Back to drills
          </button>
        </div>
      </div>
    );
  }

  if (session.isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Drill Completed!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Great job completing the {session.title}. You've improved your emergency preparedness skills.
              </p>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{session.score}%</div>
                <div className="text-sm text-gray-500">Completion Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {Math.floor((session.totalTime || 0) / 60)}m {((session.totalTime || 0) % 60)}s
                </div>
                <div className="text-sm text-gray-500">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {session.steps.filter(step => step.isCompleted).length}/{session.steps.length}
                </div>
                <div className="text-sm text-gray-500">Steps Completed</div>
              </div>
            </div>

            {/* Step Results */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step Results</h2>
              <div className="space-y-3">
                {session.steps.map((step, index) => (
                  <div key={step.stepNumber} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-4 ${getStepStatusColor('completed')}`}>
                        {step.stepNumber}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-500">{step.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {step.completionTime}s
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.feedback}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSession({
                    ...session,
                    isCompleted: false,
                    currentStep: 0,
                    startTime: new Date(),
                    steps: session.steps.map(step => ({ ...step, isCompleted: false, completionTime: undefined, feedback: undefined }))
                  });
                  setCurrentStepIndex(0);
                }}
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retake Drill
              </button>
              
              <button
                onClick={() => navigate('/drills')}
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Back to Drills
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = session.steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
                <p className="text-gray-600">Step {currentStepIndex + 1} of {session.steps.length}</p>
              </div>
              <div className="text-right">
                {stepTimeLeft !== null && (
                  <div className={`text-2xl font-bold ${
                    stepTimeLeft <= 10 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {Math.floor(stepTimeLeft / 60)}:{(stepTimeLeft % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / session.steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Step */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {!isDrillActive ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start?</h2>
                    <p className="text-gray-600 mb-6">
                      This drill will test your emergency response skills. Follow the instructions carefully and complete each step as quickly and safely as possible.
                    </p>
                    <button
                      onClick={startDrill}
                      className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Start Drill
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentStep.title}</h2>
                    <p className="text-gray-600 mb-6">{currentStep.description}</p>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions:</h3>
                      <ul className="space-y-2">
                        {currentStep.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleStepComplete}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Complete Step
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step Progress */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Drill Progress</h3>
                <div className="space-y-3">
                  {session.steps.map((step, index) => {
                    const status = getStepStatus(index);
                    return (
                      <div key={step.stepNumber} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${getStepStatusColor(status)}`}>
                          {step.stepNumber}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{step.title}</div>
                          <div className="text-xs text-gray-500">{step.description}</div>
                          {step.isCompleted && step.completionTime && (
                            <div className="text-xs text-green-600">
                              Completed in {step.completionTime}s
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDetailPage;
