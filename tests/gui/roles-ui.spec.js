const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI Roles WikiGroup - Lista y Formulario', function () {
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
  // ROLE LIST
  //
  it('Roles: debería mostrar la página de Gestión de Roles con botón "Crear Nuevo Rol" y filtro de búsqueda', async function () {
    await driver.get('http://localhost:4200/roles');

    const roleListRoot = await driver.wait(
      until.elementLocated(By.css('.role-list')),
      10000
    );

    const titulo = await roleListRoot.findElement(By.css('.header h1'));
    const tituloText = (await titulo.getText()).trim();
    if (tituloText !== 'Gestión de Roles de Proceso') {
      throw new Error(
        `El título de la página de roles no es correcto: "${tituloText}"`
      );
    }

    const crearRolBtn = await roleListRoot.findElement(
      By.xpath("//a[contains(., 'Crear Nuevo Rol')]")
    );
    if (!(await crearRolBtn.isDisplayed())) {
      throw new Error('El botón "+ Crear Nuevo Rol" no se muestra');
    }

    const searchInput = await roleListRoot.findElement(By.css('#search'));
    if (!(await searchInput.isDisplayed())) {
      throw new Error('El input de búsqueda de roles no se muestra');
    }

    await searchInput.clear();
    await searchInput.sendKeys('QA');
    await driver.sleep(500);

    const btnClear = await roleListRoot.findElements(By.css('.btn-clear'));
    if (btnClear.length > 0 && !(await btnClear[0].isDisplayed())) {
      throw new Error('El botón de limpiar búsqueda existe pero no es visible');
    }
  });

  //
  // ROLE FORM
  //
  it('Role Form: el botón "Crear/Actualizar Rol" debe habilitarse solo cuando el formulario es válido', async function () {
    await driver.get('http://localhost:4200/roles/nuevo');

    const roleFormRoot = await driver.wait(
      until.elementLocated(By.css('.role-form')),
      10000
    );

    const titulo = await roleFormRoot.findElement(By.css('.header h2'));
    const tituloText = (await titulo.getText()).trim();
    if (!tituloText.includes('Crear Nuevo Rol')) {
      console.log(
        `Aviso: el título del formulario de rol es "${tituloText}", se esperaba "Crear Nuevo Rol".`
      );
    }

    const nombreInput = await roleFormRoot.findElement(By.css('#nombre'));
    const descripcionInput = await roleFormRoot.findElement(
      By.css('#descripcion')
    );
    const submitBtn = await roleFormRoot.findElement(
      By.css('.form-actions .btn.btn-primary')
    );

    let disabledInicio = await submitBtn.getAttribute('disabled');
    if (disabledInicio === null) {
      throw new Error(
        'El botón de Crear/Actualizar Rol NO está deshabilitado con el formulario vacío'
      );
    }

    await nombreInput.clear();
    await nombreInput.sendKeys('Rol Selenium QA');

    await descripcionInput.clear();
    await descripcionInput.sendKeys(
      'Rol creado desde prueba automatizada con Selenium para validar la UI.'
    );

    await driver.sleep(600);

    const disabledFinal = await submitBtn.getAttribute('disabled');
    if (disabledFinal !== null) {
      throw new Error(
        'El botón de Crear/Actualizar Rol sigue deshabilitado con campos válidos'
      );
    }
  });
});
