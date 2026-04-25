const { loadEnvConfig } = require('@next/env');
const projectDir = 'c:/laragon/www/SIKP';
loadEnvConfig(projectDir);

const fetch = require('node-fetch');
async function test() {
  const res = await fetch('http://localhost:8787/api/teams/my-teams', {
    headers: {
      'Cookie': 'session=TODO_NEED_COOKIE'
    }
  });
  console.log(await res.json());
}
test();