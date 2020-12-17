# Shopify Theme



## Local Setup

This theme is a mixture of Slate and webpack for generating static JS and CSS files.

**Install**

```bash
git clone https://github.com/qodespace/[insert github name here]
cd the-script-theme
yarn install
```

**Watch file changes for development and debugging**

```bash
yarn dev
```

**Watch in production mode for testing before a full deployment and generate minify JS/CSS files**

```bash
yarn watch
```

**Deploy and Build - both are utilizing slate build and slate deploy right after webpack build**

```bash
yarn build
```

```bash
yarn deploy
```

## Basic Development Path (Boilerplate): 

1. Verify ticket description is adequate for complete development
 	  * If inadequate: raise issue immediately and seek efficient resolution; clearly defining what is needed to complete
2. Create duplicate theme for development
	  * Make a note of the theme id by opening it in customizer (e.g. url contains id my-site.myshopify.com/admin/themes/{theme_id}/editor
	  * Theme can be used for development on multiple tickets
3. In GitHub Desktop: pull branch of related site (e.g. bella-dahl for bella-dahl.myshopify.com)
4. Create separate branch using the site branch as a base
5. !IMPORTANT In Visual Studio code edit config.yml with theme id of the newly created theme, password and site url (if you have questions on how to obtain these please reach out to Quan) !IMPORTANT
6. Make necessary changes
	  * 'yarn dev' in Visual Studio Code terminal to simultaneously watch for changes and deploy changes to your new theme.
	  * 'yarn dev' loaded localhost browser is not sufficient for observing changes; go to theme customizer > 'Theme Actions' > Preview and manually reload when making changes
7. When changes are verified in preview get a preview link and set ticket to ready for approval
8. Check in and push changes to branch in GitHub
	  * Create Pull Request tagging Quan and Joseph for review
