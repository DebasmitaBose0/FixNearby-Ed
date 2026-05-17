// src/components/LanguageToggle.jsx

const LanguageToggle = ({ language, setLanguage }) => {
  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-slate-300 shadow-sm">
      <button
        onClick={() => setLanguage("en")}
        className={`px-5 py-2.5 text-sm font-semibold transition ${
          language === "en"
            ? "bg-blue-600 text-white"
            : "bg-white text-slate-700 hover:bg-slate-100"
        }`}
      >
        English
      </button>

      <button
        onClick={() => setLanguage("bn")}
        className={`px-5 py-2.5 text-sm font-semibold transition ${
          language === "bn"
            ? "bg-blue-600 text-white"
            : "bg-white text-slate-700 hover:bg-slate-100"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
};

export default LanguageToggle;