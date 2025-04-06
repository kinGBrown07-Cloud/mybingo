import { useState } from 'react';
import { Card } from './ui/card';
import Image from 'next/image';

interface Prize {
  value: number;
}

interface FlipCardProps {
  id: string;
  frontImage: string;
  backImage: string;
  isWinning: boolean;
  prize?: Prize;
  isFlipped: boolean;
  onFlip: (id: string) => void;
}

export function FlipCard({
  id,
  frontImage,
  backImage,
  isWinning,
  prize,
  isFlipped,
  onFlip
}: FlipCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!isFlipped) {
      onFlip(id);
    }
  };

  return (
    <Card
      className={`flip-card ${isFlipped ? 'flipped' : ''} ${isHovered ? 'hovered' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <Image
            src={frontImage}
            alt="Card front"
            width={150}
            height={200}
            className="card-image"
          />
        </div>
        <div className="flip-card-back">
          <Image
            src={backImage}
            alt="Card back"
            width={150}
            height={200}
            className="card-image"
          />
          {isFlipped && isWinning && prize && (
            <div className="prize-overlay">
              <span className="prize-amount">{prize.value}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
