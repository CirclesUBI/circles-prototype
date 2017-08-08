export interface NewsItem {
  amount: number;
  decision?: boolean;
  from: string;
  message?: string;
  unResolved?: boolean;
  timestamp: number;
  title: string;
  to: string;
  type: string;
  coinTitle:string;
}
