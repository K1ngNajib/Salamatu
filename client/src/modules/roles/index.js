import React from 'react';

const RolesModule = () => (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <h3 className="font-semibold text-slate-800 mb-2">Role Access Controls</h3>
    <p className="text-sm text-slate-600">
      Super Admin, Command Admin, Unit Admin, Officer, Personnel, and Observer permissions are enforced on order issuance, circular publishing, broadcasts, and room creation.
    </p>
  </div>
);

export default RolesModule;
