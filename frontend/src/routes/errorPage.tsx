import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error:any = useRouteError();
  console.error(error);

  return (
    <div id="error-page" style={{display: "grid", placeItems: "center", transform: "translate(0, 50%)"}}>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.data || error.statusText || error.message}</i>
      </p>
    </div>
  );
}