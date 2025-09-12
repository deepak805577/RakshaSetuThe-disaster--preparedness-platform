import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Line, Sphere, Html, Sky } from '@react-three/drei';
import * as THREE from 'three';

interface Room {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number, number];
  type: 'classroom' | 'hallway' | 'exit' | 'office' | 'stairs' | 'assembly';
  isHazard?: boolean;
}

interface EvacuationPath {
  id: string;
  points: [number, number, number][];
  isPrimary: boolean;
  estimatedTime: number;
}

interface FloorPlan {
  id: string;
  name: string;
  floor: number;
  rooms: Room[];
  evacuationPaths: EvacuationPath[];
  exitPoints: [number, number, number][];
  assemblyPoint: [number, number, number];
}

interface EvacuationRoute3DProps {
  floorPlan: FloorPlan;
  simulationMode?: boolean;
  onSimulationComplete?: (stats: any) => void;
  visualEffects?: {
    fogColor?: string;
    fogNear?: number;
    fogFar?: number;
    skySunPosition?: [number, number, number];
    ambientIntensity?: number;
    dirLightIntensity?: number;
  };
}

// Room Component
const Room3D: React.FC<{ room: Room; isActive: boolean }> = ({ room, isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissive = new THREE.Color(0xff0000);
      material.emissiveIntensity = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
    }
  });

  const getColor = () => {
    if (room.isHazard) return '#ff0000';
    switch (room.type) {
      case 'exit': return '#00ff00';
      case 'assembly': return '#0080ff';
      case 'hallway': return '#808080';
      case 'stairs': return '#ffaa00';
      default: return '#cccccc';
    }
  };

  return (
    <group position={room.position}>
      <Box
        ref={meshRef}
        args={room.size}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={room.type === 'hallway' ? 0.3 : 0.6}
          emissive={isActive ? '#ff0000' : '#000000'}
        />
      </Box>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-white px-2 py-1 rounded shadow-lg text-xs">
            <div className="font-bold">{room.name}</div>
            <div className="text-gray-600">{room.type}</div>
            {room.isHazard && <div className="text-red-600">⚠ HAZARD</div>}
          </div>
        </Html>
      )}
      <Text
        position={[0, room.size[1] / 2 + 0.5, 0]}
        fontSize={0.5}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {room.name}
      </Text>
    </group>
  );
};

// Evacuation Path Component
const EvacuationPath3D: React.FC<{ path: EvacuationPath; animated: boolean }> = ({ path, animated }) => {
  const [progress, setProgress] = useState(0);

  useFrame((state) => {
    if (animated) {
      setProgress((state.clock.elapsedTime * 0.2) % 1);
    }
  });

  const visiblePoints = animated 
    ? path.points.slice(0, Math.floor(path.points.length * progress) + 1)
    : path.points;

  return (
    <>
      <Line
        points={visiblePoints}
        color={path.isPrimary ? '#00ff00' : '#ffff00'}
        lineWidth={path.isPrimary ? 4 : 2}
        dashed={!path.isPrimary}
        dashScale={1}
        dashSize={0.5}
        gapSize={0.5}
      />
      {/* Arrow indicators along the path */}
      {path.points.map((point, index) => {
        if (index % 3 === 0 && index < path.points.length - 1) {
          const nextPoint = path.points[index + 1];
          const direction = new THREE.Vector3(
            nextPoint[0] - point[0],
            nextPoint[1] - point[1],
            nextPoint[2] - point[2]
          ).normalize();

          return (
            <group key={index} position={point}>
              <Sphere args={[0.2, 8, 8]}>
                <meshStandardMaterial color={path.isPrimary ? '#00ff00' : '#ffff00'} />
              </Sphere>
            </group>
          );
        }
        return null;
      })}
    </>
  );
};

// Exit Point Component
const ExitPoint3D: React.FC<{ position: [number, number, number]; isPrimary?: boolean }> = ({ position, isPrimary }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group position={position}>
      <Box ref={meshRef} args={[1, 2, 0.2]}>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </Box>
      <Text
        position={[0, 2, 0]}
        fontSize={0.8}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        EXIT
      </Text>
      {isPrimary && (
        <pointLight position={[0, 1, 1]} color="#00ff00" intensity={2} distance={10} />
      )}
    </group>
  );
};

// Assembly Point Component
const AssemblyPoint3D: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Sphere args={[2, 16, 16]}>
        <meshStandardMaterial 
          color="#0080ff" 
          transparent 
          opacity={0.5}
          wireframe
        />
      </Sphere>
      <Text
        position={[0, 3, 0]}
        fontSize={1}
        color="#0080ff"
        anchorX="center"
        anchorY="middle"
      >
        ASSEMBLY POINT
      </Text>
      <Html position={[0, -3, 0]} center>
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
          Safe Zone
        </div>
      </Html>
    </group>
  );
};

