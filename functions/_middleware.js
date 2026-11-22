// This middleware handles GET and POST requests.

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

/**
 * Handles POST requests to the /messages/send endpoint, forwarding them to an Apps Script endpoint.
 * @param {EventContext} context - The context object containing the request and environment variables.
 * @returns {Promise<Response>} - The response to be sent back to the client.
 */
export async function onRequestPost(context) {
    const { request, env } = context;

    // Handle the POST request to the /messages/send endpoint
    if (new URL(request.url).pathname === '/messages/send') {
        try {
            const appsScriptEndpoint = env.APPS_SCRIPT_ENDPOINT;
            const contentType = request.headers.get('Content-Type') || '';
            let formData;

            // Parse the request body based on the Content-Type header
            if (contentType.includes('application/json')) {
                formData = await request.json();
            } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
                formData = Object.fromEntries(await request.formData());
            } else {
                console.error(await request.text());
                throw new Error('Failed to parse request body: Unsupported Content-Type.');
            }

            // Send the parsed form data to the Apps Script endpoint
            const appsScriptResponse = await fetch(appsScriptEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (!appsScriptResponse.ok) {
                throw new Error(`Failed to get a successful response from endpoint with: ${appsScriptResponse.status} ${appsScriptResponse.statusText}.`);
            }

            // Send the Apps Script response back to the client
            const appsScriptData = await appsScriptResponse.json();
            const result = appsScriptData?.result;
            if (!result || result === 'error') {
                console.error(appsScriptData);
                throw new Error(`Failed to get a successful result from endpoint. \n${appsScriptData.error}`);
            }
            console.log('Successfully sent message to Apps Script endpoint');

            return new Response(result, { status: appsScriptResponse.status });

        } catch (error) {
            error.message = `Error sending message to Apps Script endpoint: ${error.message}`;
            console.error(error);
            return new Response(error.message, { status: 500 });
        }
    }
}