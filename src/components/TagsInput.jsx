import React, { useState } from 'react';

function TagsInput({ tags, onChange }) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            const newTag = inputValue.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            
            if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
            }
            setInputValue('');
        } else if (event.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            // Remove last tag when backspace is pressed on empty input
            const newTags = [...tags];
            newTags.pop();
            onChange(newTags);
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };
    
    const handlePaste = (event) => {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text');
        const pastedTags = pasteData.split(/[\s,]+/).map(tag => tag.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));
        const validNewTags = pastedTags.filter(tag => tag && !tags.includes(tag));
        
        if (validNewTags.length > 0) {
            onChange([...tags, ...new Set(validNewTags)]);
        }
    };

    return (
        <div className="react-tagsinput">
            {tags.map(tag => (
                <span key={tag} className="react-tagsinput-tag">
                    {tag}
                    <button
                        type="button"
                        className="react-tagsinput-remove"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove ${tag} tag`}
                    />
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Add tags (press Enter...)"
                className="react-tagsinput-input"
            />
        </div>
    );
}

export default TagsInput;
