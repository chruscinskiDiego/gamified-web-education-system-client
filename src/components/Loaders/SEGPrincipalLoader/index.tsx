import React from "react";
import Box from "@mui/material/Box";
import { styled, keyframes } from "@mui/system";
import logoSeg from "../../../assets/logo-seg.png";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const dashOffsetAnim = (circumference: number) => keyframes`
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -${circumference}; } /* negativo para deslizar no sentido da rotação */
`;

const Wrapper = styled(Box)(() => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
}));

const AnimatedSvg = styled("svg")(() => ({
  animation: `${spin} 2s linear infinite`,
  transformOrigin: "50% 50%",
  transformBox: "fill-box",
  display: "block",
  willChange: "transform",
}));

export const SEGPrincipalLoader: React.FC = () => {
  const size = 120;
  const viewBoxSize = 100;
  const r = 40;
  const thickness = 8;
  const circumference = 2 * Math.PI * r;
  const gapPortion = 0.26; // deixa uma pequena abertura no arco
  const dashVisible = circumference * (1 - gapPortion);
  const strokeWidth = (thickness / size) * viewBoxSize;
  const imgSize = Math.max(32, Math.floor(size * 0.46));

  const AnimatedArc = styled("circle")(() => ({
    animation: `${dashOffsetAnim(circumference)} 1.6s linear infinite`,
    willChange: "stroke-dashoffset",
  }));

  return (
    <Wrapper sx={{ width: size, height: size }} aria-busy="true" role="status">
      <AnimatedSvg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        aria-hidden
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5D70F6" />
            <stop offset="100%" stopColor="#49A0FB" />
          </linearGradient>
        </defs>

        <g transform={`rotate(-90 ${viewBoxSize / 2} ${viewBoxSize / 2})`}>
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={r}
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          <AnimatedArc
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={r}
            stroke="url(#rg)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dashVisible} ${circumference - dashVisible}`}
            strokeDashoffset={0}
          />
        </g>
      </AnimatedSvg>

      <Box
        component="img"
        src={logoSeg}
        alt="logo"
        sx={{
          width: imgSize,
          height: imgSize,
          objectFit: "cover",
          zIndex: 2,
          border: "none",
          boxShadow: "none",
          background: "transparent",
          borderRadius: "50%",
        }}
      />
    </Wrapper>
  );
};

export default SEGPrincipalLoader;
