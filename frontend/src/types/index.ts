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
