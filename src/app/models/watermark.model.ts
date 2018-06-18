export class WatermarkOptions {
  text: string;
  inputFolder: string;
  outputFolder: string;
}

export class ProcessingStatus {
  isActive = false;
  processedItems = 0;
  totalItems = 0;
}
