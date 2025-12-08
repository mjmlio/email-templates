const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs").promises;
const mjml2html = require("mjml");

const TEMPLATES_FOLDER = path.join(__dirname, "templates");
const THUMB_FOLDER = path.join(__dirname, "thumbnails");

// Get template name from command line argument
const templateToGenerate = process.argv[2];

(async function () {
  try {
    await fs.mkdir(THUMB_FOLDER, { recursive: true });

    console.log(">> Reading templates");
    let templates = await fs.readdir(TEMPLATES_FOLDER);

    // Filter to specific template if provided
    if (templateToGenerate) {
      const filename = `${templateToGenerate}.mjml`;
      templates = templates.filter((t) => t === filename);
      if (templates.length === 0) {
        throw new Error(`Template not found: ${templateToGenerate}`);
      }
    }

    const templatesWithContent = await Promise.all(templates.map(readContent));

    const browser = await puppeteer.launch();

    console.log(">> Generating thumbnails");
    for (const template of templatesWithContent) {
      await generateThumbnail(browser, template);
    }

    await browser.close();
  } catch (err) {
    exitErr(err);
  }
})();

async function readContent(templateName) {
  const templatePath = path.join(TEMPLATES_FOLDER, templateName);
  const mjml = await fs.readFile(templatePath, { encoding: "utf8" });
  return {
    name: path.basename(templateName, ".mjml"),
    mjml,
  };
}

async function generateThumbnail(browser, template) {
  console.log(` > treating ${template.name}`);
  const thumbnailName = path.join(THUMB_FOLDER, `${template.name}.jpg`);
  const html = mjml2html(template.mjml).html;

  const page = await browser.newPage();
  // Match old webshot settings: 700px width, full height
  await page.setViewport({ width: 700, height: 800 });

  // Only inject white background if body doesn't already have a background color
  let htmlWithBackground = html;
  const bodyTag = html.match(/<body[^>]*>/);
  if (!bodyTag || !bodyTag[0].includes("background-color")) {
    htmlWithBackground = html.replace(
      "</head>",
      "<style>html, body { background-color: white; }</style></head>"
    );
  }

  await page.setContent(htmlWithBackground);
  await page.screenshot({
    path: thumbnailName,
    fullPage: true,
    type: "jpeg",
    omitBackground: false,
  });
  await page.close();
}

function exitErr(err) {
  console.log("> Something went wrong");
  console.log(err.message || err);
  process.exit(1);
}
