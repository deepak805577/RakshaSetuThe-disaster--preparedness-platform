import React, { useState } from 'react';
import EvacuationRoute3D from '../../components/3d/EvacuationRoute3D';
import { useAuth } from '../../contexts/AuthContext';
import DrillScenarioEngine, { DisasterScenario } from '../../components/drills/DrillScenarioEngine';

// Sample floor plan data for demonstration
const sampleFloorPlan = {
  id: 'floor1',
  name: 'Ground Floor - Main Building',
  floor: 0,
  rooms: [
    // Classrooms
    { id: 'room1', name: 'Class 9A', position: [-10, 1, -10] as [number, number, number], size: [4, 3, 4] as [number, number, number], type: 'classroom' as const },
    { id: 'room2', name: 'Class 9B', position: [-5, 1, -10] as [number, number, number], size: [4, 3, 4] as [number, number, number], type: 'classroom' as const },
    { id: 'room3', name: 'Class 10A', position: [0, 1, -10] as [number, number, number], size: [4, 3, 4] as [number, number, number], type: 'classroom' as const },
    { id: 'room4', name: 'Class 10B', position: [5, 1, -10] as [number, number, number], size: [4, 3, 4] as [number, number, number], type: 'classroom' as const },
    { id: 'room5', name: 'Science Lab', position: [10, 1, -10] as [number, number, number], size: [4, 3, 4] as [number, number, number], type: 'classroom' as const, isHazard: true },
    
    // Hallways
    { id: 'hall1', name: 'Main Corridor', position: [0, 1, 0] as [number, number, number], size: [25, 3, 3] as [number, number, number], type: 'hallway' as const },
    { id: 'hall2', name: 'Side Corridor', position: [-10, 1, 5] as [number, number, number], size: [3, 3, 10] as [number, number, number], type: 'hallway' as const },
    
    // Offices
    { id: 'office1', name: 'Principal Office', position: [-10, 1, 10] as [number, number, number], size: [4, 3, 4] as [number, number, number], type: 'office' as const },
    { id: 'office2', name: 'Staff Room', position: [-5, 1, 10] as [number, number, number], size: [4, 3, 4] as [number, number, number], type: 'office' as const },
    
    // Stairs
    { id: 'stairs1', name: 'Main Stairs', position: [10, 1, 5] as [number, number, number], size: [3, 3, 5] as [number, number, number], type: 'stairs' as const },
    
    // Exits
    { id: 'exit1', name: 'Main Exit', position: [-12, 1, 0] as [number, number, number], size: [1, 3, 3] as [number, number, number], type: 'exit' as const },
    { id: 'exit2', name: 'Emergency Exit', position: [12, 1, 0] as [number, number, number], size: [1, 3, 3] as [number, number, number], type: 'exit' as const },
  ],
  evacuationPaths: [
    {
      id: 'path1',
      points: [
        [-10, 0.5, -10],
        [-10, 0.5, -5],
        [-10, 0.5, 0],
        [-12, 0.5, 0],
        [-15, 0.5, 5],
        [-15, 0.5, 15]
      ] as [number, number, number][],
      isPrimary: true,
      estimatedTime: 45
    },
    {
      id: 'path2',
      points: [
        [10, 0.5, -10],
        [10, 0.5, -5],
        [10, 0.5, 0],
        [12, 0.5, 0],
        [15, 0.5, 5],
        [15, 0.5, 15]
      ] as [number, number, number][],
      isPrimary: false,
      estimatedTime: 50
    }
  ],
  exitPoints: [
    [-12, 0, 0] as [number, number, number],
    [12, 0, 0] as [number, number, number]
  ],
  assemblyPoint: [0, 0, 20] as [number, number, number]
};

const EvacuationVisualizationPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [simulationMode, setSimulationMode] = useState(false);
  const [uploadedFloorPlan, setUploadedFloorPlan] = useState<any>(null);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [selectedScenario, setSelectedScenario] = useState<DisasterScenario | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would parse the uploaded floor plan
      // For now, we'll just show a success message
      alert('Floor plan uploaded successfully! Processing...');
    }
  };

  const handleSimulationComplete = (stats: any) => {
    setSimulationResults(stats);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">3D Evacuation Route Visualization</h1>
              <p className="text-gray-600 mt-2">
                Interactive 3D visualization of school evacuation routes and emergency procedures
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={simulationMode}
                  onChange={(e) => setSimulationMode(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Simulation Mode</span>
              </label>
            </div>
          </div>

          {/* Floor Selection and Upload */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Select Floor:</label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value={0}>Ground Floor</option>
                <option value={1}>First Floor</option>
                <option value={2}>Second Floor</option>
              </select>
            </div>

            {user?.role === 'admin' && (
              <div className="flex items-center space-x-4">
                <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  Upload Floor Plan
                </label>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Save Layout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Select Drill Scenario</h2>
            <p className="text-sm text-gray-600">Pick a unique scenario to simulate varying conditions.</p>
          </div>
          <div className="p-4">
            <DrillScenarioEngine
              difficulty={'intermediate'}
              selectedScenario={selectedScenario || undefined}
              onScenarioSelect={setSelectedScenario}
            />
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
          <EvacuationRoute3D
            floorPlan={uploadedFloorPlan || sampleFloorPlan}
            simulationMode={simulationMode}
            onSimulationComplete={handleSimulationComplete}
            visualEffects={{
              fogColor: selectedScenario?.type === 'fire' ? '#ffe0e0' : selectedScenario?.type === 'flood' ? '#e0f7ff' : '#cfe8ff',
              fogNear: selectedScenario?.type === 'fire' ? 10 : 20,
              fogFar: selectedScenario?.type === 'flood' ? 100 : 120,
              skySunPosition: selectedScenario?.type === 'flood' ? [0, 10, 0] : [50, 20, 50],
              ambientIntensity: selectedScenario?.type === 'lockdown' ? 0.3 : 0.6,
              dirLightIntensity: selectedScenario?.type === 'fire' ? 1.5 : 1.2,
            }}
          />
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Evacuation Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evacuation Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Capacity:</span>
                <span className="font-medium">250 students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exit Points:</span>
                <span className="font-medium">2 exits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Primary Route Time:</span>
                <span className="font-medium text-green-600">45 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alternative Route:</span>
                <span className="font-medium text-yellow-600">50 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Drill:</span>
                <span className="font-medium">2 weeks ago</span>
              </div>
            </div>
          </div>

          {/* Safety Features */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Features</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Emergency lighting installed</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Fire extinguishers available</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Clear exit signage</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Science lab requires attention</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Assembly point marked</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Schedule Drill
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Generate Report
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Train Staff
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Results */}
        {simulationResults && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {simulationResults.evacuationTime}s
                </div>
                <div className="text-sm text-gray-600">Total Evacuation Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {simulationResults.peopleEvacuated}
                </div>
                <div className="text-sm text-gray-600">People Evacuated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {simulationResults.bottlenecks}
                </div>
                <div className="text-sm text-gray-600">Bottlenecks Identified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {simulationResults.safetyScore}%
                </div>
                <div className="text-sm text-gray-600">Safety Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use the 3D Visualization</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use your mouse to rotate, zoom, and pan around the 3D model</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Hover over rooms to see their details and current status</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Green paths indicate primary evacuation routes, yellow shows alternatives</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Enable simulation mode to see animated evacuation procedures</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Red highlighted areas indicate potential hazards or blocked routes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EvacuationVisualizationPage;
