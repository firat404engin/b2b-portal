const url = process.argv[2];
const payload = { username: 'test_customer', password: 'kg$E4J_13Gtu' };
const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
(async () => {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
  const txt = await res.text();
  console.log(url, res.status, res.statusText);
  console.log(txt);
})();
