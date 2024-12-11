function Home() {
  return (
    <div className="container-fluid h-screen">

      <div className="content" id="content">
        <div
          id="slogan"
          className="text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <a className="navbar-brand" href="/">
            <i className="fas fa-code"></i>{" "}
            <span className="artistic-font text-2xl text-blue-500 font-pacifico">
              GPT4GUI
            </span>
          </a>
          <p className="text-lg text-gray-600">
            AI-based GUI test script generation for Web applications
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
