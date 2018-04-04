const promisify = require('es6-promisify')
const webshot = require('webshot')
const path = require('path')
const fs = require('fs')
const mjml2html = require('mjml')

const access = promisify(fs.access)
const readDir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const mkdir = promisify(fs.mkdir)

const TEMPLATES_FOLDER = path.join(__dirname, 'templates')
const THUMB_FOLDER = path.join(__dirname, 'thumbnails')

const WEBSHOT_OPTIONS = {
  siteType: 'html',
  screenSize: {
    width: 700,
  },
  shotSize: {
    width: 700,
    height: 'all',
  },
  defaultWhiteBackground: true,
}

;(async function () {
  try {

    await isWritableOrCreate(THUMB_FOLDER)

    console.log('>> Reading templates')
    const templates = await readDir(TEMPLATES_FOLDER)
    const templatesWithContent = await Promise.all(templates.map(readContent))

    console.log('>> Generating thumbnails')
    await templatesWithContent.reduce((promise, template) => {
      return promise.then(() => generateThumbnail(template))
    }, Promise.resolve())

  } catch (err) { exitErr(err) }
})()

async function isWritableOrCreate (folder) {
  try {
    await access(THUMB_FOLDER, fs.constants.R_OK | fs.constants.W_OK)
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdir(THUMB_FOLDER)
    } else {
      throw err
    }
  }
}

async function readContent (templateName) {
  const templatePath = path.join(TEMPLATES_FOLDER, templateName)
  const mjml = await readFile(templatePath, { encoding: 'utf8' })
  return {
    name: path.basename(templateName, '.mjml'),
    mjml,
  }
}

async function generateThumbnail (template) {
  console.log(` > treating ${template.name}`)
  const thumbnailName = path.join(THUMB_FOLDER, `${template.name}.jpg`)
  const html = await getHTML(template.mjml)
  await shot(thumbnailName, html)
}

function getHTML (mjml) {
  return new Promise((resolve, reject) => {
    try {
      const res = mjml2html(mjml)
      resolve(res.html)
    } catch (err) {
      reject(err)
    }
  })
}

function shot (name, html) {
  return new Promise((resolve, reject) => {
    webshot(html, name, WEBSHOT_OPTIONS, (err) => {
      if (err) { return reject(err) }
      resolve()
    })
  })
}

function exitErr (err) {
  console.log('> Something went wrong')
  console.log(err.message || err)
  process.exit(1)
}
