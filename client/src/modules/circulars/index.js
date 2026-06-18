import React from 'react';

const CircularsModule = ({ circulars = [] }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <h3 className="font-semibold text-slate-800 mb-2">Circulars & Publications</h3>
    <ul className="space-y-2 text-sm">
      {circulars.slice(0, 3).map((item) => (
        <li key={item._id} className="border rounded p-2">
          <strong>{item.title}</strong> · v{item.version}
        </li>
      ))}
    </ul>
  </div>
);

export default CircularsModule;
