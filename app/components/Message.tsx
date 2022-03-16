import { css } from "@emotion/react";
import styled from "@emotion/styled";

export const Message = styled.div<{ type: "success" | "error" }>((props) => {
  const color = props.type === "error" ? "red" : "green";
  return {
    backgroundColor: `var(--chakra-colors-${color}-100)`,
    borderRadius: "var(--chakra-radii-sm)",
    padding: "var(--chakra-space-4)",
    border: `1px solid var(--chakra-colors-${color}-400)`,
  };
});
