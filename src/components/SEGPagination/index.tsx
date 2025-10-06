import { Pagination, type PaginationProps, type SxProps } from "@mui/material";

const colors = {
  purple: "#5D70F6",
  blue: "#49A0FB",
};

type Props = PaginationProps & {
  sx?: SxProps;
};

const SEGPagination = ({ sx, ...props }: Props) => {
  return (
    <Pagination
      {...props}
      color="primary"
      shape="rounded"
      sx={{
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 1,
        "& .MuiPaginationItem-root": {
          minWidth: 36,
          height: 36,
          fontWeight: 700,
          fontSize: 13,
          color: "#FFFFFF",
          background: "transparent",
          borderRadius: 8,
          transition: "transform .15s ease, box-shadow .15s ease, background .15s ease",
          boxShadow: "none",
        },

        "& .MuiPaginationItem-root:hover": {
          background: colors.blue,
          transform: "translateY(-2px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        },

        // page selecionada
        "& .MuiPaginationItem-root.Mui-selected": {
          background: colors.purple,
          color: "#FFFFFF",
          border: `1px solid ${colors.purple}`,
          boxShadow: `0 10px 30px ${hexToRgba(colors.purple, 0.16)}`,
          transform: "none",
        },

        "& .MuiPaginationItem-root:focus": {
          outline: `3px solid ${hexToRgba(colors.blue, 0.18)}`,
          outlineOffset: 2,
        },

        "& .MuiPaginationItem-root.Mui-disabled": {
          opacity: 0.45,
          color: "#FFFFFF",
          borderColor: hexToRgba(colors.blue, 0.28),
          background: "transparent",
          boxShadow: "none",
        },

        "& .MuiPaginationItem-ellipsis": {
          minWidth: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
        },

        "& .MuiPaginationItem-previousNext": {
          minWidth: 36,
          height: 36,
        },

        ...((sx as object) || {}),
      }}
    />
  );
}

function hexToRgba(hex: string, alpha = 1) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized.length === 3
    ? normalized.split("").map(c => c + c).join("")
    : normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;

}

export default SEGPagination;
