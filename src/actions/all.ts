import formatDistance from "date-fns/formatDistance";
import puppeteer from "puppeteer";

import askBranchName from "../commands/askBranchName";
import askDeployEnvironments from "../commands/askDeployEnvironments";
import askMergeRequestInputs from "../commands/askMergeRequestInputs";
import checkIfBranchExists from "../commands/checkIfBranchExists";
import createBuild from "../commands/createBuild";
import createMergeRequest from "../commands/createMergeRequest";
import createUIBuild from "../commands/createUIBuild";
import deploy from "../commands/deploy";
import gitLabSignIn from "../commands/gitLabSignIn";
import jenkinsLogin from "../commands/jenkinsLogin";
import mergeMergeRequest from "../commands/mergeMergeRequest";
import mergeUIBuild from "../commands/mergeUIBuild";

import { Environment, MergeRequestInputs } from "../types";

const all = async (): Promise<void> => {
  try {
    console.log("");
    console.log("-------------");
    console.log("DEPLOYER 5000");
    console.log("-------------");
    console.log("");

    const processStartTime = new Date();

    // * Establish GL Credentials
    if (!process.env.GITLAB_USERNAME || !process.env.GITLAB_PASSWORD) {
      console.error("No GitLab Credentials set up!");
      process.exit(1);
    }

    // * Establish Jenkins Credentials
    if (!process.env.JENKINS_USERNAME || !process.env.JENKINS_PASSWORD) {
      console.error("No Jenkins Credentials set up!");
      process.exit(1);
    }

    // * Create browser instance
    const browser = await puppeteer.launch({ headless: true });

    // * Sign into GitLab
    await gitLabSignIn(
      browser,
      process.env.GITLAB_USERNAME,
      process.env.GITLAB_PASSWORD
    );

    // * Get branch name
    const branchName = await askBranchName();

    // * Ask Environments to Deploy to
    const deployEnvironments = await askDeployEnvironments();

    // * Check if branch exists
    await checkIfBranchExists(browser, branchName);

    // * Get merge request inputs
    const mergeRequestInputs: MergeRequestInputs = await askMergeRequestInputs(
      branchName
    );

    // * Create Merge Request
    const mergeRequestNumber = await createMergeRequest(
      browser,
      branchName,
      mergeRequestInputs
    );

    // * Merge Merge Request
    await mergeMergeRequest(browser, mergeRequestNumber);

    // * Log In to Jenkins
    await jenkinsLogin(
      browser,
      process.env.JENKINS_USERNAME,
      process.env.JENKINS_PASSWORD
    );

    // * Create Standalone UI Build
    await createUIBuild(browser, "standalone");

    // * Merge Standalone UI Build
    await mergeUIBuild(browser, "standalone");

    // * Create Consumed UI Build
    await createUIBuild(browser, "consumed");

    // * Merge Consumed UI Build
    await mergeUIBuild(browser, "consumed");

    // * Create Build
    await createBuild(browser);

    // * Deploy Build to Environments
    // TODO - How to handle more than 2 at a time
    // ? Currently handling with 30 min timeout
    console.log(
      `Deploying ${process.env.PROJECT_NAME} to ${deployEnvironments
        .map((deployEnvironment) => deployEnvironment.name)
        .join(", ")}`
    );
    await Promise.all(
      deployEnvironments.map((deployEnvironment: Environment) =>
        deploy(browser, deployEnvironment)
      )
    );

    await browser.close();

    console.log("");
    console.log("Deployer 5000 - Completed!");
    console.log("");

    const processEndTime = new Date();

    const processDuration = formatDistance(processStartTime, processEndTime);

    console.log(`Process Duration - ${processDuration}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default all;
