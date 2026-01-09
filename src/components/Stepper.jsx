import React from 'react';

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center min-w-[60px] sm:min-w-0">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
                style={{
                  background: isActive
                    ? '#3F6FA6'
                    : isCompleted
                    ? '#10B981'
                    : '#E5E7EB',
                  color: isActive || isCompleted ? '#FFFFFF' : '#6B7280',
                }}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <div
                className={`mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-center ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
                style={{
                  color: isActive ? '#3F6FA6' : '#6B7280',
                }}
              >
                <span className="hidden sm:inline">{step}</span>
                <span className="sm:hidden">{isActive ? step : ''}</span>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 flex-shrink-0 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
                style={{
                  background: isCompleted ? '#10B981' : '#D1D5DB',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
