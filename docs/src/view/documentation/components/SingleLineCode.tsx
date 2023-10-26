import Typography, { type TypographyProps } from "@suid/material/Typography";

export default function SingleLineCode(
  props: Omit<TypographyProps<"code">, "component" | "sx">,
) {
  return (
    <Typography
      component="code"
      sx={{
        fontFamily: "monospace",
        backgroundColor: "grey.200",
      }}
      {...props}
    />
  );
}

// // This would be better solution but theme.palette.grey didn't work
// import styled from "@suid/system/styled";
// const StyledTypography = styled(Typography, {
//   name: "SingleLineCode",
// })(({ theme }) => ({
//   fontFamily: "monospace",
//   backgroundColor: theme.palette.grey[200],
// }));
