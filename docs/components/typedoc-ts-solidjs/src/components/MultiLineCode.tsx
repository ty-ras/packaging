import Typography, { type TypographyProps } from "@suid/material/Typography";

export default function MultiLineCode(
  props: Omit<TypographyProps<"pre">, "component" | "sx">,
) {
  return (
    <Typography
      component="pre"
      sx={{
        fontFamily: "monospace",
        backgroundColor: "grey.200",
      }}
      {...props}
    />
  );
}
