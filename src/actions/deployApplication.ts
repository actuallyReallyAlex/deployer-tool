import formatDistance from "date-fns/formatDistance";
import puppeteer from "puppeteer";

import askDeployEnvironments from "../commands/askDeployEnvironments";
import deploy from "../commands/deploy";
import gitLabSignIn from "../commands/gitLabSignIn";
import jenkinsLogin from "../commands/jenkinsLogin";

import { Environment } from "../types";

const deployApplication = async (): Promise<void> => {
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

  // * Ask Environments to Deploy to
  const deployEnvironments = await askDeployEnvironments();

  // * Log In to Jenkins
  await jenkinsLogin(
    browser,
    process.env.JENKINS_USERNAME,
    process.env.JENKINS_PASSWORD
  );

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
};

export default deployApplication;
