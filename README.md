# getto-elm_tools

development tool for elm

```bash
npm run livereload # start web server with livereload and watch src to build elm
```


###### Table of Contents

- [Requirements](#Requirements)
- [Usage](#Usage)
- [License](#License)

<a id="Requirements"></a>
## Requirements

- npm : 10.4.1

elm packages not include dependencies

- elm : 0.18.0
- elm-test : 0.18.12


<a id="Usage"></a>
## Usage

directories

- src : Elm sources
- src/EntryPoint/**/*.elm : entry point modules
- public/dist/app/**/*.js : build artifacts
- templates/page.html : html template
- templates/page.elm : elm template
- config/routes.yml : list pages


### livereload

- reload + watch

### reload

```
npm run reload -d ./public -w ./public/dist -p 8000
```


### watch

- getto-watch-compile + getto-watch-make + getto-watch-routes

#### getto-watch-compile

- build file if `src/**/*.elm` file changed
- ignore `EntryPoint`

#### getto-watch-make

- build all `src/EntryPoint/**/*.elm` if `tmp/build.txt` touched
- abort if `tmp/app` directory exists

#### getto-watch-routes

- create `src/EntryPoint/**/*.elm` and `public/**/*.html` if `config/routes.yml` modified


### build

- build and uglify `src/EntryPoint/**/*.elm` files


### install

```
npm install getto-elm_tools --save-dev
```

add scripts to your `package.json`

```json
"scripts": {
  "build": "getto-build",
  "livereload": "npm run reload & npm run watch",
  "reload": "reload -d ./public -w ./public/dist -p 8000",
  "watch": "npm run watch:compile & npm run watch:make & npm run watch:routes",
  "watch:routes": "getto-watch-routes",
  "watch:make": "getto-watch-make",
  "watch:compile": "getto-watch-compile",
  "elm-install": "elm-install",
  "test": "elm-test"
}
```


<a id="License"></a>
## License

getto-elm_tools is licensed under the [MIT](LICENSE) license.

Copyright &copy; since 2018 shun@getto.systems
