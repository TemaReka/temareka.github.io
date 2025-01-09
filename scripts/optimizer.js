const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Пути
const inputDir = path.join(__dirname, '../img');
const outputDir = path.join(__dirname, '../optimized-img');
const outputHTML = path.join(__dirname, 'output.html');

// Размеры изображений
const sizes = [320, 640, 1024, 1440, 1920];
const retinaFactor = 2;

// Функция для оптимизации изображений
async function optimizeImage(baseName, inputFilePath) {
  const results = [];
  for (const size of sizes) {
    for (const factor of [1, retinaFactor]) {
      const width = size * factor;
      const outputFileName = `${baseName}-${width}.webp`;
      const outputPath = path.join(outputDir, outputFileName);

      try {
        if (!fs.existsSync(outputPath)) {
          console.log(`Создаю: ${outputPath}`);
          await sharp(inputFilePath)
            .resize({ width })
            .toFormat('webp')
            .toFile(outputPath);
        } else {
          console.log(`Уже существует: ${outputPath}`);
        }

        // Проверяем, что файл реально создан
        if (fs.existsSync(outputPath)) {
          results.push({ size: width, factor, path: `../optimized-img/${outputFileName}` });
        } else {
          console.error(`Ошибка: файл ${outputFileName} не создан!`);
        }
      } catch (error) {
        console.error(`Ошибка при создании ${outputFileName}:`, error.message);
      }
    }
  }
  console.log(`Оптимизированные изображения для ${baseName}:`, results);
  return results;
}

// Функция для генерации тега <picture>
function generatePictureTag(images, fileName) {
  const largestImage = images.reduce((max, img) => (img.size > max.size ? img : max), images[0]);

  const sources = sizes.map(size => {
    const img1x = images.find(img => img.size === size && img.factor === 1);
    const img2x = images.find(img => img.size === size && img.factor === 2);

    if (!img1x) {
      console.warn(`⚠️ Пропущен размер ${size}px для 1x`);
    }
    if (!img2x) {
      console.warn(`⚠️ Пропущен размер ${size}px для 2x`);
    }

    const srcset = img1x && img2x
      ? `${img1x.path} 1x, ${img2x.path} 2x`
      : img1x
      ? `${img1x.path} 1x`
      : '';

    return srcset
      ? `<source srcset="${srcset}" type="image/webp" media="(max-width: ${size}px)">`
      : '';
  }).filter(Boolean).join('\n');

  const srcset = images
    .map(img => `${img.path} ${img.size}w`)
    .join(', ');

  const sizesAttr = `
(max-width: 640px) 100vw, 
(max-width: 768px) 100vw, 
(max-width: 1024px) 100vw, 
(max-width: 1280px) 100vw, 
(max-width: 1920px) 100vw, 
100vw`;

  return `
<picture>
${sources}
<img 
  src="${largestImage.path}" 
  srcset="${srcset}" 
  sizes="${sizesAttr.trim()}" 
  loading="lazy" 
  alt="${fileName}">
</picture>`;
}

// Основной процесс
(async () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  let outputContent = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>Generated Pictures</title>\n</head>\n<body>\n';

  const imageFiles = fs.readdirSync(inputDir).filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  for (const file of imageFiles) {
    const inputFilePath = path.join(inputDir, file);
    const baseName = path.basename(file, path.extname(file));
    const optimizedImages = await optimizeImage(baseName, inputFilePath);
    const pictureTag = generatePictureTag(optimizedImages, file);

    outputContent += `${pictureTag}\n\n`;
  }

  outputContent += '</body>\n</html>';

  fs.writeFileSync(outputHTML, outputContent, 'utf-8');
  console.log(`Файл ${outputHTML} успешно создан!`);
})();
