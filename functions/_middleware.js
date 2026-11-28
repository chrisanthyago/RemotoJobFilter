/**
 * Handles GET requests, setting the Content-Security-Policy header for HTML responses.
 * @param {EventContext} context - The context object containing the request and environment variables.
 * @returns {Promise<Response>} - The response to be sent back to the client.
 */
export async function onRequestGet(context) {
    // Call the next middleware or route handler to get the response
    let response = await context.next();

    // If the response is HTML, set the Content-Security-Policy header
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
        try {
            // Set the Content-Security-Policy header
            const cspValue = [
                "default-src 'self'",
                "style-src 'self' https://www.w3schools.com https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "script-src 'self'"
            ].join('; ');
            response = new Response(response.body, response);
            response.headers.set('Content-Security-Policy', cspValue);

        } catch (error) {
            error.message = `Error setting Content-Security-Policy header: ${error.message}`;
            console.error(error);
        }
    }

    return response;
}