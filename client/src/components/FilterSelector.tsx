import React from 'react';
import { Sparkles } from 'lucide-react';
import { StyleFilter } from '../types';
import { formatPrice } from '../utils/payment';

interface FilterSelectorProps {
  filters: StyleFilter[];
  selectedFilter: StyleFilter | null;
  onFilterSelect: (filter: StyleFilter) => void;
  disabled?: boolean;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  filters,
  selectedFilter,
  onFilterSelect,
  disabled = false
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Choose Your Style
        </h2>
        <p className="text-gray-600">
          Transform your photo with AI-powered artistic filters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className={`group relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer ${
              selectedFilter?.id === filter.id
                ? 'border-purple-400 shadow-purple-200 shadow-xl scale-105'
                : 'border-gray-100 hover:border-purple-200 hover:shadow-xl hover:scale-102'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onFilterSelect(filter)}
          >
            <div className="p-6">
              <div className="relative mb-4">
                <img
                  src={filter.preview}
                  alt={filter.name}
                  className="w-full h-32 object-cover rounded-xl"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${filter.gradient} opacity-20 rounded-xl`} />
                
                {selectedFilter?.id === filter.id && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                    <Sparkles size={16} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {filter.name}
                  </h3>
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {formatPrice(filter.price)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  {filter.description}
                </p>
              </div>
            </div>

            <div className={`absolute inset-0 bg-gradient-to-br ${filter.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
          </div>
        ))}
      </div>
    </div>
  );
};