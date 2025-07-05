module.exports = {
  // Configura Jest para ejecutar en ambiente Node.js (no navegador)
  testEnvironment: 'node',
  
  // Ignora node_modules al calcular cobertura de código
  coveragePathIgnorePatterns: ['/node_modules/'],
  
  // Busca archivos de test con extensión .test.js en carpeta tests
  testMatch: ['**/tests/**/*.test.js'],
  
  // Archivos a incluir en el reporte de cobertura
  collectCoverageFrom: [
    'routes/**/*.js',       // Incluye todas las rutas
    'middleware/**/*.js',   // Incluye todos los middlewares
    '!**/node_modules/**'   // Excluye node_modules
  ],
  
  // Muestra detalles de cada test mientras se ejecuta
  verbose: true,
  
  // Archivo que se ejecuta antes de cada suite de tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};