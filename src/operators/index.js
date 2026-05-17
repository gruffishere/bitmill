import * as pixelSort from './pixel-sort.js';
import * as channelShift from './channel-shift.js';
import * as bitCrush from './bit-crush.js';
import * as slitScan from './slit-scan.js';
import * as jpegBomb from './jpeg-bomb.js';
import * as blockShuffle from './block-shuffle.js';
import * as scanLines from './scan-lines.js';
import * as displacement from './displacement.js';
import * as echo from './echo.js';
import * as kaleidoscope from './kaleidoscope.js';
import * as noise from './noise.js';
import * as pixelate from './pixelate.js';
import * as hueRotate from './hue-rotate.js';
import * as vhsTracking from './vhs-tracking.js';
import * as subRegion from './sub-region.js';
import * as halftone from './halftone.js';
import * as barrel from './barrel.js';
import * as edgeOutline from './edge-outline.js';

export const OPERATORS = [
  pixelSort,
  channelShift,
  bitCrush,
  slitScan,
  jpegBomb,
  blockShuffle,
  scanLines,
  displacement,
  echo,
  kaleidoscope,
  noise,
  pixelate,
  hueRotate,
  vhsTracking,
  subRegion,
  halftone,
  barrel,
  edgeOutline,
];
