import puppeteer from "puppeteer";

import createBuild from "../commands/createBuild";
import gitLabSignIn from "../commands/gitLabSignIn";
import jenkinsLogin from "../commands/jenkinsLogin";

const build = async (): Promise<void> => {
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

  // * Log In to Jenkins
  await jenkinsLogin(
    browser,
    process.env.JENKINS_USERNAME,
    process.env.JENKINS_PASSWORD
  );

  // * Create Build
  await createBuild(browser);

  await browser.close();

  console.log("");
  console.log("Deployer 5000 - Completed!");
  console.log("");
};

export default build;
