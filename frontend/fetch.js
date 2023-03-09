async function commonFetchApi(fetchParams) {
  try {
    let response = await fetch(fetchParams.url, {
      method: fetchParams.method,
      headers: fetchParams.headers,
      body: fetchParams.body,
    });
    const responseText = await response.text();
    const isJson = checkIfJson(responseText);
    if (isJson) {
      response = JSON.parse(responseText);
    } else {
      response = responseText;
    }
    return response;
  } catch (error) {
    throw error;
  }
}

function checkIfJson(string) {
  if (typeof string !== "string") return false;
  try {
    const result = JSON.parse(string);
    if (typeof result === "object" && result !== null) {
      return true;
    }
  } catch (error) {
    return false;
  }
}
