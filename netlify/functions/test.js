export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Function works!',
      hasApiKey: !!process.env.OPENAI_API_KEY,
      method: event.httpMethod
    })
  };
};
