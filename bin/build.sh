#!/usr/bin/env sh
root=$(dirname $(dirname $0))
mkdir -p "$root/generated"
mkdir -p "$root/appengine/generated"
java -jar "$root/closure-templates/SoyMsgExtractor.jar" --outputFile "$root/generated/extracted_msgs.xlf" --srcs "$root/blockly-games/common.soy,$root/blockly-games/maze.soy,$root/blockly-games/sort.soy"
"$root/blockly-games/xliff_to_json.py" --xlf "$root/generated/extracted_msgs.xlf" --output_dir "$root/generated" --templates "$root/blockly-games/common.soy,$root/blockly-games/maze.soy,$root/blockly-games/sort.soy"
"$root/blockly-games/json-to-js.py" --path_to_jar "$root/closure-templates" --output_dir "$root/generated" --template "$root/blockly-games/common.soy,$root/blockly-games/maze.soy,$root/blockly-games/sort.soy" \
    --key_file "$root/generated/keys.json" "$root/blockly-games/nl.json"
java -jar "$root/closure-compiler/closure-compiler.jar" --generate_exports --compilation_level SIMPLE_OPTIMIZATIONS \
    --dependency_mode=STRICT --language_in ECMASCRIPT5_STRICT --entry_point="$root/blockly-games/maze.js" \
    --externs="$root/externs/interpreter-externs.js" --externs="$root/externs/storage-externs.js" --externs="$root/externs/prettify-externs.js" \
    --js="$root/closure-library/closure/goog/**.js" --js="$root/closure-templates/**.js" \
    --js="$root/blockly/**.js" --js="!$root/blockly/externs/**.js" --js="!$root/blockly/demos/**.js" \
    --js="$root/blockly-games/**.js" --js="$root/generated/nl/*.js" \
    --js_output_file "$root/appengine/generated/maze.js"
java -jar "$root/closure-compiler/closure-compiler.jar" --generate_exports --compilation_level SIMPLE_OPTIMIZATIONS \
    --dependency_mode=STRICT --language_in ECMASCRIPT5_STRICT --entry_point="$root/blockly-games/sort.js" \
    --externs="$root/externs/interpreter-externs.js" --externs="$root/externs/storage-externs.js" --externs="$root/externs/prettify-externs.js" \
    --js="$root/closure-library/closure/goog/**.js" --js="$root/closure-templates/**.js" \
    --js="$root/blockly/**.js" --js="!$root/blockly/externs/**.js" --js="!$root/blockly/demos/**.js" \
    --js="$root/blockly-games/**.js" --js="$root/generated/nl/*.js" \
    --js_output_file "$root/appengine/generated/sort.js"
java -jar "$root/closure-compiler/closure-compiler.jar" \
	 --js "$root/interpreter/acorn.js" \
	 --js "$root/interpreter/interpreter.js" \
	 --js_output_file "$root/appengine/generated/interpreter.js"
cp -r "$root/blockly/media" "$root/appengine/generated/blockly"
