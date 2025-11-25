// tests/gui/auth-ui.spec.js
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI - Autenticación: Login y Registro', function () {
  this.timeout(50000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  //
  // LOGIN
  //
  it('Login: debería mostrar campos requeridos y deshabilitar el botón si el formulario es inválido', async () => {
    await driver.get('http://localhost:4200/login');

    const container = await driver.wait(
      until.elementLocated(By.css('.login-container')),
      10000
    );
    if (!(await container.isDisplayed())) {
      throw new Error('El contenedor .login-container no se está mostrando');
    }

    const headerTitle = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(., 'Iniciar Sesión')]")
      ),
      10000
    );
    if (!(await headerTitle.isDisplayed())) {
      throw new Error('No se muestra el título "Iniciar Sesión" en login');
    }

    const correoInput = await driver.wait(
      until.elementLocated(By.css('#correo')),
      10000
    );
    const passwordInput = await driver.wait(
      until.elementLocated(By.css('#password')),
      10000
    );
    const submitBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Iniciar Sesión') or contains(., 'Iniciando sesión')]")
      ),
      10000
    );

    // Al inicio debería estar deshabilitado (form inválido)
    let disabledInicio = await submitBtn.getAttribute('disabled');
    if (disabledInicio === null) {
      throw new Error(
        'El botón "Iniciar Sesión" NO está deshabilitado cuando el formulario está vacío'
      );
    }

    // Llenar con datos válidos (sólo validamos UI, no llamamos al backend)
    await correoInput.clear();
    await correoInput.sendKeys('selenium@test.com');

    await passwordInput.clear();
    await passwordInput.sendKeys('123456'); // >=6 caracteres

    // Dar tiempo a Angular para marcar el form como válido
    await driver.sleep(500);

    const disabledFinal = await submitBtn.getAttribute('disabled');
    if (disabledFinal !== null) {
      throw new Error(
        'El botón "Iniciar Sesión" sigue deshabilitado aunque los campos son válidos'
      );
    }

    // No hacemos click para evitar dependencia de backend real
    // await submitBtn.click();
  });

  //
  // REGISTER
  //
  it('Register: debería validar que el botón se habilite solo con todos los campos válidos y contraseñas iguales', async () => {
    await driver.get('http://localhost:4200/register');

    const container = await driver.wait(
      until.elementLocated(By.css('.register-container')),
      10000
    );
    if (!(await container.isDisplayed())) {
      throw new Error('El contenedor .register-container no se está mostrando');
    }

    const headerTitle = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(., 'Crear Cuenta')]")
      ),
      10000
    );
    if (!(await headerTitle.isDisplayed())) {
      throw new Error('No se muestra el título "Crear Cuenta" en register');
    }

    const empresaNombreInput = await driver.wait(
      until.elementLocated(By.css('#empresaNombre')),
      10000
    );
    const empresaNitInput = await driver.wait(
      until.elementLocated(By.css('#empresaNit')),
      10000
    );
    const empresaCorreoInput = await driver.wait(
      until.elementLocated(By.css('#empresaCorreo')),
      10000
    );

    const usuarioNombreInput = await driver.wait(
      until.elementLocated(By.css('#usuarioNombre')),
      10000
    );
    const usuarioCorreoInput = await driver.wait(
      until.elementLocated(By.css('#usuarioCorreo')),
      10000
    );
    const usuarioPasswordInput = await driver.wait(
      until.elementLocated(By.css('#usuarioPassword')),
      10000
    );
    const usuarioPasswordConfirmInput = await driver.wait(
      until.elementLocated(By.css('#usuarioPasswordConfirm')),
      10000
    );

    const submitBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Registrar Empresa') or contains(., 'Registrando empresa')]")
      ),
      10000
    );

    // Inicio: debe estar deshabilitado
    let disabledInicio = await submitBtn.getAttribute('disabled');
    if (disabledInicio === null) {
      throw new Error(
        'El botón "Registrar Empresa" NO está deshabilitado cuando el formulario está vacío'
      );
    }

    // Llenar campos requeridos
    await empresaNombreInput.clear();
    await empresaNombreInput.sendKeys('Empresa Selenium S.A.S.');

    await empresaNitInput.clear();
    await empresaNitInput.sendKeys('900123456-7');

    await empresaCorreoInput.clear();
    await empresaCorreoInput.sendKeys('contacto@selenium-test.com');

    await usuarioNombreInput.clear();
    await usuarioNombreInput.sendKeys('Admin Selenium');

    await usuarioCorreoInput.clear();
    await usuarioCorreoInput.sendKeys('admin@selenium-test.com');

    await usuarioPasswordInput.clear();
    await usuarioPasswordInput.sendKeys('123456'); // >=6

    // Caso 1: contraseñas no coinciden → botón debe seguir deshabilitado
    await usuarioPasswordConfirmInput.clear();
    await usuarioPasswordConfirmInput.sendKeys('1234567');

    await driver.sleep(500);
    let disabledMismatch = await submitBtn.getAttribute('disabled');
    if (disabledMismatch === null) {
      throw new Error(
        'El botón "Registrar Empresa" está habilitado aunque las contraseñas NO coinciden'
      );
    }

    // Caso 2: contraseñas coinciden → botón debe habilitarse
    await usuarioPasswordConfirmInput.clear();
    await usuarioPasswordConfirmInput.sendKeys('123456');

    await driver.sleep(500);
    const disabledFinal = await submitBtn.getAttribute('disabled');
    if (disabledFinal !== null) {
      throw new Error(
        'El botón "Registrar Empresa" sigue deshabilitado aunque todos los campos son válidos y las contraseñas coinciden'
      );
    }

    // No hacemos click para no depender del backend
    // await submitBtn.click();
  });
});
