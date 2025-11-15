# Representación-de-datos-poblacionales-Las-Palmas-de-Gran-Canaria

## Objetivo del trabajo
La finalidad de este proyecto es mostrar distintos datos poblacionales de la ciudad de Las Palmas de Gran Canaria a lo largo del tiempo, tales como: población total, densidad poblacional, edad media de la población y población migrante

### Datos utilizados
Para el desarrollo de este proyecto se han utilizado dos datasets proporcionados por ISTAC (https://www.gobiernodecanarias.org/istac/
).
El primer conjunto de datos (https://datos.canarias.es/catalogos/estadisticas/dataset/indicadores-demograficos-malla-de-250m-canarias-01-01-2010
) contiene las posiciones geográficas de los puntos de interés, mientras que el segundo archivo contiene diferentes métricas poblacionales de los puntos descritos en el primer conjunto de datos (https://datos.canarias.es/catalogos/estadisticas/showcase/indicadores_demograficos_malla_250
).

Los archivos descritos contienen información a nivel insular; por lo tanto, para el propósito de este trabajo se ha realizado un filtrado en ambos conjuntos para obtener únicamente los datos de la ciudad de Las Palmas de Gran Canaria.

### Descripción del código

Los datos son introducidos al flujo de la aplicación mediante el uso de una función auxiliar llamada cargarDatos(). La función consiste en un bloque try/catch en el cual se usa la función fetch para obtener los datos de los archivos CSV y posteriormente pasarlos por funciones de extracción y limpieza. En el cuerpo de la función también se realizan llamadas a calcularMaximos(), cambiarAnio() y actualizarLeyenda(), esenciales para calcular los valores que serán mostrados como información complementaria al mapa de barras.

La función visualizarDatos(), que se ejecuta cada vez que se cambia de modo de visualización o de año, es la encargada de generar los cubos-barra que representan cada zona geográfica. Lo primero que realiza esta función es limpiar cualquier barra previamente dibujada en la escena. Posteriormente, recorre una a una todas las ubicaciones cargadas desde el CSV geográfico, y para cada una de ellas intenta buscar el registro equivalente en el conjunto de datos correspondiente al año seleccionado. Si encuentra coincidencia, calcula la posición tridimensional asignada a dicho punto mediante la función auxiliar map2Range(), que transforma las coordenadas geográficas (latitud y longitud) al espacio del plano renderizado.

Una vez posicionada la barra, se calcula el valor visual a representar según el modo elegido: población total, densidad, edad media o porcentaje de población extranjera. Este valor se normaliza en relación con los valores máximos calculados previamente, para así determinar tanto la altura del cubo como su color. Los colores se generan mediante funciones independientes (getColorPoblacion(), getColorDensidad(), getColorEdad(), getColorExtranjeros()) que utilizan escalas cromáticas diseñadas para transmitir diferencias visuales. Cada barra incluye además información adicional almacenada en userData, como su latitud, longitud o población, permitiendo futuras interacciones avanzadas.

La función calcularMaximos() cumple un papel fundamental antes de la visualización: recorre los datos de todos los años para obtener los valores máximos de población, densidad, edad media y porcentaje de extranjeros. Este cálculo resulta imprescindible, pues define los límites superiores que se usarán para normalizar la altura de las barras y las escalas cromáticas.

El cambio entre años se gestiona mediante la función cambiarAnio(), que actualiza la variable global anioActual y selecciona el arreglo correspondiente (2010, 2016 o 2022). Una vez asignados los datos correctos, vuelve a llamar a las funciones de visualización y a actualizarEstadisticas(), que muestra en el panel lateral información sintetizada, como la población total del año, la edad media y el porcentaje total de población extranjera.

Otra función importante para la interfaz es actualizarLeyenda(), responsable de generar dinámicamente la leyenda de colores según el modo de visualización actual. Para ello, define una paleta de colores y etiquetas descriptivas asociadas (por ejemplo, “Bajo – Medio – Alto – Muy Alto”) y construye la estructura HTML que se inserta en el panel correspondiente.

La función crearControles() genera en tiempo de ejecución el panel izquierdo de la interfaz, donde el usuario puede seleccionar el modo de visualización mediante botones de tipo radio y cambiar el año. Esta lógica se enlaza con funciones globales como seleccionarAnio() y cambiarModo().

Por su parte, la función crearPlano() es la encargada de crear el plano base sobre el que se proyectarán los cubos. Este plano utiliza la textura del mapa cargada al inicio, ajustando automáticamente sus proporciones según el rango geográfico (mínimo y máximo) de latitud y longitud. Además del plano principal, se dibuja un borde mediante líneas para delimitar con claridad los límites del mapa.

Finalmente, las funciones init(), animate() y onWindowResize() gestionan la preparación y funcionamiento continuo de la escena.
init() configura la cámara, las luces, los controles orbitales, los paneles de información y la carga inicial de la textura.
animate() ejecuta un bucle de renderizado que mantiene la visualización en tiempo real, mientras que onWindowResize() ajusta la cámara y el renderizador cuando el usuario modifica el tamaño de la ventana.

Todas estas funciones permiten convertir datos geográficos y poblacionales en una visualización interactiva, donde el usuario puede explorar de manera visual la evolución de diferentes variables demográficas en distintos años y con diversos modos de representación.


### Video Demostración 
https://youtu.be/CM7fB145xmo

En este vídeo se muestra el funcionamiento de la aplicación.



