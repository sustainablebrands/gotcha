# gotcha

A simple node-based Web page capture CLI.

## Usage

There are two ways that this command can be used:

1. Create a screenshot of a single web page URL.
1. Create screenshots of all of the URLs in a sitemap.

### Get a Single URL

```bash
gotcha https://example.com/full-path-url/pagename
```

This will save a PNG in the current directory called
``./example.com/full-path-url/pagename.png``.

### Get a Full Sitemap

```bash
gotcha --sitemap https://example.com/sitemap.xml
```

This will grab the sitemap and loop through each page and save a screen capture.
**Note**: If you're using a multi-level site map (such as what Yoast's plugin for
WordPress creates), you will need to call the command multiple times on the
individual sitemaps that it lists -- it will not resolve sub-sitemap referecnes.

### Command Line Options

- ``--sitemap`` or ``-m`` - This URL is a sitemap.
- ``--url`` | ``-u`` - This URL is a page.
- ``{URL}`` - The URL you want to capture.

## Requirements

- Requires at least node >8 (tested on v8.11.3).
