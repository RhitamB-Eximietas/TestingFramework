$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip({
    trigger: "hover",
  });
});

$(document).ready(function () {
  $('a[href^="#"]').on("click", function (event) {
    var target = $(this.getAttribute("href"));
    if (target.length) {
      event.preventDefault();
      $("html, body").stop().animate(
        {
          scrollTop: target.offset().top,
        },
        1000
      );
    }
  });
});

async function main() {
  await setDynamicFields()
}

$(document).ready(main);

async function setDynamicFields() {
  const jsonHostBaseUrl = "http://localhost:3000";
  const fetchData = async () => {
    const collectionResponse = await fetch(`${jsonHostBaseUrl}/collection`);
    const environmentResponse = await fetch(`${jsonHostBaseUrl}/environment`);
    const runResponse = await fetch(`${jsonHostBaseUrl}/run`);
    const skippedTestsResponse = await fetch(`${jsonHostBaseUrl}/skippedTests`);

    const collectionData = await collectionResponse.json();
    const environmentData = environmentResponse.ok
    ? await environmentResponse.json()
    : [];
    const runData = await runResponse.json();
    const skippedTestsData = skippedTestsResponse.ok
      ? await skippedTestsResponse.json()
      : [];

    return {
      collections: collectionData,
      environment: environmentData,
      run: runData,
      skippedTests: skippedTestsData,
    };
  };

  // function to populate summary page with JSON Data
  async function insertSummaryData() {
    const jsonData = await fetchData();
    const runStats = jsonData.run.stats;
    const collectionInfo = jsonData.collections.info;
    const timings = jsonData.run.timings;
    const executions = jsonData.run.executions;
    const environment = jsonData.environment;
    const runFailures = jsonData.run.failures;
    const skipped = jsonData.skippedTests;

    document.title = collectionInfo.name + " Report";
    document.querySelector("#summary-header").innerHTML =
      collectionInfo.name + " Report";
    document.querySelector("#summary-header").style.fontSize = "35px";
    document.querySelector("#summary-header").style.fontWeight = "400";
    document.querySelector("#summary-header").style.paddingTop = "80px";
    document.querySelector("#summary-header").style.paddingBottom = "20px";
    // Total iterations, assertions, failed tests, skipped tests
    document.querySelector("#totalIterations").innerHTML =
      runStats.iterations.total;
    document.querySelector("#totalAssertions").innerHTML =
      runStats.assertions.total;
    document.querySelector("#totalFailedTests").innerHTML =
      runStats.requests.failed +
      runStats.prerequestScripts.failed +
      runStats.testScripts.failed +
      runStats.assertions.failed;
    document.querySelector("#totalSkippedTests").innerHTML =
      skipped?.length ?? 0;
    document.querySelector("#totalRequestsBadge").innerHTML =
      runStats.items.total;
    document.querySelector("#totalSkippedBadge").innerHTML =
      skipped?.length ?? 0;
    document.querySelector("#totalFailedBadge").innerHTML = runFailures?.length;

    // File information
    document.querySelector("#collectionName").innerHTML = collectionInfo.name;
    document.querySelector("#environmentName").innerHTML =
      environment.name ?? "Global";

    // Timings and data
    document.querySelector("#totalRunDuration").innerHTML = `${(
      (timings.completed - timings.started) /
      1000
    ).toFixed(1)}s`;
    document.querySelector(
      "#averageResponseTime"
    ).innerHTML = `${timings.responseAverage.toFixed(0)}ms`;

    // Summary item table
    document.querySelector("#totalRequests").innerHTML =
      runStats.requests.total;
    document.querySelector("#failedRequests").innerHTML =
      runStats.requests.failed;
    document.querySelector("#totalTestScripts").innerHTML =
      runStats.testScripts.total;
    document.querySelector("#failedTestScripts").innerHTML =
      runStats.testScripts.failed;
    document.querySelector("#totalAssertions2").innerHTML =
      runStats.assertions.total;
    document.querySelector("#failedAssertions").innerHTML =
      runStats.assertions.failed;
    document.querySelector("#totalSkippedTests2").innerHTML =
      skipped?.length ?? 0;
    document.querySelector("#fileInformation").style.paddingTop = "50px";
    document.querySelector("#fileInformation").style.pageBreakBefore = "always";
    document.querySelector("#pills-requests").style.pageBreakBefore = "always";
    document.querySelector("#pills-requests").style.paddingTop = "70px";
    document.querySelector("#pills-failed").style.pageBreakBefore = "always";
    document.querySelector("#pills-skipped").style.pageBreakBefore = "always";
  }
  await insertSummaryData();

  // function to populate requests page with JSON data
  const runIterations = async () => {
    const runResponse = await fetch(`${jsonHostBaseUrl}/run`);
    const runData = await runResponse.json();

    const iterations = runData.executions.map((exec) => exec.cursor.iteration);
    const uniqueIterations = [...new Set(iterations)];

    const iterationList = document.getElementById("iterationList");
    uniqueIterations.forEach((iteration) => {
      const iterationTab = document.createElement("li");
      iterationTab.className = "nav-item";
      iterationTab.innerHTML = `<a class="nav-link custom-tab" href="#" onclick="showIteration(${iteration})">${iteration + 1
        }</a>`;
      iterationList.appendChild(iterationTab);
    });
    document.getElementById(
      "iterationTitle"
    ).textContent = `${uniqueIterations.length} Iteration available to view`;

    if (uniqueIterations.length > 0) {
      await showIteration(uniqueIterations[0]);
    }
  }
  await runIterations();
  async function showIteration(iteration) {
    const collectionResponse = await fetch(`${jsonHostBaseUrl}/collection`);
    const collectionData = await collectionResponse.json();

    document.getElementById("iterationSelected").innerHTML =
      "Iteration " + (iteration + 1) + " selected";
    const executionData = document.getElementById("execution-data");
    executionData.innerHTML = "";

    const items = collectionData.item;
    await processItems(items, iteration);
  }
  async function processItems(
    items,
    iteration = 0,
    parentName = "",
    parentPath = []
  ) {
    const runResponse = await fetch(`${jsonHostBaseUrl}/run`);
    const runData = await runResponse.json();
    const envResponse = await fetch(`${jsonHostBaseUrl}/environment`);
    const envData = envResponse.ok
    ? await envResponse.json()
    : [];
    const executionData = document.getElementById("execution-data");
    const requestIndividual = runData.executions;
    const baseUrl = envData.values.length ? envData.values.find(
      (value) => value.key === "baseUrl"
    ).value : 'http://localhost';
    for (const item of items) {
      const folderId = item.id;
      const folderName = parentName
        ? `${parentName} / ${item.name}`
        : item.name;
      const folderRequests = item.item || [];
      const currentPath = [...parentPath, item.name];

      let folderPassCount = 0;
      let folderFailCount = 0;
      let folderTotalAssertions = 0;
      let requestCount = 0;

      const folderHeader = document.createElement("div");
      folderHeader.className = "alert alert-dark text-uppercase text-center";
      folderHeader.innerHTML = `
<a data-toggle="expand" href="#" data-target="#folder-expand-${folderId}" aria-expanded="true" aria-controls="expand" id="folder-${folderId}" class="expand text-dark z-block">
  <i class="fas fa-info-circle float-left resultsInfoPass"></i>
  ${folderName} - ${folderRequests.length} Requests in the folder
  <i class="float-lg-right fa fa-chevron-down" style="padding-top: 5px"></i>
</a>
`;

      const folderCollapse = document.createElement("div");
      folderCollapse.id = `folder-expand-${folderId}`;
      folderCollapse.className = "expand";
      folderCollapse.setAttribute("aria-labelledby", `folder-${folderId}`);

      for (let i = 0; i < folderRequests.length; i++) {
        const request = folderRequests[i];
        if (request.item) {
          const nestedRequestsCount = await processItems(
            [request],
            iteration,
            folderName,
            currentPath
          );
          requestCount += nestedRequestsCount;
        } else {
          requestCount++;
          const requestId = request.id;
          const requestName = request.name;

          const executions = requestIndividual.filter(
            (exec) =>
              exec.item.id === requestId && exec.cursor.iteration === iteration
          );
          console.log({ executions })
          if (executions.length === 0) continue;

          const execution = executions[0];
          const requestUrl = `${baseUrl}/${execution.item.request.url.path}`;
          const responseCode = execution.response
            ? `${execution.response.code} - ${execution.response.status}`
            : "-";
          const responseTime = execution.response
            ? `${execution.response.responseTime}ms`
            : "0ms";
          const responseSize = execution.response
            ? `${execution.response.responseSize}B`
            : "0B";

          let requestPassCount = 0;
          let requestFailCount = 0;
          let totalAssertions = 0;
          let passPercentage = 100;

          if (execution && execution.assertions) {
            totalAssertions = execution.assertions.length;
            execution.assertions.forEach((assertion) => {
              if (assertion.error) {
                requestFailCount++;
              } else {
                requestPassCount++;
              }
            });
          }

          if (totalAssertions > 0) {
            passPercentage = (requestPassCount / totalAssertions) * 100;
          }

          folderPassCount += requestPassCount;
          folderFailCount += requestFailCount;
          folderTotalAssertions += totalAssertions;

          const requestCard = document.createElement("div");
          requestCard.style.marginBottom = "13px";
          requestCard.className = "card";

          const requestHeader = document.createElement("div");
          requestHeader.className = `card-header ${requestFailCount > 0 ? "bg-danger" : "bg-success"
            }`;
          requestHeader.innerHTML = `
    <a data-toggle="expand" href="#" data-target="#expand-${requestId}" aria-expanded="false" aria-controls="expand" id="requests-${requestId}" class="expanded text-white z-block">
      Iteration: ${iteration + 1} - ${requestName}
      <i class="float-lg-right fa fa-chevron-down" style="padding-top: 5px"></i>
    </a>
  `;

          const requestCollapse = document.createElement("div");
          requestCollapse.id = `expand-${requestId}`;
          requestCollapse.className = "expand";
          requestCollapse.setAttribute(
            "aria-labelledby",
            `requests-${requestId}`
          );

          const requestBody = document.createElement("div");
          requestBody.className = "card-body";
          requestBody.innerHTML = `
    <div class="row">
      <div class="col-sm-6 mb-3">
        <div class="card border-info">
          <div class="card-body" style="height: 255px">
            <h5 class="card-title text-uppercase text-white text-center bg-info">Request Information</h5>
            <span><i class="fas fa-info-circle"></i></span><strong> Request Method:</strong> <span class="badge-outline-success badge badge-success">POST</span><br />
            <span><i class="fas fa-info-circle"></i></span><strong> Request URL:</strong> <a href="${requestUrl}" target="_blank">${requestUrl}</a><br />
          </div>
        </div>
      </div>
      <div class="col-sm-6 mb-3">
        <div class="card border-info">
          <div class="card-body pb-0">
            <h5 class="card-title text-uppercase text-white text-center bg-info">Response Information</h5>
            <span><i class="fas fa-info-circle"></i></span><strong> Response Code:</strong> <span class="float-right badge-outline badge badge-success">${responseCode}</span><br />
            <span><i class="fas fa-stopwatch"></i></span><strong> Mean time per request:</strong> <span class="float-right badge-outline badge badge-success">${responseTime}</span><br />
            <span><i class="fas fa-database"></i></span><strong> Mean size per request:</strong> <span class="float-right badge-outline badge badge-success">${responseSize}</span><br />
          </div>
          <div class="card-body pt-0">
            <hr />
            <h5 class="card-title text-uppercase text-white text-center bg-info">Test Pass Percentage</h5>
            <div class="progress" style="height: 40px">
              <div class="progress-bar ${requestFailCount > 0 ? "bg-danger" : "bg-success"
            }" style="width: 100%" role="progressbar">
                <h5 class="text-uppercase text-white text-center" style="padding-top: 5px"><strong>${passPercentage.toFixed(
              0
            )}%</strong></h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-12 mb-3">
        <div class="card border-info">
          <div class="card-body">
            <h5 class="card-title text-uppercase text-white text-center bg-info">Request Headers</h5>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead class="thead-light text-center">
                  <tr>
                    <th scope="col">Header Name</th>
                    <th scope="col">Header Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${execution?.request?.header
              ?.map(
                (header) => `
                          <tr>
                            <td>${header.key}</td>
                            <td class="requestValues">${header.value}</td>
                          </tr>
                      `
              )
              .join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-12 mb-3">
        <div class="card border-info">
          <div class="card-body">
            <h5 class="card-title text-uppercase text-white text-center bg-info">Response Headers</h5>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead class="thead-light text-center">
                  <tr>
                    <th scope="col">Header Name</th>
                    <th scope="col">Header Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${execution?.response?.header
              ?.map(
                (header) => `
                          <tr>
                            <td>${header.key}</td>
                            <td class="responseValues">${header.value}</td>
                          </tr>
                      `
              )
              .join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-12 mb-3">
        <div class="card border-info">
          <div class="card-body">
            <h5 class="card-title text-uppercase text-white text-center bg-info">Response Body</h5>
            ${execution?.response?.stream &&
              execution?.response?.stream?.data.length > 0
              ? `<pre class="bg-light p-3"><div class="responseBody"><code>${new TextDecoder().decode(
                new Uint8Array(execution?.response?.stream?.data)
              )}</code></div></pre>`
              : `<div class="progress" style="height: 40px">
                    <div class="progress-bar bg-success" style="width: 100%" role="progressbar">
                      <h5 class="text-uppercase text-white text-center" style="padding-top: 5px"><strong>No response body for this request</strong></h5>
                    </div>
                  </div>`
            }
          </div>
        </div>
      </div>
      <div class="col-sm-12 mb-3">
        <div class="card border-info">
          <div class="card-body">
            <h5 class="card-title text-uppercase text-white text-center bg-info">Test Information</h5>
            ${execution?.assertions?.length
              ? `<div class="table-responsive">
                    <table class="table table-bordered">
                      <thead class="thead-light text-center">
                        <tr>
                          <th scope="col">Name</th>
                          <th scope="col">Passed</th>
                          <th scope="col">Failed</th>
                          <th scope="col">Skipped</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${execution.assertions
                ? execution.assertions
                  .map(
                    (assertion) => `
                                    <tr>
                                      <td>${assertion.assertion}</td>
                                      <td class="${assertion.error
                        ? "text-danger text-center"
                        : "text-success text-center"
                      }">${assertion.error ? "0" : "1"}</td>
                                      <td class="${assertion.error
                        ? "text-danger text-center"
                        : "text-success text-center"
                      }">${assertion.error ? "1" : "0"}</td>
                                      <td class="${assertion.skipped
                        ? "text-danger text-center"
                        : "text-success text-center"
                      }">${assertion.skipped ? "1" : "0"}</td>
                                    </tr>
                                  `
                  )
                  .join("")
                : `
                                <tr>
                                  <td colspan="2">No assertions found</td>
                                </tr>
                              `
              }
                      </tbody>
                    </table>
                  </div>`
              : `<div class="progress" style="height: 40px">
                    <div class="progress-bar bg-success" style="width: 100%" role="progressbar">
                      <h5 class="text-uppercase text-white text-center" style="padding-top: 5px"><strong>No Test for this request</strong></h5>
                    </div>
                  </div>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
          requestCollapse.appendChild(requestBody);
          requestCard.appendChild(requestHeader);
          requestCard.appendChild(requestCollapse);
          folderCollapse.appendChild(requestCard);
        }
      }

      if (folderTotalAssertions > 0) {
        const folderPassPercentage =
          (folderPassCount / folderTotalAssertions) * 100;
        if (folderFailCount > 0) {
          folderHeader
            .querySelector("i.resultsInfoPass")
            .classList.add("text-danger");
        } else {
          folderHeader
            .querySelector("i.resultsInfoPass")
            .classList.add("text-success");
        }
        // folderHeader.innerHTML += `
        //   <span class="badge ${folderFailCount > 0 ? 'badge-danger' : 'badge-success'} float-lg-right mr-10">${folderPassPercentage.toFixed(0)}% Passed</span>
        // `;
      }

      executionData.appendChild(folderHeader);
      executionData.appendChild(folderCollapse);

      return requestCount;
    }
  }

  // function to populate failed page with JSON data
  function generateFailureHTML(failure, index) {
    return `
        <div class="col-sm-12 mb-3">
          <div class="card-deck">
            <div class="card border-danger">
              <div class="card-header bg-danger">
                <a
                  data-toggle="expand"
                  href="#"
                  data-target="#fails-expand"
                  aria-expanded="false"
                  aria-controls="expand"
                  id="fails-dd024aa1-91b0-4f6f-99c8-8902942f9a97"
                  class="expanded text-white z-block"
                >
                Iteration ${failure.cursor.iteration + 1
      } - ${failure.error.name} - ${failure.parent.name} - ${failure.source.name}
                <i
                  class="float-lg-right fa fa-chevron-down"
                  style="padding-top: 5px"
                ></i>
                </a>
              </div>
              <div
                id="fails-expand-dd024aa1-91b0-4f6f-99c8-8902942f9a97"
                class="expand"
                aria-labelledby="fails-dd024aa1-91b0-4f6f-99c8-8902942f9a97"
              >
                <div class="card-body">
                  <h5><strong>Failed Test: </strong>${failure.source.name}</h5>
                  <hr />
                  <h5
                    class="card-title text-uppercase text-white text-center bg-danger"
                  >
                    ASSERTION ERROR MESSAGE
                  </h5>
                  <div>
                    <pre><div class="failureBody"><code >${failure.error.message}</code></pre>
                  </div>
                </div>
            </div>
        </div>
    `;
  }
  async function renderFailures() {
    const runResponse = await fetch(`${jsonHostBaseUrl}/run`);
    const runData = await runResponse.json();
    const failures = runData.failures;
    if (failures.length > 0) {
      const failuresContainer = document.getElementById("failures");
      failuresContainer.style.marginTop = "40px";
      failuresContainer.innerHTML += `
        <div class="alert alert-danger text-uppercase text-center">
          <h4>Showing ${failures.length} Failures</h4>
        </div>`;
      failures.forEach((failure, index) => {
        failuresContainer.innerHTML += generateFailureHTML(failure, index);
      });
    } else {
      const noFailures = document.getElementById("failures");
      noFailures.innerHTML = `
          <div class="alert alert-success text-uppercase text-center">
            <br /><br />
              <h1 class="text-center">
                There are no failed tests
                <span><i class="far fa-thumbs-up"></i></span>
              </h1>
            <br /><br />
          </div>`;
    }
  }
  await renderFailures();

  // function to populate skipped page with JSON data
  function generateSkippedTestHTML(test, index) {
    return `
        <div class="col-sm-12 mb-3">
            <div class="card-deck">
                <div class="card border-warning">
                    <div class="card-header bg-warning text-white">
                        <a data-toggle="expand" href="#" data-target="#skipped-expand-${test.cursor.ref
      }" aria-expanded="false" aria-controls="expand" id="skipped-${test.cursor.ref}" class="expanded text-white z-block">
                            Iteration ${test.cursor.iteration + 1
      } - Skipped Test <i class="float-lg-right fa fa-chevron-down" style="padding-top:5px;"></i>
                        </a>
                    </div>
                    <div id="skipped-expand-${test.cursor.ref
      }" class="expand" aria-labelledby="skipped-${test.cursor.ref}">
                        <div class="card-body">
                            <h5><strong>Request Name:</strong> ${test.item.name
      }</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
  }

  async function renderSkippedTests() {
    const skippedTestsResponse = await fetch(`${jsonHostBaseUrl}/skippedTests`);
    const skippedTests = skippedTestsResponse.ok
      ? await skippedTestsResponse.json()
      : [];
    if (skippedTests.length > 0) {
      const skippedTestsContainer = document.getElementById("skipped-tests");
      skippedTestsContainer.style.marginTop = "100px";
      skippedTestsContainer.innerHTML = `
        <div class="alert alert-warning text-uppercase text-center">
          <h4>Showing ${skippedTests.length} Skipped Tests</h4>
        </div>
      `;
      skippedTests.forEach((test, index) => {
        skippedTestsContainer.innerHTML += generateSkippedTestHTML(test, index);
      });
    } else {
      const skippedTestsContainer = document.getElementById("skipped-tests");
      skippedTestsContainer.style.marginTop = "180px";
      skippedTestsContainer.innerHTML += `
          <div class="alert alert-success text-uppercase text-center">
            <br /><br />
              <h1 class="text-center">
                There are no skipped tests
                <span><i class="far fa-thumbs-up"></i></span>
              </h1>
              <br /><br />
            </div>
        `;
    }
  }

  await renderSkippedTests();
}

document.getElementById('DownloadPdf').addEventListener('click', () => {
  document.querySelector("#fileInformation").style.paddingTop = "none";
  document.querySelector("#pills-requests").style.paddingTop = "none";
  document.querySelector("#failures").style.marginTop = "none";
  document.querySelector("#skipped-tests").style.marginTop = "none";
  document.querySelector("#DownloadPdf").style.display = "none";

  window.scrollTo({
    top: 50,
    left: 50,
  });

  window.print();
  document.querySelector("#DownloadPdf").style.display = "flex";
});
