const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI Auth WikiGroup - Login y Registro', function () {
  this.timeout(60000);

  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  //
  // LOGIN
  //
  it('Login: debería mostrar el formulario y deshabilitar el botón si el formulario es inválido', async function () {
    await driver.get('http://localhost:4200/login');

    const loginCard = await driver.wait(
      until.elementLocated(By.css('.login-card')),
      10000
    );

    const titulo = await loginCard.findElement(By.css('h1'));
    const tituloText = (await titulo.getText()).trim();
    if (tituloText !== 'Iniciar Sesión') {
      throw new Error(`El título de login no es correcto: "${tituloText}"`);
    }

    const correoInput = await loginCard.findElement(By.css('#correo'));
    const passwordInput = await loginCard.findElement(By.css('#password'));
    const submitBtn = await loginCard.findElement(
      By.css('.form-actions .btn.btn-primary')
    );

    let disabledInicio = await submitBtn.getAttribute('disabled');
    if (disabledInicio === null) {
      throw new Error(
        'El botón de "Iniciar Sesión" NO está deshabilitado con el formulario vacío'
      );
    }

    await correoInput.clear();
    await correoInput.sendKeys('test@example.com');

    await passwordInput.clear();
    await passwordInput.sendKeys('123');

    await correoInput.click();
    await driver.sleep(500);

    let disabledPwdCorta = await submitBtn.getAttribute('disabled');
    if (disabledPwdCorta === null) {
      throw new Error(
        'El botón de "Iniciar Sesión" se habilitó con contraseña inválida'
      );
    }

    await passwordInput.clear();
    await passwordInput.sendKeys('123456');

    await driver.sleep(500);

    const disabledFinal = await submitBtn.getAttribute('disabled');
    if (disabledFinal !== null) {
      throw new Error(
        'El botón de "Iniciar Sesión" sigue deshabilitado con correo y contraseña válidos'
      );
    }
  });

  //
  // REGISTER
  //
  it('Registro: debería deshabilitar el botón si los datos son inválidos o las contraseñas no coinciden', async function () {
    await driver.get('http://localhost:4200/register');

    const registerCard = await driver.wait(
      until.elementLocated(By.css('.register-card')),
      10000
    );

    const titulo = await registerCard.findElement(By.css('h1'));
    const tituloText = (await titulo.getText()).trim();
    if (tituloText !== 'Crear Cuenta') {
      throw new Error(`El título de registro no es correcto: "${tituloText}"`);
    }

    const empresaNombre = await registerCard.findElement(
      By.css('#empresaNombre')
    );
    const empresaNit = await registerCard.findElement(
      By.css('#empresaNit')
    );
    const empresaCorreo = await registerCard.findElement(
      By.css('#empresaCorreo')
    );

    const usuarioNombre = await registerCard.findElement(
      By.css('#usuarioNombre')
    );
    const usuarioCorreo = await registerCard.findElement(
      By.css('#usuarioCorreo')
    );
    const usuarioPassword = await registerCard.findElement(
      By.css('#usuarioPassword')
    );
    const usuarioPasswordConfirm = await registerCard.findElement(
      By.css('#usuarioPasswordConfirm')
    );

    const submitBtn = await registerCard.findElement(
      By.css('.form-actions .btn.btn-primary')
    );

    let disabledInicio = await submitBtn.getAttribute('disabled');
    if (disabledInicio === null) {
      throw new Error(
        'El botón "Crear Cuenta" NO está deshabilitado con el formulario vacío'
      );
    }

    await empresaNombre.sendKeys('Empresa Selenium');
    await empresaNit.sendKeys('123456789-0');
    await empresaCorreo.sendKeys('empresa@selenium.com');

    await usuarioNombre.sendKeys('Usuario Selenium');
    await usuarioCorreo.sendKeys('user@selenium.com');
    await usuarioPassword.sendKeys('123456');
    await usuarioPasswordConfirm.sendKeys('654321'); // distinta

    await driver.sleep(600);

    let disabledPwdDiff = await submitBtn.getAttribute('disabled');
    if (disabledPwdDiff === null) {
      throw new Error(
        'El botón "Crear Cuenta" se habilitó aunque las contraseñas no coinciden'
      );
    }

    await usuarioPasswordConfirm.clear();
    await usuarioPasswordConfirm.sendKeys('123456');

    await driver.sleep(600);

    const disabledFinal = await submitBtn.getAttribute('disabled');
    if (disabledFinal !== null) {
      throw new Error(
        'El botón "Crear Cuenta" sigue deshabilitado aunque el formulario es válido y las contraseñas coinciden'
      );
    }
  });
});
