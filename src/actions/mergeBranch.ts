import formatDistance from "date-fns/formatDistance";
import puppeteer from "puppeteer";

import askBranchName from "../commands/askBranchName";
import askMergeRequestInputs from "../commands/askMergeRequestInputs";
import checkIfBranchExists from "../commands/checkIfBranchExists";
import createMergeRequest from "../commands/createMergeRequest";
import gitLabSignIn from "../commands/gitLabSignIn";
import mergeMergeRequest from "../commands/mergeMergeRequest";

import { MergeRequestInputs } from "../types";

const mergeBranch = async (): Promise<void> => {
  const processStartTime = new Date();

  // * Establish GL Credentials
  if (!process.env.GITLAB_USERNAME || !process.env.GITLAB_PASSWORD) {
    console.error("No GitLab Credentials set up!");
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

  await browser.close();

  console.log("");
  console.log("Deployer 5000 - Completed!");
  console.log("");

  const processEndTime = new Date();

  const processDuration = formatDistance(processStartTime, processEndTime);

  console.log(`Process Duration - ${processDuration}`);
};

export default mergeBranch;
