import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizeClasses = {
  sm: {
    wrapper: 'w-9 h-5',
    circle: 'h-4 w-4',
    translate: 'translate-x-4',
    top: 'top-[2px]',
  },
  md: {
    wrapper: 'w-11 h-6',
    circle: 'h-5 w-5',
    translate: 'translate-x-5',
    top: 'top-[2px]',
  },
  lg: {
    wrapper: 'w-14 h-7',
    circle: 'h-6 w-6',
    translate: 'translate-x-7',
    top: 'top-[2px]',
  },
};

export const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  size = 'md',
  disabled = false 
}) => {
  const classes = sizeClasses[size];

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`
          relative ${classes.wrapper}
          bg-gray-200
          peer-focus:outline-none
          peer-focus:ring-4
          peer-focus:ring-primary/30
          dark:peer-focus:ring-primary/30
          rounded-full
          peer
          dark:bg-gray-700
          peer-checked:after:${classes.translate}
          peer-checked:after:border-white
          after:content-['']
          after:absolute
          after:${classes.top}
          after:start-[2px]
          after:bg-white
          after:border-gray-300
          after:border
          after:rounded-full
          after:${classes.circle}
          after:transition-all
          dark:border-gray-600
          peer-checked:bg-primary
          dark:peer-checked:bg-primary
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          transition-all duration-200
        `}
      />
    </label>
  );
};

export default Toggle; 