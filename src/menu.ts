import boxen from "boxen";
import chalk from "chalk";
import inquirer from "inquirer";
import puppeteer from "puppeteer";

import askBranchName from "./commands/askBranchName";
import askDeployEnvironments from "./commands/askDeployEnvironments";
import askMergeRequestInputs from "./commands/askMergeRequestInputs";
import checkIfBranchExists from "./commands/checkIfBranchExists";
import createBuild from "./commands/createBuild";
import createMergeRequest from "./commands/createMergeRequest";
import createUIBuild from "./commands/createUIBuild";
import deploy from "./commands/deploy";
import gitLabSignIn from "./commands/gitLabSignIn";
import jenkinsLogin from "./commands/jenkinsLogin";
import mergeMergeRequest from "./commands/mergeMergeRequest";
import mergeUIBuild from "./commands/mergeUIBuild";

import { blankBoxenStyle } from "./constants";
import { titleScreen } from "./util";

import { AppState, Environment, MenuAction, MergeRequestInputs } from "./types";

/**
 * Displays Main Menu to user.
 * @param {AppState} state State of application.
 * @returns {Promise} Resolves with menuAction value.
 */
export const displayMainMenu = (state: AppState): Promise<MenuAction> =>
  new Promise(async (resolve, reject) => {
    try {
      const { menuAction } = await inquirer.prompt([
        {
          type: "list",
          message: "Main Menu",
          name: "menuAction",
          choices: [
            { value: "bigJob", name: "Big Job" },
            new inquirer.Separator(),
            { value: "about", name: "About" },
            { value: "exit", name: "Exit" },
          ],
        },
      ]);
      state.menuAction = menuAction;
      resolve(menuAction);
    } catch (e) {
      reject(e);
    }
  });

/**
 * Pauses the process execution and waits for the user to hit a key.
 * @returns {Promise} Resolves when user has entered a keystroke.
 * @async
 */
const keypress = async (): Promise<void> => {
  try {
    process.stdin.setRawMode(true);
    return new Promise((resolve, reject) => {
      try {
        process.stdin.resume();
        process.stdin.once("data", () => {
          process.stdin.setRawMode(false);
          resolve();
        });
      } catch (e) {
        return reject(e);
      }
    });
  } catch (e) {
    throw new Error(e);
  }
};

/**
 * Interprets user selected menu action.
 * @param {AppState} state State of application.
 * @returns {Promise}
 */
export const interpretMenuAction = async (state: AppState): Promise<void> => {
  try {
    if (state.menuAction === null) {
      throw new Error("menuAction can not be `null`");
    }
    const actions = {
      about: async (state: AppState): Promise<void> => {
        await titleScreen("deployer-5000");
        console.log(
          boxen(chalk.blueBright(`Author: `) + "Alex Lee", blankBoxenStyle)
        );

        console.log("Press any key to return to Main Menu ...");
        await keypress();
        state.menuActionEmitter.emit("actionCompleted", state);
      },
      bigJob: async (state: AppState): Promise<void> => {
        await titleScreen("deployer-5000");

        console.log("");
        console.log("-------------");
        console.log("DEPLOYER 5000");
        console.log("-------------");
        console.log("");

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

        console.log("Press any key to return to Main Menu ...");
        await keypress();
        state.menuActionEmitter.emit("actionCompleted", state);
      },
      exit: (state: AppState): void => process.exit(),
    };

    await actions[state.menuAction](state);
  } catch (e) {
    throw new Error(e);
  }
};
