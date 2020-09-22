import boxen from "boxen";
import chalk from "chalk";
import inquirer from "inquirer";

import all from "./actions/all";
import build from "./actions/build";
import mergeBranch from "./actions/mergeBranch";
import uiBuild from "./actions/uiBuild";

import { blankBoxenStyle } from "./constants";
import { titleScreen } from "./util";

import { AppState, MenuAction } from "./types";

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
            { value: "all", name: "All Actions" },
            new inquirer.Separator(),
            { value: "build", name: "Build" },
            { value: "mergeBranch", name: "Merge Branch" },
            { value: "uiBuild", name: "UI Build" },
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
      all: async (state: AppState): Promise<void> => {
        await titleScreen("deployer-5000");

        await all();

        console.log("Press any key to return to Main Menu ...");
        await keypress();
        state.menuActionEmitter.emit("actionCompleted", state);
      },
      exit: (state: AppState): void => process.exit(),
      mergeBranch: async (state: AppState): Promise<void> => {
        await titleScreen("deployer-5000");

        await mergeBranch();

        console.log("Press any key to return to Main Menu ...");
        await keypress();
        state.menuActionEmitter.emit("actionCompleted", state);
      },
      uiBuild: async (state: AppState): Promise<void> => {
        await titleScreen("deployer-5000");

        await uiBuild();

        console.log("Press any key to return to Main Menu ...");
        await keypress();
        state.menuActionEmitter.emit("actionCompleted", state);
      },
      build: async (state: AppState): Promise<void> => {
        await titleScreen("deployer-5000");

        await build();

        console.log("Press any key to return to Main Menu ...");
        await keypress();
        state.menuActionEmitter.emit("actionCompleted", state);
      },
    };

    await actions[state.menuAction](state);
  } catch (e) {
    throw new Error(e);
  }
};
