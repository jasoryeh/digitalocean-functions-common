const { errToObj } = require("./util");

function getRequestMethod(args) {
    return args["__ow_method"] || null;
}

function getRequestHeaders(args) {
    return args["__ow_headers"] || {};
}

function getRequestPath(args) {
    let path = args["__ow_path"] || "/";
    return path == "" ? "/" : path;
}

function getRequestAuthorization(args) {
    let headers = getRequestHeaders(args);
    let authorization = headers['authorization'];
    console.log("Authorization: " + authorization);
    return authorization || null;
}

function getRequestSource(args) {
    let headers = getRequestHeaders(args);
    return headers['x-forwarded-for'] || headers['cf-connecting-ip'];
}

function ofBearerToken(bearerToken) {
    return bearerToken.replace("Bearer ", "");
}

function responseMaker(data = null, code = 200, error = false, notifyMessage = null, ifNull404 = true) {
    let response = {
        error: error ? error : false,
        message: notifyMessage ? notifyMessage : null,
        data: data,
        timestamp: new Date()
    };
    return {
        body: response,
        statusCode: (ifNull404 && data == null) ? 404 : code
    };
}

function methodRouter(methodRoutes) {
    return async function(args) {
        //console.log(args);
        let originalMethod = getRequestMethod(args);
        //console.log("Method: " + method);
        var method = originalMethod || "GET";
        method = method.toUpperCase();
        //console.log(method);
        console.log(`Method: ${originalMethod} | Final: ${method}`)

        let findRoute = methodRoutes[method];
        if (!findRoute || findRoute == null) {
            console.log("Method doesn't exist: " + procdPath);
            console.log(methodRoutes);
            return responseMaker(args, 400, null, `Request method unsupported: ${method}`, `The ${method} request method is not supported on this route!`);
        }
        //console.log("Running...");
        let exec = null;
        try {
            exec = await findRoute(args);
        } catch(ex) {
            console.log("Error!");
            console.log(ex);
            exec = responseMaker([errToObj(ex), args], 500, true, "An error occurred in the path router!");
        }
        //console.log("Exec result:");
        //console.log(exec);
        return exec;
    }
}

function pathRouter(pathRoutes) {
    return async function(args) {
        //console.log(args);
        let path = getRequestPath(args);
        //console.log("Path: " + path);
        let pathArr = path.split('/').filter(i => i);
        let currPath = pathArr.length <= 0 ? "" : pathArr[0];
        let procdPath = `/${currPath}`;
        //console.log("Processing path: " + procdPath);
        var findRoute = pathRoutes[procdPath];

        args['__ow_path'] = "/" + (pathArr.length > 0 ? pathArr.splice(1).join("/") : "");
        //console.log("Updated path: " + args['__ow_path']);
        console.log(`Path: ${path} | Processing: ${procdPath} | Forwarded: ${args['__ow_path']}`);

        if (!findRoute || findRoute == null) {
            console.log("Path doesn't exist: " + procdPath);
            //console.log(pathRoutes);
            return responseMaker(args, 404, true, `Request path doesn't exist: ${path}`, `The ${path} doesn't exist on this route!`)
        }
        //console.log("Running...");
        let exec = null;
        try {
            exec = await findRoute(args);
        } catch(ex) {
            console.log("Error!");
            console.log(ex);
            exec = responseMaker([errToObj(ex), args], 500, true, "An error occurred in the path router!");
        }
        //console.log("Exec result:");
        //console.log(exec);
        return exec;
    }
}

module.exports = {methodRouter, pathRouter, responseMaker, getRequestHeaders, getRequestMethod, getRequestPath, getRequestAuthorization, ofBearerToken, getRequestSource};