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
  configId?: number;
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
  configId = 1,
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
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // Function to process logs for chart data
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

  // Function to process a single log line for chart data
  const processLogForChart = (logLine: string) => {
    try {
      console.log("Entry process single log for chart data")
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
            setChartData(prevData => {
              // Check if we already have this step in our data
              const exists = prevData.some(item => item.step === Number(logObj.step));
              if (exists) {
                return prevData;
              }
              
              // Add the new data point and sort by step
              const newData = [
                ...prevData, 
                {
                  step: Number(logObj.step),
                  epoch: Number(logObj.epoch),
                  loss: Number(logObj.loss)
                }
              ];
              return newData.sort((a, b) => a.step - b.step);
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error processing log for chart:', error);
    }
  };
  
  // Function to check log for training completion or errors
  const checkLogForCompletionOrErrors = (log: string) => {
    if (!isTraining) return;
    
    // Check for error indicators
    const errorIndicators = [
      "error:", 
      "exception:", 
      "training failed",
      "out of memory",
      "cuda error"
    ];
    
    const hasTrainingErrors = errorIndicators.some(indicator => 
      log.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (hasTrainingErrors) {
      console.log("Training errors detected in logs:", log);
      if (onTrainingError) onTrainingError();
      
      // Close EventSource on training error
      if (eventSourceRef.current) {
        console.log("Closing EventSource due to training error");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      return; // Don't check for completion if errors are found
    }
    
    // Check for completion indicators
    const completionIndicators = [
      "training complete",
      "training finished",
      "training completed"
    ];
    
    const isTrainingComplete = completionIndicators.some(indicator => 
      log.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (isTrainingComplete) {
      console.log("Training completion detected in logs:", log);
      if (onTrainingComplete) onTrainingComplete();
      
      // Close EventSource on training completion
      if (eventSourceRef.current) {
        console.log("Closing EventSource due to training completion");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  };

  // Setup SSE connection when training starts
  useEffect(() => {
    // Cleanup previous connections
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    console.log("TrainingLog useEffect triggered with:", { trainingId, isTraining });
    // Only establish connection if we have a training ID and training is in progress
    if (!trainingId || !isTraining) {
      console.log("Not establishing SSE connection - missing trainingId or not training");
      return;
    }
    
    // Reset state for new training session
    setLogs([]);
    setChartData([]);
    setError(null);
    // if (isTraining) {
    //   setLogs([]);
    //   setChartData([]);
    //   setError(null);
    // }
    
    setLoading(true);
    
    try {
      const sseUrl = API_ENDPOINTS.TRAIN_LOGS;
      console.log(`Establishing SSE connection to: ${sseUrl}/${trainingId}/stream?configId=${configId}`);
      
      const eventSource = new EventSource(
        `${sseUrl}/${trainingId}/stream?configId=${configId}`
      );
      
      eventSource.onopen = () => {
        console.log('SSE connection established');
        setLoading(false);
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setError('SSE connection error. Please check your network connection.');
        
        // Close the failed connection
        eventSource.close();
        eventSourceRef.current = null;
      };
      
      // Handle incoming general events
      eventSource.onmessage = (event) => {
        try {
          const data = event.data;
          
          // Add the log to the existing logs
          setLogs(prevLogs => {
            // Avoid duplicate logs
            if (prevLogs.includes(data)) {
              return prevLogs;
            }
            const newLogs = [...prevLogs, data];
            
            // Check for completion or errors
            checkLogForCompletionOrErrors(data);
            
            return newLogs;
          });
      
          // Process for chart if it contains loss data
          processLogForChart(data);
        } catch (error) {
          console.error('Error processing event message:', error);
          setError(`Error processing event message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };

      // Handle history events (receives bulk logs when first connecting)
      eventSource.addEventListener('history', (event) => {
        try {
          const historyLogs = JSON.parse(event.data);
          if (Array.isArray(historyLogs)) {
            setLogs(prevLogs => {
              // Combine previous logs with new history logs, removing duplicates
              const combinedLogs = [...new Set([...prevLogs, ...historyLogs])];
              return combinedLogs;
            });
            
            // Process all logs for the chart
            processLogsForChart(historyLogs);
            
            // Check each log for completion or errors
            historyLogs.forEach(log => checkLogForCompletionOrErrors(log));
          }
        } catch (error) {
          console.error('Error processing history event:', error);
        }
      });
      
      // Handle specific log events
      eventSource.addEventListener('log', (event) => {
        try {
          const logData = event.data;
          
          // Add the log to the existing logs
          setLogs(prevLogs => {
            // Avoid duplicate logs
            if (prevLogs.includes(logData)) {
              return prevLogs;
            }
            
            // Check for completion or errors
            checkLogForCompletionOrErrors(logData);
            
            return [...prevLogs, logData];
          });
          
          // Process for chart
          processLogForChart(logData);
        } catch (error) {
          console.error('Error processing log event:', error);
        }
      });

      // Store reference to close it later
      eventSourceRef.current = eventSource;
      
      // Cleanup function
      return () => {
        eventSource.close();
        eventSourceRef.current = null;
      };
    } catch (err) {
      console.error('Error setting up SSE:', err);
      setLoading(false);
      setError(`Failed to establish connection: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [trainingId, isTraining, configId]);
  
  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logEndRef.current && activeTab === "text") {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);
  
  // Handle manual refresh (fetch current logs from server)
  const handleRefresh = async () => {
    if (!trainingId) return;
    
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
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