export const API_HOST = "http://localhost:8080";

export const API_ENDPOINTS = {
    OPEN_ENV: `${API_HOST}/api/data/environments`,
    CREATE_ENV: `${API_HOST}/api/testing-environments/create-env`,
    ENV_DETAILS: `${API_HOST}/api/data/environment/`,
    PREDICTION: `${API_HOST}/api/model/prediction`,
    BF_PRED: `${API_HOST}/generateTraditionalTestScript`,

    TRAIN: `${API_HOST}/api/model/train`,
    TRAIN_LOGS: `${API_HOST}/api/model/training-logs`,
    TRAIN_LOGS_WS: `${API_HOST}/api/model/training-logs`,

    SCENARIOS: `${API_HOST}/api/test-scenarios`,
    IMAGE:`${API_HOST}/api/images`,
}