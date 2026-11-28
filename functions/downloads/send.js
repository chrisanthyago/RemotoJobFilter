/**
 * Handles POST requests to send form data to an Apps Script endpoint and redirect the user to a download URL.
 * @param {EventContext} context - The context object containing the request and environment variables.
 * @returns {Promise<Response>} - A promise that resolves to a Response object containing the result of the operation.
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const appsScriptEndpoint = env.APPS_SCRIPT_ENDPOINT;
    const remotoJobFilterDownloadUrl = env.GITHUB_REMOTOJOB_FILTER_DOWNLOAD_URL;
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
        const fechaHora = formData.FechaHora;
        if (typeof name !== 'string' || name.length < 2 || name.length > 50 || !/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(name)) {
            throw new Error('Failed to validate form data: Name must be a string between 2 and 50 characters, containing only letters and spaces.');
        }
        if (typeof lastName !== 'string' || lastName.length < 2 || lastName.length > 50 || !/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/.test(lastName)) {
            throw new Error('Failed to validate form data: Last Name must be a string between 2 and 50 characters, containing only letters and spaces.');
        }
        if (typeof email !== 'string' || email.length < 5 || email.length > 50 || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
            throw new Error('Failed to validate form data: Email must be a valid email address between 5 and 50 characters.');
        }
        if (typeof fechaHora !== 'string' || fechaHora.length !== 19 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(fechaHora)) {
            throw new Error('Failed to validate form data: FechaHora must be a string in the format YYYY-MM-DDTHH:mm:ss.');
        }

        // Send the parsed form data to the Apps Script endpoint
        const appsScriptResponse = await fetch(`${appsScriptEndpoint}?sheet=Downloads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        if (!appsScriptResponse.ok) {
            throw new Error(`Failed to get a successful response from Apps Script endpoint with: ${appsScriptResponse.status} ${appsScriptResponse.statusText}.`);
        }

        // Validate the Apps Script response
        const appsScriptData = await appsScriptResponse.json();
        const result = appsScriptData?.result;
        console.log(appsScriptData);
        if (result === 'error') {
            throw new Error(`Failed to get a successful result from Apps Script endpoint. \n${appsScriptData.error}`);
        }
        console.log('Successfully sent download log to Apps Script endpoint');

        // Fetch the download file from GitHub
        const gitHubResponse = await fetch(remotoJobFilterDownloadUrl, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'cloudflare-pages-remotojobfilter',
                Accept: 'application/vnd.github+json'
            }
        });
        if (!gitHubResponse.ok || !gitHubResponse.body) {
            throw new Error(`Failed to get a successful response from GitHub download URL with: ${gitHubResponse.status || 502} ${gitHubResponse.statusText}.`);
        }
        console.log('Successfully fetched download file from GitHub');

        // Return the GitHub response as a downloadable file
        return new Response(gitHubResponse.body, {
            status: gitHubResponse.status,
            headers: {
                'Content-Type': gitHubResponse.headers.get('Content-Type') || 'application/octet-stream',
                'Content-Disposition': 'attachment; filename="RemotoJobFilter.zip"',
                'Cache-Control': 'no-store'
            }
        });

    } catch (error) {
        error.message = `Backend: Error sending download log to Apps Script endpoint or fetching download file from GitHub: ${error.message}`;
        console.error(error);

        if (error.message.includes('Failed to validate form data:')) {
            return new Response(error.message, { status: 400 });
        }
        return new Response(error.message, { status: 500 });
    }
}