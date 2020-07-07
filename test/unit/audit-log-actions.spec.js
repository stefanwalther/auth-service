const AuditLogActions = require('../../src/config/audit-log-actions');

const user = {
  _id: 1,
  tenant_id: 2,
  local: {
    username: 'foo',
    email: 'foo@bar.com'
  }
};

function validateProps(target, props) {
  let r = target.apply(null, props);
  console.log('\n');
  console.log(target);
  console.log(r);
  expect(target).to.exist;
  expect(r).to.have.property('event_domain');
  expect(r).to.have.property('event');
  expect(r).to.have.property('actor_group').to.be.equal(props[0].user.tenant_id);
  expect(r).to.have.property('actor').to.be.equal(props[0].user._id);
}

describe('[unit] => audit-log-actions', () => {

  it('exposes `SUBJECT_AUDIT_LOGS`', () => {
    expect(AuditLogActions).to.have.a.property('SUBJECT_AUDIT_LOGS').to.be.equal('audit-logs');
  });

  it('exposes methods for the required cloudEvents', () => {
    expect(AuditLogActions).to.have.a.property('cloudEvents').to.have.a.property('getRegisterLocalEvent');
    expect(AuditLogActions).to.have.a.property('cloudEvents').to.have.a.property('getLoginEvent');
    expect(AuditLogActions).to.have.a.property('cloudEvents').to.have.a.property('getLogoutEvent');
  });

  it('exposes cloudEvent `getRegisterEvent` with required props', () => {
    let target = AuditLogActions.cloudEvents.getRegisterLocalEvent;
    validateProps(target, [{user: user}]);
  });

  it('exposes cloudEvent `getLoginEvent` with required props', () => {
    let target = AuditLogActions.cloudEvents.getLoginEvent;
    validateProps(target, [{user: user}]);
  });

  it('exposes cloudEvent `getLogoutEvent` with required props', () => {
    let target = AuditLogActions.cloudEvents.getLogoutEvent;
    validateProps(target, [{user: user}]);
  });
});

