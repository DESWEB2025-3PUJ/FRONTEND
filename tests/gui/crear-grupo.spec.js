const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI Test - Crear grupo', function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('debería permitir crear un grupo', async () => {
    await driver.get('http://localhost:4200/grupos');

    // Botón de crear
    const crearBtn = await driver.wait(
      until.elementLocated(By.css('button.crear-grupo')),
      10000
    );
    await crearBtn.click();

    // Formulario
    const nombreInput = await driver.wait(
      until.elementLocated(By.css('input[name="nombre"]')),
      10000
    );

    const descripcionInput = await driver.findElement(By.css('textarea[name="descripcion"]'));

    await nombreInput.sendKeys('Grupo Selenium Test');
    await descripcionInput.sendKeys('Grupo creado desde prueba automática');

    const guardarBtn = await driver.findElement(By.css('button.guardar'));
    await guardarBtn.click();

    // Validar que aparece en la lista
    const nuevoGrupo = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Grupo Selenium Test')]")),
      10000
    );

    if (!(await nuevoGrupo.isDisplayed())) {
      throw new Error('El grupo no fue creado correctamente');
    }
  });
});
