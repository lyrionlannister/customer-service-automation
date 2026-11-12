export default interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  group?: string;
  new?: boolean;
  subItems?: { name: string; path: string; new?: boolean }[];
}
