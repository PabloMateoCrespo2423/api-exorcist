const express = require('express');
require('dotenv').config(); // Cargar variables de entorno
const vision = require('@google-cloud/vision');
const cors = require('cors'); // Importar cors
// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000; 
// Habilitar CORS
app.use(cors());
// Crear un cliente de Google Vision
const client = new vision.ImageAnnotatorClient({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS) || undefined
});

app.get('/detect-objects', async (req, res) => {
    const imageUrl = req.query.url; // Tomar la URL de la imagen de los parámetros de la petición

    if (!imageUrl) {
        return res.status(400).json({ message: 'Debe proporcionar una URL de imagen' });
    }

    try {
        // Llamar a la API de Google Vision para detectar objetos en la imagen
        const [result] = await client.objectLocalization({
            image: { source: { imageUri: imageUrl } }, // Asegúrate de que la URL es accesible
        });

        const objects = result.localizedObjectAnnotations.map(object => ({
            name: object.name,
            confidence: object.score,
            boundingPoly: object.boundingPoly.normalizedVertices,
        }));

        res.json({ objects });
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        res.status(500).json({ message: 'Error al procesar la imagen', error: error.message });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
