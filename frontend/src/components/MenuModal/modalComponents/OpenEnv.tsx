import { Button, Select } from "antd";
import { useContext, useEffect, useState } from "react";
import { ModalContext } from "..";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../../const"; 

type Props = {};

const OpenEnv = ({}: Props) => {
  const modalContext = useContext(ModalContext);
  const { onCancel } = modalContext;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ label: string; value: number }[]>(
    []
  );
  const [env, setEnv] = useState<number | null>(null);

  useEffect(() => {
    const fetchEnvironments = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.OPEN_ENV, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch environments");
        }
  
        const data = await response.json();
  
        // Transform data -> { label: env.name, value: env.id }
        const envOptions = data.map((env) => ({
          label: env.name,
          value: env.id,
        }));
  
        setOptions(envOptions);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load environments:", error);
        setLoading(false);
      }
    };
  
    fetchEnvironments();
  }, []);
  

  const onOpenEnv = () => {
    if (!env) {
      return;
    }
    console.log("ENV:", env)
    // TODO: modify the state to pass to the page if needed
    navigate("/open-env", { state: { env } });
    onCancel();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mt-8 mb-12">
        <p>Choose Environment</p>
        <Select
          className="flex-1"
          options={options}
          value={env}
          onChange={(value) => setEnv(value)}
          loading={loading}
        />
      </div>
      <div className="w-full flex mt-4 justify-center">
        <Button type="primary" onClick={onOpenEnv}>
          Open
        </Button>
        <Button style={{ marginLeft: 20 }} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default OpenEnv;
