import React from 'react';

export default function SentimentBadge({ comment = "" }) {
  const getSentiment = (text) => {
    const positiveWords = ['great', 'excellent', 'amazing', 'perfect', 'awesome', 'good', 'friendly', 'fast'];
    const negativeWords = ['bad', 'slow', 'poor', 'rude', 'expensive', 'dirty', 'unprofessional'];
    
    let score = 0;
    const words = text.toLowerCase().split(/\W+/);
    words.forEach(w => {
      if (positiveWords.includes(w)) score++;
      if (negativeWords.includes(w)) score--;
    });

    if (score > 0) return { label: 'Highly Recommended', style: 'bg-green-100 text-green-800' };
    if (score < 0) return { label: 'Needs Improvement', style: 'bg-red-100 text-red-800' };
    return { label: 'Satisfactory', style: 'bg-slate-100 text-slate-800' };
  };

  const sentiment = getSentiment(comment);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sentiment.style}`}>
      {sentiment.label}
    </span>
  );
}