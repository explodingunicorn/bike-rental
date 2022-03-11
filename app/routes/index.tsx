import {
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import { Form, useTransition } from "@remix-run/react";
import { ActionFunction } from "remix";
import { useState } from "react";
import { Card } from "~/components/Card";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const wait = new Promise((res) => {
    setTimeout(() => {
      res(0);
    }, 2000);
  });
  await wait.then(() => {});
  console.log(formData);
  return null;
};

export default function Index() {
  const transition = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Center>
      <Card>
        <Form method="post">
          <VStack>
            <Heading>Testing</Heading>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                value={password}
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </FormControl>
            <Button type="submit" isLoading={transition.state === "submitting"}>
              Login
            </Button>
          </VStack>
        </Form>
      </Card>
    </Center>
  );
}
