const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('Pruebas de interfaz gráfica - FRONTEND WIKIGROUP', function () {
  this.timeout(40000); // 40 segundos

  let driver;

  // Antes de todos los tests: abre el navegador
  before(async function () {
    driver = await new Builder()
      .forBrowser('chrome')
      .build();
  });

  // Después de todos los tests: cierra el navegador
  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('debería cargar la página principal y mostrar el componente raíz', async function () {
    // 1. Ir a tu app
    await driver.get('http://localhost:4200');

    // 2. Esperar a que aparezca el componente raíz de Angular
    const root = await driver.wait(
      until.elementLocated(By.css('app-root')),
      10000
    );

    // 3. Verificar que se vea en la interfaz
    const visible = await root.isDisplayed();
    if (!visible) {
      throw new Error('El componente raíz no se está mostrando en la interfaz');
    }
  });
});
