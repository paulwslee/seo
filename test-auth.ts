async function test() {
  const res = await fetch("https://seo.appfactorys.com/api/auth/providers");
  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("BODY:", text);
}
test().catch(console.error);
