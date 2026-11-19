import React from 'react';

interface PixelIconProps {
  className?: string;
}

export const PixelCalendarIcon: React.FC<PixelIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="4" y="1" width="2" height="2" fill="currentColor" />
    <rect x="10" y="1" width="2" height="2" fill="currentColor" />
    <rect x="2" y="3" width="12" height="2" fill="currentColor" />
    <rect x="2" y="5" width="2" height="9" fill="currentColor" />
    <rect x="12" y="5" width="2" height="9" fill="currentColor" />
    <rect x="2" y="13" width="12" height="2" fill="currentColor" />
    <rect x="5" y="7" width="2" height="2" fill="currentColor" />
    <rect x="9" y="7" width="2" height="2" fill="currentColor" />
    <rect x="5" y="10" width="2" height="2" fill="currentColor" />
    <rect x="9" y="10" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelArrowRightIcon: React.FC<PixelIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="7" width="8" height="2" fill="currentColor" />
    <rect x="7" y="3" width="2" height="2" fill="currentColor" />
    <rect x="9" y="5" width="2" height="2" fill="currentColor" />
    <rect x="11" y="7" width="2" height="2" fill="currentColor" />
    <rect x="9" y="9" width="2" height="2" fill="currentColor" />
    <rect x="7" y="11" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelArrowLeftIcon: React.FC<PixelIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="5" y="7" width="8" height="2" fill="currentColor" />
    <rect x="7" y="3" width="2" height="2" fill="currentColor" />
    <rect x="5" y="5" width="2" height="2" fill="currentColor" />
    <rect x="3" y="7" width="2" height="2" fill="currentColor" />
    <rect x="5" y="9" width="2" height="2" fill="currentColor" />
    <rect x="7" y="11" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelKeyIcon: React.FC<PixelIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="4" width="5" height="2" fill="currentColor" />
    <rect x="2" y="6" width="2" height="4" fill="currentColor" />
    <rect x="7" y="6" width="2" height="4" fill="currentColor" />
    <rect x="3" y="10" width="5" height="2" fill="currentColor" />
    <rect x="9" y="7" width="6" height="2" fill="currentColor" />
    <rect x="11" y="9" width="2" height="2" fill="currentColor" />
    <rect x="14" y="9" width="1" height="3" fill="currentColor" />
  </svg>
);

export const PixelLockIcon: React.FC<PixelIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="5" y="2" width="6" height="2" fill="currentColor" />
    <rect x="4" y="4" width="2" height="3" fill="currentColor" />
    <rect x="10" y="4" width="2" height="3" fill="currentColor" />
    <rect x="3" y="7" width="10" height="7" fill="currentColor" />
    <rect x="7" y="9" width="2" height="3" fill="#050811" />
  </svg>
);

export const PixelShieldCheckIcon: React.FC<PixelIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="2" width="10" height="2" fill="currentColor" />
    <rect x="2" y="4" width="2" height="5" fill="currentColor" />
    <rect x="12" y="4" width="2" height="5" fill="currentColor" />
    <rect x="4" y="9" width="2" height="3" fill="currentColor" />
    <rect x="10" y="9" width="2" height="3" fill="currentColor" />
    <rect x="6" y="12" width="4" height="2" fill="currentColor" />
    <rect x="5" y="7" width="2" height="2" fill="currentColor" />
    <rect x="7" y="8" width="2" height="2" fill="currentColor" />
    <rect x="9" y="5" width="2" height="3" fill="currentColor" />
  </svg>
);

export const PixelEditIcon: React.FC<PixelIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="10" y="2" width="4" height="2" fill="currentColor" />
    <rect x="8" y="4" width="4" height="2" fill="currentColor" />
    <rect x="6" y="6" width="4" height="2" fill="currentColor" />
    <rect x="4" y="8" width="4" height="2" fill="currentColor" />
    <rect x="2" y="10" width="4" height="2" fill="currentColor" />
    <rect x="2" y="12" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelTrashIcon: React.FC<PixelIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="5" y="2" width="6" height="1" fill="currentColor" />
    <rect x="2" y="3" width="12" height="2" fill="currentColor" />
    <rect x="3" y="5" width="2" height="9" fill="currentColor" />
    <rect x="11" y="5" width="2" height="9" fill="currentColor" />
    <rect x="5" y="12" width="6" height="2" fill="currentColor" />
    <rect x="6" y="7" width="1" height="4" fill="currentColor" />
    <rect x="9" y="7" width="1" height="4" fill="currentColor" />
  </svg>
);

