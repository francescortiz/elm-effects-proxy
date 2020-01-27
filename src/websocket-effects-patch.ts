type ElmEffectsProxy = {
    functionPath: string,
    functionArguments: any[],
}

declare interface XMLHttpRequest {
    isElmEffectsProxy: boolean;
    patchedForElmEffects: boolean;
    elmEffectsProxy: ElmEffectsProxy;
}

(function (window: Window): void {
    const EFFECTS_PROXY_URL = "https://elm-effects-proxy.flexidao.com/";
    const EFFECTS_PROXY_URL_LENGTH = EFFECTS_PROXY_URL.length;

    function resolve(obj: any, path: string) {
        return path.split('.').reduce((o: any, i: string) => o[i], obj)
    }

    const setResponseOf = (xhr: XMLHttpRequest, status: number, result: any): void => {
        Object.defineProperty(xhr, "status", {
            configurable: true,
            get: () => status
        });
        Object.defineProperty(xhr, "response", {
            configurable: true,
            get: () => JSON.stringify(result)
        });
        const loadEvent = new Event("load");
        xhr.dispatchEvent(loadEvent);
    };

    const patchedOpen =
        function (originalOpen: Function) {
            return function (this: XMLHttpRequest, method: string, url: string, async?: boolean, username?: string | null, password?: string | null): void {
                if (url.startsWith(EFFECTS_PROXY_URL)) {
                    const functionPath = url.substring(EFFECTS_PROXY_URL_LENGTH);
                    this.isElmEffectsProxy = true;
                    this.elmEffectsProxy = {
                        functionPath: functionPath,
                        functionArguments: [],
                    }
                } else {
                    // This is important, since XMLHttpRequest might be reused.
                    this.isElmEffectsProxy = false;
                    originalOpen.apply(this, arguments);
                }
            };
        };

    const patchedSetRequestHeader =
        function (originalSetRequestHeader: Function) {
            return function (this: XMLHttpRequest, name: string, value: string): void {
                if (this.isElmEffectsProxy) {
                    // pass
                } else {
                    originalSetRequestHeader.apply(this, arguments);
                }
            };
        };

    const patchedSend =
        function (originalSend: Function) {
            return async function (this: XMLHttpRequest, body?: Document | BodyInit | null): Promise<void> {
                if (this.isElmEffectsProxy) {
                    const functionPath = this.elmEffectsProxy.functionPath;
                    var functionArguments = [];
                    if (typeof body === "string") {
                        functionArguments = body
                            ? JSON.parse(body)
                            : [];
                    }

                    if (!Array.isArray(functionArguments)) {
                        const errorMessage = `ElmEffectsProxy: expected array of arguments. Got '${functionArguments}'.`;
                        setResponseOf(this, 404, errorMessage);
                        console.error(errorMessage);
                    }

                    var resolvedFunction: any | undefined;
                    try {
                        resolvedFunction = resolve(window, functionPath);
                    } catch (e) {
                        const errorMessage = `ElmEffectsProxy: failed to resolve path '${functionPath}'.`;
                        setResponseOf(this, 404, errorMessage);
                        console.error(errorMessage);
                        console.error(e);
                    }

                    if (resolvedFunction) {
                        const typeOfResolvedFunction: string = typeof resolvedFunction;

                        if (typeOfResolvedFunction === "function") {
                            console.log(resolvedFunction.constructor.name)
                            if (resolvedFunction.constructor.name === "GeneratorFunction" || resolvedFunction.constructor.name === "AsyncGeneratorFunction") {
                                try {
                                    let iterator = resolvedFunction.apply(window, functionArguments);
                                    while (true) {
                                        const result = await iterator.next();
                                        if (result.done) {
                                            break;
                                        }
                                        setResponseOf(this, 206, result.value);
                                    }
                                } catch (e) {
                                    const errorMessage = `ElmEffectsProxy: error calling '${functionPath}': ${e}.`;
                                    setResponseOf(this, 500, e);
                                    console.error(errorMessage);
                                    console.error(e);
                                }
                            } else {
                                try {
                                    const result = await resolvedFunction.apply(window, functionArguments);
                                    setResponseOf(this, 200, result);
                                } catch (e) {
                                    const errorMessage = `ElmEffectsProxy: error calling '${functionPath}': ${e}.`;
                                    setResponseOf(this, 500, e);
                                    console.error(errorMessage);
                                    console.error(e);
                                }
                            }
                        } else {
                            const errorMessage = `ElmEffectsProxy: '${functionPath}' does not resolve to a function. It resolves to '${typeOfResolvedFunction}'.`;
                            setResponseOf(this, 404, errorMessage);
                            console.error(errorMessage);
                        }
                    } else {
                        const errorMessage = `ElmEffectsProxy: '${functionPath}' resolves to undefined, null, false or equivalent.`;
                        setResponseOf(this, 404, errorMessage);
                        console.error(errorMessage);
                    }
                } else {
                    originalSend.call(this, body);
                }
            };
        };

    const patch = () => {
        // @ts-ignore
        const exists = XMLHttpRequest.prototype.patchedForElmEffects;
        if (exists) {
            console.warn("Websockets already patched for elm effects.");
            return;
        }

        console.log("Patching websockets for side effects...");

        // Patch open
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = patchedOpen(originalOpen);

        // Patch send
        const originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = patchedSend(originalSend);

        // Patch setRequestHeader
        const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
        XMLHttpRequest.prototype.setRequestHeader = patchedSetRequestHeader(originalSetRequestHeader);

        // Store success.
        // @ts-ignore
        XMLHttpRequest.prototype.patchedForElmEffects = true;
    };

    patch();
})(window);