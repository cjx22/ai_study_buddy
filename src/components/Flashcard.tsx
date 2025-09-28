import React, { useState } from "react";
// Carousel for flashcards with navigation and flip
interface FlashcardCarouselProps {
  cards: FlashcardData[];
}

export const FlashcardCarousel: React.FC<FlashcardCarouselProps> = ({ cards }) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards.length) return null;

  const handlePrev = () => {
    setFlipped(false);
    setCurrent((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setFlipped(false);
    setCurrent((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flashcard-carousel">
      <Flashcard
        card={cards[current]}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />
      <div className="flashcard-controls">
        <button onClick={handlePrev}>Prev</button>
        <span>
          {current + 1} / {cards.length}
        </span>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};
import "./Flashcard.css";

export interface FlashcardData {
  front: string;
  back: string;
}

interface FlashcardProps {
  card: FlashcardData;
  flipped: boolean;
  onFlip: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card, flipped, onFlip }) => {
  return (
    <div className={`flashcard${flipped ? " flipped" : ""}`} onClick={onFlip}>
      <div className="flashcard-inner">
        <div className="flashcard-front">{card.front}</div>
        <div className="flashcard-back">{card.back}</div>
      </div>
    </div>
  );
};
