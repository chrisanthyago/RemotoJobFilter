/**
 * Handles POST requests to send form data to an Apps Script endpoint.
 * @param {EventContext} context - The context object containing the request and environment variables.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the result of the operation.
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const appsScriptEndpoint = env.APPS_SCRIPT_ENDPOINT;
    const contentType = request.headers.get('Content-Type') || '';
    let formData;

    try {
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
            throw new Error('Failed to validate form data: Name must be a string between 2 and 50 characters, containing only letters and spaces.');
        }
        if (typeof lastName !== 'string' || lastName.length < 2 || lastName.length > 50 || !/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(lastName)) {
            throw new Error('Failed to validate form data: Last Name must be a string between 2 and 50 characters, containing only letters and spaces.');
        }
        if (typeof email !== 'string' || email.length < 5 || email.length > 50 || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
            throw new Error('Failed to validate form data: Email must be a valid email address between 5 and 50 characters.');
        }
        if (typeof subject !== 'string' || subject.length < 5 || subject.length > 100) {
            throw new Error('Failed to validate form data: Subject must be a string between 5 and 100 characters.');
        }
        if (typeof message !== 'string' || message.length < 10 || message.length > 500) {
            throw new Error('Failed to validate form data: Message must be a string between 10 and 500 characters.');
        }
        if (typeof fechaHora !== 'string' || fechaHora.length !== 19 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(fechaHora)) {
            throw new Error('Failed to validate form data: FechaHora must be a string in the format YYYY-MM-DDTHH:mm:ss.');
        }
        if (typeof contact !== 'string' || contact.length < 5 || contact.length > 50 || !/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(contact)) {
            throw new Error('Failed to validate form data: Contact must be a string between 5 and 50 characters, containing only letters and spaces.');
        }

        // Send the parsed form data to the Apps Script endpoint
        const appsScriptResponse = await fetch(`${appsScriptEndpoint}?sheet=Messages`, {
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
        console.log(appsScriptData);
        if (result === 'error') {
            throw new Error(`Failed to get a successful result from endpoint. \n${appsScriptData.error}`);
        }
        console.log('Successfully sent message to Apps Script endpoint');

        return new Response(result, { status: appsScriptResponse.status });

    } catch (error) {
        error.message = `Backend: Error sending message to Apps Script endpoint: ${error.message}`;
        console.error(error);

        if (error.message.includes('Failed to validate form data:')) {
            return new Response(error.message, { status: 400 });
        }
        return new Response(error.message, { status: 500 });
    }
}