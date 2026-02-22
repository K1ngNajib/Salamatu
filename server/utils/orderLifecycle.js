const ALLOWED_TRANSITIONS = {
  Draft: ['Published', 'Archived'],
  Published: ['Acknowledged', 'Archived'],
  Acknowledged: ['Archived'],
  Archived: [],
};

const canTransitionOrderStatus = (fromStatus, toStatus) => {
  return (ALLOWED_TRANSITIONS[fromStatus] || []).includes(toStatus);
};

module.exports = {
  ALLOWED_TRANSITIONS,
  canTransitionOrderStatus,
};
