import { ZodError, z } from "zod";

import http from "node:http";

const host = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
    let url: URL;
    const reqUrl = req?.url ?? null;

    if (reqUrl === null) {
        return notFound(res, '/');
    }
    else if (reqUrl[0] === '/') {
        const baseUrl = `http://${host}:${port}`;
        url = new URL(reqUrl, baseUrl);
    }
    else {
        url = new URL(reqUrl);
    }

    // cors
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,HEAD');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.setHeader('Content-Type', 'application/json');

    if (req?.method === 'HEAD' || req?.method === 'OPTIONS') {
        return preflight(req, res, url);
    }

    if (req?.method === 'POST') {
        if (req?.headers["content-type"] !== 'application/json') {
            return badRequest(res, [`Content type '${req.headers['content-type']}' is not supported.`]);
        }
    }

    switch (url.pathname) {
        case '/search':
            return search(req, res, url);
        case 'sign-up':
            return postHandler(req, res, url, signUp);
        case '/pay':
            return postHandler(req, res, url, pay);
        case '/deliver':
            return postHandler(req, res, url, deliver);
    }

    return notFound(res, url.pathname);
});

server.listen(port);

/**
 * Endpoint handlers
 */

type RequestHandler = (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage }, url: URL) => void;
type PostCallback = (data: Record<string, any>, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage }) => void;
type PostHandler = (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage }, url: URL, callback: PostCallback) => void;

const preflight: RequestHandler = (req, res, url) => {
    res.statusCode = 204;
    res.end();
}

const search: RequestHandler = (req, res, url) => {
    if (req?.method !== 'GET') {
        return methodNotAllowed(res, req?.method ?? '???', url.pathname);
    }

    const { searchParams } = url;
    const schema = z.string()
        .trim()
        .regex(/^([a-z0-9]+( |)){2,}$/i, "Query must contain only letters, numbers and spaces.")
        .min(2, "Query must be at least 2 characters long.");

    try {
        schema.parse(searchParams.get('query'));   
    }
    catch (error: any) {
        if (error instanceof ZodError) {
            const flatError = error.flatten();
            const errors = [...flatError.formErrors, ...Object.entries(flatError.fieldErrors)];
            return badRequest(res, errors);
        }
    
        return serverError(res, error?.message);
    }

    return success(res, {
        data: [ "Kennedy", "Alice", "Hank", "Bob", "Miley", "Rose", "Dr. Who", "Gin G", "Soap", "Marilyn" ]
    });
};

const postHandler: PostHandler = (req, res, url, callback) => {
    if (req?.method !== 'POST') {
        return methodNotAllowed(res, req?.method ?? '???', url.pathname);
    }

    if (req?.headers["content-type"] !== 'application/json') {
        return badRequest(res, [`Content type '${req.headers['content-type']}' is not supported.`]);
    }

    let data: string | null = null;

    req.on('readable', function () {
        let part: Buffer;
        while ((part = req.read()) !== null) {
            const str = part.toString('utf8');
            if (data === null) {
                data = str;
            }
            else {
                data += str;
            }
        }
    });

    req.on('end', function () {
        if (data == null) {
            return badRequest(res, ["Request body is empty."]);
        }
        else {
            try {
                return callback(JSON.parse(data), res);
            }
            catch (error: any) {
                if (error instanceof SyntaxError) {
                    return badRequest(res, [ error?.message ?? '' ]);
                }
                return serverError(res, error.message);
            }
        }
    });

    req.on('error', function (error: Error) {
        return serverError(res, error?.message);
    });
}

const signUp: PostCallback = (data, res) => {
    try {
        const schema = z.object({
            email: z.string()
                .trim()
                .email(),
            password: z.string()
                .trim()
                .min(8, "Password must be at least 8 characters long.")
                .regex(/^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/i, "Password must contain at least one letter and one number."),
            confirm: z.string().trim()
        })
            .refine((data) => data.password === data.confirm, {
                message: "Passwords do not match.",
                path: ["confirm"]
            });

        schema.parse(data);
    }
    catch (error: any) {
        if (error instanceof SyntaxError) {
            return badRequest(res, ["Invalid JSON in body."]);
        }

        if (error instanceof ZodError) {
            const flatError = error.flatten();
            const errors = [...flatError.formErrors, ...Object.entries(flatError.fieldErrors)];
            return badRequest(res, errors);
        }

        return serverError(res, error?.message);
    }

    return success(res, {
        data: {
            user_id: Math.round(Math.random() * 10000)
        }
    });
}

