const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI Test - Navbar cargada', function () {
  this.timeout(30000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('debería mostrar el navbar y elementos principales', async () => {
    await driver.get('http://localhost:4200');

    // Navbar
    const navbar = await driver.wait(
      until.elementLocated(By.css('nav')),
      10000
    );
    if (!(await navbar.isDisplayed())) {
      throw new Error('El navbar no está visible');
    }

    // Título principal
    const title = await driver.findElement(By.css('h1, h2'));
    if (!(await title.isDisplayed())) {
      throw new Error('El título de la página no aparece');
    }
  });
});
