# getto-elm_tools

development tool for elm

```bash
npm run livereload # start web server with livereload and watch src to build elm
```


###### Table of Contents

- [Requirements](#Requirements)
- [Usage](#Usage)
- [Examples](#Examples)
- [License](#License)

<a id="Requirements"></a>
## Requirements

- npm : 10.4.1

elm packages are not include in dependencies

- elm : 0.18.0
- elm-test : 0.18.12


<a id="Usage"></a>
## Usage

directories

- src : Elm sources
- src/EntryPoint/**/*.elm : entry point modules
- public/dist/app/**/*.js : build artifacts
- public/**/*.html : html pages
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

add below scripts to your `package.json`

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


<a id="Examples"></a>
## Examples

### config/routes.yml

```yaml
# config/routes.yml
global:
  css: 0.2.36

entries:
  - name: index
    title: ホーム

  - name: auth
    entries:
      - name: profile
        title: プロフィール
```

from `config/routes.yml` above, create elm and html files below

- public/index.html
- public/auth/profile.html
- src/EntryPoint/Index.elm
- src/EntryPoint/Auth/Profile.elm

template receive entry's data like below

```json
{
  global: {
    css: "0.2.36"
  },
  entry: {
    name: "profile",
    title: "プロフィール"
  },
  info: {
    path: "auth/profile"
    module: "Auth.Index"
  }
}
```


### templates/page.html

```html
<!doctype html>
<html lang="ja">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title><%= entry.title %></title>
<script src="/dist/app/<%= info.path %>.js"></script>
<link rel="stylesheet" href="https://css.getto.systems/<%= global.css %>/getto.css">
</head>
<body>

<div id="app"></div>
<div id="error" style="display:none">
  <div class="LoginLayout">
    <article>
      <header>
        <p>
        <small id="company"><%= global.app.company %></small>
        <br>
        <span id="title"><%= global.app.title %></span>
        <br>
        <small id="sub-title"><%= global.app.sub %></small>
        </p>
      </header>
      <section>
        <form method="get" action="/">
          <footer>
          <p>
          <em class="badge is-danger"><i class="fa fa-exclamation-triangle"></i> システムエラーが発生しました</em>
          </p>
          <p>
          <a href="?reset"><i class="fa fa-refresh"></i> リセット</a>
          </p>
          </footer>
        </form>
      </section>
    </article>
    <footer>
      <span id="project"><%= global.app.project %></span>
      <span id="version">version : 2.0.20</span>
    </footer>
  </div>
</div>

<script defer>
window.config = {
  page: "<%= info.module %>",
  path: "<%= info.path %>.html"
};
</script>
<script defer src="/dist/page.js"></script>
</body>
</html>
```

### templates/page.elm

```elm
module EntryPoint.<%= info.module %> exposing (main)

import Html exposing (Html)
import <%= global.package %>.Version as Version
import <%= global.package %>.Page.<%= info.module %> as Page

opts =
  { version = Version.version
  , authRequired = True
  }
main =
  Html.programWithFlags
    { init = Page.init opts
    , view = Page.view
    , update = Page.update
    , subscriptions = Page.subscriptions
    }

```


<a id="License"></a>
## License

getto-elm_tools is licensed under the [MIT](LICENSE) license.

Copyright &copy; since 2018 shun@getto.systems
