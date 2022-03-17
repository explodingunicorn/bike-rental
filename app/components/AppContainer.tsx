import { Button, Flex, Heading, Image } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { FC, PropsWithChildren } from "react";
import { Link, useLocation } from "remix";

import BikeLogo from "~/images/bikelogo.png";

const Container = styled.div`
  margin-top: var(--chakra-space-20);
  padding: 0 var(--chakra-space-12);
`;

const Navigation = styled.nav`
  background: white;
  padding: var(--chakra-space-2);
  border-bottom: 1px solid var(--chakra-colors-gray-300);
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
`;

export const AppContainer: FC<
  PropsWithChildren<{ manager: boolean; onLogout: () => void }>
> = ({ manager, onLogout, children }) => {
  const location = useLocation();
  const links = manager
    ? [
        { href: "/manage/bikes", name: "Bikes" },
        { href: "/manage/users", name: "Users" },
        { href: "/manage/reservations", name: "Reservations" },
      ]
    : [
        { href: "/bikes", name: "Bikes" },
        { href: "/reservations", name: "Reservations" },
      ];
  return (
    <Container>
      <Navigation>
        <Flex dir="row" alignItems={"center"}>
          <Flex gap="4">
            <Image height="20px" src={BikeLogo} />
            <Heading as="h2" size="md" display="inline-block">
              {manager ? "Manager Portal" : "Bike rental"}
            </Heading>
          </Flex>
          {location.pathname !== "/" && (
            <Flex flex="1" justifyContent={"flex-end"} gap="4">
              {links.map((link) => (
                <Button
                  as={Link}
                  to={link.href}
                  variant="ghost"
                  colorScheme={"green"}
                  key={link.name}
                >
                  {link.name}
                </Button>
              ))}
              <Button colorScheme="red" variant="ghost" onClick={onLogout}>
                Log out
              </Button>
            </Flex>
          )}
        </Flex>
      </Navigation>
      <main>{children}</main>
    </Container>
  );
};
