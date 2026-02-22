import React from 'react';

const DirectoryModule = ({ personnel = [] }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <h3 className="font-semibold text-slate-800 mb-2">Personnel Directory</h3>
    <ul className="space-y-2 text-sm">
      {personnel.slice(0, 4).map((person) => (
        <li key={person._id} className="border rounded p-2">
          <strong>{person.name}</strong> · {person.role} · {person.unit || 'Unassigned'}
        </li>
      ))}
    </ul>
  </div>
);

export default DirectoryModule;
