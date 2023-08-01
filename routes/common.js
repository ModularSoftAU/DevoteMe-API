/*
    Ensure that a required field is present and has a non-null value, 
    and to return an error message if this is not the case.

    @param body Passing through the req.body
    @param field The name of the field.
    @param res Passing through res.
*/
export function required(body, field, res) {
    // Prematurely exits an API request if a required field has not been
    // defined or null. If the body is not defined then we error as well.
    // This can happen when no parameters exist.
    if (!body || !(field in body))
        return res.send({
            success: false,
            message: `Body requires field '${field}'`
        });

    if (body[field] === null)
        return res.send({
            success: false,
            message: `Field ${field} cannot be null`
        });

    return body[field];
}


/*
    Check if an optional field is present in the body object, and return its value if it is.

    @param body Passing through the req.body
    @param field The name of the field.
*/
export function optional(body, field) {
    // Jaedan: I am aware that this is pretty much default behaviour, however
    // this takes into consideration times where no body is included. Without
    // this check requests with only optional fields (that are all unused) will
    // cause a null object to be referenced, causing an error.
    if (!body || !(field in body) || body[field] === null)
        return null;

    return body[field];
}

export function removeHtmlEntities(str) {
    return str.replace(/&ldquo;|&rdquo;/g, '');
}

export function generateClientID() {
    let result = '';
    const digits = '0123456789';

    // Generate the first digit (cannot be 0)
    result += digits.charAt(Math.floor(Math.random() * 9) + 1);

    // Generate the remaining 23 digits
    for (let i = 0; i < 23; i++) {
        result += digits.charAt(Math.floor(Math.random() * 10));
    }

    return result;
}