const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI Test - Editar grupo', function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('debería editar un grupo existente', async () => {
    await driver.get('http://localhost:4200/grupos');

    // Buscar botón editar del primer grupo
    const editarBtn = await driver.wait(
      until.elementLocated(By.css('button.editar-grupo')),
      10000
    );
    await editarBtn.click();

    const nombre = await driver.wait(
      until.elementLocated(By.css('input[name="nombre"]')),
      10000
    );

    await nombre.clear();
    await nombre.sendKeys('Grupo Editado Selenium');

    const guardar = await driver.findElement(By.css('button.guardar'));
    await guardar.click();

    const grupoEditado = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Grupo Editado Selenium')]")),
      10000
    );

    if (!(await grupoEditado.isDisplayed())) {
      throw new Error('El grupo no fue editado correctamente');
    }
  });
});
