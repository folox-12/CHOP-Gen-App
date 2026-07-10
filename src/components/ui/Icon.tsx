import MdiIcon from "@mdi/react";
import {
  mdiEye,
  mdiTrayArrowDown,
  mdiClose,
  mdiArrowUp,
  mdiArrowDown,
  mdiAlert,
  mdiTrashCanOutline,
  mdiPencil,
  mdiChevronDown,
} from "@mdi/js";

export const ICONS = {
  eye: mdiEye,
  download: mdiTrayArrowDown,
  close: mdiClose,
  arrowUp: mdiArrowUp,
  arrowDown: mdiArrowDown,
  alert: mdiAlert,
  trash: mdiTrashCanOutline,
  pencil: mdiPencil,
  chevronDown: mdiChevronDown,
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

export const Icon = ({ name, size = 1, className }: Props) => (
  <MdiIcon path={ICONS[name]} size={size} className={className} />
);
