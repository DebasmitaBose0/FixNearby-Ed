import { useState, useMemo } from "react";
import { getEstimatorConfig, parseHourlyRate } from "../utils/estimatorConfig";
import { Calculator, ChevronRight, Package, Clock, DollarSign, Zap } from "lucide-react";

/* ─── Animated number that counts up on change ─────────────────────────── */
const CostBadge = ({ value, prefix = "$" }) => (
  <span className="font-bold text-emerald-600 tabular-nums">
    {prefix}{Number(value).toFixed(2)}
  </span>
);

/* ─── Single field row: label + range slider + number input ─────────────── */
const EstimatorField = ({ field, value, onChange }) => (
  <div className="mb-5">
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-semibold text-slate-700">
        {field.label}
      </label>
      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1">
        <input
          id={`estimator-${field.key}`}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(e) => onChange(field.key, parseFloat(e.target.value) || field.min)}
          className="w-14 bg-transparent text-sm font-bold text-blue-700 text-right outline-none"
        />
        <span className="text-xs text-blue-500 whitespace-nowrap">{field.unit}</span>
      </div>
    </div>
    <input
      type="range"
      min={field.min}
      max={field.max}
      step={field.step}
      value={value}
      onChange={(e) => onChange(field.key, parseFloat(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - field.min) / (field.max - field.min)) * 100}%, #e2e8f0 ${((value - field.min) / (field.max - field.min)) * 100}%, #e2e8f0 100%)`,
      }}
    />
    <div className="flex justify-between text-xs text-slate-400 mt-1">
      <span>{field.min} {field.unit}</span>
      <span>{field.max} {field.unit}</span>
    </div>
  </div>
);

/* ─── Main Component ────────────────────────────────────────────────────── */
const SmartEstimator = ({ profession, priceString, onBookWithEstimate }) => {
  const config = getEstimatorConfig(profession);
  const hourlyRate = parseHourlyRate(priceString);

  /* Build initial state from field defaults */
  const initialValues = useMemo(() => {
    if (!config) return {};
    return Object.fromEntries(config.fields.map((f) => [f.key, f.default]));
  }, [config]);

  const [values, setValues] = useState(initialValues);

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  /* Live calculation */
  const estimate = useMemo(() => {
    if (!config) return null;
    return config.calculate(values, hourlyRate);
  }, [config, values, hourlyRate]);

  if (!config) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <Calculator size={32} className="mx-auto text-slate-400 mb-3" />
        <p className="text-slate-500 text-sm">
          Smart Estimator is not yet available for <strong>{profession}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">

      {/* ── Header bar ── */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">
              Smart {profession} Estimator
            </h3>
            <p className="text-blue-200 text-sm mt-0.5">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── LEFT: Inputs ── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Zap size={16} className="text-blue-500" />
            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
              Project Parameters
            </h4>
          </div>
          {config.fields.map((field) => (
            <EstimatorField
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={handleChange}
            />
          ))}
        </div>

        {/* ── RIGHT: Live Results ── */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Calculator size={16} className="text-emerald-500" />
            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
              Live Estimate
            </h4>
          </div>

          {/* Materials breakdown */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Materials
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {estimate.materials.map((mat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5"
                >
                  <div>
                    <span className="font-medium text-slate-700 text-sm">{mat.name}</span>
                    <span className="ml-2 text-slate-400 text-xs">
                      {mat.qty} {mat.unit} × ${mat.unitCost}
                    </span>
                  </div>
                  <CostBadge value={mat.subtotal} />
                </div>
              ))}
            </div>

            {/* Labour row */}
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Labor
              </span>
            </div>
            <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-5">
              <div>
                <span className="font-medium text-slate-700 text-sm">Labor</span>
                <span className="ml-2 text-slate-400 text-xs">
                  {estimate.laborHours} hrs × ${hourlyRate}/hr
                </span>
              </div>
              <CostBadge value={estimate.laborCost} />
            </div>

            {/* Divider + total */}
            <div className="border-t border-slate-200 pt-4 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-600" />
                  <span className="font-bold text-slate-900">Total Estimate</span>
                </div>
                <span className="text-2xl font-extrabold text-emerald-600">
                  ${estimate.totalCost.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Materials ${estimate.materialCost.toFixed(2)} + Labor ${estimate.laborCost.toFixed(2)}
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            id="lock-in-book-btn"
            onClick={() => onBookWithEstimate(estimate)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
          >
            Lock In & Book
            <ChevronRight size={18} />
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">
            This estimate is locked in when you confirm booking.
          </p>
        </div>

      </div>
    </div>
  );
};

export default SmartEstimator;
