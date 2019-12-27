"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
            return __awaiter(this, void 0, void 0, function () {
                var functionPath, functionArguments, errorMessage, resolvedFunction, errorMessage, typeOfResolvedFunction, result, errorMessage, errorMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isElmEffectsTask) return [3 /*break*/, 6];
                            functionPath = this.elmEffectsTask.functionPath;
                            functionArguments = [];
                            if (typeof body === "string") {
                                functionArguments = body
                                    ? JSON.parse(body)
                                    : [];
                            }
                            if (!Array.isArray(functionArguments)) {
                                errorMessage = "ElmEffectsTask: expected array of arguments. Got '" + functionArguments + "'.";
                                setResponseOf(this, 404, errorMessage);
                                console.error(errorMessage);
                            }
                            try {
                                resolvedFunction = resolve(window, functionPath);
                            }
                            catch (e) {
                                errorMessage = "ElmEffectsTask: failed to resolve path '" + functionPath + "'.";
                                setResponseOf(this, 404, errorMessage);
                                console.error(errorMessage);
                                console.error(e);
                            }
                            if (!resolvedFunction) return [3 /*break*/, 4];
                            typeOfResolvedFunction = typeof resolvedFunction;
                            if (!(typeOfResolvedFunction === "function")) return [3 /*break*/, 2];
                            return [4 /*yield*/, resolvedFunction.apply(window, functionArguments)];
                        case 1:
                            result = _a.sent();
                            setResponseOf(this, 200, result);
                            return [3 /*break*/, 3];
                        case 2:
                            errorMessage = "ElmEffectsTask: '" + functionPath + "' does not resolve to a function. It resolves to '" + typeOfResolvedFunction + "'.";
                            setResponseOf(this, 404, errorMessage);
                            console.error(errorMessage);
                            _a.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            errorMessage = "ElmEffectsTask: '" + functionPath + "' resolves to undefined, null, false or equivalent.";
                            setResponseOf(this, 404, errorMessage);
                            console.error(errorMessage);
                            _a.label = 5;
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            originalSend.call(this, body);
                            _a.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            });
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