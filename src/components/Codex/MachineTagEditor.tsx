/**
 * Machine Tag Editor Component
 * 
 * Allows users to add, remove, and manage custom tags for codex machines.
 * Features autocomplete, max 5 tags limit, and tag filtering.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMachineTagsStore } from '../../store/useMachineTagsStore';
import { MAX_TAGS_PER_MACHINE, MAX_TAG_LENGTH } from '../../types';

interface MachineTagEditorProps {
  machineId: string;
  onClose: () => void;
}

export function MachineTagEditor({ machineId, onClose }: MachineTagEditorProps) {
  // Get store state
  const currentTags = useMachineTagsStore((s) => s.getTags)(machineId);
  const addTagAction = useMachineTagsStore((s) => s.addTag);
  const removeTagAction = useMachineTagsStore((s) => s.removeTag);
  
  // Local state
  const [inputValue, setInputValue] = useState('');
  const [autocompleteTags, setAutocompleteTags] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Local tags state (synced with store)
  const [tags, setTags] = useState<string[]>(currentTags);
  
  // Get autocomplete suggestions
  const getAutocomplete = useMachineTagsStore((s) => s.getAutocomplete);
  
  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setError(null);
    
    if (value.trim()) {
      const suggestions = getAutocomplete(value, 8);
      setAutocompleteTags(suggestions);
      setShowAutocomplete(suggestions.length > 0);
    } else {
      setAutocompleteTags([]);
      setShowAutocomplete(false);
    }
  }, [getAutocomplete]);
  
  // Add tag
  const handleAddTag = useCallback((tag: string) => {
    const result = addTagAction(machineId, tag);
    
    if (result.success) {
      setTags((prev) => [...prev, tag.toLowerCase().trim()]);
      setInputValue('');
      setShowAutocomplete(false);
      setError(null);
    } else {
      setError(result.error || 'Failed to add tag');
    }
  }, [machineId, addTagAction]);
  
  // Remove tag
  const handleRemoveTag = useCallback((tag: string) => {
    removeTagAction(machineId, tag);
    setTags((prev) => prev.filter((t) => t !== tag));
  }, [machineId, removeTagAction]);
  
  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setInputValue('');
    }
  }, [inputValue, handleAddTag]);
  
  // Handle autocomplete selection
  const handleAutocompleteSelect = useCallback((tag: string) => {
    handleAddTag(tag);
  }, [handleAddTag]);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const canAddMore = tags.length < MAX_TAGS_PER_MACHINE;
  
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md mx-4 bg-[#121826] border border-[#1e2a42] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a42]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <h3 className="text-base font-bold text-white">Edit Tags</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
            aria-label="Close tag editor"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#9ca3af]">
                Tags ({tags.length}/{MAX_TAGS_PER_MACHINE})
              </span>
              {!canAddMore && (
                <span className="text-xs text-[#fbbf24]">
                  Maximum tags reached
                </span>
              )}
            </div>
            
            {/* Tags display */}
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {tags.length === 0 ? (
                <span className="text-sm text-[#4a5568] italic">No tags yet</span>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7c3aed]/20 text-[#a78bfa] text-sm group"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="w-4 h-4 rounded-full bg-[#7c3aed]/40 hover:bg-[#ef4444] flex items-center justify-center text-xs transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
          
          {/* Add tag input */}
          {canAddMore && (
            <div className="relative" ref={dropdownRef}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (autocompleteTags.length > 0) {
                    setShowAutocomplete(true);
                  }
                }}
                placeholder="Add a tag..."
                maxLength={MAX_TAG_LENGTH}
                className="w-full bg-[#0a0e17] border border-[#1e2a42] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition-colors"
                aria-label="Enter tag name"
              />
              
              {/* Autocomplete dropdown */}
              {showAutocomplete && autocompleteTags.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e2a42] border border-[#2d3a56] rounded-lg shadow-xl overflow-hidden z-10">
                  {autocompleteTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAutocompleteSelect(tag)}
                      className="w-full px-3 py-2 text-left text-sm text-[#e2e8f0] hover:bg-[#7c3aed]/30 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
              <span className="text-sm text-[#fca5a5]">{error}</span>
            </div>
          )}
          
          {/* Info */}
          <div className="text-xs text-[#6b7280]">
            <p>Tags help you organize your machines. Press Enter or click a suggestion to add.</p>
            <p className="mt-1">Only letters, numbers, hyphens, and underscores allowed.</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#1e2a42] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default MachineTagEditor;
