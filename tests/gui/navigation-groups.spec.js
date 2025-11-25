const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI Test - Navegación a Grupos', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('debería navegar a la página de grupos', async () => {
    await driver.get('http://localhost:4200');

    // Botón o link de GRUPOS
    const btnGrupos = await driver.wait(
      until.elementLocated(By.css('a[href="/grupos"], button.grupos')),
      10000
    );

    await btnGrupos.click();

    // Verificar que carga el componente de grupos
    const gruposComponent = await driver.wait(
      until.elementLocated(By.css('app-grupos-list')),
      10000
    );

    if (!(await gruposComponent.isDisplayed())) {
      throw new Error('La página de grupos no se cargó correctamente');
    }
  });
});
