import inquirer from "inquirer";

import { environments } from "../constants";

import { Environment } from "../types";

const askDeployEnvironments = async (): Promise<Environment[]> => {
  try {
    const { deployEnvironments } = await inquirer.prompt({
      type: "checkbox",
      name: "deployEnvironments",
      message: "Which environment(s) would you like to deploy to?",
      choices: environments.map((environment: Environment) => environment.name),
    });

    const filteredEnvironments = environments.filter(
      (environment: Environment) =>
        deployEnvironments.includes(environment.name)
    );

    return filteredEnvironments;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default askDeployEnvironments;
