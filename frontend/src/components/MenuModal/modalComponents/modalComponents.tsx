import {
  COLAB,
  CONFIGURE_PREDICTION_SERVER,
  CONFIGURE_TRAINING_SERVER,
  LOCAL,
  NEW_ENV,
  OPEN_ENV,
  SAGEMAKER,
} from "../../Menu/const";
import NewEnv from "./NewEnv";
import OpenEnv from "./OpenEnv";
import ServerConfig from "./ServerConfig";

export const MENU_ACTION = {
  [NEW_ENV]: {
    title: "Creating New Testing Environment",
    component: <NewEnv />,
  },
  [OPEN_ENV]: {
    title: "Opening Existing Environment",
    component: <OpenEnv />,
  },
  [CONFIGURE_TRAINING_SERVER]: {
    title: "Configuring Training Server",
  },
  [COLAB]: {
    title: "Configuring Colab Training Server",
    component: <ServerConfig />,
  },
  [SAGEMAKER]: {
    title: "Configuring Sagemaker Training Server",
    component: <ServerConfig />,
  },
  [LOCAL]: {
    title: "Configuring Local Training Server",
    component: <ServerConfig />,
  },
};