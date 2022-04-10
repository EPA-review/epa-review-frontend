import type { DSVRowArray } from "d3-dsv";

export type DeidData = {
  rawData?: DSVRowArray<string>;
  config?: {
    feedbackColumns: string[];
    residentNameColumns: string[];
    observerNameColumns: string[];
  };
  nameDictionary?: any;
  results?: Results;
};

export type Results = { feedbackGroups: FeedbackGroup[] };

export type FeedbackGroup = {
  feedbacks: Feedback[];
};

export type Feedback = {
  originalText: string;
  tags: Tag[];
  userTagsDict: { [user: string]: Tag[] };
  currentUserTagsBackup: Tag[];
  showingModifiedTags?: boolean;
  editing?: boolean;
  clickHandler?: (event: CustomEvent) => void;
};

export type Tag = {
  start: number;
  end: number;
  label: string;
  edited?: boolean;
};
