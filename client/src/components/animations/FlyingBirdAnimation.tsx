import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlyingBirdAnimationProps {
  isVisible: boolean;
  onAnimationComplete: () => void;
  startPosition?: { x: number; y: number };
  endPosition?: { x: number; y: number };
}

const FlyingBirdAnimation: React.FC<FlyingBirdAnimationProps> = ({
  isVisible,
  onAnimationComplete,
  startPosition = { x: 300, y: 300 },
  endPosition = { x: 100, y: 100 },
}) => {
  const [birdSize, setBirdSize] = useState({ width: 40, height: 40 });

  // Adjust bird size based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBirdSize({ width: 30, height: 30 });
      } else {
        setBirdSize({ width: 40, height: 40 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const path = [
    [startPosition.x, startPosition.y],
    [startPosition.x - 50, startPosition.y - 80],
    [endPosition.x + 50, endPosition.y + 30],
    [endPosition.x, endPosition.y],
  ];

  const birdVariants = {
    initial: {
      x: path[0][0],
      y: path[0][1],
      scale: 0,
      opacity: 0,
    },
    animate: {
      x: [path[0][0], path[1][0], path[2][0], path[3][0]],
      y: [path[0][1], path[1][1], path[2][1], path[3][1]],
      scale: [0, 1, 1, 0.5],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 1.8,
        times: [0, 0.3, 0.7, 1],
        ease: "easeInOut",
      },
    },
  };

  const calendarVariants = {
    initial: { scale: 1 },
    highlight: { 
      scale: 1.15, 
      boxShadow: "0 0 15px rgba(79, 70, 229, 0.6)",
      transition: { 
        delay: 1.6,
        duration: 0.3,
        type: "spring", 
        stiffness: 300 
      }
    },
    normal: { 
      scale: 1,
      boxShadow: "0 0 0px rgba(79, 70, 229, 0)",
      transition: { 
        delay: 0.1,
        duration: 0.3,
        type: "spring", 
        stiffness: 300
      }
    }
  };

  // SVG for bird animation
  const Bird = () => (
    <svg 
      width={birdSize.width} 
      height={birdSize.height} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="filter drop-shadow-md"
    >
      <path
        d="M12 6.5C11.3 6.5 10.2 7.1 9.1 7.7C8.3 8.2 7.4 8.7 6.5 8.7C4.8 8.6 3.5 7.6 3.5 7.6L3 9.3C3 9.3 4.1 10.3 6.2 10.5C7.6 10.6 8.7 10 9.6 9.5C10.1 9.2 10.5 8.9 10.9 8.7C10.2 10.2 9 11.4 7.1 12L8 13.5C8.3 13.3 8.8 12.8 9.5 12.9C10.4 13 9.9 15.7 11.3 16C11.5 16.1 12.5 16.1 12.7 16C14.1 15.7 13.6 13 14.5 12.9C15.2 12.8 15.7 13.3 16 13.5L16.9 12C15 11.4 13.8 10.2 13.1 8.7C13.5 8.9 13.9 9.2 14.4 9.5C15.3 10 16.4 10.6 17.8 10.5C19.9 10.3 21 9.3 21 9.3L20.5 7.6C20.5 7.6 19.2 8.6 17.5 8.7C16.6 8.7 15.7 8.2 14.9 7.7C13.8 7.1 12.7 6.5 12 6.5M12.5 9.8C12.3 9.8 12.1 9.9 12 10.2C11.9 9.9 11.7 9.8 11.5 9.8C11.3 9.8 11 9.9 11 10.4C11 10.7 11.3 11 11.5 11C11.7 11 11.9 10.8 12 10.5C12.1 10.8 12.3 11 12.5 11C12.7 11 13 10.7 13 10.4C13 9.9 12.7 9.8 12.5 9.8M9 16C8.8 16.9 8 17.5 7 17.5C5.9 17.5 5 16.6 5 15.5C5 14.4 5.9 13.5 7 13.5H7.2C7.6 13.6 7.9 13.8 8.2 14.1C8.7 14.7 9 15.3 9 16M19 15.5C19 16.6 18.1 17.5 17 17.5C16 17.5 15.2 16.9 15 16C15 15.3 15.3 14.7 15.8 14.1C16.1 13.8 16.4 13.6 16.8 13.5H17C18.1 13.5 19 14.4 19 15.5Z"
        fill="#6d28d9"
      />
    </svg>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Flying bird animation */}
          <motion.div
            className="fixed z-50 pointer-events-none"
            variants={birdVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
            onAnimationComplete={onAnimationComplete}
          >
            <Bird />
          </motion.div>

          {/* Calendar highlight effect */}
          <motion.div
            className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none z-10"
            aria-hidden="true"
            initial="initial"
            animate={["highlight", "normal"]}
            variants={calendarVariants}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default FlyingBirdAnimation;