// TASK 8 - Concurrent Academic API Aggregator with async/await
// Run: node task8_async_await.js

class HttpError extends Error { constructor(status) { super(`HTTP error ${status}`); this.name = 'HttpError'; this.status = status; } }
class NetworkError extends Error { constructor(msg) { super(msg); this.name = 'NetworkError'; } }
class InvalidJsonError extends Error { constructor(msg) { super(msg); this.name = 'InvalidJsonError'; } }
class TimeoutError extends Error { constructor(ms) { super(`Request timed out after ${ms}ms`); this.name = 'TimeoutError'; } }

const fakeData = {
  '/users': [
    { id: 1, name: 'Ali', department: 'CS' },
    { id: 2, name: 'Sara', department: 'CS' },
    { id: 3, name: 'Usman', department: 'SE' },
    { id: 4, name: 'Hina', department: 'AI' },
  ],
  '/courses': [{ code: 'FSWD', title: 'Full Stack' }, { code: 'DB', title: 'Databases' }],
  '/results': [
    { studentId: 1, course: 'FSWD', marks: 82 }, { studentId: 1, course: 'DB', marks: 70 },
    { studentId: 2, course: 'FSWD', marks: 91 }, { studentId: 2, course: 'DB', marks: 88 },
    { studentId: 3, course: 'FSWD', marks: 40 }, { studentId: 3, course: 'DB', marks: 45 },
    { studentId: 4, course: 'FSWD', marks: 73 }, { studentId: 4, course: 'DB', marks: 66 },
  ],
};

// URLs: /users /courses /results (200) | /notfound (404) | /server-error (500)
//       /network (network failure) | /badjson (invalid JSON) | /slow (3 seconds)
function fakeFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    if (url === '/network') { reject(new TypeError('Failed to fetch')); return; }

    const delay = url === '/slow' ? 3000 : 100;
    const timer = setTimeout(() => {
      let status = 200;
      let body = JSON.stringify(fakeData[url] ?? {});
      if (url === '/notfound') status = 404;
      if (url === '/server-error') status = 500;
      if (url === '/badjson') body = '{ this is not json';
      resolve({
        ok: status >= 200 && status < 300,
        status,
        json: async () => JSON.parse(body),
      });
    }, delay);

    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('The operation was aborted', 'AbortError'));
      });
    }
  });
}

async function getJSON(url, fetchImplementation) {
  let response;
  try {
    response = await fetchImplementation(url);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new NetworkError(`Network failure: ${error.message}`);
  }
  if (!response.ok) throw new HttpError(response.status);
  try {
    return await response.json();
  } catch (error) {
    throw new InvalidJsonError(`Invalid JSON: ${error.message}`);
  }
}

async function fetchWithTimeout(url, milliseconds) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), milliseconds);
  try {
    return await getJSON(url, (u) => fakeFetch(u, { signal: controller.signal }));
  } catch (error) {
    if (error.name === 'AbortError') throw new TimeoutError(milliseconds);
    throw error;
  } finally {
    clearTimeout(timerId); // always clean the timer
  }
}

async function loadDashboard() {
  // Promise.all starts all 3 requests at the same time
  const [users, courses, results] = await Promise.all([
    getJSON('/users', fakeFetch),
    getJSON('/courses', fakeFetch),
    getJSON('/results', fakeFetch),
  ]);

  const studentStats = users.map((user) => {
    const marks = results.filter((r) => r.studentId === user.id).map((r) => r.marks);
    const average = marks.reduce((sum, m) => sum + m, 0) / marks.length;
    return { ...user, average: Number(average.toFixed(2)) };
  });

  const overall = results.reduce((sum, r) => sum + r.marks, 0) / results.length;
  const best = studentStats.reduce((top, s) => (s.average > top.average ? s : top));

  const departments = {};
  studentStats.forEach((s) => {
    const d = departments[s.department] ?? { students: 0, total: 0 };
    d.students += 1;
    d.total += s.average;
    departments[s.department] = d;
  });
  Object.keys(departments).forEach((k) => {
    departments[k] = { students: departments[k].students, average: Number((departments[k].total / departments[k].students).toFixed(2)) };
  });

  return {
    totalStudents: users.length,
    totalCourses: courses.length,
    overallAverage: Number(overall.toFixed(2)),
    topStudent: { name: best.name, average: best.average },
    failedStudents: studentStats.filter((s) => s.average < 50).length, // failed = average below 50
    departmentStats: departments,
  };
}

async function main() {
  console.time('Dashboard load');
  console.log('Dashboard:', await loadDashboard());
  console.timeEnd('Dashboard load');

  const cases = [
    ['200 success', () => getJSON('/courses', fakeFetch)],
    ['404', () => getJSON('/notfound', fakeFetch)],
    ['500', () => getJSON('/server-error', fakeFetch)],
    ['Network failure', () => getJSON('/network', fakeFetch)],
    ['Invalid JSON', () => getJSON('/badjson', fakeFetch)],
    ['Fast request, 1000ms limit', () => fetchWithTimeout('/users', 1000)],
    ['Slow request, 500ms limit', () => fetchWithTimeout('/slow', 500)],
  ];
  console.log('\nError type tests:');
  for (const [label, run] of cases) {
    try {
      const data = await run();
      console.log(`[${label}] OK ->`, Array.isArray(data) ? `${data.length} items` : data);
    } catch (error) {
      console.log(`[${label}] ${error.name}: ${error.message}`);
    }
  }
}
main();
