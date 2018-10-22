module.exports = {
  SUBJECT_AUDIT_LOGS: 'audit-logs',
  cloudEvents: {
    getRegisterEvent: user_id => {
      return {
        event_domain: 'AUTH',
        event_name: 'AUTH_REGISTER',
        user_id,
        description: 'Register account.',
        source: '/auth-service',
        action_type: 'C'
      };
    },
    getLoginEvent: user_id => {
      return {
        event_domain: 'AUTH',
        event_name: 'AUTH_LOGIN',
        user_id,
        description: 'Log into account.',
        source: '/auth-service',
        action_type: 'R'
      };
    },
    getLogoutEvent: user_id => {
      return {
        event_domain: 'AUTH',
        event_name: 'AUTH_LOGOUT',
        user_id,
        description: 'Log out.',
        source: '/auth-service',
        action_type: 'R'
      };
    }
  }
};
