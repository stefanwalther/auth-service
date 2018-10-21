module.exports = {
  SUBJECT_AUDIT_LOGS: 'audit-logs',
  cloudEvents: {
    getRegisterEvent: () => {
      return {
        event_domain: 'AUTH',
        event_name: 'AUTH_REGISTER',
        description: 'Register account.',
        source: '/auth-service',
        action_type: 'C'
      };
    },
    getLoginEvent: () => {
      return {
        event_domain: 'AUTH',
        event_name: 'AUTH_LOGIN',
        description: 'Log into account.',
        source: '/auth-service',
        action_type: 'R'
      };
    },
    getLogoutEvent: () => {
      return {
        event_domain: 'AUTH',
        event_name: 'AUTH_LOGOUT',
        description: 'Log out.',
        source: '/auth-service',
        action_type: 'R'
      };
    }
  }
};
