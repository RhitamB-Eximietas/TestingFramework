# Testing Framework

This repository contains a framework for setting up a testing environment using Newman, Robot Framework, and Python. The framework allows you to export Postman collections, push files to Git, write Robot Framework scripts, generate reports, and publish them.

## Pre-requisites

Ensure that your CI/CD pipeline has the following pre-installed:
- Newman (a CLI runner for Postman)
- Robot Framework
- Robot Framework JSON Library
- Python
- Node.js
- Puppeteer

## Setup and Usage

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
5. Merge with the main branch if necessary:
   ```sh
   git merge main
   ```

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

1. Write the paths of the collection and environment, separating them using a comma:
   ```
   PostmanCollections/Collection/your_collection.json,PostmanCollections/Environment/your_environment.json
   ```

### 5. Execute main.py

1. Use the following command to execute the program:
   ```sh
   py main.py
   ```

## Improvements and Best Practices

### Detailed Commit Messages

Use descriptive commit messages to clearly communicate the changes made. For example:
```sh
git commit -m "feat: add initial setup for Postman collections and environments"
```

### Automated Script Execution

Automate the execution of `main.py` within your CI/CD pipeline to ensure seamless integration and continuous testing.

### Error Handling

Incorporate error handling in `main.py` to manage potential issues during execution. This includes try-except blocks to catch and handle exceptions gracefully.

### Documentation

Maintain a detailed README file in your repository to provide context and instructions for new users. Include sections such as setup instructions, usage guidelines, and troubleshooting tips.

### Version Control

Use version control for your Postman collections and environments to track changes over time. This allows you to revert to previous versions if needed and maintain a history of modifications.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.