import { Options as boxenOptions } from "boxen";

import { Environment } from "./types";

/**
 * Blank style applied to Boxen.
 */
export const blankBoxenStyle: boxenOptions = {
  borderStyle: {
    topLeft: " ",
    topRight: " ",
    bottomLeft: " ",
    bottomRight: " ",
    horizontal: " ",
    vertical: " ",
  },
  float: "center",
  padding: { top: 0, bottom: 0, right: 1, left: 1 },
};

export const environments: Environment[] = [
  {
    buildSelector: `a[href='/job/${process.env.JENKINS_ORG_ID}/job/${process.env.JENKINS_PROJECT_ID}/job/${process.env.JENKINS_MAIN_BRANCH_ID}/job/Deployment-Tasks/job/${process.env.JENKINS_DEPLOY_JOB_ID_1}/build?delay=0sec']`,
    name: process.env.JENKINS_ENV_NAME_1 || "No ENV Name Provided",
    url: `${process.env.JENKINS_BASE_URL}/job/${process.env.JENKINS_ORG_ID}/job/${process.env.JENKINS_PROJECT_ID}/job/${process.env.JENKINS_MAIN_BRANCH_ID}/job/Deployment-Tasks/job/${process.env.JENKINS_DEPLOY_JOB_ID_1}/`,
  },
  {
    buildSelector: `a[href='/job/${process.env.JENKINS_ORG_ID}/job/${process.env.JENKINS_PROJECT_ID}/job/${process.env.JENKINS_MAIN_BRANCH_ID}/job/Deployment-Tasks/job/${process.env.JENKINS_DEPLOY_JOB_ID_2}/build?delay=0sec']`,
    name: process.env.JENKINS_ENV_NAME_2 || "No ENV Name Provided",
    url: `${process.env.JENKINS_BASE_URL}/job/${process.env.JENKINS_ORG_ID}/job/${process.env.JENKINS_PROJECT_ID}/job/${process.env.JENKINS_MAIN_BRANCH_ID}/job/Deployment-Tasks/job/${process.env.JENKINS_DEPLOY_JOB_ID_2}/`,
  },
  {
    buildSelector: `a[href='/job/${process.env.JENKINS_ORG_ID}/job/${process.env.JENKINS_PROJECT_ID}/job/${process.env.JENKINS_MAIN_BRANCH_ID}/job/Deployment-Tasks/job/${process.env.JENKINS_DEPLOY_JOB_ID_3}/build?delay=0sec']`,
    name: process.env.JENKINS_ENV_NAME_3 || "No ENV Name Provided",
    url: `${process.env.JENKINS_BASE_URL}/job/${process.env.JENKINS_ORG_ID}/job/${process.env.JENKINS_PROJECT_ID}/job/${process.env.JENKINS_MAIN_BRANCH_ID}/job/Deployment-Tasks/job/${process.env.JENKINS_DEPLOY_JOB_ID_3}/`,
  },
  {
    buildSelector: `a[href='/job/${process.env.JENKINS_ORG_ID}/job/${process.env.JENKINS_PROJECT_ID}/job/${process.env.JENKINS_MAIN_BRANCH_ID}/job/Deployment-Tasks/job/${process.env.JENKINS_DEPLOY_JOB_ID_4}/build?delay=0sec']`,
    name: process.env.JENKINS_ENV_NAME_4 || "No ENV Name Provided",
    url: `${process.env.JENKINS_BASE_URL}/job/${process.env.JENKINS_ORG_ID}/job/${process.env.JENKINS_PROJECT_ID}/job/${process.env.JENKINS_MAIN_BRANCH_ID}/job/Deployment-Tasks/job/${process.env.JENKINS_DEPLOY_JOB_ID_4}/`,
  },
];
