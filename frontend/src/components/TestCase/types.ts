export interface TestItem {
    id: string;
    testItem: string;
    testProcedure: string;
    expectedOutput: string;
    environmentCondition: string;
    testClassification: string;
    testId: string;
    websiteUrl: string;
  }
  
  export interface TestList {
    [key: string]: TestItem;
  }
  
  export interface TestCaseDetailsProps {
    testData: TestItem;
    isEditing: boolean;
    form: any;
  }
  
  export interface PredictionSectionProps {
    modelPrediction: string;
    traditionalPrediction: string;
    onModelPredict: () => void;
    onTraditionalPredict: () => void;
  }
  
  export interface TestCaseEditorProps {
    testCase: TestItem | null;
    onSave: (updatedTestCase: TestItem) => void;
    onCancel: () => void;
  }