"use client";

import React, { useState } from 'react'; // Assurez-vous que React est importé correctement et useState est importé correctement
import PropTypes from 'prop-types'; // Assurez-vous que PropTypes est utilisé si nécessaire
import { Globe, ChevronDown } from 'lucide-react';
import { Region } from '@/types/rewards';
import { getRegionName } from '@/utils/rewards-utils';

interface RegionSelectorProps {
  selectedRegion: Region;
  onChange: (region: Region) => void;
}

export default function RegionSelector({ selectedRegion, onChange }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const regions = [
    Region.EUROPE,
    Region.AFRICA_SUB,
    Region.AFRICA_NORTH,
    Region.ASIA,
    Region.AMERICA
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectRegion = (region: Region) => {
    onChange(region);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-md"
      >
        <Globe size={16} />
        <span>{getRegionName(selectedRegion)}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-56 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="py-1">
            {regions.map((region) => (
              <li
                key={region}
                className={`px-4 py-2 hover:bg-zinc-700 cursor-pointer ${region === selectedRegion ? 'bg-zinc-700' : ''}`}
                onClick={() => selectRegion(region)}
              >
                {getRegionName(region)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
