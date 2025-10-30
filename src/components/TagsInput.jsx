import React, { useState } from 'react';

function TagsInput({ tags, onChange }) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            const newTag = inputValue.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
            
            if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };
    
    const handlePaste = (event) => {
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text');
        const pastedTags = pasteData.split(/[\s,]+/).map(tag => tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''));
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
                    <a className="react-tagsinput-remove" onClick={() => handleRemoveTag(tag)} />
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
