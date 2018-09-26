#!/bin/bash

getto_elm_build_main(){
  local make
  local uglify
  local root
  local dest
  local tmp

  make=./node_modules/.bin/elm-make
  uglify=./node_modules/.bin/uglifyjs

  root=src/EntryPoint
  dest=public/dist/_app
  tmp=tmp/app

  if [ -d "$tmp" ]; then
    echo abort
    return
  fi

  echo
  echo "=== build start ==="
  echo

  getto_elm_build_compile "$root"

  echo
  echo "=== build completed ==="
  echo

  getto_elm_build_cleanup
}
getto_elm_build_compile(){
  local file
  local output
  local check

  for file in $1/*; do
    if [ -d "$file" ]; then
      getto_elm_build_compile "$file"
    else
      if [ -f "$file" ]; then
        output=${file#$root/}
        output=$(echo "$output" | sed -r -e 's/^([A-Z])/\L\1\E/' -e 's/([A-Z])/_\L\1\E/g')
        output=${output//\/_/\/}
        output=${output%.elm}.js

        $make "$file" --output "$tmp/$output" 2>&1
        if [ "$?" != 0 ]; then
          getto_elm_build_error
        fi

        mkdir -p $(dirname $dest/$output)
        mv "$tmp/$output" "$dest/$output"

        minify=$dest/${output%.js}.min.js
        echo "uglifyjs -c -m -o $minify -- $dest/$output"
        $uglify -c -m -o "$minify" -- "$dest/$output"
        if [ "$?" != 0 ]; then
          getto_elm_build_error
        fi
      fi
    fi
  done
}
getto_elm_build_error(){
  getto_elm_build_cleanup
  exit 1
}
getto_elm_build_cleanup(){
  rm -rf $tmp
}

getto_elm_build_main
