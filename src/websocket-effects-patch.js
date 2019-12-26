"use strict";
(function (window) {
    var EFFECTS_TASK_URL = "https://elm-effects-task.flexidao.com/";
    var EFFECTS_TASK_URL_LENGTH = EFFECTS_TASK_URL.length;
    function resolve(obj, path) {
        return path.split('.').reduce(function (o, i) { return o[i]; }, obj);
    }
    var setResponseOf = function (xhr, status, result) {
        Object.defineProperty(xhr, "status", {
            configurable: true,
            get: function () { return status; }
        });
        Object.defineProperty(xhr, "response", {
            configurable: true,
            get: function () { return JSON.stringify(result); }
        });
        var loadEvent = new Event("load");
        xhr.dispatchEvent(loadEvent);
    };
    var patchedOpen = function (originalOpen) {
        return function (method, url, async, username, password) {
            if (url.startsWith(EFFECTS_TASK_URL)) {
                var functionPath = url.substring(EFFECTS_TASK_URL_LENGTH);
                this.isElmEffectsTask = true;
                this.elmEffectsTask = {
                    functionPath: functionPath,
                    functionArguments: [],
                };
            }
            else {
                // This is important, since XMLHttpRequest might be reused.
                this.isElmEffectsTask = false;
                originalOpen.apply(this, arguments);
            }
        };
    };
    var patchedSetRequestHeader = function (originalSetRequestHeader) {
        return function (name, value) {
            if (this.isElmEffectsTask) {
                // pass
            }
            else {
                originalSetRequestHeader.apply(this, arguments);
            }
        };
    };
    var patchedSend = function (originalSend) {
        return function (body) {
            if (this.isElmEffectsTask) {
                var functionPath = this.elmEffectsTask.functionPath;
                var functionArguments = [];
                if (typeof body === "string") {
                    functionArguments = body
                        ? JSON.parse(body)
                        : [];
                }
                if (!Array.isArray(functionArguments)) {
                    var errorMessage = "ElmEffectsTask: expected array of arguments. Got '" + functionArguments + "'.";
                    setResponseOf(this, 404, errorMessage);
                    console.error(errorMessage);
                }
                var resolvedFunction;
                try {
                    resolvedFunction = resolve(window, functionPath);
                }
                catch (e) {
                    var errorMessage = "ElmEffectsTask: failed to resolve path '" + functionPath + "'.";
                    setResponseOf(this, 404, errorMessage);
                    console.error(errorMessage);
                    console.error(e);
                }
                if (resolvedFunction) {
                    var typeOfResolvedFunction = typeof resolvedFunction;
                    if (typeOfResolvedFunction === "function") {
                        var result = resolvedFunction.apply(window, functionArguments);
                        setResponseOf(this, 200, result);
                    }
                    else {
                        var errorMessage = "ElmEffectsTask: '" + functionPath + "' does not resolve to a function. It resolves to '" + typeOfResolvedFunction + "'.";
                        setResponseOf(this, 404, errorMessage);
                        console.error(errorMessage);
                    }
                }
                else {
                    var errorMessage = "ElmEffectsTask: '" + functionPath + "' resolves to undefined, null, false or equivalent.";
                    setResponseOf(this, 404, errorMessage);
                    console.error(errorMessage);
                }
            }
            else {
                originalSend.apply(this, arguments);
            }
        };
    };
    var patch = function () {
        // @ts-ignore
        var exists = XMLHttpRequest.prototype.patchedForElmEffects;
        if (exists) {
            console.warn("Websockets already patched for elm effects.");
            return;
        }
        console.log("Patching websockets for side effects...");
        // Patch open
        var originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = patchedOpen(originalOpen);
        // Patch send
        var originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = patchedSend(originalSend);
        // Patch setRequestHeader
        var originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
        XMLHttpRequest.prototype.setRequestHeader = patchedSetRequestHeader(originalSetRequestHeader);
        // Store success.
        // @ts-ignore
        XMLHttpRequest.prototype.patchedForElmEffects = true;
    };
    patch();
})(window);
//# sourceMappingURL=websocket-effects-patch.js.map