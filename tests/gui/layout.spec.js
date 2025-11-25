const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI - Layout: Navbar y Footer', function () {
  this.timeout(40000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('debería mostrar el navbar con el logo WikiGroup y enlaces básicos', async () => {
    // Forzamos tamaño "móvil" para que aparezca el botón hamburguesa
    await driver.manage().window().setRect({ width: 480, height: 800 });

    await driver.get('http://localhost:4200/home');

    // Navbar raíz
    const navbar = await driver.wait(
      until.elementLocated(By.css('nav.navbar')),
      10000
    );
    if (!(await navbar.isDisplayed())) {
      throw new Error('El navbar no está visible');
    }

    // Logo / marca
    const brandLogo = await driver.wait(
      until.elementLocated(By.css('.navbar .brand-logo')),
      10000
    );
    const brandTextEl = await driver.findElement(By.css('.navbar .brand-text'));
    const brandText = await brandTextEl.getText();

    if (brandText.trim() !== 'WikiGroup') {
      throw new Error(
        `El texto de la marca en navbar no es "WikiGroup", es: "${brandText}"`
      );
    }

    // Botón toggle responsive (en móvil debe ser visible)
    const toggleBtn = await driver.wait(
      until.elementLocated(By.css('.navbar-toggle')),
      10000
    );
    if (!(await toggleBtn.isDisplayed())) {
      throw new Error('El botón de toggle del menú no está visible en viewport móvil');
    }

    // Al menos debería haber un enlace "Inicio"
    const inicioLinks = await driver.findElements(
      By.xpath("//a[contains(., 'Inicio')]")
    );
    if (inicioLinks.length === 0) {
      throw new Error('No se encontró el enlace "Inicio" en el navbar');
    }

    // Escenario autenticado vs no autenticado
    const procesosLinks = await driver.findElements(
      By.xpath("//a[contains(., 'Procesos')]")
    );
    const loginLinks = await driver.findElements(
      By.xpath("//a[contains(., 'Iniciar Sesión')]")
    );
    const registerLinks = await driver.findElements(
      By.xpath("//a[contains(., 'Registrarse')]")
    );

    const escenarioAuth = procesosLinks.length > 0;
    const escenarioNoAuth =
      loginLinks.length > 0 && registerLinks.length > 0;

    if (!escenarioAuth && !escenarioNoAuth) {
      throw new Error(
        'El navbar no muestra ni el escenario autenticado (Procesos) ni el no autenticado (Iniciar Sesión / Registrarse)'
      );
    }
  });

  it('debería mostrar el footer con año actual y texto de WikiGroup', async () => {
    await driver.get('http://localhost:4200/home');

    const footer = await driver.wait(
      until.elementLocated(By.css('footer.footer')),
      10000
    );
    if (!(await footer.isDisplayed())) {
      throw new Error('El footer no está visible');
    }

    // Texto general del footer
    const footerTextEl = await driver.findElement(
      By.css('.footer-section h4')
    );
    const footerHeading = await footerTextEl.getText();

    if (footerHeading.trim() !== 'WikiGroup') {
      throw new Error(
        `El footer no tiene el título "WikiGroup", tiene: "${footerHeading}"`
      );
    }

    // Año actual en la franja inferior
    const bottomTextEl = await driver.findElement(
      By.css('.footer-bottom p')
    );
    const bottomText = await bottomTextEl.getText();
    const currentYear = new Date().getFullYear().toString();

    if (!bottomText.includes(currentYear)) {
      throw new Error(
        `El footer no muestra el año actual (${currentYear}) en el texto inferior: "${bottomText}"`
      );
    }

    if (!bottomText.includes('WikiGroup')) {
      throw new Error(
        `El footer inferior no contiene la palabra "WikiGroup": "${bottomText}"`
      );
    }
  });
});
