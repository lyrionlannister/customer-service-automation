interface Images {
  src: string;
  alt: string;
}

export default interface ColumnImageGridProps {
  cols: number;
  images: Images[];
}
