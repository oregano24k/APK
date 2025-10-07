import React, { useState, useEffect } from 'react';
import { Step } from '../App';
import { CodeBlock } from './CodeBlock';
import { ActionButton } from './ActionButton';
import DetailsDisplay from './DetailsDisplay';

interface ResultCardProps {
  steps: Step[];
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ steps, onReset }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedOS, setSelectedOS] = useState<'macos_linux' | 'windows' | null>(null);

  const currentStep = steps[currentStepIndex];

  // Restablecer la selección de SO cuando cambia el paso
  useEffect(() => {
    setSelectedOS(null);
  }, [currentStepIndex]);


  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  
  const isOsStep = currentStep.isOsSpecific && currentStep.osInstructions;
  const instructions = isOsStep && selectedOS ? currentStep.osInstructions![selectedOS] : currentStep;


  return (
    <div className="mt-10 p-6 sm:p-8 bg-white border border-gray-200 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-500 to-cyan-500 text-transparent bg-clip-text mb-2">
        Tu Guía Interactiva
      </h2>
      <p className="text-center text-gray-500 font-semibold mb-8">
        Paso {currentStepIndex + 1} de {steps.length}
      </p>
      
      <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-6 min-h-[300px] flex flex-col transition-all duration-300">
        <h3 className="text-2xl font-bold text-cyan-700 mb-4">{currentStep.title}</h3>
        
        {/* Selector de SO */}
        {isOsStep && !selectedOS && (
          <div className="flex-grow flex flex-col justify-center">
            <p className="text-gray-700 leading-relaxed mb-6 text-center">{currentStep.explanation}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                  onClick={() => setSelectedOS('macos_linux')}
                  className="p-6 border-2 border-gray-300 rounded-lg text-left hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300"
                >
                  <span className="text-2xl" role="img" aria-label="Apple">💻</span>
                  <h4 className="font-bold text-lg text-gray-800 mt-2">macOS / Linux</h4>
                  <p className="text-sm text-gray-600">Para terminales ZSH o Bash.</p>
                </button>
                 <button 
                  onClick={() => setSelectedOS('windows')}
                  className="p-6 border-2 border-gray-300 rounded-lg text-left hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-300"
                 >
                  <span className="text-2xl" role="img" aria-label="Windows">🖥️</span>
                  <h4 className="font-bold text-lg text-gray-800 mt-2">Windows</h4>
                   <p className="text-sm text-gray-600">Configuración manual del sistema.</p>
                </button>
            </div>
          </div>
        )}

        {/* Contenido del Paso */}
        {(!isOsStep || selectedOS) && (
           <div className="flex-grow">
            {isOsStep && selectedOS && (
              <button onClick={() => setSelectedOS(null)} className="text-sm text-cyan-600 hover:underline mb-4">
                &larr; Cambiar sistema operativo
              </button>
            )}

            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{instructions.explanation}</p>
            
            {/* Fix: Display the command block even if actions are present. */}
            {instructions.command && (
              <div className="my-4">
                <CodeBlock command={instructions.command} />
              </div>
            )}

            {instructions.actions && instructions.actions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {instructions.actions.map((action, actionIndex) => (
                  <ActionButton key={actionIndex} action={action} />
                ))}
              </div>
            )}

            {instructions.details && (
                <DetailsDisplay details={instructions.details} />
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={isFirstStep}
          className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={isLastStep ? onReset : handleNext}
          className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-cyan-500 transition-all duration-300"
        >
          {isLastStep ? 'Comenzar de Nuevo' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
};

export default ResultCard;