import {
  json,
  Links,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useSubmit,
} from "remix";
import type { MetaFunction } from "remix";
import React, { useContext, useEffect } from "react";
import { withEmotionCache } from "@emotion/react";
import { ChakraProvider } from "@chakra-ui/react";

import { ServerStyleContext, ClientStyleContext } from "./context";
import { AppContainer } from "./components/AppContainer";
import { expiredJwtGuard, managerGuard } from "./utils/guards";
import { destroySession, getSession } from "./sessions";
import { setApiAuth } from "./utils/setApiAuth";

// root.tsx

interface DocumentProps {
  children: React.ReactNode;
}

const Document = withEmotionCache(
  ({ children }: DocumentProps, emotionCache) => {
    const serverSyleData = useContext(ServerStyleContext);
    const clientStyleData = useContext(ClientStyleContext);

    // Only executed on client
    useEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData?.reset();
    }, []);

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstaticom" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
            rel="stylesheet"
          />
          <Meta />
          <Links />
          {serverSyleData?.map(({ key, ids, css }) => (
            <style
              key={key}
              data-emotion={`${key} ${ids.join(" ")}`}
              dangerouslySetInnerHTML={{ __html: css }}
            />
          ))}
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
        </body>
      </html>
    );
  }
);

export const meta: MetaFunction = () => {
  return { title: "New Remix App" };
};

export const loader: LoaderFunction = async ({ request, context }) => {
  if (new URL(request.url).searchParams.has("logout")) {
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
  const root = request.url.endsWith("/");
  if (!root) {
    const jwtExpired = await expiredJwtGuard(request);
    if (jwtExpired) return jwtExpired;
  }
  const isManagerRoute = request.url.includes("manage");
  if (isManagerRoute) {
    const accessDenied = await managerGuard(request);
    if (accessDenied) {
      return accessDenied;
    }
  }
  return json({ manager: isManagerRoute });
};

export default function App() {
  const submit = useSubmit();
  const loaderData = useLoaderData() || {};

  const onLogout = () => {
    submit({ logout: "true" }, { method: "get" });
  };

  return (
    <Document>
      <ChakraProvider>
        <AppContainer manager={loaderData.manager} onLogout={onLogout}>
          <Outlet />
        </AppContainer>
      </ChakraProvider>
    </Document>
  );
}
