# elm-effects-proxy

This project provides a monkey patch for XMLHttpRequest that enables side effects as HTTP requests in Elm without the 
need of using ports.

## Motivation

We have to handle a lot of side effects because of the need to interact with privative 3rd party js libraries for our 
project. Being able to handle side effects as tasks or cmds allowed us to remove lots of boilerplate code and has
made all the side effect handling much more understandable.

## Frontend Potential Public Goals

- WebSockets.

## Backend Potential Public Goals

- 100% Elm based web server.
- 100% Elm based PostgreSQL ORM. 

## How to use it

1. On the JS side, import `websocket-effects-patch.js`.
2. On the elm side, import `EffectsProxy.elm`.

You can see an example implementation in the file `src/EffectsProxyDemo.elm`.


