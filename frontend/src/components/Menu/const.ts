import { MenuProps } from "antd";

export const MENU_KEY = {
  // File Menu Keys
  NEW_ENV: "new_env",
  OPEN_ENV: "open_env",
  TRAIN_MODEL: "train_model",
  SAGEMAKER_TRAIN_MODEL: "sagemaker_train_model",
  GENERATE_TRAIN_SET: "generate_train_set",

  // Settings Menu Keys
  SETUP_SELENIUM: "setup_selenium",
  CONFIGURE_TRAINING_SERVER: "configure_training_server",
  CONFIGURE_PREDICTION_SERVER: "configure_prediction_server",
  CHOOSE_TRAINING_SERVER: "choose_training_server",
  // Sub keys of CHOOSE_TRAINING_SERVER
  COLAB: "colab",
  SAGEMAKER: "sagemaker",
  LOCAL: "local",
};

export const {
  NEW_ENV,
  OPEN_ENV,
  TRAIN_MODEL,
  SAGEMAKER_TRAIN_MODEL,
  GENERATE_TRAIN_SET,
  SETUP_SELENIUM,
  CONFIGURE_TRAINING_SERVER,
  CONFIGURE_PREDICTION_SERVER,
  CHOOSE_TRAINING_SERVER,
  COLAB,
  SAGEMAKER,
  LOCAL,
} = MENU_KEY;

export const FILES_MENU: MenuProps["items"] = [
  {
    label: "Create New Environment",
    key: NEW_ENV,
  },
  {
    label: "Open Environment",
    key: OPEN_ENV,
  },
  {
    label: "Train Model",
    key: TRAIN_MODEL,
  },
  // {
  //   label: "Sagemaker Train Model",
  //   key: SAGEMAKER_TRAIN_MODEL,
  // },
  // {
  //   label: "Generate Training Set",
  //   key: GENERATE_TRAIN_SET,
  // },
];

export const SETTINGS_MENU: MenuProps["items"] = [
  {
    label: "Set up java code for Selenium",
    key: SETUP_SELENIUM,
  },
  // {
  //   label: "Configure Training Server",
  //   key: CONFIGURE_TRAINING_SERVER,
  // },
  // {
  //   label: "Configure Prediction Server",
  //   key: CONFIGURE_PREDICTION_SERVER,
  // },
  // {
  //   label: "Choose Training Server",
  //   key: CHOOSE_TRAINING_SERVER,
  //   children: [
  //     {
  //       label: "Google Colab",
  //       key: COLAB,
  //     },
  //     {
  //       label: "Sagemaker",
  //       key: SAGEMAKER,
  //     },
  //     {
  //       label: "Local",
  //       key: LOCAL,
  //     },
  //   ],
  // },
];

export const SERVERS_MENU = [
  {
    label: "Google Colab",
    key: COLAB,
    id:1,
  },
  {
    label: "Sagemaker",
    key: SAGEMAKER,
  },
  {
    label: "Local",
    key: LOCAL,
    id:2,
  },
];
