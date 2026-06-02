import React, { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';

/**
 * TagInput Component
 * @param {Object} props
 * @param {Array<string>} props.value - Array of tag strings
 * @param {Function} props.onChange - Callback function when tags change (value) => void
 * @param {string} [props.placeholder] - Input placeholder text
 */
const TagInput = ({ value = [], onChange, onInputChange, placeholder = 'Add item...' }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      const updatedTags = [...value, trimmed];
      onChange(updatedTags);
      setInputValue('');
      if (onInputChange) onInputChange('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      const updatedTags = value.slice(0, -1);
      onChange(updatedTags);
    }
  };

  const removeTag = (indexToRemove) => {
    const updatedTags = value.filter((_, idx) => idx !== indexToRemove);
    onChange(updatedTags);
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      onClick={focusInput}
      className="flex flex-wrap items-center gap-2 p-2 min-h-[44px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200 cursor-text"
    >
      {/* List of tags */}
      {value.map((tag, idx) => (
        <span
          key={idx}
          className="flex items-center space-x-1 pl-3 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 animate-in zoom-in-95 duration-150"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(idx);
            }}
            className="p-0.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}

      {/* Input element */}
      <div className="flex-1 min-w-[120px] flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (onInputChange) onInputChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="w-full bg-transparent border-0 p-0 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-0 focus:outline-none"
        />
        {inputValue.trim() && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addTag();
            }}
            className="p-1 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-500 hover:text-indigo-700 transition-colors"
            title="Add tag"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TagInput;
