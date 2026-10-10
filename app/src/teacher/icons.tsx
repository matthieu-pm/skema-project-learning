import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  UserGroupIcon,
  Calendar03Icon,
  BookOpen01Icon,
  UserCircleIcon,
  Message01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Add01Icon,
  Tick02Icon,
  Clock01Icon,
  Video01Icon,
  AiMagicIcon,
  Search01Icon,
  Location01Icon,
  Settings01Icon,
  HelpCircleIcon,
  Wallet01Icon,
  Archive02Icon,
  Cancel01Icon,
  SidebarLeftIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  CircleIcon as HugeCircleIcon,
  MoreVerticalIcon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons";
import type { SVGProps } from "react";

const icons: Record<string, IconSvgElement> = {
  students: UserGroupIcon,
  calendar: Calendar03Icon,
  book: BookOpen01Icon,
  person: UserCircleIcon,
  message: Message01Icon,
  arrow: ArrowRight01Icon,
  back: ArrowLeft01Icon,
  plus: Add01Icon,
  check: Tick02Icon,
  clock: Clock01Icon,
  video: Video01Icon,
  spark: AiMagicIcon,
  search: Search01Icon,
  pin: Location01Icon,
  settings: Settings01Icon,
  help: HelpCircleIcon,
  wallet: Wallet01Icon,
  archive: Archive02Icon,
  close: Cancel01Icon,
  sidebar: SidebarLeftIcon,
  down: ArrowDown01Icon,
  up: ArrowUp01Icon,
  circle: HugeCircleIcon,
  more: MoreVerticalIcon,
  expand: ArrowUpDownIcon,
};
type Props = Omit<SVGProps<SVGSVGElement>, "strokeWidth"> & {
  size?: number;
  name?: string;
  strokeWidth?: number;
};
export function Icon({ name = "book", size = 20, ...props }: Props) {
  return (
    <HugeiconsIcon
      icon={icons[name] || icons.book}
      size={size}
      strokeWidth={1.7}
      aria-hidden="true"
      {...props}
    />
  );
}
export const PanelLeftIcon = (props: Props) => (
  <Icon name="sidebar" {...props} />
);
export const XIcon = (props: Props) => <Icon name="close" {...props} />;
export const CheckIcon = (props: Props) => <Icon name="check" {...props} />;
export const ChevronRightIcon = (props: Props) => (
  <Icon name="arrow" {...props} />
);
export const CircleIcon = (props: Props) => <Icon name="circle" {...props} />;
