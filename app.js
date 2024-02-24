var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var puppeteer = require('puppeteer');
var ejs = require('ejs');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate-pdf', async (req, res) => {
  const { ordenSalida, ordenEntrega, nombre, fecha, series, articulos } = req.body;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const content = await ejs.renderFile(path.join(__dirname, 'views', 'index.ejs'), {
    ordenSalida,
    ordenEntrega,
    nombre, // Nombre del cliente
    fecha,
    series, // Lista de series
    articulos // Lista de artículos con clave y cantidad
  });

  await page.setContent(content, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();

  const timestamp = new Date().getTime(); // Obtiene la marca de tiempo actual
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${timestamp}.pdf`);
  res.send(pdf);
});

// Añadido para escuchar en el puerto que Vercel asigna a través de la variable de entorno PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
