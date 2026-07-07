// src/components/InfoCards.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface InfoCard {
  icon: string;
  title: string;
  description: string;
}

const InfoCards: React.FC = () => {
  const cards: InfoCard[] = [
    {
      icon: '🔒',
      title: 'Secure Transaction',
      description: 'Your wallet signs all transactions locally'
    },
    {
      icon: '⚡',
      title: 'Instant Claim',
      description: 'Tokens credited after confirmation'
    },
    {
      icon: '🌐',
      title: 'Solana Network',
      description: 'Fast and low-cost transactions'
    }
  ];

  return (
    <motion.div 
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="info-cards">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            className="info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="info-card-icon">{card.icon}</div>
            <h4>{card.title}</h4>
            <p>{card.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default InfoCards;