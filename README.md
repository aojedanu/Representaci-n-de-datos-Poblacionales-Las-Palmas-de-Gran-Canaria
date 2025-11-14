# Representación-de-datos-poblacionales-Las-Palmas-de-Gran-Canaria

## Objetivo del trabajo
La finalidad de este proyecto es mostrar distintos datos poblacionales de la ciudad de Las Palmas De Gran Canaria a lo largo del tiempo como: Población total, densidad poblacional, edad media de la poblacion y poblacion migrante. 

### Datos utilizados
Para el desarrollo de este proyecto se han utilizado dos datasets proporcionados por ISTAC https://www.gobiernodecanarias.org/istac/. El primer conjunto de datos (https://datos.canarias.es/catalogos/estadisticas/dataset/indicadores-demograficos-malla-de-250m-canarias-01-01-2010) contiene las posiciones geograficas de los puntos de interes, mientras qeu el segundo arhivo contiene diferentes metricas poblacionales de los puntos poblacionales descritos en el primer conjunto de datos (https://datos.canarias.es/catalogos/estadisticas/showcase/indicadores_demograficos_malla_250).  

Los archivos descritos contienen informaciono a nivel insluar por lo tanto para el porposito de este trabajo se ha realizado un filtrado en ambos conjuntos para obtener solo los datos de la ciudad de Las Palmas De Gran Canaria.

### Descripción del código

Los datos son introducidos al flujo de la aplicacion mediante el uso de una funcion auxiliar llamada cargarDatos(). La funcion consiste de un bloque try/catch en el cual se usa la función fetch para obtener los datos del csv y posteriormente pasarlos por funciones de extración y limpieza de los datos. En el cuerpo de la funcion tambien se hacen llamadas a estas fucniones  calcularMaximos(), cambiarAñio(), actualizarLeyenda() esenciales para calcular los datos que seran mostrados como información complementaria al mapa de barras.

Para extraer los datos de el csv se usan dos funciones procesarCSVGeografico() en la cual se obtiene cada fila y para cada fila se obtienen los encabezados  const encabezados = filas[0]
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map(h => h.replace(/"/g, '').trim().toLowerCase());



