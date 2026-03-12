const fs = require('fs');
const urls = {
  "Dashboard.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQ4ZTE2ZmUwYjMzMjRjMTJiNzk0NTFhYjViOGJjNzQ4EgsSBxDVgOX0yhQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTM4NzA0NTEyNzMyNTUzMTc0&filename=&opi=89354086",
  "Simulations.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzM0NzI5NWVhN2ZkZTRiZjE5NThlNzU2NDlhYjhiOWQ2EgsSBxDVgOX0yhQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTM4NzA0NTEyNzMyNTUzMTc0&filename=&opi=89354086",
  "Assignments.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzY0ZTc0MTE5OWMzMTQyNWM5ODczMTEzYjAwYTkyNDdlEgsSBxDVgOX0yhQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTM4NzA0NTEyNzMyNTUzMTc0&filename=&opi=89354086",
  "Session.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E4YTFiMDYxYjNkNDQzZjdiMWQ5MzY2OTI0NTIxMzRkEgsSBxDVgOX0yhQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTM4NzA0NTEyNzMyNTUzMTc0&filename=&opi=89354086",
  "Report.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzg0MDlmN2NiOTE3ODRjOGFiYTU3NWI1YTRhM2E4YWJiEgsSBxDVgOX0yhQYAZIBIwoKcHJvamVjdF9pZBIVQhM3MTM4NzA0NTEyNzMyNTUzMTc0&filename=&opi=89354086"
};

fs.mkdirSync('stitch_html', { recursive: true });

async function download() {
  for (const [name, url] of Object.entries(urls)) {
    console.log('Downloading ' + name);
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync('stitch_html/' + name, text);
  }
}
download();
