// src/components/ThemedAvatar.jsx
import React from 'react';
import { User } from 'lucide-react';

function ThemedAvatar({ profilePicUrl, username, className = "w-9 h-9" }) { // Default size
  const initial = (username && username.length > 0) ? username[0].toUpperCase() : '?';

  // Determine text size based on container size class
  let textSize = "text-lg"; // Default
  if (className.includes("w-8") || className.includes("h-8")) textSize = "text-base";
  if (className.includes("w-10") || className.includes("h-10")) textSize = "text-xl";
  if (className.includes("w-12") || className.includes("h-12")) textSize = "text-2xl";


  if (profilePicUrl) {
    return (
      <img 
        src={profilePicUrl}
        alt="Profile"
        className={`rounded-full object-cover ${className}`}
        onError={(e) => { 
            e.target.onerror = null; 
            // Handle error: Maybe set a flag to render the initial component?
            // For now, let's just log it.
            console.error("Failed to load profile pic URL:", profilePicUrl);
        }}
      />
    );
  }

  // No profile pic - render themed initial
  return (
    <div
      style={{ backgroundColor: 'var(--color-primary-hex, #14b8a6)' }}
      className={`rounded-full flex items-center justify-center ${className}`}
      title={username || 'Curiosity User'}
    >
      {/* Use dynamic text size */}
      <span className={`text-white font-semibold ${textSize}`}>
        {initial}
      </span>
    </div>
  );
}

export default ThemedAvatar;
