import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { FormEvent, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  ActionFunction,
  json,
  LoaderFunction,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "remix";
import { serviceSupabase, supabase } from "~/api";
import { GeneralError } from "~/components/GeneralError";
import { UserCard } from "~/components/UserCard";
import { User } from "~/types/user";
import { setApiAuth } from "~/utils/setApiAuth";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await setApiAuth(request);
  const { error, data: users } = await supabase
    .from<User>("user_permissions")
    .select()
    .not("id", "eq", session.user?.id);
  if (error) {
    return json({ error: "Can't get users" });
  }
  return json({ users });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await setApiAuth(request);
  const form = await request.formData();
  const id = form.get("id") as string;
  const email = form.get("email") as string;
  const isManager = form.get("isManager") as string;
  const password = form.get("password") as string;
  if (request.method === "PUT" && id && email && isManager) {
    const { error, data } = await supabase
      .from<User>("user_permissions")
      .update({ email, manager: isManager === "true" })
      .eq("id", id);
    if (error) {
      return json({ error: "Something went wrong" });
    }
    return json({ data });
  }
  if (request.method === "POST" && email && password) {
    const { data } = await supabase
      .from<User>("user_permissions")
      .select("manager")
      .eq("id", session.user?.id || "");
    if (data?.[0].manager) {
      const { error, data } = await serviceSupabase.auth.api.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) {
        return json({ error });
      }
      const { error: emailError } = await serviceSupabase.auth.api.generateLink(
        "signup",
        email,
        { password }
      );
      if (emailError) {
        return null;
      }
      return json({ user: data });
    }
    return json({ error: "Cannot access " });
  }
  if (request.method === "DELETE" && id) {
    const { error } = await supabase
      .from<User>("user_permissions")
      .delete()
      .eq("id", id);
    if (error) {
      return json({ error });
    }
    const { error: authDeleteError, data } =
      await serviceSupabase.auth.api.deleteUser(id);
    if (authDeleteError) {
      return json({ error: authDeleteError });
    }
    return json({ user: data });
  }
  return json({ error: "Something went wrong" });
};

export default function ManageUsers() {
  const submit = useSubmit();
  const transition = useTransition();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [createPressed, setCreatePressed] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>();
  const [userName, setUserName] = useState("");
  const [isManager, setIsManager] = useState(false);
  const [password, setPassword] = useState("");
  const loaderData = useLoaderData<{ users?: User[]; error?: string }>();
  const actionData = useActionData<{ error?: string }>();

  const onCreatePressed = () => {
    setCreatePressed(true);
    setUserName("");
    setSelectedUser(null);
    onOpen();
  };

  const onUserEdit = (user: User) => {
    setSelectedUser(user);
    setUserName(user.email);
    setIsManager(user.manager);
    onOpen();
  };

  const onUserDelete = (user: User) => {
    submit({ id: user.id }, { method: "delete" });
  };

  const onUserEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      submit(
        {
          id: selectedUser.id,
          email: userName,
          isManager: isManager ? "true" : "false",
        },
        { method: "put" }
      );
    } else if (createPressed) {
      submit(
        {
          email: userName,
          password,
        },
        { method: "post" }
      );
      setUserName("");
      setPassword("");
    }
    onClose();
  };

  return (
    <>
      <Stack dir="column" spacing="6">
        {(loaderData.error || actionData?.error) && <GeneralError />}
        <Flex
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Heading as="h1">Users</Heading>
          <Button
            colorScheme="green"
            leftIcon={<FaPlus />}
            onClick={onCreatePressed}
          >
            Create
          </Button>
        </Flex>
        <Grid templateColumns="repeat(4, 1fr)" gap="6">
          {loaderData.users?.map((user) => (
            <GridItem key={user.email}>
              <UserCard
                user={user}
                onEdit={onUserEdit}
                editing={
                  transition.state === "submitting" &&
                  selectedUser?.id === user.id
                }
                onDelete={onUserDelete}
                deleting={
                  transition.state === "submitting" &&
                  transition.submission.formData.get("id") === user.id
                }
              />
            </GridItem>
          ))}
        </Grid>
      </Stack>
      <Modal onClose={onClose} isOpen={isOpen}>
        <ModalOverlay />
        {!!(selectedUser || createPressed) && (
          <ModalContent>
            <ModalHeader>{createPressed ? "Create" : "Edit"} user</ModalHeader>
            <ModalBody>
              <Stack
                dir="column"
                spacing="4"
                as="form"
                onSubmit={onUserEditSubmit}
              >
                <FormControl>
                  <FormLabel>{createPressed ? "Email" : "User name"}</FormLabel>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    name={createPressed ? "email" : "username"}
                  />
                </FormControl>
                {!createPressed ? (
                  <FormControl>
                    <FormLabel>Manager</FormLabel>
                    <Checkbox
                      type="checkbox"
                      isChecked={isManager}
                      onChange={(e) => setIsManager(e.target.checked)}
                      name="manager"
                    />
                  </FormControl>
                ) : (
                  <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      name="manager"
                    />
                  </FormControl>
                )}
                <Button
                  colorScheme={createPressed ? "green" : "blue"}
                  type="submit"
                >
                  {createPressed ? "Create" : "Finish edit"}
                </Button>
              </Stack>
            </ModalBody>
          </ModalContent>
        )}
      </Modal>
    </>
  );
}
