"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RewardType,
  Reward,
  Currency
} from '@/types/rewards';
import { formatCurrency } from '@/utils/rewards-utils';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  cashValue: {value: number, currency: Currency} | null;
  onSelectReward: (type?: RewardType) => void;
}

export default function RewardModal({
  isOpen,
  onClose,
  points,
  cashValue,
  onSelectReward
}: RewardModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-zinc-900 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-4 relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white text-center">
                Félicitations! Vous avez gagné {points} points!
              </h2>
              {cashValue && (
                <p className="text-white/90 text-center mt-1">
                  Valeur: {formatCurrency(cashValue.value, cashValue.currency)}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-300 text-center mb-6">
                Choisissez le type de récompense que vous souhaitez recevoir:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Nourriture */}
                <div
                  className="bg-zinc-800 p-4 rounded-lg text-center cursor-pointer hover:bg-zinc-700 transition-colors"
                  onClick={() => onSelectReward(RewardType.FOOD)}
                >
                  <div className="w-16 h-16 mx-auto mb-2 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <Image
                      src="https://ext.same-assets.com/841830000/394320000.png"
                      alt="Nourriture"
                      width={32}
                      height={32}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <h3 className="text-white font-bold mb-1">Nourriture</h3>
                  <p className="text-gray-400 text-sm">Sacs de riz, pâtes, huile, conserves...</p>
                </div>

                {/* Vêtements */}
                <div
                  className="bg-zinc-800 p-4 rounded-lg text-center cursor-pointer hover:bg-zinc-700 transition-colors"
                  onClick={() => onSelectReward(RewardType.CLOTHING)}
                >
                  <div className="w-16 h-16 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Image
                      src="https://ext.same-assets.com/1994760000/1773891000.png"
                      alt="Vêtements"
                      width={32}
                      height={32}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <h3 className="text-white font-bold mb-1">Vêtements</h3>
                  <p className="text-gray-400 text-sm">Montres, chaussures, vestes, bijoux...</p>
                </div>

                {/* Jackpot */}
                <div
                  className="bg-zinc-800 p-4 rounded-lg text-center cursor-pointer hover:bg-zinc-700 transition-colors"
                  onClick={() => onSelectReward(RewardType.JACKPOT)}
                >
                  <div className="w-16 h-16 mx-auto mb-2 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Image
                      src="https://ext.same-assets.com/3747852000/1986124000.jpeg"
                      alt="Super-lot"
                      width={32}
                      height={32}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <h3 className="text-white font-bold mb-1">Super-lot</h3>
                  <p className="text-gray-400 text-sm">Scooter électrique Vespa</p>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => onSelectReward(undefined)}
                  className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white"
                >
                  Recevoir en espèces
                </Button>
                <p className="text-gray-500 text-xs mt-2">
                  Vous pouvez échanger vos points contre leur valeur monétaire
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
