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
    async updateTestCase(testId: string, testCase: Partial<TestCase>) {
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
  // Lấy danh sách images
  fetchImages: async (envId: string) => {
    return callApi<TestImage[]>(`${API_ENDPOINTS.SCENARIOS}?envId=${envId}`);
  },
  
  // Thêm image mới (sử dụng FormData cho upload hình ảnh)
  uploadImage: async (envId: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('envId', envId);
    
    try {
      const response = await fetch(API_ENDPOINTS.SCENARIOS, {
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
  
  // Đổi tên image
  renameImage: async (imageId: number, newName: string) => {
    return callApi<TestImage>(`${API_ENDPOINTS.SCENARIOS}/${imageId}`, 'PUT', { name: newName });
  },
  
  // Xóa image
  deleteImage: async (imageId: number) => {
    return callApi<void>(`${API_ENDPOINTS.SCENARIOS}/${imageId}`, 'DELETE');
  },
};

// API cho Prediction
export const PredictionApi = {
  // Gọi prediction API
  callPrediction: async (testData: TestCase) => {
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
};

export default {
  TestCaseApi,
  ImageApi,
  PredictionApi,
};