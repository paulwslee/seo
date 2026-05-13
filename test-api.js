async function run() {
  const res = await fetch("http://localhost:3000/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://hiddentapes.net", ignoreRobots: false, includePerformance: false })
  });
  const data = await res.json();
  console.log(data.results.technicalSeo);
}
run();
