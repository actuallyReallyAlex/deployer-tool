import EventEmitter from "events";
import Configstore from "configstore";

/**
 * Application State
 */
export interface AppState {
  config: Configstore;
  menuAction: MenuAction;
  menuActionEmitter: EventEmitter.EventEmitter;
}

export type MenuAction =
  | "about"
  | "exit"
  | "all"
  | "mergeBranch"
  | "uiBuild"
  | "build"
  | null;

export interface Environment {
  buildSelector: string;
  name: string;
  url: string;
}

export interface MergeRequestInputs {
  deleteAfterMerge: boolean;
  description: string;
  title: string;
}

export type UIBuildType = "consumed" | "standalone";
