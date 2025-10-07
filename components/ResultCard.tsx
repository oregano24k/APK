import React, { useState } from 'react';
import { Step, Action } from '../App';
import { CodeBlock } from './CodeBlock';
import { ActionButton } from './ActionButton';
import DetailsDisplay from './DetailsDisplay';
import Step3MacOS from './Step3MacOS';

interface ResultCardProps {
  steps: Step[];
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ steps, onReset }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  const currentStep = steps[currentStepIndex];

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

  // Lógica de detección específica para el Paso 3 de macOS/Linux
  const isMacOSStep3 = currentStep.actions?.some(a => a.group === 'shell_check');

  // La lógica de agrupación genérica se mantiene para otros pasos (ej. Windows)
  const groupedActions = !isMacOSStep3 ? currentStep.actions?.reduce((acc, action) => {
    const groupKey = action.group || 'default';
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(action);
    return acc;
  }, {} as Record<string, Action[]>) : null;


  return (
    <div className="mt-10 p-6 sm:p-8 bg-white border border-gray-200 rounded-xl shadow-2xl animate-fade-in">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-500 to-cyan-500 text-transparent bg-clip-text mb-2">
        Tu Guía Interactiva
      </h2>
      <p className="text-center text-gray-500 font-semibold mb-8">
        Paso {currentStepIndex + 1} de {steps.length}
      </p>
      
      <div className="border border-gray-200 rounded-lg bg-gray-50/50 p-6 min-h-[300px] flex flex-col transition-all duration-300">
        <h3 className="text-2xl font-bold text-cyan-700 mb-4">{currentStep.title}</h3>
        
        <div className="flex-grow">
            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{currentStep.explanation}</p>
            
            {currentStep.command && (
              <div className="my-4">
                <CodeBlock command={currentStep.command} />
              </div>
            )}

            {/* Bifurcación de renderizado: usa el nuevo componente para el Paso 3 de macOS, o el antiguo para el resto */}
            {isMacOSStep3 ? (
                <Step3MacOS actions={currentStep.actions!} details={currentStep.details} />
            ) : (
                <>
                    {groupedActions && (
                      <div className="mt-6 space-y-6">
                         {/* Grupo por Defecto (para el resto de los pasos con acciones, ej. Windows) */}
                         {groupedActions.default && (
                           <div className="pt-4 border-t first:pt-0 first:border-0">
                             <div className="flex flex-wrap gap-3">
                                {groupedActions.default.map((action, i) => <ActionButton key={`def-${i}`} action={action} />)}
                             </div>
                           </div>
                         )}
                          {groupedActions.validation && (
                            <div className="pt-4 border-t">
                                <h4 className="text-base font-semibold text-gray-800 mb-2">Valida tu Configuración</h4>
                                <p className="text-sm text-gray-600 mb-3">Usa estos botones para confirmar que todo funciona. Si recibes un error, revisa las instrucciones en la sección de detalles.</p>
                                <div className="flex flex-wrap gap-3">
                                {groupedActions.validation.map((action, i) => <ActionButton key={`val-${i}`} action={action} />)}
                                </div>
                            </div>
                         )}
                      </div>
                    )}
                    {currentStep.details && (
                        <DetailsDisplay details={currentStep.details} />
                    )}
                </>
            )}
          </div>
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
