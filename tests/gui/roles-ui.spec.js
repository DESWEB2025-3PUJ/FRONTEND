// tests/gui/roles-ui.spec.js
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI - Roles: Lista y Formulario', function () {
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

  it('debería mostrar la lista de roles con botón "Crear Nuevo Rol" o estado vacío', async () => {
    // Asume que ya tienes el front levantado en http://localhost:4200
    await driver.get('http://localhost:4200/roles');

    // Contenedor principal
    const roleList = await driver.wait(
      until.elementLocated(By.css('.role-list')),
      10000
    );
    if (!(await roleList.isDisplayed())) {
      throw new Error('El contenedor .role-list no se está mostrando');
    }

    // Título
    const headerTitle = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(., 'Gestión de Roles de Proceso')]")
      ),
      10000
    );
    if (!(await headerTitle.isDisplayed())) {
      throw new Error('No se muestra el título "Gestión de Roles de Proceso"');
    }

    // Botón "Crear Nuevo Rol"
    const btnNuevoRol = await driver.wait(
      until.elementLocated(
        By.xpath("//a[contains(@class,'btn-primary') and contains(., 'Crear Nuevo Rol')]")
      ),
      10000
    );
    if (!(await btnNuevoRol.isDisplayed())) {
      throw new Error('No se muestra el botón "+ Crear Nuevo Rol"');
    }

    // Input de búsqueda
    const searchInput = await driver.wait(
      until.elementLocated(By.css('#search')),
      10000
    );
    if (!(await searchInput.isDisplayed())) {
      throw new Error('El input de búsqueda de roles (#search) no se muestra');
    }

    // Dos escenarios válidos:
    //  - Hay tabla con roles
    //  - No hay roles filtrados y se ve el empty-state
    const rolesTable = await driver.findElements(By.css('table.roles-table'));
    const emptyState = await driver.findElements(By.css('.empty-state'));

    if (rolesTable.length === 0 && emptyState.length === 0) {
      throw new Error(
        'No hay ni tabla de roles (.roles-table) ni estado vacío (.empty-state) visible'
      );
    }
  });

  it('debería permitir abrir el formulario de creación de rol y validar habilitado del botón "Crear Rol"', async () => {
    await driver.get('http://localhost:4200/roles/nuevo');

    const roleFormContainer = await driver.wait(
      until.elementLocated(By.css('.role-form')),
      10000
    );
    if (!(await roleFormContainer.isDisplayed())) {
      throw new Error('El contenedor .role-form no se está mostrando');
    }

    // Título del formulario
    const headerForm = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[contains(., 'Crear Nuevo Rol') or contains(., 'Editar Rol de Proceso')]")
      ),
      10000
    );
    if (!(await headerForm.isDisplayed())) {
      throw new Error('No se muestra el título del formulario de rol');
    }

    const nombreInput = await driver.wait(
      until.elementLocated(By.css('#nombre')),
      10000
    );
    const descripcionInput = await driver.wait(
      until.elementLocated(By.css('#descripcion')),
      10000
    );

    // Botón submit ("Crear Rol" o "Actualizar Rol")
    const submitBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//button[contains(., 'Crear Rol') or contains(., 'Actualizar Rol')]"
        )
      ),
      10000
    );

    // Con el formulario vacío debería estar deshabilitado
    const disabledInicio = await submitBtn.getAttribute('disabled');
    if (disabledInicio === null) {
      throw new Error(
        'El botón de Crear/Actualizar Rol NO está deshabilitado cuando el formulario está vacío'
      );
    }

    // Llenar campos con datos válidos
    await nombreInput.clear();
    await nombreInput.sendKeys('Rol Selenium UI');

    await descripcionInput.clear();
    await descripcionInput.sendKeys(
      'Rol de prueba creado solo a nivel de interfaz con Selenium'
    );

    // Pequeña espera para que Angular actualice la validez del formulario
    await driver.sleep(500);

    const disabledFinal = await submitBtn.getAttribute('disabled');
    if (disabledFinal !== null) {
      throw new Error(
        'El botón de Crear/Actualizar Rol sigue deshabilitado aunque el formulario es válido'
      );
    }

    // NO hacemos click en guardar para no depender del backend real
    // await submitBtn.click();
  });

  it('debería permitir navegar desde la lista al formulario de edición si existe al menos un rol', async function () {
    await driver.get('http://localhost:4200/roles');

    // Esperar a que deje de estar en loading
    await driver.wait(
      until.elementLocated(By.css('.role-list')),
      10000
    );

    // Buscar botón "Editar" en la tabla de roles
    const editarBtns = await driver.findElements(
      By.xpath("//table[contains(@class,'roles-table')]//a[contains(., 'Editar')]")
    );

    if (editarBtns.length === 0) {
      console.log(
        'No se encontraron roles con botón "Editar"; se omite la validación de navegación a edición.'
      );
      return;
    }

    // Click en el primer "Editar"
    await editarBtns[0].click();

    // Verificar que estamos en .role-form con título de edición
    const roleFormContainer = await driver.wait(
      until.elementLocated(By.css('.role-form')),
      10000
    );
    if (!(await roleFormContainer.isDisplayed())) {
      throw new Error('Tras hacer click en "Editar", no se muestra .role-form');
    }

    const headerForm = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[contains(., 'Editar Rol de Proceso')]")
      ),
      10000
    );
    if (!(await headerForm.isDisplayed())) {
      throw new Error(
        'Tras hacer click en "Editar", el título no es "Editar Rol de Proceso"'
      );
    }

    // Comprobar que los campos principales existen
    await driver.wait(until.elementLocated(By.css('#nombre')), 10000);
    await driver.wait(until.elementLocated(By.css('#descripcion')), 10000);
  });
});
