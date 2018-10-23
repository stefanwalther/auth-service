const _ = require('lodash');

const BASE_PROPS = {
  event_domain: 'auth',
  source: '/auth-service'
};

function getActorDetails(user) {
  return {
    username: user.local.username,
    email: user.local.email
  };
}

module.exports = {
  SUBJECT_AUDIT_LOGS: 'audit-logs',
  cloudEvents: {
    getRegisterLocalEvent: props => {
      return Object.assign({
        event: 'register',
        actor_group: _.get(props.user, ['tenant_id']),
        actor: props.user._id,
        actor_details: getActorDetails(props.user),
        action_type: 'C',
        description: 'Register account.'
      }, BASE_PROPS);
    },
    getLoginEvent: props => {
      return Object.assign({
        event: 'login',
        actor_group: _.get(props.user, ['tenant_id']),
        actor: props.user._id,
        actor_details: getActorDetails(props.user),
        action_type: 'R',
        description: 'Log into account.'
      }, BASE_PROPS);
    },
    getLogoutEvent: props => {
      return Object.assign({
        event: 'logout',
        actor_group: _.get(props.user, ['tenant_id']),
        actor: props.user._id,
        actor_details: getActorDetails(props.user),
        action_type: 'R',
        description: 'Log out.'
      }, BASE_PROPS);
    }
  }
};
