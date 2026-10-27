# Heychat Website

This repository contains a static marketing and blog website for Heychat, built using HTML, CSS, and JavaScript.

## Included pages
- index.html
- features.html
- about.html
- download.html
- blog.html
- blog-post.html
- help.html
- contact.html
- privacy.html
- terms.html

## Styling and scripts
- css/styles.css
- js/main.js

## Assets
- assets/heychat-logo.svg
- assets/hero-illustration.svg

## Additional deployment files
- robots.txt
- sitemap.xml

## Cloudflare Pages deployment
1. Push this repository to GitHub.
2. In Cloudflare Pages, click "Create a project" and connect the repository.
3. Choose the project framework preset: "None" for static HTML/CSS/JS.
4. Set the build command to blank or leave it empty.
5. Set the output directory to the repository root ("/").
6. Deploy.

## Notes
- This is a static site and does not require a backend for viewing.
- Contact form, blog search, and FAQ interactions are front-end only.
- Any real submission, login, CMS, or database feature would require a backend service, Cloudflare Worker, or external provider.

## Future updates
- Update the content in the HTML files directly.
- Update colors, spacing, and general layout in css/styles.css.
- Add custom functionality in js/main.js.

## Domain setup
After deployment, connect your purchased domain in Cloudflare Pages and configure DNS records as directed by the Cloudflare dashboard.
