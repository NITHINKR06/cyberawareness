import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Zap, Shield, AlertTriangle, Play, Pause } from 'lucide-react';
import './TimeMachine.css';

interface TimeMachineInterfaceProps {
  onEraSelect: (year: number) => void;
  selectedEra: number | null;
}

export default function TimeMachineInterface({ onEraSelect, selectedEra }: TimeMachineInterfaceProps) {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const eras = [
    { 
      year: 2015, 
      name: t('timeMachine.classicScams'),
      icon: <Clock className="w-4 h-4 sm:w-6 sm:h-6" />,
      description: t('timeMachine.classicEra'),
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-900/20 to-orange-900/20'
    },
    { 
      year: 2025, 
      name: t('timeMachine.modernThreats'),
      icon: <Zap className="w-4 h-4 sm:w-6 sm:h-6" />,
      description: t('timeMachine.modernEra'),
      color: 'from-blue-500 to-purple-600',
      bgColor: 'from-blue-900/20 to-purple-900/20'
    },
    { 
      year: 2035, 
      name: t('timeMachine.futureFrauds'),
      icon: <Shield className="w-4 h-4 sm:w-6 sm:h-6" />,
      description: t('timeMachine.futureEra'),
      color: 'from-green-500 to-teal-600',
      bgColor: 'from-green-900/20 to-teal-900/20'
    },
  ];

  const handleEraSelect = (year: number) => {
    setIsTimeTraveling(true);
    setIsActive(true);
    setTimeout(() => {
      onEraSelect(year);
      setIsActive(false);
      setIsTimeTraveling(false);
    }, 3000);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* 3D Dimensional Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div 
          className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 time-machine-orb"
          style={{
            top: `${mousePosition.y * 0.1}px`,
            left: `${mousePosition.x * 0.1}px`,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 time-machine-orb"
          style={{
            top: `${mousePosition.y * -0.1 + 200}px`,
            right: `${mousePosition.x * 0.1}px`,
            transform: 'translate(50%, -50%)'
          }}
        ></div>
        <div 
          className="absolute w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 time-machine-orb"
          style={{
            bottom: `${mousePosition.y * 0.05}px`,
            left: `${mousePosition.x * -0.1}px`,
            transform: 'translate(-50%, 50%)'
          }}
        ></div>

        {/* Dimensional Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div
                key={i}
                className="border border-white/5 hover:border-white/20 transition-all duration-1000 time-machine-grid"
                style={{
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Time Rift Effect */}
        {isTimeTraveling && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent time-rift"></div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Time Machine Controls */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center space-x-2 sm:space-x-4 bg-black/40 backdrop-blur-xl rounded-full px-4 py-2 sm:px-8 sm:py-4 border border-white/30 shadow-2xl">
            <div className="relative">
              <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
              {isTimeTraveling && (
                <div className="absolute inset-0 animate-ping">
                  <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
                </div>
              )}
            </div>
            <span className="text-white font-semibold text-sm sm:text-base">
              {isTimeTraveling ? 'TIME TRAVELING...' : 'TIME MACHINE ACTIVE'}
            </span>
            <div className="relative">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              {isTimeTraveling && (
                <div className="absolute inset-0 animate-ping">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="mb-8 sm:mb-12 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            {t('timeMachine.title')}
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('timeMachine.subtitle')}
          </p>
        </div>

        {/* Era Selection Cards */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {eras.map((era, index) => (
              <div
                key={era.year}
                className={`relative group cursor-pointer transform transition-all duration-700 hover-lift time-machine-card ${
                  selectedEra === era.year ? 'scale-105 ring-4 ring-white/50' : ''
                }`}
                onClick={() => handleEraSelect(era.year)}
                style={{
                  animationDelay: `${index * 0.5}s`
                }}
              >
                {/* 3D Card Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${era.color} rounded-2xl opacity-80 group-hover:opacity-100 transition-all duration-500 transform group-hover:rotate-1`}></div>
                
                {/* Glass Effect with 3D Depth */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 group-hover:border-white/40 transition-all duration-500 shadow-2xl group-hover:shadow-3xl">
                  {/* Year Display with 3D Effect */}
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {era.year}
                  </div>
                  
                  {/* Icon with Animation */}
                  <div className="text-white mb-3 sm:mb-4 flex justify-center transform group-hover:rotate-12 transition-transform duration-300">
                    {era.icon}
                  </div>
                  
                  {/* Era Name */}
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                    {era.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-200 text-xs sm:text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
                    {era.description}
                  </p>
                  
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Time Travel Animation */}
                  {isActive && selectedEra === era.year && (
                    <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping"></div>
                  )}

                  {/* 3D Border Effect */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-all duration-300"></div>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white/30 rounded-full time-machine-particle"
                      style={{
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 20}%`,
                        animationDelay: `${i * 0.5}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions with 3D Effect */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="inline-block bg-black/30 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
              {t('timeMachine.selectEraInstruction')}
            </p>
          </div>
          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
