const generateResponse = (data, {statusCode = 200, headers = {}}) => {
  console.log('response ', statusCode);
  const responseHeaders = Object.assign(headers, {
    'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
  });
  return {
    statusCode,
    body: JSON.stringify(data),
    headers: responseHeaders
  }
};

const generateError = error => {
  console.log('error ', error);
  const errorObj = {
    message: error.message || error
  };
  return generateResponse(errorObj, { statusCode: (error || {}).statusCode || 500 });
}

module.exports = {
  generateResponse,
  generateError
}