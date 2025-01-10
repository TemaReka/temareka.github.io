const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Папки с HTML-файлами
const folders = ['../', '../pages']; // Корневая папка и папка pages

folders.forEach(folderPath => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Ошибка чтения папки ${folderPath}:`, err);
      return;
    }

    // Фильтруем только HTML-файлы
    files.filter(file => file.endsWith('.html')).forEach(file => {
      const filePath = path.join(folderPath, file);

      // Читаем содержимое файла
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          console.error(`Ошибка чтения файла ${file}:`, err);
          return;
        }

        // Используем JSDOM для работы с HTML
        const dom = new JSDOM(data);
        const document = dom.window.document;

        // Обрабатываем ссылки
        document.querySelectorAll('a').forEach(link => {
          // Пропускаем ссылки с классом "wrappingLink"
          if (link.classList.contains('wrappingLink')) return;

          let linkText = link.textContent;

          if (linkText.startsWith('← ')) {
            // Если ссылка начинается с "← " (стрелка + пробел)
            let arrow = '← '; // Стрелка остаётся как есть
            let remainingText = linkText.slice(2); // Остальной текст после "← "

            // Оборачиваем только оставшийся текст в <u>
            link.innerHTML = `${arrow}<u>${remainingText}</u>`;
          } else {
            // Если стрелки нет, оборачиваем весь текст в <u>
            link.innerHTML = `<u>${linkText}</u>`;
          }
        });

        // Сохраняем изменения в файл
        fs.writeFile(filePath, dom.serialize(), 'utf-8', err => {
          if (err) {
            console.error(`Ошибка записи файла ${file}:`, err);
          } else {
            console.log(`Файл ${file} в папке ${folderPath} успешно обновлён.`);
          }
        });
      });
    });
  });
});
