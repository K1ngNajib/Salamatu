import React from 'react';

const DocumentsModule = ({ docs = [] }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <h3 className="font-semibold text-slate-800 mb-2">Encrypted Documents</h3>
    <ul className="space-y-2 text-sm">
      {docs.slice(0, 3).map((doc) => (
        <li key={doc._id} className="border rounded p-2">
          <strong>{doc.title}</strong> · v{doc.version}
        </li>
      ))}
    </ul>
  </div>
);

export default DocumentsModule;
