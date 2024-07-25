# Testing Framework

This guide provides a comprehensive framework for setting up a testing environment using Newman, Robot Framework, and Python. Follow the steps below to export Postman collections, push files to Git, write Robot Framework scripts, generate reports, and publish them.

## Pre-requisites

Ensure that the CI/CD pipeline has the following pre-installed:
- Newman (a CLI runner for Postman)
- Robot Framework
- Robot Framework JSON Library
- Python
- Node.js
- Puppeteer

## Steps

### 1. Export Postman Collection and Environment

1. Open Postman.
2. Select the desired collection.
3. Click on the "..." icon.
4. Choose "Export".
5. Select the "Collection v2" format.
6. Repeat the process for the environment.

### 2. Push Files to Git and Merge with Main

1. Navigate to your local Git repository.
2. Add the exported files:
   ```sh
   git add .
   ```
3. Commit the changes:
   ```sh
   git commit -m "feat: export Postman collections and environments"
   ```
4. Push to the Git repository:
   ```sh
   git push origin main/<branch>
   ```
5. Merge with the main branch if necessary.

### 3. Save the Collection and Environment

1. Save the Postman collection in the path:
   ```
   PostmanCollections/Collection/
   ```
2. Save the environment in the path:
   ```
   PostmanCollections/Environment/
   ```

### 4. Write the Path Names in collection.csv

1. Write the paths of the collection and environment, separating them using a comma.

### 5. Execute main.py

1. Use the following command to execute the program:
   ```sh
   py main.py
   ```

By following these steps, you can effectively set up and utilize a testing framework using Newman, Robot Framework, and Python, along with Puppeteer to generate the PDF report.

### Improvements

1. **Detailed Commit Messages**: Use more descriptive commit messages to clearly communicate the changes made.
2. **Automated Script Execution**: Automate the execution of `main.py` within your CI/CD pipeline for seamless integration.
3. **Error Handling**: Incorporate error handling in `main.py` to manage potential issues during execution.
4. **Documentation**: Maintain a detailed README file in your repository to provide context and instructions for new users.
5. **Version Control**: Use version control for your Postman collections and environments to track changes over time.

By incorporating these improvements, you can enhance the robustness and maintainability of your testing framework.