import { TestCase, TestImage } from '../types';
import { API_ENDPOINTS } from '../const';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const callApi = async <T>(
  url: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API call error [${url}]:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// API cho Test Cases
export const TestCaseApi = {
    // Get all test cases for a scenario
    async getTestCases(scenarioId: number) {
      try {
        const response = await fetch(`${API_ENDPOINTS.SCENARIOS}/scenario/${scenarioId}`);
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error fetching test cases:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error', 
          data: null 
        };
      }
    },
  
    // Add a new test case
    async addTestCase(envId: number, testCase: Partial<TestCase>) {
      try {
        const payloadWithEnvId = {
          ...testCase,
          env_id: envId
        };
        const response = await fetch(`${API_ENDPOINTS.SCENARIOS}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadWithEnvId),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error adding test case:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error', 
          data: null 
        };
      }
    },
  
    // Delete a test case
    async deleteTestCase(testId: string) {
      try {
        const response = await fetch(`${API_ENDPOINTS.SCENARIOS}/${testId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error deleting test case:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    },
  
    // Update a test case
    async updateTestCase(testId: number, testCase: Partial<TestCase>) {
      try {
        const response = await fetch(`${API_ENDPOINTS.SCENARIOS}/${testId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testCase),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Error updating test case:', error);
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error', 
          data: null 
        };
      }
    },
  };

// API cho Images
export const ImageApi = {
  // Get all images for an environment
  async fetchImages(envId: string) {
    return callApi<TestImage[]>(`${API_ENDPOINTS.IMAGE}/${envId}`);
  },
  
  // Upload a new image (using FormData for image upload)
  async uploadImage(envId: string, imageFile: File, imageName: string) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('name', imageName);
    formData.append('env_id', envId);
    
    try {
      const response = await fetch(API_ENDPOINTS.IMAGE, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Upload image error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },
  
  // Rename image
  async renameImage(imageId: number, newName: string) {
    try {
      // Sử dụng URLSearchParams thay vì FormData vì chỉ cần gửi tham số đơn giản
      const url = `${API_ENDPOINTS.IMAGE}/${imageId}?name=${encodeURIComponent(newName)}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Rename image error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },
  // Delete image - Note: You need to implement this endpoint in your backend
  async deleteImage(imageId: number) {
    return callApi<void>(`${API_ENDPOINTS.IMAGE}/${imageId}`, 'DELETE');
  },
};

// API cho Prediction
export const PredictionApi = {
  // Gọi prediction API
  callModelPrediction: async (testData: TestCase) => {
    const payload = {
      config_id: 1, // TODO: Set từ config
      pred_list: [
        {
          testItem: testData.testItem,
          testProcedure: testData.testProcedure,
          expectedOutput: testData.expectedOutput,
          environmentCondition: testData.environmentCondition,
        },
      ],
    };
    
    return callApi<any>(API_ENDPOINTS.PREDICTION, 'POST', payload);
  },
  callBFPrediction: async( test: TestCase) =>{
    try {
      // Tạo URL với query parameters
      const url = new URL(API_ENDPOINTS.BF_PRED);
      url.searchParams.append('testData', test.testProcedure);
      url.searchParams.append('iconElementId', 'icon_id');
      
      const response = await fetch(url.toString(), {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // API trả về plain text nên không cần parse JSON
      const data = await response.text();
      return { success: true, data };
    } catch (error) {
      console.error('Error calling BF prediction API:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
};

export default {
  TestCaseApi,
  ImageApi,
  PredictionApi,
};