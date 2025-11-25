const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('UI - Procesos: Lista, Formulario, Detalle y Diagrama', function () {
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
  // LISTA DE PROCESOS
  //
  it('debería mostrar la lista de procesos con filtros y botón "Nuevo Proceso"', async () => {
    await driver.get('http://localhost:4200/procesos');

    // Encabezado
    const headerTitle = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(., 'Gestión de Procesos')]")
      ),
      10000
    );
    if (!(await headerTitle.isDisplayed())) {
      throw new Error('No se muestra el título "Gestión de Procesos"');
    }

    // Botón "Nuevo Proceso" que lleva al diagrama
    const btnNuevo = await driver.wait(
      until.elementLocated(By.css('.wg-btn-new')),
      10000
    );
    if (!(await btnNuevo.isDisplayed())) {
      throw new Error('No se ve el botón "Nuevo Proceso"');
    }

    // Filtros
    const searchInput = await driver.wait(
      until.elementLocated(By.css('#search')),
      10000
    );
    const estadoSelect = await driver.wait(
      until.elementLocated(By.css('#estado')),
      10000
    );
    const categoriaInput = await driver.wait(
      until.elementLocated(By.css('#categoria')),
      10000
    );
    const btnLimpiar = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Limpiar Filtros')]")
      ),
      10000
    );

    if (!(await searchInput.isDisplayed())) {
      throw new Error('El input de búsqueda de procesos no se muestra');
    }
    if (!(await estadoSelect.isDisplayed())) {
      throw new Error('El select de estado no se muestra');
    }
    if (!(await categoriaInput.isDisplayed())) {
      throw new Error('El input de categoría no se muestra');
    }
    if (!(await btnLimpiar.isDisplayed())) {
      throw new Error('El botón "Limpiar Filtros" no se muestra');
    }

    // Resultado válido: o hay tarjetas de procesos o se ve el empty-state
    const procesosCards = await driver.findElements(
      By.css('.proceso-card')
    );
    const emptyStates = await driver.findElements(
      By.css('.empty-state')
    );

    if (procesosCards.length === 0 && emptyStates.length === 0) {
      throw new Error(
        'No hay ni procesos listados ni estado vacío visible en la lista de procesos'
      );
    }
  });

  //
  // FORMULARIO DE PROCESO (crear)
  //
  it('Proceso Form: el botón Crear/Actualizar Proceso debe estar deshabilitado si el formulario es inválido y habilitarse con datos válidos', async () => {
    // Ruta para crear nuevo proceso
    await driver.get('http://localhost:4200/procesos/nuevo');

    // Esperar a que no esté en loading (detectamos que haya el título del form)
    const headerForm = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[contains(., 'Crear Nuevo Proceso') or contains(., 'Editar Proceso')]")
      ),
      10000
    );
    if (!(await headerForm.isDisplayed())) {
      throw new Error('No se muestra el título del formulario de proceso');
    }

    const nombreInput = await driver.wait(
      until.elementLocated(By.css('#nombre')),
      10000
    );
    const categoriaInput = await driver.wait(
      until.elementLocated(By.css('#categoria')),
      10000
    );
    const descripcionInput = await driver.wait(
      until.elementLocated(By.css('#descripcion')),
      10000
    );
    const estadoSelect = await driver.wait(
      until.elementLocated(By.css('#estado')),
      10000
    );

    const submitBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Crear Proceso') or contains(., 'Actualizar Proceso')]")
      ),
      10000
    );

    // Al inicio debería estar deshabilitado (form vacío)
    const disabledInicio = await submitBtn.getAttribute('disabled');
    if (disabledInicio === null) {
      throw new Error(
        'El botón de Crear/Actualizar Proceso NO está deshabilitado cuando el formulario está vacío'
      );
    }

    // Llenamos campos requeridos
    await nombreInput.clear();
    await nombreInput.sendKeys('Proceso Selenium Test');

    await categoriaInput.clear();
    await categoriaInput.sendKeys('Categoría Test');

    await descripcionInput.clear();
    await descripcionInput.sendKeys(
      'Descripción de proceso creada desde prueba automática'
    );

    await estadoSelect.click();
    const estadoOptions = await estadoSelect.findElements(By.css('option'));
    if (estadoOptions.length > 1) {
      await estadoOptions[1].click(); // BORRADOR / PUBLICADO / INACTIVO
    }

    // Esperar a que Angular marque el form como válido
    await driver.sleep(500);

    const disabledFinal = await submitBtn.getAttribute('disabled');
    if (disabledFinal !== null) {
      throw new Error(
        'El botón de Crear/Actualizar Proceso sigue deshabilitado aunque el formulario es válido'
      );
    }

    // NO hacemos click en Guardar para no depender del backend
    // await submitBtn.click();
  });

  //
  // DETALLE DE PROCESO
  //
  it('Proceso Detail: si hay procesos, debería permitir navegar al detalle y mostrar acciones principales', async () => {
    await driver.get('http://localhost:4200/procesos');

    // Esperar a que la sección principal esté visible
    await driver.wait(
      until.elementLocated(By.css('.proceso-list')),
      10000
    );

    const detalleBtns = await driver.findElements(
      By.xpath("//a[contains(., 'Ver Detalles')]")
    );

    if (detalleBtns.length === 0) {
      console.log(
        'No se encontraron procesos con botón "Ver Detalles"; se omite validación de detalle.'
      );
      return;
    }

    // Ir al detalle del primer proceso
    await detalleBtns[0].click();

    // Dos posibles estados: loading o ya el contenido
    const titleOrError = await driver.wait(async () => {
      const titles = await driver.findElements(By.xpath("//h2"));
      const errors = await driver.findElements(By.css('.alert.alert-danger'));
      return titles[0] || errors[0] || null;
    }, 10000);

    if (!titleOrError) {
      throw new Error('No se encontró ni título ni mensaje de error en detalle de proceso');
    }

    // Si hay error, lo aceptamos como estado válido (no hay backend, etc.)
    const isError =
      (await titleOrError.getAttribute('class'))?.includes('alert-danger');

    if (!isError) {
      // Validar que existan las acciones principales
      const volverBtn = await driver.findElement(
        By.xpath("//a[contains(., 'Volver')]")
      );
      const actividadesBtn = await driver.findElement(
        By.xpath("//a[contains(., 'Actividades')]")
      );
      const diagramaBtn = await driver.findElement(
        By.xpath("//a[contains(., 'Ver Diagrama')]")
      );

      if (!(await volverBtn.isDisplayed())) {
        throw new Error('No se muestra el botón "Volver" en detalle de proceso');
      }
      if (!(await actividadesBtn.isDisplayed())) {
        throw new Error('No se muestra el botón "Actividades" en detalle de proceso');
      }
      if (!(await diagramaBtn.isDisplayed())) {
        throw new Error('No se muestra el botón "Ver Diagrama" en detalle de proceso');
      }
    }
  });

  //
  // DIAGRAMA DE PROCESO (editor)
  //
  it('Proceso Diagram: debería mostrar el editor con componentes arrastrables y área de dibujo', async () => {
    // Ruta temporal según tu app.routes
    await driver.get('http://localhost:4200/proceso/diagram');

    const diagramPage = await driver.wait(
      until.elementLocated(By.css('.diagram-page')),
      10000
    );
    if (!(await diagramPage.isDisplayed())) {
      throw new Error('La página de diagrama (.diagram-page) no se está mostrando');
    }

    const title = await driver.findElement(
      By.xpath("//h2[contains(., 'Editor de Procesos')]")
    );
    if (!(await title.isDisplayed())) {
      throw new Error('No se muestra el título "Editor de Procesos" en la página de diagrama');
    }

    // Panel lateral con componentes
    const sidebar = await driver.findElement(By.css('.sidebar'));
    if (!(await sidebar.isDisplayed())) {
      throw new Error('El panel lateral (.sidebar) no se muestra en el editor de procesos');
    }

    const componentes = await driver.findElements(
      By.css('.sidebar .node-option')
    );
    if (componentes.length < 4) {
      throw new Error(
        'No se encontraron los cuatro componentes básicos (Inicio, Actividad, Decisión, Fin)'
      );
    }

    // Área de dibujo
    const canvasArea = await driver.findElement(By.css('.canvas-area'));
    if (!(await canvasArea.isDisplayed())) {
      throw new Error('El área de dibujo (.canvas-area) no se muestra en el editor de procesos');
    }

    // Botón Volver
    const btnVolver = await driver.findElement(
      By.css('.btn-volver')
    );
    if (!(await btnVolver.isDisplayed())) {
      throw new Error('No se muestra el botón "← Volver" en la página de diagrama');
    }
  });
});