export const PixelCheckIcon: React.FC<PixelIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="8" width="2" height="2" fill="currentColor" />
    <rect x="4" y="10" width="2" height="2" fill="currentColor" />
    <rect x="6" y="10" width="2" height="2" fill="currentColor" />
    <rect x="8" y="8" width="2" height="2" fill="currentColor" />
    <rect x="10" y="6" width="2" height="2" fill="currentColor" />
    <rect x="12" y="4" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelPlusIcon: React.FC<PixelIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="7" y="3" width="2" height="10" fill="currentColor" />
    <rect x="3" y="7" width="10" height="2" fill="currentColor" />
  </svg>
);

export const PixelClockIcon: React.FC<PixelIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="5" y="2" width="6" height="2" fill="currentColor" />
    <rect x="5" y="12" width="6" height="2" fill="currentColor" />
    <rect x="2" y="5" width="2" height="6" fill="currentColor" />
    <rect x="12" y="5" width="2" height="6" fill="currentColor" />
    <rect x="7" y="5" width="2" height="4" fill="currentColor" />
    <rect x="9" y="7" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelResetIcon: React.FC<PixelIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="5" y="3" width="6" height="2" fill="currentColor" />
    <rect x="11" y="5" width="2" height="6" fill="currentColor" />
    <rect x="5" y="11" width="6" height="2" fill="currentColor" />
    <rect x="3" y="7" width="2" height="4" fill="currentColor" />
    <rect x="2" y="3" width="2" height="4" fill="currentColor" />
    <rect x="4" y="5" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelBookmarkIcon: React.FC<PixelIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="2" width="10" height="2" fill="currentColor" />
    <rect x="3" y="4" width="2" height="10" fill="currentColor" />
    <rect x="11" y="4" width="2" height="10" fill="currentColor" />
    <rect x="5" y="4" width="6" height="7" fill="currentColor" />
    <rect x="5" y="11" width="2" height="2" fill="currentColor" />
    <rect x="9" y="11" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelLogOutIcon: React.FC<PixelIconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="2" width="6" height="2" fill="currentColor" />
    <rect x="2" y="4" width="2" height="8" fill="currentColor" />
    <rect x="2" y="12" width="6" height="2" fill="currentColor" />
    <rect x="6" y="7" width="6" height="2" fill="currentColor" />
    <rect x="10" y="5" width="2" height="2" fill="currentColor" />
    <rect x="12" y="7" width="2" height="2" fill="currentColor" />
    <rect x="10" y="9" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelAlertIcon: React.FC<PixelIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="6" y="2" width="4" height="2" fill="currentColor" />
    <rect x="4" y="4" width="2" height="3" fill="currentColor" />
    <rect x="10" y="4" width="2" height="3" fill="currentColor" />
    <rect x="2" y="7" width="2" height="5" fill="currentColor" />
    <rect x="12" y="7" width="2" height="5" fill="currentColor" />
    <rect x="2" y="12" width="12" height="2" fill="currentColor" />
    <rect x="7" y="5" width="2" height="4" fill="currentColor" />
    <rect x="7" y="10" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelEyeIcon: React.FC<PixelIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="4" y="4" width="8" height="2" fill="currentColor" />
    <rect x="2" y="6" width="2" height="4" fill="currentColor" />
    <rect x="12" y="6" width="2" height="4" fill="currentColor" />
    <rect x="4" y="10" width="8" height="2" fill="currentColor" />
    <rect x="7" y="7" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelEyeOffIcon: React.FC<PixelIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="4" y="4" width="8" height="2" fill="currentColor" />
    <rect x="2" y="6" width="2" height="4" fill="currentColor" />
    <rect x="12" y="6" width="2" height="4" fill="currentColor" />
    <rect x="4" y="10" width="8" height="2" fill="currentColor" />
    <rect x="2" y="12" width="2" height="2" fill="currentColor" />
    <rect x="4" y="10" width="2" height="2" fill="currentColor" />
    <rect x="6" y="8" width="2" height="2" fill="currentColor" />
    <rect x="8" y="6" width="2" height="2" fill="currentColor" />
    <rect x="10" y="4" width="2" height="2" fill="currentColor" />
    <rect x="12" y="2" width="2" height="2" fill="currentColor" />
  </svg>
);

export const PixelLogInIcon: React.FC<PixelIconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    shapeRendering="crispEdges"
    className={className}
    aria-hidden="true"
  >
    <rect x="8" y="2" width="6" height="2" fill="currentColor" />
    <rect x="12" y="4" width="2" height="8" fill="currentColor" />
    <rect x="8" y="12" width="6" height="2" fill="currentColor" />
    <rect x="2" y="7" width="7" height="2" fill="currentColor" />
    <rect x="6" y="5" width="2" height="2" fill="currentColor" />
    <rect x="8" y="7" width="2" height="2" fill="currentColor" />
    <rect x="6" y="9" width="2" height="2" fill="currentColor" />
  </svg>
);
