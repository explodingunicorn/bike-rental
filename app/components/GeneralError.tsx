import { Button, Text } from "@chakra-ui/react";
import { Message } from "./Message";

export const GeneralError = () => {
  return (
    <Message type="error">
      <Text>
        An error was encountered, please try{" "}
        <Button color="lightblue" onClick={location.reload}>
          reloading
        </Button>
        .
      </Text>
    </Message>
  );
};
