*** Settings ***
Library           Process
Library           OperatingSystem
Library           JSONLibrary
Library           Collections

*** Variables ***
${COLLECTION}     PostmanCollections/Patient Service.postman_collection.json
${ENVIRONMENT}    PostmanCollections/OncoConnect.postman_environment.json
${REPORT_PATH}    Report/HTML/report.html
${JSON_REPORT_PATH}    Report/JSON/newman_report.json

*** Test Cases ***
Run Postman Collection
    [Documentation]    Runs the Postman collection and generates an HTML report using htmlextra reporter and a JSON report
    Run Newman    ${COLLECTION}    ${ENVIRONMENT}    ${REPORT_PATH}    ${JSON_REPORT_PATH}

*** Keywords ***
Run Newman
    [Arguments]    ${collection}    ${environment}    ${report_path}    ${json_report_path}
    Log    Collection path: ${collection}
    Log    Environment path: ${environment}
    Log    Report path: ${report_path}
    ${result}=    Run Process    newman    run    ${collection}    -e    ${environment}    -r    htmlextra,json    --reporter-htmlextra-export    ${report_path}    --reporter-json-export    ${json_report_path}    shell=True
    Log Many    ${result.stdout}    ${result.stderr}
    Log    Stdout: ${result.stdout}
    Log    Stderr: ${result.stderr}
    Should Be Equal As Strings    ${result.rc}    0
    Log    Newman run completed.
    Log    Find the HTML report and JSON report in the Reports folder.
