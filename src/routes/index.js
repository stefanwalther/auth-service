const combineRouters = require('koa-combine-routers');
const glob = require('glob');
const path = require('path');

let index = glob.sync(path.join(__dirname, './../modules/**/*.routes.js'));
let routers = [];

index.forEach(r => {
  let x = require(r);
  // Only push if we have a router object, by doing this we prevent errors with empty *.routes.js files.
  if (typeof x.routes === 'function') {
    routers.push(require(r));
  }
});

const router = combineRouters(routers);

module.exports = router;

