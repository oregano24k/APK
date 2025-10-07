import React, { useState, useMemo } from 'react';
import { Action } from '../App';
import { ActionButton } from './ActionButton';
import DetailsDisplay from './DetailsDisplay';
import { CheckIcon } from './icons/CheckIcon';

interface Step3MacOSProps {
  actions: Action[];
  details?: string;
}

const SUB_STEPS_CONFIG = [
  {
    key: 'shell_check',
    title: 'Identificar Shell',
    description: 'Ejecuta este comando para saber qué opción (A o B) usar en los siguientes pasos.',
    actionGroups: ['shell_check'],
  },
  {
    key: 'setup_files',
    title: 'Crear y Abrir Archivo',
    description: 'Primero, haz clic en "Crear Archivo" para asegurarte de que exista. Luego, haz clic en "Abrir Archivo" para editarlo.',
    actionGroups: ['zshrc_setup', 'bash_setup'],
  },
  {
    key: 'copy_block',
    title: 'Copiar Bloque de Configuración',
    description: "Pega este bloque al final del archivo que abriste. No olvides reemplazar 'TU_RUTA_ANDROID_SDK'.",
    actionGroups: ['common'],
  },
  {
    key: 'apply_changes',
    title: 'Aplicar Cambios',
    description: 'Guarda y cierra el archivo. Luego, usa el botón correspondiente a tu shell para que la terminal reconozca los cambios.',
    actionGroups: ['zshrc_apply', 'bash_apply'],
  },
  {
    key: 'validation',
    title: 'Validar Configuración',
    description: 'Usa estos botones para confirmar que todo funciona. Si recibes un error, revisa las instrucciones en la sección de detalles más abajo.',
    actionGroups: ['validation'],
  },
];

const Step3MacOS: React.FC<Step3MacOSProps> = ({ actions, details }) => {
  const [activeSubStep, setActiveSubStep] = useState(0);

  const groupedActions = useMemo(() => actions.reduce((acc, action) => {
    const groupKey = action.group || 'default';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(action);
    return acc;
  }, {} as Record<string, Action[]>), [actions]);

  const currentSubStepConfig = SUB_STEPS_CONFIG[activeSubStep];

  const renderActionsForSubStep = () => {
    const actionGroupsToRender = currentSubStepConfig.actionGroups;
    const hasMultipleOptions = actionGroupsToRender.length > 1;

    if (hasMultipleOptions) { // Para ZSH vs Bash
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">Opción A: ZSH (si tu shell es '/bin/zsh')</p>
            <div className="flex flex-col items-start gap-3">
              {groupedActions[actionGroupsToRender[0]]?.map((action, i) => (
                <ActionButton key={`${actionGroupsToRender[0]}-${i}`} action={action} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">Opción B: Bash (si tu shell es '/bin/bash')</p>
            <div className="flex flex-col items-start gap-3">
              {groupedActions[actionGroupsToRender[1]]?.map((action, i) => (
                <ActionButton key={`${actionGroupsToRender[1]}-${i}`} action={action} />
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // Para un solo grupo de acciones
    return (
      <div className="flex flex-wrap gap-3">
        {groupedActions[actionGroupsToRender[0]]?.map((action, i) => (
          <ActionButton key={`${actionGroupsToRender[0]}-${i}`} action={action} />
        ))}
      </div>
    );
  };


  return (
    <div className="mt-4 border-t pt-4">
      {/* Stepper UI */}
      <div className="flex items-center justify-between mb-6 px-2">
        {SUB_STEPS_CONFIG.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index < activeSubStep ? 'bg-green-500 text-white' : 
                  index === activeSubStep ? 'bg-cyan-600 text-white ring-4 ring-cyan-200' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index < activeSubStep ? <CheckIcon className="w-5 h-5"/> : <span>{index + 1}</span>}
              </div>
              <p className={`mt-2 text-xs font-semibold ${index <= activeSubStep ? 'text-cyan-700' : 'text-gray-500'}`}>{step.title}</p>
            </div>
            {index < SUB_STEPS_CONFIG.length - 1 && <div className="flex-1 h-1 bg-gray-200 mx-2"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Content for active sub-step */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[150px]">
         <h4 className="text-base font-semibold text-gray-800 mb-2">{`Sub-Paso ${activeSubStep + 1}: ${currentSubStepConfig.title}`}</h4>
         <p className="text-sm text-gray-600 mb-4">{currentSubStepConfig.description}</p>
         {renderActionsForSubStep()}
      </div>

      {/* Details Section */}
      {details && (
        <DetailsDisplay details={details} />
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-end items-center gap-4">
        <button
          onClick={() => setActiveSubStep(s => s - 1)}
          disabled={activeSubStep === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => setActiveSubStep(s => s + 1)}
          disabled={activeSubStep === SUB_STEPS_CONFIG.length - 1}
          className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Siguiente Sub-Paso
        </button>
      </div>
    </div>
  );
};

export default Step3MacOS;
