interface Milestone {
  price: number;
  title: string;
  description: string;
  deadline: number;
}

enum Sort {
  LOW_TO_HIGH_PRICE,
  HIGH_TO_LOW_PRICE,
}

interface UploadResults {
  extension: string;
  url: string;
  filePath: string;
}

export { Milestone, Sort, UploadResults };
