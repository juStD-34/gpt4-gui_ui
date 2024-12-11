import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Suspense } from "react";
import ErrorPage from "./errorPage";
import Home from "../views/Home";
import OpenEnv from "../views/OpenEnv";
import SeleniumCodeEditor from "../views/JavaEditor";
import TrainModal from "../views/TrainModal";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Lazy loading...</div>}>
        <App />
      </Suspense>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/open-env", element: <OpenEnv /> },
      { path: "/setup-selenium", element: <SeleniumCodeEditor /> },
      { path: "/train-model", element: <TrainModal /> },
    ],
  },
  // { path: "login", element: <Login /> },
]);

export default routes;
