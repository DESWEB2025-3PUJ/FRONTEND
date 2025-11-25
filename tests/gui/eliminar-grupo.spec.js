const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI Test - Eliminar grupo', function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('debería eliminar un grupo', async () => {
    await driver.get('http://localhost:4200/grupos');

    const eliminarBtn = await driver.wait(
      until.elementLocated(By.css('button.eliminar-grupo')),
      10000
    );
    await eliminarBtn.click();

    const confirmarBtn = await driver.wait(
      until.elementLocated(By.css('button.confirmar')),
      10000
    );
    await confirmarBtn.click();

    // Comprobación: el grupo ya no debe existir
    const lista = await driver.findElements(
      By.xpath("//*[contains(text(), 'Grupo Selenium Test')]")
    );

    if (lista.length > 0) {
      throw new Error('El grupo no fue eliminado');
    }
  });
});
