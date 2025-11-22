import { useState } from 'react';
import { universities } from '../data/universities';
import { Search, Check } from 'lucide-react';

function UniversitySelector({ selectedUniversity, onSelect, showSearch = true }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUni = universities.find(u => u.id === selectedUniversity) || universities.find(u => u.name === selectedUniversity);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Your University
      </label>
      
      {/* Selected University Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedUni ? (
            <>
              <img
                src={selectedUni.logo}
                alt={selectedUni.shortName}
                className="w-10 h-10 object-contain rounded bg-gray-100"
              />
              <div className="text-left">
                <p className="font-medium text-gray-800">{selectedUni.shortName}</p>
                <p className="text-xs text-gray-500">{selectedUni.city}</p>
              </div>
            </>
          ) : (
            <span className="text-gray-500">Select a university...</span>
          )}
        </div>
        <Search size={18} className="text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-hidden">
          {showSearch && (
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-80">
            {filteredUniversities.map((uni) => (
              <button
                key={uni.id}
                type="button"
                onClick={() => {
                  onSelect(uni);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  selectedUniversity === uni.id || selectedUniversity === uni.name
                    ? 'bg-primary-50 border-l-4 border-primary-500'
                    : ''
                }`}
              >
                        <img
                          src={uni.logo}
                          alt={uni.shortName}
                          className="w-12 h-12 object-contain rounded p-1 bg-gray-50"
                        />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800">{uni.shortName}</p>
                  <p className="text-xs text-gray-500">{uni.name}</p>
                  <p className="text-xs text-gray-400">{uni.city} • {uni.type}</p>
                </div>
                {(selectedUniversity === uni.id || selectedUniversity === uni.name) && (
                  <Check size={20} className="text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default UniversitySelector;

