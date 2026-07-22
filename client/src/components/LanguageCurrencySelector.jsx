import React, { useState } from 'react';

const LanguageCurrencySelector = ({ onLocaleChange }) => {
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('USD');

  const handleChange = (newLang, newCurr) => {
    setLang(newLang);
    setCurrency(newCurr);
    if (onLocaleChange) onLocaleChange({ lang: newLang, currency: newCurr });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <select
        value={lang}
        onChange={(e) => handleChange(e.target.value, currency)}
        className="bg-transparent border-none focus:ring-0 cursor-pointer font-medium"
      >
        <option value="en">English (EN)</option>
        <option value="hi">हिंदी (HI)</option>
        <option value="bn">বাংলা (BN)</option>
      </select>
      <span className="text-gray-300">|</span>
      <select
        value={currency}
        onChange={(e) => handleChange(lang, e.target.value)}
        className="bg-transparent border-none focus:ring-0 cursor-pointer font-medium"
      >
        <option value="USD">$ USD</option>
        <option value="INR">₹ INR</option>
        <option value="EUR">€ EUR</option>
      </select>
    </div>
  );
};

export default LanguageCurrencySelector;
