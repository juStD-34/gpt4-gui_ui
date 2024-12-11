import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Menu from "./components/Menu/Menu";
const { Header, Content } = Layout;
import "./App.css";

function App() {
  return (
    <Layout>
      <Header>
        <Menu />
      </Header>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
}

export default App;
