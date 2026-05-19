import { useState } from 'react';

export function Tabs({ tabs, defaultTab = 0, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => handleTabChange(idx)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all duration-200 border-b-2 -mb-[2px] ${
              activeTab === idx
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/40 bg-white/50 dark:bg-slate-900/30 p-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}