// Person Simulator for evacuation
const Person3D: React.FC<{ startPosition: [number, number, number]; path: [number, number, number][]; speed: number }> = ({ startPosition, path, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [position, setPosition] = useState(startPosition);

  useFrame((state, delta) => {
    if (meshRef.current && currentPathIndex < path.length) {
      const target = path[currentPathIndex];
      const direction = new THREE.Vector3(
        target[0] - position[0],
        target[1] - position[1],
        target[2] - position[2]
      );
      
      const distance = direction.length();
      if (distance > 0.1) {
        direction.normalize();
        const movement = direction.multiplyScalar(speed * delta);
        const newPosition: [number, number, number] = [
          position[0] + movement.x,
          position[1] + movement.y,
          position[2] + movement.z
        ];
        setPosition(newPosition);
        meshRef.current.position.set(...newPosition);
      } else {
        setCurrentPathIndex(currentPathIndex + 1);
      }
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.3, 8, 8]} position={position}>
      <meshStandardMaterial color="#ff00ff" />
    </Sphere>
  );
};

// Main 3D Evacuation Route Component
const EvacuationRoute3D: React.FC<EvacuationRoute3DProps> = ({ 
  floorPlan, 
  simulationMode = false,
  onSimulationComplete,
  visualEffects 
}) => {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [evacuees, setEvacuees] = useState<Array<{ id: string; startPosition: [number, number, number]; path: [number, number, number][] }>>([]);

  useEffect(() => {
    if (simulationMode && simulationStarted) {
      const timer = setInterval(() => {
        setSimulationTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [simulationMode, simulationStarted]);

  const startSimulation = () => {
    setSimulationStarted(true);
    // Create evacuees in each classroom
    const newEvacuees = floorPlan.rooms
      .filter(room => room.type === 'classroom')
      .map((room, index) => ({
        id: `evacuee-${index}`,
        startPosition: room.position,
        path: floorPlan.evacuationPaths[0]?.points || []
      }));
    setEvacuees(newEvacuees);
  };

  const resetSimulation = () => {
    setSimulationStarted(false);
    setSimulationTime(0);
    setEvacuees([]);
  };

  return (
    <div className="relative w-full h-full">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-bold text-lg mb-2">Evacuation Route Viewer</h3>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-semibold">Floor:</span> {floorPlan.name}
          </div>
          <div className="text-sm">
            <span className="font-semibold">Level:</span> {floorPlan.floor}
          </div>
          {simulationMode && (
            <>
              <div className="text-sm">
                <span className="font-semibold">Simulation Time:</span> {simulationTime}s
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startSimulation}
                  disabled={simulationStarted}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Start Drill
                </button>
                <button
                  onClick={resetSimulation}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <h4 className="font-bold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400"></div>
            <span>Classroom</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 opacity-50"></div>
            <span>Hallway</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span>Exit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500"></div>
            <span>Assembly Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span>Hazard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500"></div>
            <span>Primary Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-yellow-500 border-dashed border-t-2 border-yellow-500"></div>
            <span>Alternative Route</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [15, 15, 15], fov: 60 }}>
        {/* Sky and Fog for atmospheric depth */}
        <Sky sunPosition={visualEffects?.skySunPosition || [50, 20, 50]} turbidity={6} rayleigh={1.2} mieCoefficient={0.01} mieDirectionalG={0.8} inclination={0.49} azimuth={0.25} />
        {/* Fog */}
        {/* @ts-ignore */}
        <fog attach="fog" args={[visualEffects?.fogColor || '#cfe8ff', visualEffects?.fogNear || 20, visualEffects?.fogFar || 120]} />

        {/* Lights */}
        <ambientLight intensity={visualEffects?.ambientIntensity ?? 0.6} />
        <directionalLight position={[10, 15, 5]} intensity={visualEffects?.dirLightIntensity ?? 1.2} castShadow />

        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Grid Floor */}
        <gridHelper args={[50, 50]} />
        
        {/* Render Rooms */}
        {floorPlan.rooms.map(room => (
          <group key={room.id}>
            <Room3D 
              room={room} 
              isActive={room.id === activeRoomId}
            />
            {/* Subtle hazard particles near hazardous rooms for visual impact */}
            {room.isHazard && (
              <group position={[room.position[0], room.position[1] + room.size[1] / 2, room.position[2]]}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Sphere key={i} args={[0.08, 6, 6]} position={[Math.sin(i) * 0.5, (i % 3) * 0.2, Math.cos(i) * 0.5]}>
                    <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.8} transparent opacity={0.7} />
                  </Sphere>
                ))}
              </group>
            )}
          </group>
        ))}
        
        {/* Render Evacuation Paths */}
        {floorPlan.evacuationPaths.map(path => (
          <EvacuationPath3D 
            key={path.id} 
            path={path} 
            animated={simulationStarted}
          />
        ))}
        
        {/* Render Exit Points */}
        {floorPlan.exitPoints.map((exit, index) => (
          <ExitPoint3D 
            key={`exit-${index}`} 
            position={exit} 
            isPrimary={index === 0}
          />
        ))}
        
        {/* Render Assembly Point */}
        <AssemblyPoint3D position={floorPlan.assemblyPoint} />
        
        {/* Render Evacuees during simulation */}
        {simulationStarted && evacuees.map(evacuee => (
          <Person3D 
            key={evacuee.id}
            startPosition={evacuee.startPosition}
            path={evacuee.path}
            speed={2}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default EvacuationRoute3D;
