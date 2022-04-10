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
