#!/bin/bash

getto_elm_make_main(){
  local make
  local root
  local dest
  local tmp

  make=./node_modules/.bin/elm-make

  root=src/EntryPoint
  dest=public/dist/app
  tmp=tmp/app

  if [ -d "$tmp" ]; then
    echo "tmp directory exists. maybe working? : $tmp"
    return
  fi

  getto_elm_make_compile "$root"

  echo
  echo "=== build completed ==="
  echo

  getto_elm_make_cleanup
}
getto_elm_make_compile(){
  local file
  local output
  local check

  for file in $1/*; do
    if [ -d "$file" ]; then
      getto_elm_make_compile "$file"
    else
      if [ -f "$file" ]; then
        output=${file#$root/}
        output=$(echo "$output" | sed -r -e 's/^([A-Z])/\L\1\E/' -e 's/([A-Z])/_\L\1\E/g')
        output=${output//\/_/\/}
        output=${output%.elm}.js

        $make "$file" --output "$tmp/$output" 2>&1
        if [ "$?" != 0 ]; then
          getto_elm_make_cleanup
          exit 1
        fi

        if [ ! -f "$dest/$output" ]; then
          mkdir -p $(dirname $dest/$output)
          mv "$tmp/$output" "$dest/$output"
        else
          check=$(sha1sum $tmp/$output)
          check=${check/$tmp/$dest}
          if [ -n "$(echo $check | sha1sum -c --quiet 2> /dev/null)" ]; then
            mkdir -p $(dirname $dest/$output)
            mv "$tmp/$output" "$dest/$output"
          fi
        fi
      fi
    fi
  done
}
getto_elm_make_cleanup(){
  rm -rf $tmp
}

getto_elm_make_main
