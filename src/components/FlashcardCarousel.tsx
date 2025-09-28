import React, { useState } from "react";
import { Flashcard } from "./Flashcard";
import type { FlashcardData } from "./Flashcard";
import "./Flashcard.css";

interface FlashcardCarouselProps {
  cards: FlashcardData[];
}

const FlashcardCarousel: React.FC<FlashcardCarouselProps> = ({ cards }) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);

  // Card stacking: show prev/current/next with offset
  const getCardStyle = (idx: number) => {
    if (idx === current) {
      return { zIndex: 2, transform: `translateX(${dragDelta}px)` };
    }
    if (idx === current - 1 || (current === 0 && idx === cards.length - 1)) {
      return { zIndex: 1, transform: 'scale(0.95) translateX(-40px) rotateZ(-3deg)' };
    }
    if (idx === current + 1 || (current === cards.length - 1 && idx === 0)) {
      return { zIndex: 1, transform: 'scale(0.95) translateX(40px) rotateZ(3deg)' };
    }
    return { zIndex: 0, opacity: 0, pointerEvents: 'none' as React.CSSProperties['pointerEvents'] };
  };

  // Swipe gesture handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setDragStartX('touches' in e ? e.touches[0].clientX : e.clientX);
  };
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragStartX === null) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragDelta(x - dragStartX);
  };
  const handleDragEnd = () => {
    if (dragDelta > 80) {
      setFlipped(false);
      setCurrent((prev) => (prev - 1 + cards.length) % cards.length);
    } else if (dragDelta < -80) {
      setFlipped(false);
      setCurrent((prev) => (prev + 1) % cards.length);
    }
    setDragStartX(null);
    setDragDelta(0);
  };

  const nextCard = () => {
    setFlipped(false);
    setCurrent((prev) => (prev + 1) % cards.length);
  };
  const prevCard = () => {
    setFlipped(false);
    setCurrent((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div
      className="flashcard-carousel"
      onMouseDown={handleDragStart}
      onMouseMove={dragStartX !== null ? handleDragMove : undefined}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      style={{ position: 'relative', minHeight: 220 }}
    >
      {cards.map((card, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transition: 'transform 0.4s cubic-bezier(.4,2,.3,.7), opacity 0.3s',
            ...getCardStyle(idx),
          }}
        >
          <Flashcard
            card={card}
            flipped={idx === current ? flipped : false}
            onFlip={() => idx === current && setFlipped((f) => !f)}
          />
        </div>
      ))}
      <div className="flashcard-controls" style={{ marginTop: 220 }}>
        <button onClick={prevCard} disabled={cards.length <= 1}>⬅ Prev</button>
        <span>
          {current + 1} / {cards.length}
        </span>
        <button onClick={nextCard} disabled={cards.length <= 1}>Next ➡</button>
      </div>
    </div>
  );
};

export default FlashcardCarousel;
