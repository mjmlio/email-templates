# email-templates

A collection of responsive email templates coded in MJML and available on [mjml.io/templates](https://mjml.io/templates).

## Fixing a template

Some of those templates could do with a good clean and we truly appreciate help. If you see any error
in a template or a way to enhance a template, feel free to submit a pull-request with your changes.

## Submitting a template

We love showcasing our community's work! If you want to have your template featured on the website,
feel free to submit your own MJML template (with a `.mjml` file extension) as a pull-request in this repo.

## Compiling templates to HTML

You can render all templates at once by using the `-w` command (just make sure to first create the folder where you want the HTML files to be created). 

```
mkdir templates/html
mjml -w ./templates/*.mjml -o ./templates/html/
```

## Generating thumbnails

You can automatically generate thumbnails for the templates in the `templates` folder (requires Node v7.9.0).

```
yarn install
yarn thumbnails
```
