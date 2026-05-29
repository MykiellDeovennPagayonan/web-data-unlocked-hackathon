fetch('http://api:8090/admin/dashboard').then(async (r) => {
  const t = await r.text();
  console.log(r.status);
  console.log(t.slice(0, 200));
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
