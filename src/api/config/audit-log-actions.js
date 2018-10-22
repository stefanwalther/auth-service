const BASE_PROPS = {
  event_domain: 'auth',
  source: '/auth-service'
};

module.exports = {
  SUBJECT_AUDIT_LOGS: 'audit-logs',
  cloudEvents: {
    getRegisterEvent: props => {
      return Object.assign({
        event: 'register',
        actor: props.actor,
        actor_group: props.actor_group,
        action_type: 'C',
        description: 'Register account.'
      }, BASE_PROPS);
    },
    getLoginEvent: props => {
      return Object.assign({
        event: 'login',
        actor: props.actor,
        actor_group: props.actor_group,
        action_type: 'R',
        description: 'Log into account.'
      }, BASE_PROPS);
    },
    getLogoutEvent: props => {
      return Object.assign({
        event: 'logout',
        actor: props.actor,
        actor_group: props.actor_group,
        action_type: 'R',
        description: 'Log out.'
      }, BASE_PROPS);
    }
  }
};
