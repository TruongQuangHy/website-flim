interface ScreenOrientation extends EventTarget {
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
  readonly type: OrientationType;
  readonly angle: number;
}

type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

type OrientationType =
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

interface Screen {
  orientation: ScreenOrientation;
}

interface Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
}
