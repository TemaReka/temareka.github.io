const fs = require("fs");
const path = require("path");

// Строки для добавления
const metaTags = `
    <link rel="icon" href="icons/yo.svg" type="image/svg+xml">
    <meta name="description" content="Занимаюсь дизайном информации на экране и бумаге">
    <meta property="og:title" content="Привет, я Артём Река">
    <meta property="og:description" content="Занимаюсь дизайном информации на экране и бумаге">
    <meta property="og:image" content="https://drive.google.com/file/d/1FUI-fSHRGmmGPhoFdBV3A7Hd_gYhKvZa/view?usp=drive_link">
    <meta name="vk:image" content="https://drive.google.com/file/d/16y4zQmFd3tYtTRhWG0b3v3y05VIKejAa/view?usp=sharing">
`;

// Функция для обновления <head> в HTML-файлах
function updateHTMLFiles(directory) {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
        const filePath = path.join(directory, file);

        if (fs.statSync(filePath).isFile() && file.endsWith(".html")) {
            const content = fs.readFileSync(filePath, "utf-8");

            if (content.includes("<head>")) {
                const metaCharsetMatch = content.match(
                    /<meta charset=["']?[^"'>]+["']?\s*>/i
                );

                let updatedContent;

                if (metaCharsetMatch) {
                    // Вставляем после <meta charset="...">
                    const insertPosition =
                        metaCharsetMatch.index + metaCharsetMatch[0].length;
                    updatedContent =
                        content.slice(0, insertPosition) +
                        metaTags +
                        content.slice(insertPosition);
                } else {
                    // Если <meta charset> не найден, добавляем сразу после <head>
                    updatedContent = content.replace("<head>", `<head>${metaTags}`);
                }

                fs.writeFileSync(filePath, updatedContent, "utf-8");
                console.log(`Updated: ${file}`);
            } else {
                console.log(`No <head> tag found in: ${file}`);
            }
        }
    });
}

// Получаем путь из аргументов командной строки
const targetDirectory = process.argv[2];

if (!targetDirectory) {
    console.error("Укажите директорию с HTML-файлами в качестве аргумента.");
    process.exit(1);
}

updateHTMLFiles(path.resolve(targetDirectory));
