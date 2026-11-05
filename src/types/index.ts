export type ApplicationStatus =
  | 'Applied'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Rejected'
  | 'Test Shortlisted'
  | 'Not Shortlisted'
  | 'Closed';

export interface CommentItem {
  id: string;
  text: string;
  createdAt: string;
}

export interface CompanyApplication {
  id: string;
  companyName: string;
  profile: string;
  jafId?: string;
  status: ApplicationStatus | string;
  appliedDate?: string;
  resume?: string;
  testGiven: boolean; // Checkbox: given / given not the test
  testDate?: string;
  testPlatform?: string; // HackerRank, Mettl, CodeSignal, etc.
  location?: string;
  ctc?: string;
  comments: CommentItem[]; // Comment section for each company
  createdAt: string;
  updatedAt: string;
}

export type FilterTestStatus = 'all' | 'given' | 'not_given';
export type FilterAppStatus = 'all' | ApplicationStatus | string;

