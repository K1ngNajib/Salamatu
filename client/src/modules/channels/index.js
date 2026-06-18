import React, { useMemo, useState } from 'react';
import axios from 'axios';

const ChannelsModule = ({ channels = [], personnel = [], onRefresh }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('unit-room');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [messageId, setMessageId] = useState('');

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel._id === selectedChannelId),
    [channels, selectedChannelId],
  );

  const availableMembers = useMemo(() => {
    if (!selectedChannel) return personnel;
    const existingMembers = new Set((selectedChannel.members || []).map((member) => member.toString()));
    return personnel.filter((person) => !existingMembers.has(person._id?.toString()));
  }, [personnel, selectedChannel]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;

    await axios.post(`${baseURL}/api/channels`, {
      name,
      type,
      members: [],
    }, { withCredentials: true });

    setName('');
    setType('unit-room');
    onRefresh?.();
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!selectedChannelId || !memberId) return;

    await axios.post(`${baseURL}/api/channels/${selectedChannelId}/members`, { memberId }, { withCredentials: true });
    setMemberId('');
    onRefresh?.();
  };

  const pinMessage = async (action) => {
    if (!selectedChannelId || !messageId) return;

    await axios.post(`${baseURL}/api/channels/${selectedChannelId}/${action}`, { messageId }, { withCredentials: true });
    setMessageId('');
    onRefresh?.();
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-2">Structured Channels</h3>
      <p className="text-xs text-slate-500 mb-2">Create channels, assign personnel, and pin governance messages.</p>

      <form onSubmit={handleCreate} className="grid gap-2 mb-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded p-2 text-sm" placeholder="Channel name" />
        <div className="flex gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded p-2 text-sm flex-1">
            <option value="command-announcement">Command-wide announcements</option>
            <option value="unit-room">Unit room</option>
            <option value="department-channel">Department channel</option>
            <option value="direct-secure">Direct secure</option>
            <option value="admin-broadcast">Admin broadcast</option>
          </select>
          <button type="submit" className="bg-slate-800 text-white px-3 rounded text-sm">Create</button>
        </div>
      </form>

      <select value={selectedChannelId} onChange={(e) => setSelectedChannelId(e.target.value)} className="border rounded p-2 text-sm w-full mb-2">
        <option value="">Select channel</option>
        {channels.map((channel) => (
          <option key={channel._id} value={channel._id}>{channel.name}</option>
        ))}
      </select>

      <form onSubmit={addMember} className="flex gap-2 mb-2">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="border rounded p-2 text-sm flex-1">
          <option value="">Select personnel to add</option>
          {availableMembers.map((person) => (
            <option key={person._id} value={person._id}>{person.name} · {person.unit || 'No unit'}</option>
          ))}
        </select>
        <button type="submit" className="border px-2 rounded text-sm">Add member</button>
      </form>

      <div className="flex gap-2 mb-3">
        <input value={messageId} onChange={(e) => setMessageId(e.target.value)} className="border rounded p-2 text-sm flex-1" placeholder="Message id" />
        <button onClick={() => pinMessage('pin-message')} className="border px-2 rounded text-sm">Pin</button>
        <button onClick={() => pinMessage('unpin-message')} className="border px-2 rounded text-sm">Unpin</button>
      </div>

      <ul className="text-sm text-slate-600 space-y-1">
        {channels.slice(0, 5).map((channel) => (
          <li key={channel._id} className="border rounded p-2">
            {channel.name} · {channel.type} · members: {channel.members?.length || 0} · pinned: {channel.pinnedMessages?.length || 0}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChannelsModule;
