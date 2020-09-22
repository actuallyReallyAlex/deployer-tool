import formatDistance from "date-fns/formatDistance";
import puppeteer from "puppeteer";

import createUIBuild from "../commands/createUIBuild";
import gitLabSignIn from "../commands/gitLabSignIn";
import jenkinsLogin from "../commands/jenkinsLogin";
import mergeUIBuild from "../commands/mergeUIBuild";

const uiBuild = async (): Promise<void> => {
  try {
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

export default uiBuild;