const pay: PostCallback = (data, res) => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0);
        tomorrow.setMinutes(0);
        tomorrow.setSeconds(0);
        tomorrow.setMilliseconds(0);
        const schema = z.object({
            name: z.string()
                .trim()
                .regex(/^([a-z]+( |))+$/i, "Name must contain only letters and spaces."),
            number: z.coerce.string()
                .trim()
                .regex(/^([\d]{4}( |)){4}$/, "Card number must be 16 digits long."),
            expiry: z.coerce.date()
                .min(new Date(), "Card must be valid after today."),
            code: z.number()
                .gte(100, "Code must be between 100 and 999.")
                .lte(999, "Code must be between 100 and 999."),
        });

        schema.parse(data);
    }
    catch (error: any) {
        if (error instanceof SyntaxError) {
            return badRequest(res, ["Invalid JSON in body."]);
        }

        if (error instanceof ZodError) {
            const flatError = error.flatten();
            const errors = [...flatError.formErrors, ...Object.entries(flatError.fieldErrors)];
            return badRequest(res, errors);
        }

        return serverError(res, error?.message);
    }

    return success(res, {
        data: {
            payment_id: Math.round(Math.random() * 10000)
        }
    });
}

const deliver: PostCallback = (data, res) => {
    try {
        const schema = z.object({
            name: z.string()
                .trim()
                .regex(/^([a-z]+( |))+$/i, "Name must contain only letters and spaces."),
            address: z.string()
                .trim()
                .regex(/^[a-z0-9\,\.]+$/, "Address must contain only letters, digits, commas and periods."),
            zip: z.coerce.string()
                .trim()
                .regex(/[\d]{,6}/, "Zip code must contain up to 6 digits."),
            city: z.string()
                .trim()
                .regex(/^[a-z \-\'\.]+$/i, "City must contain only letters, dashes, single quotes and periods."),
            country: z.string()
                .trim()
                .regex(/^[a-z \-\']+$/i, "Country must contain only letters, dashes, single quotes and periods."),
        });

        schema.parse(data);
    }
    catch (error: any) {
        if (error instanceof SyntaxError) {
            return badRequest(res, ["Invalid JSON in body."]);
        }

        if (error instanceof ZodError) {
            const flatError = error.flatten();
            const errors = [...flatError.formErrors, ...Object.entries(flatError.fieldErrors)];
            return badRequest(res, errors);
        }

        return serverError(res, error?.message);
    }

    return success(res, {
        data: {
            delivery_id: Math.round(Math.random() * 10000)
        }
    });
}

/**
 * Responses 
 */

function success(res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage }, json: string|Record<string, any>) {
    res.statusCode = 200;
    res.end(typeof json === 'string' ? json : JSON.stringify(json));
}

function badRequest(res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage }, errors: (string | [ string, string[] | undefined ])[]) {
    res.statusCode = 400;
    if (errors.length === 0) {
        serverError(res, "No errors provided for Bad Request error.");
    }
    else {
        res.end(JSON.stringify({
            errors
        }));
    }
}

function notFound(res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage }, route: string) {
    res.statusCode = 404;
    res.end(`{ "errors": [ "Route '${route}' is not found." ] }`);
}

function methodNotAllowed(res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage }, method: string, route: string) {
    res.statusCode = 405;
    res.end(`{ "errors": [ "Method '${method}' is not allowed for route '${route}'." ] }`);
}

function serverError(res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage }, msg: string|null = null) {
    res.statusCode = 500;
    if (msg === null) {
        res.end('{}');
    }
    else {
        res.end(`{ "errors": [ ${msg} ] }`);
    }
}