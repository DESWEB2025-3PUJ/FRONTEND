const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

describe('Pruebas de interfaz gráfica WikiGroup - Home, Actividades y Empresa', function () {
  this.timeout(50000);

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
  // HOME
  //
  it('Home: debería mostrar el hero con el título WikiGroup y botones de acción', async function () {
    await driver.get('http://localhost:4200/');

    // Título principal
    const heroTitle = await driver.wait(
      until.elementLocated(By.css('.hero-title')),
      10000
    );
    const heroText = await heroTitle.getText();

    if (heroText.trim() !== 'WikiGroup') {
      throw new Error(
        `El título de la home no es "WikiGroup", es: "${heroText}"`
      );
    }

    // Escenario no logueado (Comenzar Gratis / Iniciar Sesión)
    // o logueado (Ver Procesos / Crear Proceso)
    const comenzarGratis = await driver.findElements(
      By.xpath("//a[contains(., 'Comenzar Gratis')]")
    );
    const iniciarSesion = await driver.findElements(
      By.xpath("//a[contains(., 'Iniciar Sesión')]")
    );
    const verProcesos = await driver.findElements(
      By.xpath("//a[contains(., 'Ver Procesos')]")
    );
    const crearProceso = await driver.findElements(
      By.xpath("//a[contains(., 'Crear Proceso')]")
    );

    const hayEscenarioNoLogueado =
      comenzarGratis.length > 0 && iniciarSesion.length > 0;
    const hayEscenarioLogueado =
      verProcesos.length > 0 && crearProceso.length > 0;

    if (!hayEscenarioNoLogueado && !hayEscenarioLogueado) {
      throw new Error(
        'No se encontraron los botones esperados en el hero (ni Comenzar/Iniciar ni Ver/Crear Procesos)'
      );
    }
  });

  //
  // ACTIVIDAD LIST
  //
  it('Actividades: debería mostrar botón "Nueva Actividad" y filtros de búsqueda', async function () {
    // 👇 Ajusta el "1" por un procesoId que exista en tu backend
    await driver.get('http://localhost:4200/procesos/1/actividades');

    // Título
    const titulo = await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(., 'Actividades del Proceso')]")),
      10000
    );
    if (!(await titulo.isDisplayed())) {
      throw new Error('No se ve el título "Actividades del Proceso"');
    }

    // Botón "Nueva Actividad"
    const nuevaActividadBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//a[contains(., 'Nueva Actividad')]")
      ),
      10000
    );
    if (!(await nuevaActividadBtn.isDisplayed())) {
      throw new Error('No se ve el botón "Nueva Actividad"');
    }

    // Campo de búsqueda
    const searchInput = await driver.wait(
      until.elementLocated(By.css('#searchTerm')),
      10000
    );

    // Select de filtro tipo
    const filtroTipo = await driver.wait(
      until.elementLocated(By.css('#filtroTipo')),
      10000
    );

    // Botón "Limpiar Filtros"
    const limpiarFiltrosBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Limpiar Filtros')]")
      ),
      10000
    );

    if (!(await searchInput.isDisplayed())) {
      throw new Error('El input de búsqueda no se muestra');
    }
    if (!(await filtroTipo.isDisplayed())) {
      throw new Error('El select de filtro de tipo no se muestra');
    }
    if (!(await limpiarFiltrosBtn.isDisplayed())) {
      throw new Error('El botón "Limpiar Filtros" no se muestra');
    }
  });

  //
  // ACTIVIDAD FORM
  //
  it('Actividad Form: el botón "Crear/Actualizar Actividad" debe estar deshabilitado si el formulario es inválido y habilitarse con datos válidos', async function () {
    // 👇 Ajusta el "1" por un procesoId válido
    await driver.get('http://localhost:4200/procesos/1/actividades/nueva');

    const nombreInput = await driver.wait(
      until.elementLocated(By.css('#nombre')),
      10000
    );
    const descripcionInput = await driver.wait(
      until.elementLocated(By.css('#descripcion')),
      10000
    );
    const tipoSelect = await driver.wait(
      until.elementLocated(By.css('#tipo')),
      10000
    );
    const duracionInput = await driver.wait(
      until.elementLocated(By.css('#duracionEstimada')),
      10000
    );

    // Botón submit (texto incluye "Actividad")
    const submitBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[contains(., 'Actividad')]")
      ),
      10000
    );

    // Al inicio debería estar deshabilitado
    const disabledInicio = await submitBtn.getAttribute('disabled');
    if (disabledInicio === null) {
      throw new Error(
        'El botón de Crear/Actualizar Actividad NO está deshabilitado cuando el formulario está vacío'
      );
    }

    // Llenamos campos requeridos
    await nombreInput.clear();
    await nombreInput.sendKeys('Actividad de prueba Selenium');

    await descripcionInput.clear();
    await descripcionInput.sendKeys(
      'Descripción de actividad creada desde prueba automatizada'
    );

    await tipoSelect.click();
    const segundaOpcion = await driver.findElement(
      By.css('#tipo option:nth-child(2)')
    );
    await segundaOpcion.click();

    await duracionInput.clear();
    await duracionInput.sendKeys('30');

    await driver.sleep(500);

    const disabledFinal = await submitBtn.getAttribute('disabled');
    if (disabledFinal !== null) {
      throw new Error(
        'El botón de Crear/Actualizar Actividad sigue deshabilitado aunque el formulario es válido'
      );
    }
  });

  //
  // EMPRESA LIST
  //
   it('Empresa: debería mostrar título y algún estado (card, sin datos o error)', async function () {
    await driver.get('http://localhost:4200/empresas');

    const tituloEmpresa = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[contains(., 'Información de la Empresa')]")
      ),
      10000
    );
    if (!(await tituloEmpresa.isDisplayed())) {
      throw new Error(
        'No se está mostrando el título "Información de la Empresa"'
      );
    }

    // Pequeña espera para que deje de estar en loading()
    await driver.sleep(500);

    // 1. Empresa encontrada → card
    const cardEmpresa = await driver.findElements(By.css('.card'));

    // 2. No hay empresa → alerta info
    const alertaInfo = await driver.findElements(
      By.xpath("//*[contains(., 'No se encontró información de la empresa')]")
    );

    // 3. Error de backend → alerta danger
    const alertaError = await driver.findElements(
      By.css('.alert.alert-danger')
    );

    if (
      cardEmpresa.length === 0 &&
      alertaInfo.length === 0 &&
      alertaError.length === 0
    ) {
      throw new Error(
        'No se encontró ni la card de empresa, ni el mensaje de que no hay información, ni un mensaje de error'
      );
    }
  });

  //
  // EMPRESA EDIT
  //
  it('Empresa Form: si hay botón Editar, debe llevar al formulario con los campos principales visibles', async function () {
    await driver.get('http://localhost:4200/empresas');

    const editarBtns = await driver.findElements(
      By.xpath("//a[contains(., 'Editar')]")
    );

    if (editarBtns.length === 0) {
      console.log(
        'No se encontró botón "Editar" en Empresa; se asume que no hay empresa o no eres admin. Se omite esta validación.'
      );
      return;
    }

    await editarBtns[0].click();

    const formTitulo = await driver.wait(
      until.elementLocated(
        By.xpath("//h3[contains(., 'Editar Información de la Empresa')]")
      ),
      10000
    );
    if (!(await formTitulo.isDisplayed())) {
      throw new Error(
        'No se ve el título "Editar Información de la Empresa" en el formulario'
      );
    }

    const nombre = await driver.wait(
      until.elementLocated(By.css('#nombre')),
      10000
    );
    const nit = await driver.wait(
      until.elementLocated(By.css('#nit')),
      10000
    );
    const correo = await driver.wait(
      until.elementLocated(By.css('#correo')),
      10000
    );

    if (!(await nombre.isDisplayed())) {
      throw new Error('El campo "Nombre de la Empresa" no se muestra');
    }
    if (!(await nit.isDisplayed())) {
      throw new Error('El campo "NIT" no se muestra');
    }
    if (!(await correo.isDisplayed())) {
      throw new Error('El campo "Correo Electrónico" no se muestra');
    }
  });
});
