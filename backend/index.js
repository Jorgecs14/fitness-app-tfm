//Import express
const express = require('express');
//Crear app
const app = express();
//Definir
const PORT = 3005;

// Nueva ruta
app.get('/', (req, res) => {
    res.json({mensaje: 'Hola mundo!'});
});

//Arrancar
app.listen(PORT, () => {
    console.log('Servidor arranco!');
})
