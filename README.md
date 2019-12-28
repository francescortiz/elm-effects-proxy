# elm-effects-proxy

This project provides a monkey patch for XMLHttpRequest that enables side effects as Cmds or Tasks in Elm without the 
need of using ports.

## How to use it

1. On the JS side, import `websocket-effects-patch.js`.
2. On the elm side, import `EffectsTask.elm`.

You can see an example implementation in the file `src/EffectsTaskDemo.elm`.


