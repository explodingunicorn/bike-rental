import {
  Button,
  Center,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import {
  Form,
  useTransition,
  useActionData,
  useLocation,
  useFetcher,
} from "@remix-run/react";
import { ActionFunction, json, LoaderFunction, redirect } from "remix";
import { useEffect, useState } from "react";
import { Card } from "~/components/Card";
import { Message } from "~/components/Message";
import { supabase } from "~/api";
import { commitSession, getSession } from "~/sessions";
import { Session } from "@supabase/supabase-js";

const validatePassword = (pass: string) => {
  return pass.length > 5 && pass.length <= 30;
};

const finishLoginAndRedirect = async (session: Session, path: string) => {
  const newSession = await getSession();
  newSession.set("supabaseSession", session);
  return redirect(path, {
    headers: {
      "Set-Cookie": await commitSession(newSession),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.has("access_token")) {
    return json({ registrationConfirmed: true });
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const userSession = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const action = formData.get("action") as string | null;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (userSession.has("supabaseSession")) {
    const supabaseSession: Session = userSession.get("supabaseSession");
    if (Date.now() < (supabaseSession.expires_at || 0) * 1000) {
      return redirect("bikes");
    }
  }

  if (email && password && validatePassword(password)) {
    switch (action) {
      case "login": {
        const { error, session } = await supabase.auth.signIn({
          email,
          password,
        });
        if (error) {
          return json({ error: "Invalid email or password." });
        }
        let redirect = "bikes";
        if (session?.user) {
          const { data } = await supabase
            .from("user_permissions")
            .select("*")
            .eq("id", session.user.id)
            .eq("manager", true);
          if (data?.length) {
            redirect = "manage/bikes";
          }
        }
        return await finishLoginAndRedirect(session as Session, redirect);
      }
      case "register": {
        const { session, error } = await supabase.auth.signUp(
          {
            email,
            password,
          },
          {
            redirectTo: "/confirmation",
          }
        );
        if (error) {
          return json({ error: error.message });
        }
        return json({ registrationComplete: true });
      }
      default: {
        return json({ error: "Something went wrong, please try again" });
      }
    }
  }
  if (password && !validatePassword(password)) {
    return json({ error: "Password does not meet requirements" });
  }
  return json({ error: "Missing email or password." });
};

export default function Index() {
  const loginRoute = useFetcher();
  const location = useLocation();
  const transition = useTransition();
  const actionData = useActionData() || {};
  const [login, setLogin] = useState(true);
  const [email, setEmail] = useState("abcorey7@gmail.com");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (actionData.registrationComplete) {
      setLogin(true);
    }
  }, [actionData.registrationComplete]);

  useEffect(() => {
    const params = new URLSearchParams(location.hash.substring(1));
    if (params.has("access_token")) {
      loginRoute.submit(params);
    }
  }, [location.hash]);

  return (
    <Card style={{ margin: "0 auto", width: "30%" }}>
      <Container padding="unset" margin="unset">
        <Form method="post">
          <VStack spacing="4">
            <Heading as="h2" size="md">
              {login ? "Login" : "Register"}
            </Heading>
            {actionData.error && (
              <Message type="error">{actionData.error}</Message>
            )}
            {actionData.registrationComplete && (
              <Message type="success">
                Registration complete, please login.
              </Message>
            )}
            {loginRoute.data?.registrationConfirmed && (
              <Message type="success">
                Registration confirmed, please log in
              </Message>
            )}
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                placeholder="user@email.com"
              />
              {!login && (
                <FormHelperText>
                  Please provide a valid email address
                </FormHelperText>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                value={password}
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="password"
              />
              {!login && (
                <FormHelperText>Must be between 5-30 characters</FormHelperText>
              )}
            </FormControl>
            <Button
              type="submit"
              isLoading={transition.state === "submitting"}
              width="full"
              colorScheme="green"
              name="action"
              value={login ? "login" : "register"}
            >
              {login ? "Login" : "Register"}
            </Button>
          </VStack>
        </Form>
        <Center padding="1" marginBlockStart="4">
          <Button
            variant="link"
            colorScheme="green"
            size="xs"
            onClick={() => setLogin(!login)}
          >
            {login
              ? "Don't have an account? Register now!"
              : "Already have an account? Login here!"}
          </Button>
        </Center>
      </Container>
    </Card>
  );
}
