{%= name%} is a tiny, re-usable authentication service to be used in any microservices environment.

It is built on top of [express](https://expressjs.com/) , [passport](http://passportjs.org/) and [JWT](https://jwt.io/), therefore easy to extend and integrate.

### Basic functionality

- Registration of a user
- Login (and return a JWT token)
- Verify JWT token
- Logout
- Send password reset email
- Password reset
- Return the user's profile

## Social Authentication Providers

- GitHub

As currently only GitHub is implemented, is should be pretty straightforward to extend _{%= name%}_ with other authentication provider, such as:
 
- auth0
- saml
- oauth/oauth2
- DropBox
- Google
- Facebook
- LinkedIn
- OpenId
- ...

Just have a look at [passports.js](http://passportjs.org/) and the supported strategies.
