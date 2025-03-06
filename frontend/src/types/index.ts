export interface TestCase {
  id: number;
  testId: string;
  testItem: string;
  testProcedure: string;
  websiteUrl: string;
  testClassification: string;
  expectedOutput: string;
  environmentCondition: string;
}

export interface TestImage {
  id: number;
  name: string;
  imageUrl: string;
}

export interface TestScenario {
  id: number;
  name: string;
  testData: TestCase[];
  images: TestImage[];
}

export interface ModelOption {
  value: string;
  label: string;
}

export interface ConfigOption {
  value: number;
  label: string;
}

export interface TrainingFormData {
  trainingSet?: {
    fileList: {
      originFileObj: File;
    }[];
  };
  epochs?: number;
  modelType?: string[];
  configId?: number;
  loggingDirectory?: string;
  outputDirectory?: string;
}
