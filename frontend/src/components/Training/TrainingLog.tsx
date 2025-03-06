import React, { useEffect, useState, useRef } from 'react';
import { Alert, Button, Space, Spin, Tooltip, Tabs, Card, Radio } from 'antd';
import { DownloadOutlined, CopyOutlined, ClearOutlined, LineChartOutlined, FileTextOutlined } from '@ant-design/icons';
import { API_ENDPOINTS } from "../../const";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const { TabPane } = Tabs;

interface TrainingLogProps {
  trainingId?: string; // ID of the current training session
  isTraining: boolean;  // Whether training is in progress
  onError?: (message: string) => void; // Callback for errors
  onTrainingError?: () => void; // Callback when training error is detected
  onTrainingComplete?: () => void; // Callback when training completes successfully
}

// Define types for the loss data
interface LossDataPoint {
  step: number;
  epoch: number;
  loss: number;
}

const TrainingLog: React.FC<TrainingLogProps> = ({ 
  trainingId, 
  isTraining,
  onError,
  onTrainingError,
  onTrainingComplete
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("text");
  const [chartData, setChartData] = useState<LossDataPoint[]>([]);
  const [xAxisType, setXAxisType] = useState<'step' | 'epoch'>('step');
  const logEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  // Function to fetch logs from server
  const fetchLogs = async () => {
    if (!trainingId) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.TRAIN_LOGS}/${trainingId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch logs');
      }
      
      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
        processLogsForChart(data.logs);
      }
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error fetching logs: ${errorMessage}`);
      if (onError) onError(errorMessage);
    }
  };

  // Parse logs to extract loss information for chart
  const processLogsForChart = (logEntries: string[]) => {
    if (logEntries.length === 0) return;
    
    try {
      const parsedData: LossDataPoint[] = [];
      
      // Process each log line
      logEntries.forEach(logLine => {
        try {
          // Try to parse log line as JSON
          if (logLine.includes('{') && logLine.includes('}')) {
            // Extract the JSON part from the log line
            const jsonMatch = logLine.match(/\{[^}]+\}/);
            
            if (jsonMatch) {
              const jsonStr = jsonMatch[0];
              const logObj = JSON.parse(jsonStr);
              
              // Ensure we have all required fields and loss is a number
              if (
                logObj && 
                'step' in logObj && 
                'epoch' in logObj && 
                'loss' in logObj && 
                !isNaN(Number(logObj.loss))
              ) {
                parsedData.push({
                  step: Number(logObj.step),
                  epoch: Number(logObj.epoch),
                  loss: Number(logObj.loss)
                });
              }
            }
          }
        } catch (err) {
          // Skip lines that can't be parsed
          console.warn('Could not parse log line:', logLine);
        }
      });
      
      // Sort data by step to ensure correct line drawing
      parsedData.sort((a, b) => a.step - b.step);
      
      setChartData(parsedData);
    } catch (error) {
      console.error('Error processing logs for chart:', error);
    }
  };

  // Monitor logs for completion or error messages
  useEffect(() => {
    if (!isTraining || logs.length === 0) return;
    
    // Check for error indicators
    const errorIndicators = [
      "error:", 
      "exception:", 
      "training failed",
      "out of memory",
      "cuda error"
    ];
    
    const hasTrainingErrors = logs.some(log => 
      errorIndicators.some(indicator => 
        log.toLowerCase().includes(indicator.toLowerCase())
      )
    );
    
    if (hasTrainingErrors && onTrainingError) {
      console.log("Training errors detected in logs");
      onTrainingError();
      return; // Don't check for completion if errors are found
    }
    
    // Check for completion indicators
    const completionIndicators = [
      "training complete",
      "training finished",
      "training completed"
    ];
    
    const isTrainingComplete = logs.some(log => 
      completionIndicators.some(indicator => 
        log.toLowerCase().includes(indicator.toLowerCase())
      )
    );
    
    if (isTrainingComplete && onTrainingComplete) {
      console.log("Training completion detected in logs");
      onTrainingComplete();
    }
  }, [logs, isTraining, onTrainingError, onTrainingComplete]);

  // Setup WebSocket connection or polling for real-time logs
  useEffect(() => {
    // Clear any previous connections
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // If not training or no training ID, don't establish connections
    if (!trainingId || !isTraining) {
      return;
    }
    
    setLoading(true);
    
    // Try to establish WebSocket connection first
    try {
      const wsUrl = API_ENDPOINTS.TRAIN_LOGS_WS?.replace('http', 'ws');
      
      if (wsUrl) {
        const socket = new WebSocket(`${wsUrl}/${trainingId}`);
        socketRef.current = socket;
        
        socket.onopen = () => {
          console.log('WebSocket connection established');
          setLoading(false);
        };
        
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            let newLogs: string[] = [];
            
            if (data.logs) {
              newLogs = data.logs;
            } else if (data.log) {
              newLogs = [data.log];
            } else {
              newLogs = [event.data];
            }
            
            setLogs(prevLogs => {
              const updatedLogs = [...prevLogs, ...newLogs];
              processLogsForChart(updatedLogs);
              return updatedLogs;
            });
          } catch (err) {
            // If not JSON, assume it's a plain text log
            setLogs(prevLogs => {
              const updatedLogs = [...prevLogs, event.data];
              processLogsForChart(updatedLogs);
              return updatedLogs;
            });
          }
        };
        
        socket.onerror = (err) => {
          console.error('WebSocket error:', err);
          setError('WebSocket connection error. Falling back to polling.');
          socket.close();
          socketRef.current = null;
          
          // Fall back to polling if WebSocket fails
          startPolling();
        };
        
        socket.onclose = () => {
          console.log('WebSocket connection closed');
          socketRef.current = null;
          // If training is still in progress, fall back to polling
          if (isTraining) {
            startPolling();
          }
        };
      } else {
        // If WebSocket URL is not defined, fall back to polling
        startPolling();
      }
    } catch (err) {
      console.error('Error setting up WebSocket:', err);
      // Fall back to polling if WebSocket setup fails
      startPolling();
    }
    
    // Polling function
    function startPolling() {
      setLoading(false);
      
      // Don't start polling if not training or already polling
      if (!isTraining || pollingIntervalRef.current) return;
      
      // Initial fetch
      fetchLogs();
      
      // Setup polling interval (every 2 seconds)
      const intervalId = window.setInterval(() => {
        if (isTraining) {
          fetchLogs();
        } else {
          // Stop polling if training is no longer in progress
          clearInterval(intervalId);
          pollingIntervalRef.current = null;
        }
      }, 2000);
      
      pollingIntervalRef.current = intervalId;
    }
    
    // Cleanup function for the useEffect
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [trainingId, isTraining]);
  
  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logEndRef.current && activeTab === "text") {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);
  
  // Clean up polling/websocket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchLogs();
  };
  
  // Handle log download
  const handleDownload = () => {
    if (logs.length === 0) return;
    
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-log-${trainingId || new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle log copy
  const handleCopy = () => {
    if (logs.length === 0) return;
    
    navigator.clipboard.writeText(logs.join('\n'))
      .then(() => {
        alert('Logs copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy logs:', err);
        alert('Failed to copy logs');
      });
  };
  
  // Handle clear logs
  const handleClear = () => {
    setLogs([]);
    setChartData([]);
  };

  // Handle changing the x-axis type (step or epoch)
  const handleXAxisChange = (e: any) => {
    setXAxisType(e.target.value);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded">
        <div>
          {isTraining && (
            <Space>
              <Spin size="small" />
              <span className="text-blue-600 font-medium">Training in progress</span>
            </Space>
          )}
          {!isTraining && logs.length > 0 && (
            <span className="text-green-600 font-medium">Training completed</span>
          )}
          {!isTraining && logs.length === 0 && !loading && (
            <span className="text-gray-500">No logs available</span>
          )}
        </div>
        
        <Space>
          <Tooltip title="Refresh logs">
            <Button 
              icon={<Spin spinning={loading} />} 
              onClick={handleRefresh}
              disabled={!trainingId}
            >
              Refresh
            </Button>
          </Tooltip>
          <Tooltip title="Download logs">
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownload}
              disabled={logs.length === 0}
            >
              Download
            </Button>
          </Tooltip>
          <Tooltip title="Copy logs">
            <Button 
              icon={<CopyOutlined />} 
              onClick={handleCopy}
              disabled={logs.length === 0}
            >
              Copy
            </Button>
          </Tooltip>
          <Tooltip title="Clear logs">
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleClear}
              disabled={logs.length === 0}
            >
              Clear
            </Button>
          </Tooltip>
        </Space>
      </div>
      
      {/* Error message */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-2"
        />
      )}
      
      {/* Tabs for different views */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="flex-1">
        <TabPane 
          tab={<span><FileTextOutlined /> Text Logs</span>} 
          key="text"
          className="h-full"
        >
          {/* Log display area */}
          <div 
            className="h-full overflow-auto p-4 font-mono text-sm bg-black text-green-400 rounded"
            style={{ 
              minHeight: '200px',
              height: 'calc(100vh - 300px)'
            }}
          >
            {loading && logs.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <Spin tip="Loading logs..." />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>No logs available. Start training to see logs here.</p>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">
                {logs.join('\n')}
                <div ref={logEndRef} />
              </pre>
            )}
          </div>
        </TabPane>
        
        <TabPane 
          tab={<span><LineChartOutlined /> Loss Chart</span>} 
          key="chart"
          className="h-full"
        >
          <Card className="h-full">
            <div className="mb-4 flex justify-end">
              <Radio.Group value={xAxisType} onChange={handleXAxisChange} buttonStyle="solid">
                <Radio.Button value="step">Step</Radio.Button>
                <Radio.Button value="epoch">Epoch</Radio.Button>
              </Radio.Group>
            </div>
            
            <div style={{ width: '100%', height: 'calc(100vh - 340px)', minHeight: '300px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={xAxisType} 
                      label={{ 
                        value: xAxisType === 'step' ? 'Training Step' : 'Epoch', 
                        position: 'insideBottomRight', 
                        offset: -10 
                      }} 
                    />
                    <YAxis 
                      label={{ 
                        value: 'Loss', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }} 
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => [Number(value).toFixed(4), 'Loss']}
                      labelFormatter={(value) => `${xAxisType === 'step' ? 'Step' : 'Epoch'}: ${value}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="loss" 
                      stroke="#8884d8" 
                      name="Training Loss" 
                      dot={false}
                      activeDot={{ r: 6 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex justify-center items-center">
                  <div className="text-center text-gray-500">
                    <LineChartOutlined style={{ fontSize: '2rem' }} />
                    <p className="mt-2">
                      {loading ? "Processing log data..." : "No loss data available yet"}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {chartData.length > 0 && (
              <div className="mt-4 text-xs text-gray-500">
                <p>
                  Showing {chartData.length} data points • 
                  Current loss: {chartData[chartData.length - 1]?.loss.toFixed(4) || 'N/A'} •
                  Min loss: {Math.min(...chartData.map(d => d.loss)).toFixed(4)}
                </p>
              </div>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TrainingLog;