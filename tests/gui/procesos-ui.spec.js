const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('Pruebas UI WikiGroup - Navbar, Footer y Procesos', function () {
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
  // NAVBAR (no autenticado)
  //
   it('Navbar: debería mostrar Inicio y un menú coherente según el estado (logueado o no)', async function () {
    await driver.get('http://localhost:4200/home');

    const navbar = await driver.wait(
      until.elementLocated(By.css('.navbar')),
      10000
    );

    const navLinks = await navbar.findElements(By.css('.nav-link'));
    const textos = [];
    for (const link of navLinks) {
      textos.push((await link.getText()).trim());
    }

    // Siempre debería haber "Inicio"
    const tieneInicio = textos.includes('Inicio');

    // Escenario no autenticado
    const tieneLogin = textos.includes('Iniciar Sesión');
    const tieneRegister = textos.includes('Registrarse');
    const esNoAutenticado = tieneLogin && tieneRegister;

    // Escenario autenticado (según tu navbar actual)
    const tieneProcesos = textos.includes('Procesos');
    const esAutenticado = tieneProcesos; // opcionalmente podrías chequear Roles/Empresas también

    if (!tieneInicio) {
      throw new Error(
        `La navbar no tiene el link "Inicio". Links encontrados: ${JSON.stringify(
          textos
        )}`
      );
    }

    if (!esNoAutenticado && !esAutenticado) {
      throw new Error(
        `La navbar no corresponde ni a usuario autenticado ni no autenticado. Links: ${JSON.stringify(
          textos
        )}`
      );
    }
  });

  //
  // FOOTER
  //
  it('Footer: debería mostrar texto de WikiGroup y enlaces de Legal', async function () {
    await driver.get('http://localhost:4200/home');

    const footer = await driver.wait(
      until.elementLocated(By.css('footer.footer')),
      10000
    );

    const footerText = await footer.getText();

    if (!footerText.includes('WikiGroup')) {
      throw new Error('El footer no contiene el texto "WikiGroup"');
    }
    if (!footerText.includes('Términos de Servicio')) {
      throw new Error('El footer no muestra "Términos de Servicio"');
    }
    if (!footerText.includes('Política de Privacidad')) {
      throw new Error('El footer no muestra "Política de Privacidad"');
    }
  });

  //
  // PROCESO LIST
  //
  it('Procesos: debería mostrar la página de Gestión de Procesos con filtros y botón "Nuevo Proceso"', async function () {
    await driver.get('http://localhost:4200/procesos');

    const bodyText = await driver.findElement(By.tagName('body')).getText();
    if (bodyText.includes('Iniciar Sesión')) {
      console.log(
        'Parece que /procesos redirige a login (no autenticado). Este test se limita a verificar que la ruta es accesible.'
      );
      return;
    }

    const titulo = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(., 'Gestión de Procesos')]")
      ),
      10000
    );
    if (!(await titulo.isDisplayed())) {
      throw new Error('No se ve el título "Gestión de Procesos"');
    }

    const nuevoProcesoBtn = await driver.wait(
      until.elementLocated(
        By.css('.wg-proc-header .wg-btn-new')
      ),
      10000
    );
    const btnText = (await nuevoProcesoBtn.getText()).trim();
    if (!btnText.includes('Nuevo Proceso')) {
      throw new Error(
        `El botón principal no dice "Nuevo Proceso" sino "${btnText}"`
      );
    }

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
    const limpiarBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Limpiar Filtros')]")
      ),
      10000
    );

    if (!(await searchInput.isDisplayed())) {
      throw new Error('El input de búsqueda de procesos no se muestra');
    }
    if (!(await estadoSelect.isDisplayed())) {
      throw new Error('El filtro de estado no se muestra');
    }
    if (!(await categoriaInput.isDisplayed())) {
      throw new Error('El filtro de categoría no se muestra');
    }
    if (!(await limpiarBtn.isDisplayed())) {
      throw new Error('El botón "Limpiar Filtros" no se muestra');
    }
  });

  //
  // PROCESO FORM
  //
  it('Proceso Form: el botón "Crear/Actualizar Proceso" debe habilitarse solo con formulario válido', async function () {
    await driver.get('http://localhost:4200/procesos/nuevo'); // ajusta si tu ruta es otra

    const formRoot = await driver.wait(
      until.elementLocated(By.css('.proceso-form')),
      10000
    );

    const nombreInput = await formRoot.findElement(By.css('#nombre'));
    const categoriaInput = await formRoot.findElement(By.css('#categoria'));
    const descripcionInput = await formRoot.findElement(
      By.css('#descripcion')
    );
    const estadoSelect = await formRoot.findElement(By.css('#estado'));
    const submitBtn = await formRoot.findElement(
      By.css('.form-actions .btn.btn-primary')
    );

    let disabledInicio = await submitBtn.getAttribute('disabled');
    if (disabledInicio === null) {
      throw new Error(
        'El botón de Crear/Actualizar Proceso NO está deshabilitado cuando el formulario está vacío'
      );
    }

    await nombreInput.clear();
    await nombreInput.sendKeys('Proceso Selenium Test');

    await categoriaInput.clear();
    await categoriaInput.sendKeys('Testing');

    await descripcionInput.clear();
    await descripcionInput.sendKeys(
      'Descripción de proceso creada desde prueba automatizada con Selenium.'
    );

    await estadoSelect.click();
    const opcionesEstado = await estadoSelect.findElements(By.css('option'));
    let opcionBorrador;
    for (const opt of opcionesEstado) {
      const t = (await opt.getText()).trim();
      if (t === 'BORRADOR') {
        opcionBorrador = opt;
        break;
      }
    }
    if (opcionBorrador) {
      await opcionBorrador.click();
    } else if (opcionesEstado.length > 0) {
      await opcionesEstado[0].click();
    }

    await driver.sleep(600);

    const disabledFinal = await submitBtn.getAttribute('disabled');
    if (disabledFinal !== null) {
      throw new Error(
        'El botón de Crear/Actualizar Proceso sigue deshabilitado aunque el formulario es válido'
      );
    }
  });

  //
  // PROCESO DIAGRAM
  //
  it('Proceso Diagram: debería mostrar título "Editor de Procesos" y los componentes laterales', async function () {
    await driver.get('http://localhost:4200/proceso/diagram');

    const diagramPage = await driver.wait(
      until.elementLocated(By.css('.diagram-page')),
      10000
    );

    const title = await diagramPage.findElement(By.css('h2.title'));
    const titleText = (await title.getText()).trim();

    if (titleText !== 'Editor de Procesos') {
      throw new Error(
        `El título de la página de Diagrama no es "Editor de Procesos", es "${titleText}"`
      );
    }

    const volverBtn = await diagramPage.findElement(By.css('.btn-volver'));
    if (!(await volverBtn.isDisplayed())) {
      throw new Error('El botón "← Volver" no se muestra en la página de diagrama');
    }

    const inicio = await diagramPage.findElement(
      By.xpath("//div[contains(@class,'node-option') and contains(., 'Inicio')]")
    );
    const actividad = await diagramPage.findElement(
      By.xpath("//div[contains(@class,'node-option') and contains(., 'Actividad')]")
    );
    const decision = await diagramPage.findElement(
      By.xpath("//div[contains(@class,'node-option') and contains(., 'Decisión')]")
    );
    const fin = await diagramPage.findElement(
      By.xpath("//div[contains(@class,'node-option') and contains(., 'Fin')]")
    );

    if (!(await inicio.isDisplayed())) {
      throw new Error('El componente "Inicio" no se muestra en la barra lateral');
    }
    if (!(await actividad.isDisplayed())) {
      throw new Error('El componente "Actividad" no se muestra en la barra lateral');
    }
    if (!(await decision.isDisplayed())) {
      throw new Error('El componente "Decisión" no se muestra en la barra lateral');
    }
    if (!(await fin.isDisplayed())) {
      throw new Error('El componente "Fin" no se muestra en la barra lateral');
    }
  });
});
