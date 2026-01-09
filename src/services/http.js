export default {
  async get(url) {
    return fetch(url);
  },
  async post(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }
};

