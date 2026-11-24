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
            // console.log(contentType, formData);

            // Validate the form data
            const name = formData.Name;
            const lastName = formData.LastName;
            const email = formData.Email;
            const subject = formData.Subject;
            const message = formData.Message;
            const fechaHora = formData.FechaHora;
            const contact = formData.Contact;
            if (typeof name !== 'string' || name.length < 2 || name.length > 50 || !/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(name)) {
                throw new Error('Error: Name must be a string between 2 and 50 characters, containing only letters and spaces.');
            }
            if (typeof lastName !== 'string' || lastName.length < 2 || lastName.length > 50 || !/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(lastName)) {
                throw new Error('Error: Last Name must be a string between 2 and 50 characters, containing only letters and spaces.');
            }
            if (typeof email !== 'string' || email.length < 5 || email.length > 50 || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
                throw new Error('Error: Email must be a valid email address between 5 and 50 characters.');
            }
            if (typeof subject !== 'string' || subject.length < 5 || subject.length > 100) {
                throw new Error('Error: Subject must be a string between 5 and 100 characters.');
            }
            if (typeof message !== 'string' || message.length < 10 || message.length > 500) {
                throw new Error('Error: Message must be a string between 10 and 500 characters.');
            }
            if (typeof fechaHora !== 'string' || fechaHora.length !== 19 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(fechaHora)) {
                throw new Error('Error: FechaHora must be a string in the format YYYY-MM-DDTHH:mm:ss.');
            }
            if (typeof contact !== 'string' || contact.length < 5 || contact.length > 50 || !/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(contact)) {
                throw new Error('Error: Contact must be a string between 5 and 50 characters, containing only letters and spaces.');
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
            if (error.message.startsWith('Error:')) {
                console.error(error);
                return new Response(error.message, { status: 400 });
            }
            console.error(error);
            error.message = `Error sending message to Apps Script endpoint: ${error.message}`;
            return new Response(error.message, { status: 500 });
        }
    }
}