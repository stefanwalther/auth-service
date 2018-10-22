const AuditLogActions = require('./../../src/api/config/audit-log-actions');

function validateProps(target, props) {
  let r = target.apply(null, props);
  console.log('\n');
  console.log(target);
  console.log(r);
  expect(target).to.exist;
  expect(r).to.have.property('event_domain');
  expect(r).to.have.property('event');
  expect(r).to.have.property('actor_group').to.be.equal(props[0].actor_group);
  expect(r).to.have.property('actor').to.be.equal(props[0].actor);
}

describe('[unit] audit-log-actions', () => {

  it('exposes `SUBJECT_AUDIT_LOGS`', () => {
    expect(AuditLogActions).to.have.a.property('SUBJECT_AUDIT_LOGS').to.be.equal('audit-logs');
  });

  it('exposes methods for the required cloudEvents', () => {
    expect(AuditLogActions).to.have.a.property('cloudEvents').to.have.a.property('getRegisterEvent');
    expect(AuditLogActions).to.have.a.property('cloudEvents').to.have.a.property('getLoginEvent');
    expect(AuditLogActions).to.have.a.property('cloudEvents').to.have.a.property('getLogoutEvent');
  });

  it('exposes cloudEvent `getRegisterEvent` with required props', () => {
    let target = AuditLogActions.cloudEvents.getRegisterEvent;
    validateProps(target, [{actor_group: 'bar', actor: 'foo'}]);
  });

  it('exposes cloudEvent `getLoginEvent` with required props', () => {
    let target = AuditLogActions.cloudEvents.getLoginEvent;
    validateProps(target, [{actor_group: 'bar', actor: 'foo'}]);
  });

  it('exposes cloudEvent `getLogoutEvent` with required props', () => {
    let target = AuditLogActions.cloudEvents.getLogoutEvent;
    validateProps(target, [{actor_group: 'bar', actor: 'foo'}]);
  });
});

