const originalEmit = process.emit

process.emit = function (name, data, ...args) {
    if (
        name === "warning" &&
        typeof data === "object" &&
        data.name === "ExperimentalWarning" &&
        (data.message.includes("--experimental-loader") ||
            data.message.includes("Custom ESM Loaders is an experimental feature") ||
            data.message.includes("The Node.js specifier resolution flag is experimental"))
    )
        return false

    return originalEmit.apply(process, arguments)
}
