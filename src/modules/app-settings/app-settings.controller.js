class AppSettingsController {

  static get(ctx) {
    ctx.body = ctx.appSettings;
  }

}

module.exports = AppSettingsController;
