import React from "react";
import { motion } from "framer-motion";
import "./AnimatedList.css";

interface AnimatedListProps {
  items: string[];
  onItemSelect?: (item: string, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  displayScrollbar?: boolean;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  items,
  onItemSelect,
  showGradients = false,
  enableArrowNavigation = false,
  displayScrollbar = true,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!enableArrowNavigation) return;

    if (e.key === "ArrowDown" && index < items.length - 1) {
      document.getElementById(`animated-item-${index + 1}`)?.focus();
    }
    if (e.key === "ArrowUp" && index > 0) {
      document.getElementById(`animated-item-${index - 1}`)?.focus();
    }
  };

  return (
    <div
      className={`animated-list ${displayScrollbar ? "" : "no-scrollbar"}`}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          id={`animated-item-${index}`}
          tabIndex={0}
          className="animated-list-item"
          whileHover={{ scale: 1.05, backgroundColor: "#eaf2ff" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onItemSelect?.(item, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        >
          {item}
        </motion.div>
      ))}
      {showGradients && <div className="gradient-overlay" />}
    </div>
  );
};

export default AnimatedList;
