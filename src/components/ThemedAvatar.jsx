import React from 'react';
import { User } from 'lucide-react';
import logger from '../logger';
function ThemedAvatar({ profilePicUrl, username, className = "w-9 h-9" }) {
  const initial = (username && username.length > 0) ? username[0].toUpperCase() : '?';
  let textSize = "text-lg";
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
            logger.error("Failed to load profile pic URL:", profilePicUrl);
        }}
      />
    );
  }
  return (
    <div
      style={{ backgroundColor: 'var(--color-primary-hex, #14b8a6)' }}
      className={`rounded-full flex items-center justify-center ${className}`}
      title={username || 'Curiosity User'}
    >
      {}
      <span className={`text-white font-semibold ${textSize}`}>
        {initial}
      </span>
    </div>
  );
}
export default ThemedAvatar;
