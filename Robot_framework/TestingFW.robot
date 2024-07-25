*** Settings ***
Library           Process
Library           OperatingSystem
Library           JSONLibrary
Library           Collections

*** Variables ***
${COLLECTION}    
${ENVIRONMENT}    
${JSON_REPORT_PATH}    Report/JSON/Host/newman_report.json

*** Test Cases ***
Run Postman Collection
    [Documentation]    Runs the Postman collection and generates an HTML report using htmlextra reporter and a JSON report
    IF  '${ENVIRONMENT}'
        Run Newman with environment    ${COLLECTION}    ${ENVIRONMENT}    ${JSON_REPORT_PATH}
    ELSE
        Run Newman without environment    ${COLLECTION}    ${JSON_REPORT_PATH}
    END

*** Keywords ***
Run Newman with environment
    [Arguments]    ${collection}    ${environment}    ${json_report_path}
    Log    Collection path: '${collection}'
    Log    Environment path: '${environment}'
    ${result}=    Run Process    newman    run    ${collection}    -e    ${environment}    -r    json    --reporter-json-export    ${json_report_path}    shell=True
    Log Many    ${result.stdout}    ${result.stderr}
    Log    Stdout: ${result.stdout}
    Log    Stderr: ${result.stderr}
    Should Be Equal As Strings    ${result.rc}    0
    Log    Newman run completed.
    Log    Find the JSON report in the Reports folder.

Run Newman without environment
    [Arguments]    ${collection}    ${json_report_path}
    Log    Collection path: ${collection}
    Log    Environment path: ${environment}
    ${result}=    Run Process    newman    run    ${collection}    -r    json    --reporter-json-export    ${json_report_path}    shell=True
    Log Many    ${result.stdout}    ${result.stderr}
    Log    Stdout: ${result.stdout}
    Log    Stderr: ${result.stderr}
    Should Be Equal As Strings    ${result.rc}    0
    Log    Newman run completed.
    Log    Find the JSON report in the Reports folder.