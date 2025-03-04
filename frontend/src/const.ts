export const API_HOST = "http://localhost:8080";

export const API_ENDPOINTS = {
    OPEN_ENV: `${API_HOST}/api/data/environments`,
    CREATE_ENV: `${API_HOST}/api/testing-environments/create-env`,
    ENV_DETAILS: `${API_HOST}/api/data/environment/`,
    PREDICTION: `${API_HOST}/api/model/prediction`,
    TRAIN: `${API_HOST}/api/model/train`,
    SCENARIOS: `${API_HOST}/api/test-scenarios`,
    UPLOAD_IMAGE:`${API_HOST}/api/images`,
    DELETE_IMAGE:`${API_HOST}/api/images/delete`,
    DELETE_SCEN: `${API_HOST}/api/data/test_script`
}