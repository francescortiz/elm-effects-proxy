type ElmEffectsTask = {
    functionPath: string,
    functionArguments: any[],
}

declare interface XMLHttpRequest {
    isElmEffectsTask: boolean;
    patchedForElmEffects: boolean;
    elmEffectsTask: ElmEffectsTask;
}

(function (window: Window): void {
    const EFFECTS_TASK_URL = "https://elm-effects-task.flexidao.com/";
    const EFFECTS_TASK_URL_LENGTH = EFFECTS_TASK_URL.length;

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
                if (url.startsWith(EFFECTS_TASK_URL)) {
                    const functionPath = url.substring(EFFECTS_TASK_URL_LENGTH);
                    this.isElmEffectsTask = true;
                    this.elmEffectsTask = {
                        functionPath: functionPath,
                        functionArguments: [],
                    }
                } else {
                    // This is important, since XMLHttpRequest might be reused.
                    this.isElmEffectsTask = false;
                    originalOpen.apply(this, arguments);
                }
            };
        };

    const patchedSetRequestHeader =
        function (originalSetRequestHeader: Function) {
            return function (this: XMLHttpRequest, name: string, value: string): void {
                if (this.isElmEffectsTask) {
                    // pass
                } else {
                    originalSetRequestHeader.apply(this, arguments);
                }
            };
        };

    const patchedSend =
        function (originalSend: Function) {
            return function (this: XMLHttpRequest, body?: Document | BodyInit | null): void {
                if (this.isElmEffectsTask) {
                    const functionPath = this.elmEffectsTask.functionPath;
                    var functionArguments = [];
                    if (typeof body === "string") {
                        functionArguments = body
                            ? JSON.parse(body)
                            : [];
                    }

                    if (!Array.isArray(functionArguments)) {
                        const errorMessage = `ElmEffectsTask: expected array of arguments. Got '${functionArguments}'.`;
                        setResponseOf(this, 404, errorMessage);
                        console.error(errorMessage);
                    }

                    var resolvedFunction: any | undefined;
                    try {
                        resolvedFunction = resolve(window, functionPath);
                    } catch (e) {
                        const errorMessage = `ElmEffectsTask: failed to resolve path '${functionPath}'.`;
                        setResponseOf(this, 404, errorMessage);
                        console.error(errorMessage);
                        console.error(e);
                    }

                    if (resolvedFunction) {
                        const typeOfResolvedFunction: string = typeof resolvedFunction;

                        if (typeOfResolvedFunction === "function") {
                            const result = resolvedFunction.apply(window, functionArguments);
                            setResponseOf(this, 200, result);
                        } else {
                            const errorMessage = `ElmEffectsTask: '${functionPath}' does not resolve to a function. It resolves to '${typeOfResolvedFunction}'.`;
                            setResponseOf(this, 404, errorMessage);
                            console.error(errorMessage);
                        }
                    } else {
                        const errorMessage = `ElmEffectsTask: '${functionPath}' resolves to undefined, null, false or equivalent.`;
                        setResponseOf(this, 404, errorMessage);
                        console.error(errorMessage);
                    }
                } else {
                    originalSend.apply(this, arguments);
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