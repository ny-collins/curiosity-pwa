// src/components/ThemedAvatar.jsx
import React from 'react';
import { User } from 'lucide-react';

// Renders either the profile pic URL or a themed initial
function ThemedAvatar({ profilePicUrl, username, className }) {
  // Get the first initial, default to 'C'
  const initial = (username && username.length > 0) ? username[0].toUpperCase() : 'C';

  if (profilePicUrl) {
    return (
      <img 
        src={profilePicUrl}
        alt="Profile"
        className={`rounded-full object-cover ${className}`}
        // Fallback to placeholder if URL image fails to load
        onError={(e) => { 
            e.target.onerror = null; 
            // Try a generic placeholder? Or default to initial?
            // For now, let's just note the error
            console.error("Failed to load profile pic URL:", profilePicUrl);
            // We could have it render the initial component on error
            // but that requires more state.
        }}
      />
    );
  }

  // No profile pic - render themed initial
  return (
    <div
      // Use inline style to set the background color from our CSS variable
      style={{ backgroundColor: 'var(--color-primary-hex, #14b8a6)' }}
      className={`rounded-full flex items-center justify-center ${className}`}
      title={username || 'Curiosity User'}
    >
      <span className="text-white font-semibold" style={{ fontSize: `calc(${className.match(/w-(\d+)/)?.[1] || 10}px / 2)` }}>
        {initial}
      </span>
    </div>
  );
}

export default ThemedAvatar;
