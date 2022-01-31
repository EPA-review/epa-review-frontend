export type Tag = {
  start: number;
  end: number;
  name: string;
  score: number;
  isUserSet?: boolean;
};

export type EpaRecord = {
  originalText?: string;
  residentName?: string;
  observerName?: string;
  tags?: Tag[];
};

export type EpaRecordForView = EpaRecord & {
  userTags?: { [user: string]: Tag[] };
  currentUserTagCache?: Tag[];
  editing?: boolean;
  showingModifiedTags: boolean;
  clickHandler: (event: CustomEvent) => void;
};
