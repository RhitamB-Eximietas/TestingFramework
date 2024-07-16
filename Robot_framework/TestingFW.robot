*** Settings ***
Library           Process
Library           OperatingSystem
Library           JSONLibrary
Library           Collections

*** Variables ***
${COLLECTION}     PostmanCollections/Example.postman_collection.json
# ${ENVIRONMENT}    PostmanCollections/Example.postman_environment.json
${JSON_REPORT_PATH}    Report/JSON/newman_report.json

*** Test Cases ***
Run Postman Collection
    [Documentation]    Runs the Postman collection and generates an HTML report using htmlextra reporter and a JSON report
    Run Newman    ${COLLECTION}    ${JSON_REPORT_PATH}

*** Keywords ***
Run Newman
    [Arguments]    ${collection}    ${json_report_path}
    Log    Collection path: ${collection}
    # Log    Environment path: ${environment}
    ${result}=    Run Process    newman    run    ${collection}    -r    json    --reporter-json-export    ${json_report_path}    shell=True
    Log Many    ${result.stdout}    ${result.stderr}
    Log    Stdout: ${result.stdout}
    Log    Stderr: ${result.stderr}
    Should Be Equal As Strings    ${result.rc}    0
    Log    Newman run completed.
    Log    Find the JSON report in the Reports folder.
