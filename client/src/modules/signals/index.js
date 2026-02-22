import React from 'react';

const priorityClass = {
  Urgent: 'text-red-600',
  Important: 'text-amber-600',
  Routine: 'text-slate-500',
};

const SignalsModule = ({ signals = [] }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <h3 className="font-semibold text-slate-800 mb-2">Signal Alerts</h3>
    <ul className="space-y-2 text-sm">
      {signals.slice(0, 5).map((signal) => (
        <li key={signal._id} className="border rounded p-2 flex justify-between">
          <span>{signal.message}</span>
          <span className={priorityClass[signal.priority] || 'text-slate-500'}>{signal.priority}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default SignalsModule;
