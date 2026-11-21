export default {
    // Fetch event handler to serve static assets
    async fetch(request, env) {
        if (new URL(request.url).pathname === '/send/message' && request.method === 'POST') {
            try {
                const appsScriptEndpoint = env.APPS_SCRIPT_ENDPOINT;
                const contentType = request.headers.get('Content-Type') || '';
                let formData;

                if (contentType.includes('application/json')) {
                    formData = await request.json();
                } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
                    formData = Object.fromEntries(await request.formData());
                } else {
                    console.error(await request.text());
                    throw new Error('Failed to parse request body: Unsupported Content-Type.');
                }

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

        let response = await env.ASSETS.fetch(request);

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
};