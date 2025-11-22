import { useState } from 'react';
import { Smile } from 'lucide-react';

const EMOJI_CATEGORIES = {
  '😀': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  '❤️': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈'],
  '👍': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾'],
  '🎉': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🎃', '🎄', '🎅', '🤶', '🧑‍🎄', '🎆', '🎇', '✨', '🎊', '🎋', '🎍', '🎎', '🎏', '🎐', '🎑', '🧧', '🎀', '🎁', '🎗️', '🎟️', '🎫', '🎖️', '🏆', '🏅', '🥇', '🥈'],
  '🔥': ['🔥', '💥', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💢', '💯', '💨', '💦', '💤', '🕳️', '🎯', '🎲', '🧩', '🎮', '🕹️', '🎰', '🎳', '🎯', '🎲', '🧩', '🎮', '🕹️', '🎰', '🎳', '🎴', '🃏', '🀄', '🎲'],
  '🚀': ['🚀', '✈️', '🛫', '🛬', '🛩️', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸', '🛎️', '🧳', '⌛', '⏳', '⌚', '⏰', '⏱️', '⏲️', '🕰️', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞', '🕓', '🕟']
};

function EmojiPicker({ onEmojiSelect, isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('😀');

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-2xl border border-gray-200 p-3 w-80 max-h-64 overflow-hidden flex flex-col z-50">
      <div className="flex gap-1 mb-2 border-b pb-2 overflow-x-auto">
        {Object.keys(EMOJI_CATEGORIES).map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`text-2xl p-1 rounded transition-colors ${
              activeCategory === category ? 'bg-primary-100' : 'hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeCategory].map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
              className="text-2xl p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmojiPicker;

